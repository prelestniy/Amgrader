import os
import re
import base64
import html as htmllib
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

from fastapi import FastAPI, Header, HTTPException, Depends, Response, BackgroundTasks
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


def gen_public_id(conn) -> str:
    """Случайный 6-значный публичный ID, которого ещё нет в базе."""
    while True:
        pid = str(secrets.randbelow(900000) + 100000)
        if not conn.execute("SELECT 1 FROM users WHERE public_id=? COLLATE NOCASE", (pid,)).fetchone():
            return pid


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
        for col in ("chance_bonus INTEGER DEFAULT 0", "rev INTEGER DEFAULT 0", "luck_rules TEXT DEFAULT '[]'", "last_daily INTEGER DEFAULT 0", "history TEXT DEFAULT '[]'", "about TEXT DEFAULT ''", "avatar BLOB", "avatar_key TEXT"):
            try:
                conn.execute("ALTER TABLE users ADD COLUMN " + col)
            except sqlite3.OperationalError:
                pass
        # публичный ID (виден игрокам, ищется по нему; админ может менять)
        try:
            conn.execute("ALTER TABLE users ADD COLUMN public_id TEXT")
        except sqlite3.OperationalError:
            pass
        for r in conn.execute("SELECT id FROM users WHERE public_id IS NULL OR public_id=''").fetchall():
            conn.execute("UPDATE users SET public_id=? WHERE id=?", (gen_public_id(conn), r["id"]))
        conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_public_id ON users(public_id COLLATE NOCASE)")
        conn.execute("""CREATE TABLE IF NOT EXISTS friendships(
            user_a INTEGER, user_b INTEGER, requester INTEGER, status TEXT, created_at INTEGER,
            PRIMARY KEY(user_a, user_b))""")
        conn.execute("""CREATE TABLE IF NOT EXISTS blocks(
            blocker_id INTEGER, blocked_id INTEGER, created_at INTEGER,
            PRIMARY KEY(blocker_id, blocked_id))""")
        conn.execute("""CREATE TABLE IF NOT EXISTS messages(
            id INTEGER PRIMARY KEY AUTOINCREMENT, sender_id INTEGER, recipient_id INTEGER,
            text TEXT, created_at INTEGER, read_at INTEGER)""")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_msg_pair ON messages(sender_id, recipient_id, id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_msg_rcpt ON messages(recipient_id, read_at)")
        conn.execute("""CREATE TABLE IF NOT EXISTS chat_requests(
            user_a INTEGER, user_b INTEGER, initiator INTEGER, status TEXT, created_at INTEGER,
            PRIMARY KEY(user_a, user_b))""")
        conn.execute("""CREATE TABLE IF NOT EXISTS reports(
            id INTEGER PRIMARY KEY AUTOINCREMENT, reporter_id INTEGER, reported_id INTEGER,
            reason TEXT, comment TEXT, context TEXT, status TEXT DEFAULT 'new', created_at INTEGER)""")
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
        "publicId": row["public_id"],
        "about": row["about"] or "",
        "hasPassword": bool(row["password_hash"]),
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
                source, balance, inventory, referral_code, referred_by, token, created_at, public_id)
               VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (login, password_hash, telegram_id, nickname, username, photo, source,
             balance, "[]", ref_code, referred_by, token, int(time.time()), gen_public_id(conn)),
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


@app.get("/api/leaderboard")
def leaderboard(limit: int = 10):
    """Публичный топ игроков по балансу — для слайдера в профиле.
    Отдаём ник/баланс/фото и публичный ID (по нему открывается профиль), без логина, внутреннего id и токена."""
    limit = max(1, min(limit, 50))
    with closing(db()) as conn:
        rows = conn.execute(
            "SELECT public_id, nickname, photo, balance FROM users ORDER BY balance DESC LIMIT ?",
            (limit,),
        ).fetchall()
    return {"top": [
        {"publicId": r["public_id"], "nickname": r["nickname"] or "Игрок", "balance": r["balance"], "photo": r["photo"]}
        for r in rows
    ]}


@app.get("/api/me")
def me(user=Depends(auth_user)):
    return user_public(user)


@app.delete("/api/me")
def delete_me(user=Depends(auth_user)):
    with closing(db()) as conn, conn:
        conn.execute("DELETE FROM users WHERE id=?", (user["id"],))
        conn.execute("DELETE FROM friendships WHERE user_a=? OR user_b=?", (user["id"], user["id"]))
        conn.execute("DELETE FROM blocks WHERE blocker_id=? OR blocked_id=?", (user["id"], user["id"]))
        conn.execute("DELETE FROM messages WHERE sender_id=? OR recipient_id=?", (user["id"], user["id"]))
        conn.execute("DELETE FROM chat_requests WHERE user_a=? OR user_b=?", (user["id"], user["id"]))
        conn.execute("DELETE FROM reports WHERE reporter_id=?", (user["id"],))
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
    """Логин, публичный ID или #внутренний_id."""
    raw = who.strip()
    w = raw.lstrip("#").lower()
    if raw.startswith("#"):
        row = conn.execute("SELECT * FROM users WHERE CAST(id AS TEXT)=?", (w,)).fetchone()
    else:
        row = (conn.execute("SELECT * FROM users WHERE login=?", (w,)).fetchone()
               or conn.execute("SELECT * FROM users WHERE public_id=? COLLATE NOCASE", (w,)).fetchone()
               or conn.execute("SELECT * FROM users WHERE CAST(id AS TEXT)=?", (w,)).fetchone())
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


PUBLIC_ID_RE = re.compile(r"[A-Za-z0-9_]{3,16}")


class PublicIdBody(BaseModel):
    login: str
    new_id: str


@app.post("/admin/public_id")
def admin_set_public_id(body: PublicIdBody, _=Depends(check_admin)):
    new = body.new_id.strip().lstrip("#")
    if not PUBLIC_ID_RE.fullmatch(new):
        raise HTTPException(400, "ID: 3–16 символов, латиница, цифры и _")
    with closing(db()) as conn, conn:
        row = find_user(conn, body.login)
        if conn.execute("SELECT 1 FROM users WHERE public_id=? COLLATE NOCASE AND id<>?", (new, row["id"])).fetchone():
            raise HTTPException(409, "Этот ID уже занят")
        conn.execute("UPDATE users SET public_id=?, rev = rev + 1 WHERE id=?", (new, row["id"]))
    return {"ok": True, "publicId": new}


@app.get("/api/users/search")
def search_users_by_public_id(q: str = "", user=Depends(auth_user)):
    """Поиск игрока по точному публичному ID. Отдаём только ID, ник и фото."""
    q = q.strip().lstrip("#")
    if not q or len(q) > 16:
        return {"users": []}
    with closing(db()) as conn:
        r = conn.execute("SELECT id, public_id, nickname, photo FROM users WHERE public_id=? COLLATE NOCASE", (q,)).fetchone()
    if not r:
        return {"users": []}
    return {"users": [{"publicId": r["public_id"], "nickname": r["nickname"] or "Игрок",
                       "photo": r["photo"], "isMe": r["id"] == user["id"]}]}


ABOUT_MAX = 20
AVATAR_MAX_BYTES = 300_000


class AboutBody(BaseModel):
    about: str = ""


class AvatarBody(BaseModel):
    image: str


class CredentialsBody(BaseModel):
    login: Optional[str] = None
    new_password: Optional[str] = None
    current_password: Optional[str] = None


@app.post("/api/me/profile")
def update_profile(body: AboutBody, user=Depends(auth_user)):
    about = " ".join(body.about.split())
    if len(about) > ABOUT_MAX:
        raise HTTPException(400, f"«О себе»: не больше {ABOUT_MAX} символов")
    with closing(db()) as conn, conn:
        conn.execute("UPDATE users SET about=? WHERE id=?", (about, user["id"]))
        row = conn.execute("SELECT * FROM users WHERE id=?", (user["id"],)).fetchone()
    return user_public(row)


@app.post("/api/me/avatar")
def upload_avatar(body: AvatarBody, user=Depends(auth_user)):
    """Аватар приходит уже уменьшенным JPEG (data URL) — храним в базе, отдаём по /avatar/<ключ>."""
    try:
        raw = base64.b64decode(body.image.split(",", 1)[-1], validate=True)
    except Exception:
        raise HTTPException(400, "Не удалось прочитать картинку")
    if len(raw) < 100 or len(raw) > AVATAR_MAX_BYTES:
        raise HTTPException(400, "Картинка слишком большая")
    if not raw.startswith(b"\xff\xd8\xff"):
        raise HTTPException(400, "Нужна JPEG-картинка")
    key = secrets.token_urlsafe(9)
    with closing(db()) as conn, conn:
        conn.execute("UPDATE users SET avatar=?, avatar_key=?, photo=? WHERE id=?",
                     (raw, key, "/avatar/" + key, user["id"]))
        row = conn.execute("SELECT * FROM users WHERE id=?", (user["id"],)).fetchone()
    return user_public(row)


@app.get("/avatar/{key}")
def get_avatar(key: str):
    if not re.fullmatch(r"[A-Za-z0-9_-]{6,32}", key):
        raise HTTPException(404)
    with closing(db()) as conn:
        r = conn.execute("SELECT avatar FROM users WHERE avatar_key=?", (key,)).fetchone()
    if not r or not r["avatar"]:
        raise HTTPException(404)
    return Response(bytes(r["avatar"]), media_type="image/jpeg",
                    headers={"Cache-Control": "public, max-age=31536000, immutable"})


@app.post("/api/me/credentials")
def update_credentials(body: CredentialsBody, user=Depends(auth_user)):
    new_login = (body.login or "").strip().lower() or None
    new_pw = body.new_password or None
    has_pw = bool(user["password_hash"])
    cur_login = user["login"]
    login_changed = bool(new_login) and new_login != (cur_login or "")
    if not login_changed and not new_pw:
        raise HTTPException(400, "Нечего менять")
    if has_pw and hash_password(body.current_password or "") != user["password_hash"]:
        raise HTTPException(400, "Неверный текущий пароль")
    if login_changed and not (3 <= len(new_login) <= 32):
        raise HTTPException(400, "Логин: от 3 до 32 символов")
    if new_pw is not None and not (4 <= len(new_pw) <= 64):
        raise HTTPException(400, "Пароль: от 4 до 64 символов")
    final_login = new_login if login_changed else cur_login
    if not has_pw and (not final_login or not new_pw):
        raise HTTPException(400, "Чтобы входить по логину, задайте и логин, и пароль")
    sets, vals = [], []
    if login_changed:
        sets.append("login=?"); vals.append(new_login)
    if new_pw:
        sets.append("password_hash=?"); vals.append(hash_password(new_pw))
    vals.append(user["id"])
    try:
        with closing(db()) as conn, conn:
            if login_changed and conn.execute("SELECT 1 FROM users WHERE login=? AND id<>?", (new_login, user["id"])).fetchone():
                raise HTTPException(400, "Такой логин уже занят")
            conn.execute("UPDATE users SET " + ", ".join(sets) + " WHERE id=?", vals)
            row = conn.execute("SELECT * FROM users WHERE id=?", (user["id"],)).fetchone()
    except sqlite3.IntegrityError:
        raise HTTPException(400, "Такой логин уже занят")
    return user_public(row)


def _pair(x: int, y: int):
    return (x, y) if x < y else (y, x)


def _target(conn, public_id: str):
    pid = (public_id or "").strip().lstrip("#")
    if not PUBLIC_ID_RE.fullmatch(pid):
        raise HTTPException(404, "Игрок не найден")
    r = conn.execute("SELECT id, public_id, nickname, photo FROM users WHERE public_id=? COLLATE NOCASE", (pid,)).fetchone()
    if not r:
        raise HTTPException(404, "Игрок не найден")
    return r


def relation(conn, me: int, other: int) -> str:
    """none | friend | incoming (он мне) | outgoing (я ему) | blocked (я заблокировал)."""
    if conn.execute("SELECT 1 FROM blocks WHERE blocker_id=? AND blocked_id=?", (me, other)).fetchone():
        return "blocked"
    x, y = _pair(me, other)
    f = conn.execute("SELECT requester, status FROM friendships WHERE user_a=? AND user_b=?", (x, y)).fetchone()
    if not f:
        return "none"
    if f["status"] == "accepted":
        return "friend"
    return "outgoing" if f["requester"] == me else "incoming"


@app.get("/api/users/{public_id}")
def public_profile(public_id: str, user=Depends(auth_user)):
    """Чужой профиль: ник, фото, «о себе», дата регистрации, баланс, инвентарь и связь с вами."""
    with closing(db()) as conn:
        r = _target_full(conn, public_id)
        rel = "none" if r["id"] == user["id"] else relation(conn, user["id"], r["id"])
    return {"publicId": r["public_id"], "nickname": r["nickname"] or "Игрок", "photo": r["photo"],
            "about": r["about"] or "", "createdAt": r["created_at"], "balance": r["balance"],
            "inventory": json.loads(r["inventory"] or "[]"), "isMe": r["id"] == user["id"], "relation": rel}


def _target_full(conn, public_id: str):
    pid = (public_id or "").strip().lstrip("#")
    if not PUBLIC_ID_RE.fullmatch(pid):
        raise HTTPException(404, "Игрок не найден")
    r = conn.execute("SELECT * FROM users WHERE public_id=? COLLATE NOCASE", (pid,)).fetchone()
    if not r:
        raise HTTPException(404, "Игрок не найден")
    return r


# ---------------------------------------------------------------------------
# Друзья и блокировки
# ---------------------------------------------------------------------------
class PidBody(BaseModel):
    publicId: str


class BlockBody(BaseModel):
    publicId: str
    block: bool = True


MAX_PENDING_OUT = 50


@app.get("/api/friends")
def friends_list(user=Depends(auth_user)):
    me = user["id"]
    with closing(db()) as conn:
        rows = conn.execute(
            """SELECT f.status, f.requester, u.public_id, u.nickname, u.photo
               FROM friendships f
               JOIN users u ON u.id = CASE WHEN f.user_a=? THEN f.user_b ELSE f.user_a END
               WHERE f.user_a=? OR f.user_b=? ORDER BY f.created_at DESC""", (me, me, me)).fetchall()
    out = {"friends": [], "incoming": [], "outgoing": []}
    for r in rows:
        item = {"publicId": r["public_id"], "nickname": r["nickname"] or "Игрок", "photo": r["photo"]}
        if r["status"] == "accepted":
            out["friends"].append(item)
        elif r["requester"] == me:
            out["outgoing"].append(item)
        else:
            out["incoming"].append(item)
    return out


@app.post("/api/friends/request")
def friend_request(body: PidBody, user=Depends(auth_user)):
    me = user["id"]
    with closing(db()) as conn, conn:
        t = _target(conn, body.publicId)
        if t["id"] == me:
            raise HTTPException(400, "Нельзя добавить в друзья себя")
        if conn.execute("SELECT 1 FROM blocks WHERE blocker_id=? AND blocked_id=?", (me, t["id"])).fetchone():
            raise HTTPException(400, "Сначала разблокируйте игрока")
        if conn.execute("SELECT 1 FROM blocks WHERE blocker_id=? AND blocked_id=?", (t["id"], me)).fetchone():
            raise HTTPException(400, "Не удалось отправить заявку")
        x, y = _pair(me, t["id"])
        f = conn.execute("SELECT requester, status FROM friendships WHERE user_a=? AND user_b=?", (x, y)).fetchone()
        if f:
            if f["status"] == "accepted":
                return {"relation": "friend"}
            if f["requester"] == me:
                return {"relation": "outgoing"}
            conn.execute("UPDATE friendships SET status='accepted' WHERE user_a=? AND user_b=?", (x, y))
            return {"relation": "friend"}
        n = conn.execute("SELECT COUNT(*) FROM friendships WHERE requester=? AND status='pending'", (me,)).fetchone()[0]
        if n >= MAX_PENDING_OUT:
            raise HTTPException(400, "Слишком много неотвеченных заявок")
        conn.execute("INSERT INTO friendships(user_a, user_b, requester, status, created_at) VALUES(?,?,?,?,?)",
                     (x, y, me, "pending", int(time.time())))
    return {"relation": "outgoing"}


@app.post("/api/friends/accept")
def friend_accept(body: PidBody, user=Depends(auth_user)):
    me = user["id"]
    with closing(db()) as conn, conn:
        t = _target(conn, body.publicId)
        x, y = _pair(me, t["id"])
        cur = conn.execute("UPDATE friendships SET status='accepted' WHERE user_a=? AND user_b=? AND status='pending' AND requester<>?",
                           (x, y, me))
        if cur.rowcount == 0:
            raise HTTPException(404, "Заявка не найдена")
    return {"relation": "friend"}


@app.post("/api/friends/remove")
def friend_remove(body: PidBody, user=Depends(auth_user)):
    """Удалить из друзей, отклонить входящую или отменить свою исходящую заявку."""
    me = user["id"]
    with closing(db()) as conn, conn:
        t = _target(conn, body.publicId)
        x, y = _pair(me, t["id"])
        conn.execute("DELETE FROM friendships WHERE user_a=? AND user_b=?", (x, y))
    return {"relation": "none"}


@app.get("/api/blocks")
def blocks_list(user=Depends(auth_user)):
    with closing(db()) as conn:
        rows = conn.execute(
            """SELECT u.public_id, u.nickname, u.photo FROM blocks b JOIN users u ON u.id=b.blocked_id
               WHERE b.blocker_id=? ORDER BY b.created_at DESC""", (user["id"],)).fetchall()
    return {"blocked": [{"publicId": r["public_id"], "nickname": r["nickname"] or "Игрок", "photo": r["photo"]} for r in rows]}


@app.post("/api/blocks")
def block_user(body: BlockBody, user=Depends(auth_user)):
    me = user["id"]
    with closing(db()) as conn, conn:
        t = _target(conn, body.publicId)
        if t["id"] == me:
            raise HTTPException(400, "Нельзя заблокировать себя")
        if body.block:
            conn.execute("INSERT OR IGNORE INTO blocks(blocker_id, blocked_id, created_at) VALUES(?,?,?)",
                         (me, t["id"], int(time.time())))
            x, y = _pair(me, t["id"])
            conn.execute("DELETE FROM friendships WHERE user_a=? AND user_b=?", (x, y))
        else:
            conn.execute("DELETE FROM blocks WHERE blocker_id=? AND blocked_id=?", (me, t["id"]))
    return {"relation": "blocked" if body.block else "none"}


# ---------------------------------------------------------------------------
# Сообщения
#  • друзьям — без ограничений;
#  • не другу — одно сообщение (запрос на переписку), дальше — только после принятия.
#  • в Telegram-бота уходит только уведомление «вам написал …», текст — только в мини-аппе.
# ---------------------------------------------------------------------------
MSG_MAX = 500
MSG_PER_MINUTE = 20


class SendBody(BaseModel):
    text: str


def webapp_url() -> str:
    url = os.environ.get("WEBAPP_URL", "")
    if not url and os.environ.get("RAILWAY_PUBLIC_DOMAIN"):
        url = "https://" + os.environ["RAILWAY_PUBLIC_DOMAIN"]
    return url


def notify_telegram(tg_id: int, text: str):
    """Уведомление в бота (без текста сообщения). Любая ошибка игнорируется."""
    if not BOT_TOKEN or not tg_id:
        return
    payload = {"chat_id": tg_id, "text": text, "parse_mode": "HTML", "disable_web_page_preview": True}
    url = webapp_url()
    if url:
        payload["reply_markup"] = {"inline_keyboard": [[{"text": "💬 Открыть", "web_app": {"url": url}}]]}
    try:
        httpx.post(f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage", json=payload, timeout=8)
    except Exception:
        log.warning("не удалось отправить уведомление в Telegram")


def chat_state(conn, me: int, other: int):
    """(state, can_send). state: friend | accepted | none | request_in | request_out | declined | blocked_by_me | blocked_me."""
    if conn.execute("SELECT 1 FROM blocks WHERE blocker_id=? AND blocked_id=?", (me, other)).fetchone():
        return "blocked_by_me", False
    if conn.execute("SELECT 1 FROM blocks WHERE blocker_id=? AND blocked_id=?", (other, me)).fetchone():
        return "blocked_me", False
    if relation(conn, me, other) == "friend":
        return "friend", True
    x, y = _pair(me, other)
    c = conn.execute("SELECT initiator, status FROM chat_requests WHERE user_a=? AND user_b=?", (x, y)).fetchone()
    if not c:
        return "none", True
    if c["status"] == "accepted":
        return "accepted", True
    if c["status"] == "pending":
        return ("request_out", False) if c["initiator"] == me else ("request_in", True)
    # declined
    return ("declined", False) if c["initiator"] == me else ("request_in", True)


def _peer(conn, public_id: str):
    return _target(conn, public_id)


def _msg_json(r, me: int):
    return {"id": r["id"], "mine": r["sender_id"] == me, "text": r["text"], "at": r["created_at"]}


@app.get("/api/chats/unread")
def chats_unread(user=Depends(auth_user)):
    with closing(db()) as conn:
        n = conn.execute("SELECT COUNT(*) FROM messages WHERE recipient_id=? AND read_at IS NULL", (user["id"],)).fetchone()[0]
    return {"unread": n}


@app.get("/api/chats")
def chats_list(user=Depends(auth_user)):
    me = user["id"]
    with closing(db()) as conn:
        rows = conn.execute(
            """SELECT partner, MAX(id) AS last_id,
                      SUM(CASE WHEN recipient_id=? AND read_at IS NULL THEN 1 ELSE 0 END) AS unread
               FROM (SELECT id, recipient_id, read_at,
                            CASE WHEN sender_id=? THEN recipient_id ELSE sender_id END AS partner
                     FROM messages WHERE sender_id=? OR recipient_id=?)
               GROUP BY partner ORDER BY last_id DESC LIMIT 50""", (me, me, me, me)).fetchall()
        out, total = [], 0
        for r in rows:
            u = conn.execute("SELECT id, public_id, nickname, photo FROM users WHERE id=?", (r["partner"],)).fetchone()
            m = conn.execute("SELECT * FROM messages WHERE id=?", (r["last_id"],)).fetchone()
            if not u or not m:
                continue
            state, _ = chat_state(conn, me, u["id"])
            total += r["unread"] or 0
            out.append({"publicId": u["public_id"], "nickname": u["nickname"] or "Игрок", "photo": u["photo"],
                        "unread": r["unread"] or 0, "state": state,
                        "last": {"text": m["text"][:80], "mine": m["sender_id"] == me, "at": m["created_at"]}})
    return {"chats": out, "unread": total}


@app.get("/api/chats/{public_id}")
def chat_open(public_id: str, after: int = 0, user=Depends(auth_user)):
    """Сообщения с игроком (после after). Входящие помечаются прочитанными."""
    me = user["id"]
    with closing(db()) as conn, conn:
        p = _peer(conn, public_id)
        if p["id"] == me:
            raise HTTPException(400, "Нельзя писать самому себе")
        state, can = chat_state(conn, me, p["id"])
        rows = conn.execute(
            """SELECT * FROM (SELECT * FROM messages
                  WHERE ((sender_id=? AND recipient_id=?) OR (sender_id=? AND recipient_id=?)) AND id>?
                  ORDER BY id DESC LIMIT 100) ORDER BY id ASC""", (me, p["id"], p["id"], me, after)).fetchall()
        conn.execute("UPDATE messages SET read_at=? WHERE recipient_id=? AND sender_id=? AND read_at IS NULL",
                     (int(time.time()), me, p["id"]))
    return {"peer": {"publicId": p["public_id"], "nickname": p["nickname"] or "Игрок", "photo": p["photo"]},
            "state": state, "canSend": can, "messages": [_msg_json(r, me) for r in rows]}


@app.post("/api/chats/{public_id}/send")
def chat_send(public_id: str, body: SendBody, bg: BackgroundTasks, user=Depends(auth_user)):
    me = user["id"]
    text = body.text.replace("\r", "").strip()
    if not text:
        raise HTTPException(400, "Введите сообщение")
    if len(text) > MSG_MAX:
        raise HTTPException(400, f"Не больше {MSG_MAX} символов")
    now = int(time.time())
    notify = None
    with closing(db()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        p = _peer(conn, public_id)
        if p["id"] == me:
            raise HTTPException(400, "Нельзя писать самому себе")
        state, can = chat_state(conn, me, p["id"])
        if state == "blocked_by_me":
            raise HTTPException(400, "Сначала разблокируйте игрока")
        if not can:
            if state == "request_out":
                raise HTTPException(400, "Дождитесь, пока игрок примет запрос на переписку")
            raise HTTPException(400, "Не удалось отправить сообщение")
        if conn.execute("SELECT COUNT(*) FROM messages WHERE sender_id=? AND created_at>?", (me, now - 60)).fetchone()[0] >= MSG_PER_MINUTE:
            raise HTTPException(429, "Слишком часто — подождите минуту")
        x, y = _pair(me, p["id"])
        is_request = False
        if state == "none":
            conn.execute("INSERT OR REPLACE INTO chat_requests(user_a, user_b, initiator, status, created_at) VALUES(?,?,?,?,?)",
                         (x, y, me, "pending", now))
            is_request = True
        elif state == "request_in":
            # ответ на запрос = его принятие
            conn.execute("UPDATE chat_requests SET status='accepted' WHERE user_a=? AND user_b=?", (x, y))
        unread_before = conn.execute(
            "SELECT COUNT(*) FROM messages WHERE sender_id=? AND recipient_id=? AND read_at IS NULL", (me, p["id"])).fetchone()[0]
        cur = conn.execute("INSERT INTO messages(sender_id, recipient_id, text, created_at) VALUES(?,?,?,?)",
                           (me, p["id"], text, now))
        mid = cur.lastrowid
        new_state, new_can = chat_state(conn, me, p["id"])
        rcpt = conn.execute("SELECT telegram_id FROM users WHERE id=?", (p["id"],)).fetchone()
        if unread_before == 0 and rcpt and rcpt["telegram_id"]:
            notify = (rcpt["telegram_id"], is_request)
    if notify:
        name = htmllib.escape(user["nickname"] or "Игрок")
        msg = (f"💬 <b>{name}</b> хочет начать переписку" if notify[1] else f"💬 Вам написал(а) <b>{name}</b>") + \
              "\n<i>Сообщение можно прочитать в мини-аппе.</i>"
        bg.add_task(notify_telegram, notify[0], msg)
    return {"message": {"id": mid, "mine": True, "text": text, "at": now}, "state": new_state, "canSend": new_can}


@app.post("/api/chats/{public_id}/accept")
def chat_accept(public_id: str, user=Depends(auth_user)):
    me = user["id"]
    with closing(db()) as conn, conn:
        p = _peer(conn, public_id)
        x, y = _pair(me, p["id"])
        cur = conn.execute("UPDATE chat_requests SET status='accepted' WHERE user_a=? AND user_b=? AND initiator<>?", (x, y, me))
        if cur.rowcount == 0:
            raise HTTPException(404, "Запрос не найден")
        state, can = chat_state(conn, me, p["id"])
    return {"state": state, "canSend": can}


@app.post("/api/chats/{public_id}/decline")
def chat_decline(public_id: str, user=Depends(auth_user)):
    me = user["id"]
    with closing(db()) as conn, conn:
        p = _peer(conn, public_id)
        x, y = _pair(me, p["id"])
        cur = conn.execute("UPDATE chat_requests SET status='declined' WHERE user_a=? AND user_b=? AND initiator<>? AND status='pending'", (x, y, me))
        if cur.rowcount == 0:
            raise HTTPException(404, "Запрос не найден")
        state, can = chat_state(conn, me, p["id"])
    return {"state": state, "canSend": can}


# ---------------------------------------------------------------------------
# Жалобы на игроков (приходят админам в админ-бота)
# ---------------------------------------------------------------------------
REPORT_REASONS = {"spam": "Спам", "abuse": "Оскорбления", "scam": "Мошенничество", "other": "Другое"}
REPORT_COMMENT_MAX = 200
REPORT_CONTEXT_MESSAGES = 10
ADMIN_BOT_TOKEN = os.environ.get("ADMIN_BOT_TOKEN", "")
ADMIN_TG_IDS = [int(x) for x in os.environ.get("ADMIN_IDS", "").split(",") if x.strip().isdigit()]


class ReportBody(BaseModel):
    publicId: str
    reason: str
    comment: str = ""


def notify_admins(text: str):
    if not ADMIN_BOT_TOKEN:
        return
    for chat_id in ADMIN_TG_IDS:
        try:
            httpx.post(f"https://api.telegram.org/bot{ADMIN_BOT_TOKEN}/sendMessage",
                       json={"chat_id": chat_id, "text": text[:3900], "parse_mode": "HTML",
                             "disable_web_page_preview": True}, timeout=8)
        except Exception:
            log.warning("не удалось отправить жалобу админу")


def report_text(rid, reporter, reported, reason, comment, context) -> str:
    e = htmllib.escape
    lines = [f"🚩 <b>Жалоба #{rid}</b> · {e(reason)}",
             f"От: <b>{e(reporter['nickname'] or '—')}</b> · ID <code>{e(reporter['public_id'] or '—')}</code>",
             f"На: <b>{e(reported['nickname'] or '—')}</b> · ID <code>{e(reported['public_id'] or '—')}</code>"]
    if comment:
        lines.append(f"Комментарий: {e(comment)}")
    if context:
        lines.append("\nПоследние сообщения:")
        for m in context[-6:]:
            who = "жалуется" if m["from"] == "reporter" else "обвиняемый"
            lines.append(f"• <i>{who}:</i> {e(m['text'][:120])}")
    return "\n".join(lines)


@app.post("/api/reports")
def create_report(body: ReportBody, bg: BackgroundTasks, user=Depends(auth_user)):
    me = user["id"]
    if body.reason not in REPORT_REASONS:
        raise HTTPException(400, "Выберите причину жалобы")
    comment = " ".join(body.comment.split())
    if len(comment) > REPORT_COMMENT_MAX:
        raise HTTPException(400, f"Комментарий: не больше {REPORT_COMMENT_MAX} символов")
    now = int(time.time())
    with closing(db()) as conn, conn:
        t = _target(conn, body.publicId)
        if t["id"] == me:
            raise HTTPException(400, "Нельзя пожаловаться на себя")
        if conn.execute("SELECT COUNT(*) FROM reports WHERE reporter_id=? AND created_at>?", (me, now - 86400)).fetchone()[0] >= 10:
            raise HTTPException(429, "Слишком много жалоб за сутки")
        if conn.execute("SELECT 1 FROM reports WHERE reporter_id=? AND reported_id=? AND created_at>?", (me, t["id"], now - 3600)).fetchone():
            raise HTTPException(400, "Вы уже отправили жалобу на этого игрока — модератор её рассмотрит")
        rows = conn.execute(
            """SELECT * FROM (SELECT * FROM messages
                  WHERE (sender_id=? AND recipient_id=?) OR (sender_id=? AND recipient_id=?)
                  ORDER BY id DESC LIMIT ?) ORDER BY id ASC""", (me, t["id"], t["id"], me, REPORT_CONTEXT_MESSAGES)).fetchall()
        context = [{"from": "reporter" if r["sender_id"] == me else "reported", "text": r["text"], "at": r["created_at"]} for r in rows]
        cur = conn.execute(
            "INSERT INTO reports(reporter_id, reported_id, reason, comment, context, created_at) VALUES(?,?,?,?,?,?)",
            (me, t["id"], body.reason, comment, json.dumps(context, ensure_ascii=False), now))
        rid = cur.lastrowid
        reported = conn.execute("SELECT nickname, public_id FROM users WHERE id=?", (t["id"],)).fetchone()
        text = report_text(rid, user, reported, REPORT_REASONS[body.reason], comment, context)
    bg.add_task(notify_admins, text)
    return {"ok": True}


class ReportCloseBody(BaseModel):
    id: int


@app.get("/admin/reports")
def admin_reports(limit: int = 10, _=Depends(check_admin)):
    limit = max(1, min(limit, 30))
    with closing(db()) as conn:
        rows = conn.execute(
            """SELECT r.*, a.nickname AS rn, a.public_id AS rp, b.nickname AS tn, b.public_id AS tp
               FROM reports r LEFT JOIN users a ON a.id=r.reporter_id LEFT JOIN users b ON b.id=r.reported_id
               WHERE r.status='new' ORDER BY r.id DESC LIMIT ?""", (limit,)).fetchall()
        total = conn.execute("SELECT COUNT(*) FROM reports WHERE status='new'").fetchone()[0]
    out = []
    for r in rows:
        try:
            ctx = json.loads(r["context"] or "[]")
        except ValueError:
            ctx = []
        out.append({"id": r["id"], "reason": REPORT_REASONS.get(r["reason"], r["reason"]), "comment": r["comment"] or "",
                    "created_at": r["created_at"], "context": ctx,
                    "reporter": {"nickname": r["rn"], "public_id": r["rp"]},
                    "reported": {"nickname": r["tn"], "public_id": r["tp"]}})
    return {"reports": out, "total": total}


@app.post("/admin/reports/close")
def admin_report_close(body: ReportCloseBody, _=Depends(check_admin)):
    with closing(db()) as conn, conn:
        n = conn.execute("UPDATE reports SET status='closed' WHERE id=?", (body.id,)).rowcount
    if not n:
        raise HTTPException(404, "Жалоба не найдена")
    return {"ok": True}


@app.get("/admin/users")
def admin_search_users(q: str = "", _=Depends(check_admin)):
    like = f"%{q}%"
    with closing(db()) as conn:
        rows = conn.execute(
            """SELECT id, public_id, login, nickname, username, balance, referral_code FROM users
               WHERE login LIKE ? OR nickname LIKE ? OR username LIKE ? OR public_id LIKE ? LIMIT 20""",
            (like, like, like, like),
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
