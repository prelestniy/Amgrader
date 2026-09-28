import os
import json
import asyncio
import logging
from pathlib import Path
from contextlib import asynccontextmanager
import time
import hmac
import hashlib
import secrets
from contextlib import closing
from typing import Optional, List, Dict, Any
from urllib.parse import parse_qsl

from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel
import sqlite3
import httpx

# ---------------------------------------------------------------------------
# Настройки (задаются переменными окружения в Railway)
# ---------------------------------------------------------------------------
DB_PATH = os.environ.get("DB_PATH", "amgrader.db")
BOT_TOKEN = os.environ.get("BOT_TOKEN", "")               # токен бота №1 (мини-апп) — нужен для проверки Telegram-входа
# без переменной — случайный секрет на время работы (админ-бот в том же процессе получит его сам)
ADMIN_SECRET = os.environ.setdefault("ADMIN_SECRET", secrets.token_hex(16))
PASSWORD_SALT = os.environ.get("PASSWORD_SALT", "amgrader-salt-change-me")
REFERRAL_REFERRER_BONUS = int(os.environ.get("REFERRAL_REFERRER_BONUS", "1000"))
REFERRAL_REFEREE_BONUS = int(os.environ.get("REFERRAL_REFEREE_BONUS", "500"))
DEFAULT_BALANCE = 0
BASE_DIR = Path(__file__).resolve().parent
ITEMS = json.loads((BASE_DIR / "items.json").read_text(encoding="utf-8"))
ITEM_IDS = {i["id"] for i in ITEMS}
log = logging.getLogger("amgrader")

# Специальные аккаунты: логин (в нижнем регистре) -> стартовый баланс
SPECIAL_ACCOUNTS = {
    "матвей": 100000,
}

@asynccontextmanager
async def lifespan(_app):
    """Запускает обоих ботов в этом же процессе (если заданы токены)."""
    tasks = []
    for name in ("bot_user", "bot_admin"):
        try:
            mod = __import__(name)
            if mod.enabled():
                tasks.append(asyncio.create_task(mod.run(), name=name))
            else:
                log.warning("%s: токен не задан — бот не запущен", name)
        except Exception:
            log.exception("не удалось запустить %s", name)
    yield
    for t in tasks:
        t.cancel()
    await asyncio.gather(*tasks, return_exceptions=True)


app = FastAPI(title="Amgrader Backend", lifespan=lifespan)


# ---------------------------------------------------------------------------
# База данных (SQLite)
# ---------------------------------------------------------------------------
def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with closing(db()) as conn, conn:
        conn.execute("""CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            login TEXT UNIQUE,
            password_hash TEXT,
            telegram_id INTEGER UNIQUE,
            nickname TEXT,
            username TEXT,
            photo TEXT,
            source TEXT,
            balance INTEGER DEFAULT 0,
            inventory TEXT DEFAULT '[]',
            referral_code TEXT UNIQUE,
            referred_by INTEGER,
            token TEXT UNIQUE,
            created_at INTEGER
        )""")
        for col in ("chance_bonus INTEGER DEFAULT 0", "rev INTEGER DEFAULT 0", "luck_rules TEXT DEFAULT '[]'", "last_daily INTEGER DEFAULT 0", "history TEXT DEFAULT '[]'"):
            try:
                conn.execute("ALTER TABLE users ADD COLUMN " + col)
            except sqlite3.OperationalError:
                pass
        conn.execute("CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT)")
        conn.execute("""CREATE TABLE IF NOT EXISTS tasks(
            id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, kind TEXT, url TEXT, chat TEXT,
            reward INTEGER, active INTEGER DEFAULT 1)""")
        conn.execute("""CREATE TABLE IF NOT EXISTS task_claims(
            user_id INTEGER, task_id INTEGER, started_at INTEGER, claimed_at INTEGER,
            PRIMARY KEY(user_id, task_id))""")
        conn.execute("""CREATE TABLE IF NOT EXISTS promo_codes(
            code TEXT PRIMARY KEY,
            reward_type TEXT,
            reward_value INTEGER,
            max_uses INTEGER DEFAULT 1,
            used_count INTEGER DEFAULT 0,
            active INTEGER DEFAULT 1,
            created_by TEXT,
            created_at INTEGER
        )""")
        conn.execute("""CREATE TABLE IF NOT EXISTS promo_redemptions(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            code TEXT,
            redeemed_at INTEGER,
            UNIQUE(user_id, code)
        )""")
        # владелец пользовательского промокода (для списка «Мои промокоды»)
        try:
            conn.execute("ALTER TABLE promo_codes ADD COLUMN owner_id INTEGER")
        except sqlite3.OperationalError:
            pass
        # старые пользовательские коды привязываем к их авторам (created_by = 'user:<логин или id>')
        conn.execute("""UPDATE promo_codes SET owner_id = (
                            SELECT u.id FROM users u
                            WHERE u.login=substr(promo_codes.created_by,6)
                               OR CAST(u.id AS TEXT)=substr(promo_codes.created_by,6))
                        WHERE owner_id IS NULL AND created_by LIKE 'user:%'""")


init_db()


def hash_password(pw: str) -> str:
    return hashlib.pbkdf2_hmac("sha256", pw.encode(), PASSWORD_SALT.encode(), 120_000).hex()


def gen_token() -> str:
    return secrets.token_hex(24)


def gen_referral_code() -> str:
    return secrets.token_hex(3).upper()


def global_bonus() -> int:
    with closing(db()) as conn:
        r = conn.execute("SELECT value FROM settings WHERE key='chance_bonus'").fetchone()
    return int(r["value"]) if r else 0


def parse_rules(s):
    try:
        return [[float(a), int(b)] for a, b in json.loads(s or "[]")]
    except Exception:
        return []


def global_rules():
    with closing(db()) as conn:
        r = conn.execute("SELECT value FROM settings WHERE key='luck_rules'").fetchone()
    return parse_rules(r["value"]) if r else []


def luck_list(row):
    return [r + ["u"] for r in parse_rules(row["luck_rules"])] + [r + ["g"] for r in global_rules()]


def user_public(row) -> dict:
    return {
        "luck": luck_list(row),
        "rev": row["rev"] or 0,
        "id": row["id"],
        "login": row["login"],
        "nickname": row["nickname"],
        "username": row["username"],
        "photo": row["photo"],
        "source": row["source"],
        "balance": row["balance"],
        "inventory": json.loads(row["inventory"] or "[]"),
        "referralCode": row["referral_code"],
        "referredBy": row["referred_by"],
        "token": row["token"],
    }


def auth_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "no token")
    token = authorization.split(" ", 1)[1]
    with closing(db()) as conn:
        row = conn.execute("SELECT * FROM users WHERE token=?", (token,)).fetchone()
    if not row:
        raise HTTPException(401, "invalid token")
    return row


def check_admin(x_admin_secret: Optional[str] = Header(None)):
    if not x_admin_secret or x_admin_secret != ADMIN_SECRET:
        raise HTTPException(403, "forbidden")


def create_user(login=None, password_hash=None, telegram_id=None, nickname="Игрок",
                 username=None, photo=None, source="manual", ref_code_used=None):
    balance = SPECIAL_ACCOUNTS.get((login or "").lower(), DEFAULT_BALANCE)
    ref_code = gen_referral_code()
    with closing(db()) as conn, conn:
        # уникальность реферального кода
        while conn.execute("SELECT 1 FROM users WHERE referral_code=?", (ref_code,)).fetchone():
            ref_code = gen_referral_code()

        referred_by = None
        if ref_code_used:
            r = conn.execute("SELECT * FROM users WHERE referral_code=?", (ref_code_used.upper(),)).fetchone()
            if r:
                referred_by = r["id"]

        token = gen_token()
        cur = conn.execute(
            """INSERT INTO users(login, password_hash, telegram_id, nickname, username, photo,
                source, balance, inventory, referral_code, referred_by, token, created_at)
               VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (login, password_hash, telegram_id, nickname, username, photo, source,
             balance, "[]", ref_code, referred_by, token, int(time.time())),
        )
        uid = cur.lastrowid
        if referred_by:
            conn.execute("UPDATE users SET balance = MAX(0, balance + ?), rev = rev + 1 WHERE id=?", (REFERRAL_REFERRER_BONUS, referred_by))
            conn.execute("UPDATE users SET balance = MAX(0, balance + ?), rev = rev + 1 WHERE id=?", (REFERRAL_REFEREE_BONUS, uid))
        row = conn.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
        return row


# ---------------------------------------------------------------------------
# Схемы запросов
# ---------------------------------------------------------------------------
class RegisterBody(BaseModel):
    login: str
    password: str
    ref: Optional[str] = None


class LoginBody(BaseModel):
    login: str
    password: str


class TelegramBody(BaseModel):
    initData: str
    ref: Optional[str] = None


class StateBody(BaseModel):
    balance: int
    inventory: List[int]
    rev: Optional[int] = None


class PromoRedeemBody(BaseModel):
    code: str


class ReferralApplyBody(BaseModel):
    code: str


class PromoCreateBody(BaseModel):
    code: str
    reward_type: str  # "balance" | "item"
    reward_value: int
    max_uses: int = 1
    created_by: Optional[str] = None


class PromoCodeOnly(BaseModel):
    code: str


class PromoUserCreateBody(BaseModel):
    amount: int
    count: int = 1


class HistoryAddBody(BaseModel):
    entry: Dict[str, Any]


class GrantBody(BaseModel):
    login: str
    amount: int


# ---------------------------------------------------------------------------
# Авторизация игрока
# ---------------------------------------------------------------------------
@app.post("/api/auth/register")
def register(body: RegisterBody):
    login = body.login.strip()
    if len(login) < 3:
        raise HTTPException(400, "Логин слишком короткий")
    if len(body.password) < 4:
        raise HTTPException(400, "Пароль слишком короткий")
    with closing(db()) as conn:
        exists = conn.execute("SELECT 1 FROM users WHERE login=?", (login.lower(),)).fetchone()
    if exists:
        raise HTTPException(400, "Такой логин уже занят")
    row = create_user(login=login.lower(), password_hash=hash_password(body.password),
                       nickname=login, source="manual", ref_code_used=body.ref)
    return user_public(row)


@app.post("/api/auth/login")
def login(body: LoginBody):
    with closing(db()) as conn:
        row = conn.execute("SELECT * FROM users WHERE login=?", (body.login.strip().lower(),)).fetchone()
    if not row or row["password_hash"] != hash_password(body.password):
        raise HTTPException(400, "Неверный логин или пароль")
    return user_public(row)


def check_telegram_auth(init_data: str) -> dict:
    if not BOT_TOKEN:
        raise HTTPException(500, "BOT_TOKEN не настроен на сервере")
    pairs = dict(parse_qsl(init_data, strict_parsing=False))
    recv_hash = pairs.pop("hash", None)
    if not recv_hash:
        raise HTTPException(400, "invalid initData")
    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(pairs.items()))
    secret_key = hmac.new(b"WebAppData", BOT_TOKEN.encode(), hashlib.sha256).digest()
    calc_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    if calc_hash != recv_hash:
        raise HTTPException(401, "bad signature")
    return json.loads(pairs.get("user", "{}"))


@app.post("/api/auth/telegram")
def telegram_auth(body: TelegramBody):
    tg_user = check_telegram_auth(body.initData)
    tid = tg_user.get("id")
    if not tid:
        raise HTTPException(400, "no telegram user")
    with closing(db()) as conn:
        row = conn.execute("SELECT * FROM users WHERE telegram_id=?", (tid,)).fetchone()
    if row:
        return user_public(row)
    nickname = " ".join(filter(None, [tg_user.get("first_name"), tg_user.get("last_name")])) \
        or tg_user.get("username") or "Игрок"
    row = create_user(telegram_id=tid, nickname=nickname, username=tg_user.get("username"),
                       photo=tg_user.get("photo_url"), source="telegram", ref_code_used=body.ref)
    return user_public(row)


@app.get("/api/config")
def public_config():
    return {"botUsername": os.environ.get("BOT_USERNAME", ""),
            "referrerBonus": REFERRAL_REFERRER_BONUS, "refereeBonus": REFERRAL_REFEREE_BONUS}


@app.get("/api/me")
def me(user=Depends(auth_user)):
    return user_public(user)


@app.delete("/api/me")
def delete_me(user=Depends(auth_user)):
    with closing(db()) as conn, conn:
        conn.execute("DELETE FROM users WHERE id=?", (user["id"],))
    return {"ok": True}


@app.post("/api/state")
def save_state(body: StateBody, user=Depends(auth_user)):
    if body.balance < 0 or any(i not in ITEM_IDS for i in body.inventory):
        raise HTTPException(400, "bad state")
    with closing(db()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        cur = conn.execute("SELECT * FROM users WHERE id=?", (user["id"],)).fetchone()
        if body.rev is not None and body.rev != (cur["rev"] or 0):
            # админ/промокод изменили данные, пока клиент был со старой версией
            return {"ok": False, "stale": True, "user": user_public(cur)}
        conn.execute("UPDATE users SET balance=?, inventory=? WHERE id=?",
                     (body.balance, json.dumps(body.inventory), user["id"]))
    return {"ok": True}


# ---------------------------------------------------------------------------
# Промокоды
# ---------------------------------------------------------------------------
@app.post("/api/promo/redeem")
def redeem_promo(body: PromoRedeemBody, user=Depends(auth_user)):
    code = body.code.strip().upper()
    if not code:
        raise HTTPException(400, "Введите промокод")
    with closing(db()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        promo = conn.execute("SELECT * FROM promo_codes WHERE code=?", (code,)).fetchone()
        if not promo or not promo["active"]:
            raise HTTPException(404, "Промокод не найден")
        if promo["max_uses"] and promo["used_count"] >= promo["max_uses"]:
            raise HTTPException(400, "Промокод исчерпан")
        already = conn.execute(
            "SELECT 1 FROM promo_redemptions WHERE user_id=? AND code=?", (user["id"], code)
        ).fetchone()
        if already:
            raise HTTPException(400, "Вы уже использовали этот промокод")

        conn.execute("INSERT INTO promo_redemptions(user_id, code, redeemed_at) VALUES(?,?,?)",
                     (user["id"], code, int(time.time())))
        conn.execute("UPDATE promo_codes SET used_count = used_count + 1 WHERE code=?", (code,))

        if promo["reward_type"] == "balance":
            conn.execute("UPDATE users SET balance = MAX(0, balance + ?), rev = rev + 1 WHERE id=?", (promo["reward_value"], user["id"]))
        else:
            row = conn.execute("SELECT inventory FROM users WHERE id=?", (user["id"],)).fetchone()
            inv = json.loads(row["inventory"] or "[]")
            inv.append(promo["reward_value"])
            conn.execute("UPDATE users SET inventory=?, rev = rev + 1 WHERE id=?", (json.dumps(inv), user["id"]))

        newrow = conn.execute("SELECT * FROM users WHERE id=?", (user["id"],)).fetchone()
    out = user_public(newrow)
    out["reward"] = {"type": promo["reward_type"], "value": promo["reward_value"]}
    return out


@app.post("/api/promo/create")
def create_user_promo(body: PromoUserCreateBody, user=Depends(auth_user)):
    if body.amount <= 0:
        raise HTTPException(400, "Сумма должна быть больше 0")
    if body.count < 1 or body.count > 10:
        raise HTTPException(400, "От 1 до 10 активаций")
    total = body.amount * body.count
    with closing(db()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        cur = conn.execute("SELECT * FROM users WHERE id=?", (user["id"],)).fetchone()
        if cur["balance"] < total:
            raise HTTPException(400, "Недостаточно баланса")
        while True:
            code = "P" + secrets.token_hex(4).upper()
            if not conn.execute("SELECT 1 FROM promo_codes WHERE code=?", (code,)).fetchone():
                break
        conn.execute(
            """INSERT INTO promo_codes(code, reward_type, reward_value, max_uses, used_count, active, created_by, created_at, owner_id)
               VALUES(?,'balance',?,?,0,1,?,?,?)""",
            (code, body.amount, body.count, f"user:{cur['login'] or cur['id']}", int(time.time()), cur["id"]),
        )
        conn.execute("UPDATE users SET balance = balance - ?, rev = rev + 1 WHERE id=?", (total, user["id"]))
        newrow = conn.execute("SELECT * FROM users WHERE id=?", (user["id"],)).fetchone()
    out = user_public(newrow)
    out["codes"] = [code]
    out["amount"] = body.amount
    out["count"] = body.count
    return out


@app.get("/api/promo/mine")
def my_promos(user=Depends(auth_user)):
    with closing(db()) as conn:
        rows = conn.execute("SELECT * FROM promo_codes WHERE owner_id=? ORDER BY created_at DESC",
                            (user["id"],)).fetchall()
    out = []
    for r in rows:
        exhausted = bool(r["max_uses"]) and r["used_count"] >= r["max_uses"]
        status = "disabled" if not r["active"] else ("exhausted" if exhausted else "active")
        out.append({"code": r["code"], "amount": r["reward_value"], "maxUses": r["max_uses"],
                    "usedCount": r["used_count"], "active": status == "active",
                    "status": status, "createdAt": r["created_at"]})
    return {"promos": out}


# ---------------------------------------------------------------------------
# История амгрейдов (для отображения в профиле на любом устройстве)
# ---------------------------------------------------------------------------
HISTORY_MAX = 50


@app.get("/api/history")
def get_history(user=Depends(auth_user)):
    return {"history": json.loads(user["history"] or "[]")}


@app.post("/api/history/add")
def add_history(body: HistoryAddBody, user=Depends(auth_user)):
    with closing(db()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        cur = conn.execute("SELECT history FROM users WHERE id=?", (user["id"],)).fetchone()
        hist = json.loads(cur["history"] or "[]")
        entry = dict(body.entry)
        entry["time"] = int(time.time() * 1000)  # время фиксируем на сервере, клиенту не доверяем
        hist.insert(0, entry)
        hist = hist[:HISTORY_MAX]
        conn.execute("UPDATE users SET history=? WHERE id=?", (json.dumps(hist), user["id"]))
    return {"ok": True, "history": hist}


@app.post("/api/history/clear")
def clear_history(user=Depends(auth_user)):
    with closing(db()) as conn, conn:
        conn.execute("UPDATE users SET history='[]' WHERE id=?", (user["id"],))
    return {"ok": True}


# ---------------------------------------------------------------------------
# Реферальная программа
# ---------------------------------------------------------------------------
@app.post("/api/referral/apply")
def apply_referral(body: ReferralApplyBody, user=Depends(auth_user)):
    code = body.code.strip().upper()
    if user["referred_by"]:
        raise HTTPException(400, "Реферальный код уже был применён")
    if code == user["referral_code"]:
        raise HTTPException(400, "Нельзя использовать свой собственный код")
    with closing(db()) as conn, conn:
        ref = conn.execute("SELECT * FROM users WHERE referral_code=?", (code,)).fetchone()
        if not ref:
            raise HTTPException(404, "Такой код не найден")
        conn.execute("UPDATE users SET referred_by=? WHERE id=?", (ref["id"], user["id"]))
        conn.execute("UPDATE users SET balance = MAX(0, balance + ?), rev = rev + 1 WHERE id=?", (REFERRAL_REFEREE_BONUS, user["id"]))
        conn.execute("UPDATE users SET balance = MAX(0, balance + ?), rev = rev + 1 WHERE id=?", (REFERRAL_REFERRER_BONUS, ref["id"]))
        newrow = conn.execute("SELECT * FROM users WHERE id=?", (user["id"],)).fetchone()
    return user_public(newrow)


# ---------------------------------------------------------------------------
# Админ-эндпоинты (используются только вторым ботом, через X-Admin-Secret)
# ---------------------------------------------------------------------------
@app.post("/admin/promo")
def admin_create_promo(body: PromoCreateBody, _=Depends(check_admin)):
    code = body.code.strip().upper()
    if body.reward_type not in ("balance", "item"):
        raise HTTPException(400, "reward_type должен быть balance или item")
    if body.reward_type == "item" and body.reward_value not in ITEM_IDS:
        raise HTTPException(400, "Предмета с таким id нет")
    if body.reward_type == "balance" and body.reward_value <= 0:
        raise HTTPException(400, "Сумма должна быть больше 0")
    if not code or body.max_uses < 0:
        raise HTTPException(400, "Неверные параметры")
    with closing(db()) as conn, conn:
        exists = conn.execute("SELECT 1 FROM promo_codes WHERE code=?", (code,)).fetchone()
        if exists:
            raise HTTPException(400, "Такой промокод уже существует")
        conn.execute(
            """INSERT INTO promo_codes(code, reward_type, reward_value, max_uses, used_count, active, created_by, created_at)
               VALUES(?,?,?,?,0,1,?,?)""",
            (code, body.reward_type, body.reward_value, body.max_uses, body.created_by, int(time.time())),
        )
    return {"ok": True, "code": code}


@app.get("/admin/promo")
def admin_list_promo(_=Depends(check_admin)):
    with closing(db()) as conn:
        rows = conn.execute("SELECT * FROM promo_codes ORDER BY created_at DESC").fetchall()
    return [dict(r) for r in rows]


@app.post("/admin/promo/deactivate")
def admin_deactivate_promo(body: PromoCodeOnly, _=Depends(check_admin)):
    with closing(db()) as conn, conn:
        conn.execute("UPDATE promo_codes SET active=0 WHERE code=?", (body.code.strip().upper(),))
    return {"ok": True}


@app.post("/admin/grant")
def admin_grant(body: GrantBody, _=Depends(check_admin)):
    with closing(db()) as conn, conn:
        who = body.login.strip().lstrip("#").lower()
        row = conn.execute("SELECT * FROM users WHERE login=? OR CAST(id AS TEXT)=?", (who, who)).fetchone()
        if not row:
            raise HTTPException(404, "Пользователь не найден")
        conn.execute("UPDATE users SET balance = MAX(0, balance + ?), rev = rev + 1 WHERE id=?", (body.amount, row["id"]))
    return {"ok": True}


class BalanceBody(BaseModel):
    login: str = ""          # пусто = все пользователи
    amount: int
    mode: str = "add"        # add — прибавить (можно минус), set — установить


def find_user(conn, who: str):
    who = who.strip().lstrip("#").lower()
    row = conn.execute("SELECT * FROM users WHERE login=? OR CAST(id AS TEXT)=?", (who, who)).fetchone()
    if not row:
        raise HTTPException(404, "Пользователь не найден")
    return row


@app.post("/admin/balance")
def admin_balance(body: BalanceBody, _=Depends(check_admin)):
    if body.mode not in ("add", "set"):
        raise HTTPException(400, "mode: add или set")
    expr = "MAX(0, balance + ?)" if body.mode == "add" else "MAX(0, ?)"
    with closing(db()) as conn, conn:
        if body.login.strip():
            row = find_user(conn, body.login)
            conn.execute(f"UPDATE users SET balance = {expr}, rev = rev + 1 WHERE id=?", (body.amount, row["id"]))
            n = 1
        else:
            n = conn.execute(f"UPDATE users SET balance = {expr}, rev = rev + 1", (body.amount,)).rowcount
    return {"ok": True, "affected": n}


class LuckBody(BaseModel):
    login: str = ""          # пусто = правило для всех игроков
    at: float = 0            # правило действует, когда ПОКАЗАННЫЙ шанс <= at (%)
    bonus: int = 0           # сколько % добавить к реальному шансу (0 = убрать правило)


def luck_conn_rules(conn, login):
    if login.strip():
        row = find_user(conn, login)
        return row, parse_rules(row["luck_rules"])
    r = conn.execute("SELECT value FROM settings WHERE key='luck_rules'").fetchone()
    return None, parse_rules(r["value"]) if r else []


def luck_save(conn, row, rules):
    dump = json.dumps(sorted(rules))
    if row:
        conn.execute("UPDATE users SET luck_rules=? WHERE id=?", (dump, row["id"]))
    else:
        conn.execute("INSERT OR REPLACE INTO settings(key, value) VALUES('luck_rules', ?)", (dump,))


@app.post("/admin/luck")
def admin_luck_set(body: LuckBody, _=Depends(check_admin)):
    if not (0 < body.at <= 100) or not (-100 <= body.bonus <= 100):
        raise HTTPException(400, "шанс 0–100, бонус -100…100")
    with closing(db()) as conn, conn:
        row, rules = luck_conn_rules(conn, body.login)
        rules = [r for r in rules if abs(r[0] - body.at) > 1e-9]
        if body.bonus:
            rules.append([body.at, body.bonus])
        luck_save(conn, row, rules)
    return {"ok": True, "rules": sorted(rules)}


@app.get("/admin/luck")
def admin_luck_get(login: str = "", _=Depends(check_admin)):
    with closing(db()) as conn:
        _row, rules = luck_conn_rules(conn, login)
    return {"rules": rules}


@app.post("/admin/luck/clear")
def admin_luck_clear(body: LuckBody, _=Depends(check_admin)):
    with closing(db()) as conn, conn:
        row, _rules = luck_conn_rules(conn, body.login)
        luck_save(conn, row, [])
    return {"ok": True}


@app.get("/admin/top")
def admin_top(_=Depends(check_admin)):
    with closing(db()) as conn:
        rows = conn.execute("SELECT id, login, nickname, balance, luck_rules FROM users ORDER BY balance DESC LIMIT 15").fetchall()
        total = conn.execute("SELECT COUNT(*) c, COALESCE(SUM(balance),0) s FROM users").fetchone()
    return {"users": [dict(r) for r in rows], "count": total["c"], "sum": total["s"]}


# ---------------------------------------------------------------------------
# Бонусы: ежедневная награда и задания
# ---------------------------------------------------------------------------
DAILY_AMOUNT = int(os.environ.get("DAILY_BONUS", "50"))
TASK_WAIT = 12   # сек. между «Перейти» и «Проверить» для заданий-ссылок


def today() -> int:
    return int((time.time() + 10800) // 86400)      # сутки по Москве


def secs_left() -> int:
    return int((today() + 1) * 86400 - 10800 - time.time())


@app.get("/api/bonus")
def bonus_info(user=Depends(auth_user)):
    with closing(db()) as conn:
        tasks = conn.execute("SELECT * FROM tasks WHERE active=1 ORDER BY id").fetchall()
        cl = {r["task_id"]: r for r in conn.execute("SELECT * FROM task_claims WHERE user_id=?", (user["id"],)).fetchall()}
        row = conn.execute("SELECT last_daily FROM users WHERE id=?", (user["id"],)).fetchone()
    return {
        "daily": {"amount": DAILY_AMOUNT, "available": (row["last_daily"] or 0) < today(), "secondsLeft": secs_left()},
        "tasks": [{"id": t["id"], "title": t["title"], "kind": t["kind"], "url": t["url"], "reward": t["reward"],
                   "done": bool(cl.get(t["id"]) and cl[t["id"]]["claimed_at"]), "started": t["id"] in cl} for t in tasks],
    }


@app.post("/api/bonus/daily")
def bonus_daily(user=Depends(auth_user)):
    with closing(db()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        row = conn.execute("SELECT * FROM users WHERE id=?", (user["id"],)).fetchone()
        if (row["last_daily"] or 0) >= today():
            raise HTTPException(400, "Бонус уже получен — приходите завтра")
        conn.execute("UPDATE users SET balance=balance+?, last_daily=?, rev=rev+1 WHERE id=?", (DAILY_AMOUNT, today(), row["id"]))
        new = conn.execute("SELECT * FROM users WHERE id=?", (row["id"],)).fetchone()
    return user_public(new)


class TaskClaim(BaseModel):
    initData: Optional[str] = None


@app.post("/api/tasks/{task_id}/start")
def task_start(task_id: int, user=Depends(auth_user)):
    with closing(db()) as conn, conn:
        if not conn.execute("SELECT 1 FROM tasks WHERE id=? AND active=1", (task_id,)).fetchone():
            raise HTTPException(404, "Задание не найдено")
        conn.execute("INSERT OR IGNORE INTO task_claims(user_id, task_id, started_at) VALUES(?,?,?)", (user["id"], task_id, int(time.time())))
    return {"ok": True}


@app.post("/api/tasks/{task_id}/claim")
def task_claim(task_id: int, body: TaskClaim, user=Depends(auth_user)):
    with closing(db()) as conn:
        t = conn.execute("SELECT * FROM tasks WHERE id=? AND active=1", (task_id,)).fetchone()
        c = conn.execute("SELECT * FROM task_claims WHERE user_id=? AND task_id=?", (user["id"], task_id)).fetchone()
    if not t:
        raise HTTPException(404, "Задание не найдено")
    if c and c["claimed_at"]:
        raise HTTPException(400, "Уже выполнено")
    if t["kind"] == "tg":
        tg_id = user["telegram_id"]
        if not tg_id and body.initData:
            tg_id = check_telegram_auth(body.initData).get("id")
        if not tg_id:
            raise HTTPException(400, "Откройте игру внутри Telegram, чтобы проверить подписку")
        try:
            r = httpx.get(f"https://api.telegram.org/bot{BOT_TOKEN}/getChatMember", params={"chat_id": t["chat"], "user_id": tg_id}, timeout=8).json()
        except Exception:
            raise HTTPException(502, "Telegram не ответил, попробуйте ещё раз")
        if not r.get("ok"):
            raise HTTPException(400, "Не удалось проверить подписку (бот должен быть админом канала)")
        if r["result"]["status"] not in ("member", "administrator", "creator"):
            raise HTTPException(400, "Подписка не найдена — подпишитесь и нажмите «Проверить» ещё раз")
    elif not c or time.time() - (c["started_at"] or 0) < TASK_WAIT:
        raise HTTPException(400, "Сначала выполните задание по ссылке, затем нажмите «Проверить»")
    with closing(db()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        cl = conn.execute("SELECT * FROM task_claims WHERE user_id=? AND task_id=?", (user["id"], task_id)).fetchone()
        if cl and cl["claimed_at"]:
            raise HTTPException(400, "Уже выполнено")
        conn.execute("""INSERT INTO task_claims(user_id, task_id, started_at, claimed_at) VALUES(?,?,?,?)
                        ON CONFLICT(user_id, task_id) DO UPDATE SET claimed_at=excluded.claimed_at""",
                     (user["id"], task_id, int(time.time()), int(time.time())))
        conn.execute("UPDATE users SET balance=balance+?, rev=rev+1 WHERE id=?", (t["reward"], user["id"]))
        new = conn.execute("SELECT * FROM users WHERE id=?", (user["id"],)).fetchone()
    return user_public(new)


class TaskBody(BaseModel):
    title: str
    kind: str                # "tg" — проверяем подписку; "link" — по ссылке (TikTok и т.п.)
    url: str
    chat: str = ""
    reward: int


@app.post("/admin/task")
def admin_task_add(body: TaskBody, _=Depends(check_admin)):
    if body.kind not in ("tg", "link") or body.reward <= 0 or (body.kind == "tg" and not body.chat):
        raise HTTPException(400, "Неверные параметры задания")
    with closing(db()) as conn, conn:
        cur = conn.execute("INSERT INTO tasks(title, kind, url, chat, reward) VALUES(?,?,?,?,?)",
                           (body.title.strip(), body.kind, body.url.strip(), body.chat.strip(), body.reward))
    return {"ok": True, "id": cur.lastrowid}


@app.get("/admin/task")
def admin_task_list(_=Depends(check_admin)):
    with closing(db()) as conn:
        return [dict(r) for r in conn.execute("SELECT * FROM tasks WHERE active=1 ORDER BY id").fetchall()]


class TaskDel(BaseModel):
    id: int


@app.post("/admin/task/delete")
def admin_task_del(body: TaskDel, _=Depends(check_admin)):
    with closing(db()) as conn, conn:
        n = conn.execute("UPDATE tasks SET active=0 WHERE id=?", (body.id,)).rowcount
    if not n:
        raise HTTPException(404, "Нет такого задания")
    return {"ok": True}


@app.get("/admin/items")
def admin_items(q: str = "", _=Depends(check_admin)):
    q = q.strip().lower()
    return [i for i in ITEMS if not q or q in i["name"].lower() or q in i["nameEn"].lower() or q == str(i["id"])][:8]


@app.get("/admin/users")
def admin_search_users(q: str = "", _=Depends(check_admin)):
    like = f"%{q}%"
    with closing(db()) as conn:
        rows = conn.execute(
            """SELECT id, login, nickname, username, balance, referral_code FROM users
               WHERE login LIKE ? OR nickname LIKE ? OR username LIKE ? LIMIT 20""",
            (like, like, like),
        ).fetchall()
    return [dict(r) for r in rows]


# Мини-апп (index.html лежит рядом с app.py)
# ---------------------------------------------------------------------------
@app.get("/videos/{name}")
def video(name: str):
    """Видео-реакции: лежат в папке videos/ (или прямо в корне рядом с app.py)."""
    if "/" in name or "\\" in name or not name.lower().endswith(".mp4"):
        raise HTTPException(404)
    for folder in (BASE_DIR / "videos", BASE_DIR):
        f = folder / name
        if f.is_file():
            return FileResponse(f, media_type="video/mp4", headers={"Cache-Control": "public, max-age=86400"})
    raise HTTPException(404)


@app.get("/")
def index():
    return FileResponse(BASE_DIR / "index.html", headers={"Cache-Control": "no-cache"})
