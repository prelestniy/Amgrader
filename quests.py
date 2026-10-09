"""Квесты: ежедневный набор из пула, прогресс игрока, проверка событий сервером, награды, уведомления."""
import os
import json
import time
import random
import asyncio
import logging
from collections import Counter
from contextlib import closing
from pathlib import Path

import httpx
from fastapi import HTTPException

log = logging.getLogger("quests")
BASE_DIR = Path(__file__).resolve().parent
POOL = json.loads((BASE_DIR / "quests.json").read_text(encoding="utf-8"))
POOL_BY_ID = {q["id"]: q for q in POOL}
PER_DAY = int(os.environ.get("QUESTS_PER_DAY", "5"))
NOTIFY_ACTIVE_DAYS = int(os.environ.get("QUESTS_NOTIFY_DAYS", "7"))
REWARD_BASE = 20
DIFF_MULT = {1: 1, 2: 2, 3: 3.5, 4: 5, 5: 7}
TYPE_WEIGHT = {"case": 1.0, "upgrade": 1.3}
CRAFT_COUNT = 10
NOTIFY_TEXT = "🎯 <b>Квесты обновились!</b>\nНовые задания уже ждут — скорее играть!"

_db = None
_items = {}
_token = ""
_user_public = None


def setup(db, items, bot_token, user_public):
    global _db, _items, _token, _user_public
    _db = db
    _items = {i["id"]: i for i in items}
    _token = bot_token
    _user_public = user_public


def today() -> int:
    return int((time.time() + 10800) // 86400)          # сутки по Москве, как в app.py


def secs_left() -> int:
    return int((today() + 1) * 86400 - 10800 - time.time())


def reward_for(q) -> int:
    v = REWARD_BASE * DIFF_MULT[q["difficulty"]] * TYPE_WEIGHT[q["type"]]
    return max(10, int(round(v / 10.0)) * 10)


def init_db(conn):
    conn.execute("""CREATE TABLE IF NOT EXISTS quest_days(day INTEGER PRIMARY KEY, ids TEXT)""")
    conn.execute("""CREATE TABLE IF NOT EXISTS quests_custom(
        id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, title TEXT, target INTEGER,
        rarity TEXT, chance_max REAL, difficulty INTEGER, active INTEGER DEFAULT 1)""")
    conn.execute("""CREATE TABLE IF NOT EXISTS quest_progress(
        user_id INTEGER, day INTEGER, quest_id TEXT, progress INTEGER DEFAULT 0, claimed_at INTEGER,
        PRIMARY KEY(user_id, day, quest_id))""")
    cols = {r["name"] for r in conn.execute("PRAGMA table_info(users)").fetchall()}
    for col in ("last_seen", "last_msg_id"):
        if col not in cols:
            conn.execute(f"ALTER TABLE users ADD COLUMN {col} INTEGER")


def day_ids(conn, day):
    r = conn.execute("SELECT ids FROM quest_days WHERE day=?", (day,)).fetchone()
    if r:
        return json.loads(r["ids"])
    rng = random.Random(f"amgrader-quests-{day}")
    pool_ids = sorted(_pool(conn))
    ids = rng.sample(pool_ids, min(PER_DAY, len(pool_ids)))
    conn.execute("INSERT OR IGNORE INTO quest_days(day, ids) VALUES(?,?)", (day, json.dumps(ids)))
    return ids


RARITIES = {"common", "rare", "epic", "legendary", "mythic", "secret", "galactic", "sausage"}


def _row_to_quest(r):
    return {"id": f"c{r['id']}", "type": r["type"], "title": r["title"], "target": r["target"],
            "rarity": r["rarity"], "chance_max": r["chance_max"], "difficulty": r["difficulty"]}


def _pool(conn):
    pool = dict(POOL_BY_ID)
    for r in conn.execute("SELECT * FROM quests_custom WHERE active=1").fetchall():
        pool[f"c{r['id']}"] = _row_to_quest(r)
    return pool


def add_custom(p: dict) -> dict:
    t = p.get("type")
    if t not in ("case", "upgrade"):
        raise HTTPException(400, "Неверный тип квеста")
    title = (p.get("title") or "").strip()
    if not 2 <= len(title) <= 80:
        raise HTTPException(400, "Название: от 2 до 80 символов")
    target = int(p.get("target") or 0)
    if not 1 <= target <= 1000:
        raise HTTPException(400, "Количество: от 1 до 1000")
    rarity = p.get("rarity") or None
    if rarity in ("any", ""):
        rarity = None
    if rarity is not None and rarity not in RARITIES:
        raise HTTPException(400, "Неизвестная редкость")
    chance = p.get("chance_max")
    if t == "case":
        chance = None
    elif chance is not None and not 0 < float(chance) <= 100:
        raise HTTPException(400, "Шанс: от 1 до 100")
    diff = int(p.get("difficulty") or 0)
    if not 1 <= diff <= 5:
        raise HTTPException(400, "Сложность: от 1 до 5")
    with closing(_db()) as conn, conn:
        cur = conn.execute(
            "INSERT INTO quests_custom(type, title, target, rarity, chance_max, difficulty, active) VALUES(?,?,?,?,?,?,1)",
            (t, title, target, rarity, chance, diff))
        qid = f"c{cur.lastrowid}"
    return {"ok": True, "id": qid}


def list_custom() -> list:
    with closing(_db()) as conn:
        return [_row_to_quest(r) for r in conn.execute(
            "SELECT * FROM quests_custom WHERE active=1 ORDER BY id").fetchall()]


def delete_custom(qid: str) -> dict:
    if not (qid.startswith("c") and qid[1:].isdigit()):
        raise HTTPException(400, "Можно удалять только свои квесты")
    with closing(_db()) as conn, conn:
        n = conn.execute("UPDATE quests_custom SET active=0 WHERE id=? AND active=1", (int(qid[1:]),)).rowcount
    if not n:
        raise HTTPException(404, "Нет такого квеста")
    return {"ok": True}


def list_for(uid):
    with closing(_db()) as conn, conn:
        day = today()
        pool = _pool(conn)
        ids = [i for i in day_ids(conn, day) if i in pool]
        prog = {r["quest_id"]: r for r in conn.execute(
            "SELECT * FROM quest_progress WHERE user_id=? AND day=?", (uid, day)).fetchall()}
    out = []
    for qid in ids:
        q = pool[qid]
        p = prog.get(qid)
        progress = min(q["target"], p["progress"] if p else 0)
        out.append({"id": qid, "title": q["title"], "type": q["type"], "target": q["target"],
                    "progress": progress, "reward": reward_for(q),
                    "done": progress >= q["target"], "claimed": bool(p and p["claimed_at"])})
    return {"resetIn": secs_left(), "quests": out}


def _matches(q, kind, rarity, chance):
    if q["type"] != kind:
        return False
    if q.get("rarity") and q["rarity"] != rarity:
        return False
    if q.get("chance_max") is not None and (chance is None or chance > q["chance_max"]):
        return False
    return True


def record_event(uid, body):
    kind = body.get("type")
    inv_new = body.get("inventory") or []
    if not isinstance(inv_new, list) or any(not isinstance(i, int) or i not in _items for i in inv_new):
        raise HTTPException(400, "Некорректный инвентарь")
    with closing(_db()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        row = conn.execute("SELECT inventory FROM users WHERE id=?", (uid,)).fetchone()
        old = Counter(json.loads(row["inventory"] or "[]"))
        new = Counter(inv_new)
        added = new - old
        removed = old - new
        day = today()
        pool = _pool(conn)
        active = [pool[i] for i in day_ids(conn, day) if i in pool]
        deltas = Counter()                       # quest_id -> +прогресс

        if kind == "case":
            drops = body.get("drops") or []
            if not drops or len(drops) > 100 or any(not isinstance(d, int) or d not in _items for d in drops):
                raise HTTPException(400, "Некорректные выпавшие предметы")
            if any(added[k] < v for k, v in Counter(drops).items()):
                raise HTTPException(400, "Предметы не получены")
            for d in drops:
                rarity = _items[d]["rarity"]
                for q in active:
                    if _matches(q, "case", rarity, None):
                        deltas[q["id"]] += 1

        elif kind == "upgrade":
            if sum(removed.values()) != CRAFT_COUNT:
                raise HTTPException(400, "Апгрейд не списал предметы")
            from_rarities = {_items[k]["rarity"] for k in removed}
            if len(from_rarities) != 1:
                raise HTTPException(400, "Апгрейд из разных редкостей")
            from_r = from_rarities.pop()
            gained = list(added.elements())
            if len(gained) != 1 or _items[gained[0]]["rarity"] == from_r:
                raise HTTPException(400, "Результат апгрейда не получен")
            chance = body.get("chance")
            if chance is not None:
                if not isinstance(chance, (int, float)) or not 0 <= chance <= 100:
                    raise HTTPException(400, "Некорректный шанс")
                chance = float(chance)
            for q in active:
                if _matches(q, "upgrade", from_r, chance):
                    deltas[q["id"]] += 1
        else:
            raise HTTPException(400, "Неизвестный тип события")

        for qid, n in deltas.items():
            conn.execute(
                """INSERT INTO quest_progress(user_id, day, quest_id, progress) VALUES(?,?,?,?)
                   ON CONFLICT(user_id, day, quest_id)
                   DO UPDATE SET progress=MIN(progress+excluded.progress, ?)""",
                (uid, day, qid, n, pool[qid]["target"]))
        conn.execute("UPDATE users SET inventory=?, last_seen=? WHERE id=?",
                     (json.dumps(inv_new), int(time.time()), uid))
    return {"ok": True, "progressed": dict(deltas)}


def claim(uid, qid):
    with closing(_db()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        day = today()
        if qid not in day_ids(conn, day):
            raise HTTPException(404, "Квест не найден или уже не актуален")
        q = _pool(conn).get(qid)
        if q is None:
            raise HTTPException(404, "Квест не найден")
        p = conn.execute("SELECT * FROM quest_progress WHERE user_id=? AND day=? AND quest_id=?",
                         (uid, day, qid)).fetchone()
        if not p or p["progress"] < q["target"]:
            raise HTTPException(400, "Квест ещё не выполнен")
        if p["claimed_at"]:
            raise HTTPException(400, "Награда уже получена")
        conn.execute("UPDATE quest_progress SET claimed_at=? WHERE user_id=? AND day=? AND quest_id=?",
                     (int(time.time()), uid, day, qid))
        conn.execute("UPDATE users SET balance=balance+?, rev=rev+1 WHERE id=?", (reward_for(q), uid))
        row = conn.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
    return _user_public(row)


# ---------------------------------------------------------------------------
# Telegram: уведомления (всегда одно последнее сообщение на игрока)
# ---------------------------------------------------------------------------
def _tg(method, **params):
    try:
        r = httpx.post(f"https://api.telegram.org/bot{_token}/{method}", json=params, timeout=10).json()
        return r.get("result") if r.get("ok") else None
    except Exception:
        log.exception("telegram %s", method)
        return None


def clear_message(uid):
    """Вызывается, когда игрок открыл игру: прошлое уведомление удаляем из чата."""
    with closing(_db()) as conn, conn:
        row = conn.execute("SELECT telegram_id, last_msg_id FROM users WHERE id=?", (uid,)).fetchone()
        conn.execute("UPDATE users SET last_seen=?, last_msg_id=NULL WHERE id=?", (int(time.time()), uid))
    if row and row["last_msg_id"] and row["telegram_id"]:
        _tg("deleteMessage", chat_id=row["telegram_id"], message_id=row["last_msg_id"])


def notify_all():
    cutoff = int(time.time()) - NOTIFY_ACTIVE_DAYS * 86400
    with closing(_db()) as conn:
        rows = conn.execute(
            "SELECT id, telegram_id, last_msg_id FROM users WHERE telegram_id IS NOT NULL AND last_seen>=?",
            (cutoff,)).fetchall()
    for r in rows:
        if r["last_msg_id"]:
            _tg("deleteMessage", chat_id=r["telegram_id"], message_id=r["last_msg_id"])
        res = _tg("sendMessage", chat_id=r["telegram_id"], text=NOTIFY_TEXT, parse_mode="HTML",
                  disable_notification=True)
        mid = res.get("message_id") if res else None
        with closing(_db()) as conn, conn:
            conn.execute("UPDATE users SET last_msg_id=? WHERE id=?", (mid, r["id"]))
        time.sleep(0.05)                                   # не упираемся в лимиты Telegram


async def scheduler():
    """Раз в минуту проверяет, наступили ли новые сутки; при смене дня готовит набор и рассылает."""
    last = None
    while True:
        try:
            d = today()
            if d != last:
                with closing(_db()) as conn, conn:
                    day_ids(conn, d)
                if last is not None:
                    await asyncio.to_thread(notify_all)
                last = d
        except Exception:
            log.exception("quests scheduler")
        await asyncio.sleep(60)
