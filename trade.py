"""Трейды: обмен предметами (и G сверху) с другом или по ссылке.
Обе стороны подтверждают → 10 секунд отмены → обмен. Комиссия TRADE_FEE_PCT % с каждой стороны
уходит на аккаунт TRADE_FEE_LOGIN (логин администратора). Обмен атомарный: в одной транзакции."""
import asyncio
import json
import re
import os
import secrets
import time
from collections import Counter
from contextlib import closing

from fastapi import HTTPException

COUNTDOWN = 10
MAX_OPEN = 10
FEE_PCT = float(os.environ.get("TRADE_FEE_PCT", "5"))
FEE_LOGIN = os.environ.get("TRADE_FEE_LOGIN", "").strip().lower()
ACTIVE = ("open", "countdown")
_db = None
_items = {}


def setup(db, items):
    global _db, _items
    _db = db
    _items = {i["id"]: i for i in items}


def init_db(conn):
    conn.execute("""CREATE TABLE IF NOT EXISTS trades(
        id TEXT PRIMARY KEY, from_uid INTEGER, to_uid INTEGER,
        a_items TEXT DEFAULT '[]', a_g INTEGER DEFAULT 0, a_ok INTEGER DEFAULT 0,
        b_items TEXT DEFAULT '[]', b_g INTEGER DEFAULT 0, b_ok INTEGER DEFAULT 0,
        status TEXT DEFAULT 'open', exec_at INTEGER DEFAULT 0, note TEXT DEFAULT '',
        created_at INTEGER, updated_at INTEGER)""")


def _value(ids):
    return sum(_items[i]["price"] for i in ids)


def _fee(ids, g, enabled):
    if not enabled or FEE_PCT <= 0:
        return 0
    return int(round((_value(ids) + g) * FEE_PCT / 100))


def _admin(conn):
    if not FEE_LOGIN:
        return None
    return conn.execute("SELECT id FROM users WHERE LOWER(login)=?", (FEE_LOGIN,)).fetchone()


def _has(inv, ids):
    have = Counter(inv)
    return all(have[k] >= v for k, v in Counter(ids).items())


def _check_side(uid, conn, items, g):
    """Проверяем, что у игрока есть такие предметы и столько G (с учётом комиссии)."""
    if not isinstance(items, list) or any(not isinstance(i, int) or i not in _items for i in items):
        raise HTTPException(400, "Некорректные предметы")
    if len(items) > 50:
        raise HTTPException(400, "Не больше 50 предметов за раз")
    if not isinstance(g, int) or g < 0:
        raise HTTPException(400, "Некорректная сумма M")
    row = conn.execute("SELECT inventory, balance FROM users WHERE id=?", (uid,)).fetchone()
    inv = json.loads(row["inventory"] or "[]")
    if not _has(inv, items):
        raise HTTPException(400, "Недостаточно предметов в инвентаре")
    if g > (row["balance"] or 0):
        raise HTTPException(400, "Недостаточно M")
    return sorted(items), g


def _load(conn, code):
    row = conn.execute("SELECT * FROM trades WHERE id=?", (code,)).fetchone()
    if row is None:
        raise HTTPException(404, "Трейд не найден")
    return row


def _names(conn, uid):
    if uid is None:
        return None, None, None
    import style
    r = conn.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
    return (r["public_id"], r["nickname"] or "Игрок", style.style_fields(r)) if r else (None, None, None)


def _view(conn, row, me):
    now = int(time.time())
    a_pid, a_nick, a_style = _names(conn, row["from_uid"])
    b_pid, b_nick, b_style = _names(conn, row["to_uid"])
    a_items, b_items = json.loads(row["a_items"]), json.loads(row["b_items"])
    enabled = bool(FEE_LOGIN and _admin(conn))
    return {
        "id": row["id"],
        "status": row["status"],
        "note": row["note"] or "",
        "you": "a" if row["from_uid"] == me else "b",
        "secondsLeft": max(0, row["exec_at"] - now) if row["status"] == "countdown" else 0,
        "feePct": FEE_PCT if enabled else 0,
        "a": {"items": a_items, "g": row["a_g"], "ok": bool(row["a_ok"]), "publicId": a_pid, "nickname": a_nick, "style": a_style,
              "fee": _fee(a_items, row["a_g"], enabled)},
        "b": {"items": b_items, "g": row["b_g"], "ok": bool(row["b_ok"]), "publicId": b_pid, "nickname": b_nick, "style": b_style,
              "fee": _fee(b_items, row["b_g"], enabled)},
    }


def _party(row, uid):
    if uid not in (row["from_uid"], row["to_uid"]):
        raise HTTPException(403, "Это не ваш трейд")


def _open_count(conn, uid):
    return conn.execute("SELECT COUNT(*) AS n FROM trades WHERE status IN ('open','countdown') AND (from_uid=? OR to_uid=?)",
                        (uid, uid)).fetchone()["n"]


def _execute(conn, row):
    """Исполнение обмена внутри уже открытой транзакции."""
    a, b = row["from_uid"], row["to_uid"]
    a_items, b_items = json.loads(row["a_items"]), json.loads(row["b_items"])
    ua = conn.execute("SELECT * FROM users WHERE id=?", (a,)).fetchone()
    ub = conn.execute("SELECT * FROM users WHERE id=?", (b,)).fetchone()
    admin = _admin(conn)
    fee_a = _fee(a_items, row["a_g"], bool(admin))
    fee_b = _fee(b_items, row["b_g"], bool(admin))
    inv_a = json.loads(ua["inventory"] or "[]")
    inv_b = json.loads(ub["inventory"] or "[]")
    problem = None
    if not _has(inv_a, a_items) or not _has(inv_b, b_items):
        problem = "Предмет уже нет в инвентаре — предложение нужно обновить"
    elif (ua["balance"] or 0) < row["a_g"] + fee_a or (ub["balance"] or 0) < row["b_g"] + fee_b:
        problem = "Не хватает M на комиссию или сумму — предложение нужно обновить"
    if problem:
        conn.execute("UPDATE trades SET status='open', a_ok=0, b_ok=0, exec_at=0, note=?, updated_at=? WHERE id=?",
                     (problem, int(time.time()), row["id"]))
        return
    for x in a_items:
        inv_a.remove(x)
    inv_a += b_items
    for x in b_items:
        inv_b.remove(x)
    inv_b += a_items
    conn.execute("UPDATE users SET inventory=?, balance=?, rev=rev+1 WHERE id=?",
                 (json.dumps(inv_a), (ua["balance"] or 0) - row["a_g"] - fee_a + row["b_g"], a))
    conn.execute("UPDATE users SET inventory=?, balance=?, rev=rev+1 WHERE id=?",
                 (json.dumps(inv_b), (ub["balance"] or 0) - row["b_g"] - fee_b + row["a_g"], b))
    if admin and fee_a + fee_b > 0:
        conn.execute("UPDATE users SET balance=COALESCE(balance,0)+?, rev=rev+1 WHERE id=?",
                     (fee_a + fee_b, admin["id"]))
    conn.execute("UPDATE trades SET status='done', note='', updated_at=? WHERE id=?", (int(time.time()), row["id"]))


def _maybe_execute(conn, row):
    if row["status"] == "countdown" and time.time() >= row["exec_at"]:
        _execute(conn, row)
        row = _load(conn, row["id"])
    return row


# ---------------------------------------------------------------------------
# Публичные функции (вызываются из app.py)
# ---------------------------------------------------------------------------
def create(uid, items, g, to_public_id):
    with closing(_db()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        if _open_count(conn, uid) >= MAX_OPEN:
            raise HTTPException(400, f"Можно вести не больше {MAX_OPEN} трейдов одновременно")
        to_uid = None
        digits = re.sub(r"\D", "", to_public_id or "")
        if to_public_id and not digits:
            raise HTTPException(400, "Введите ID друга — цифры из профиля")
        if digits:
            r = conn.execute("SELECT id FROM users WHERE public_id=?", (digits,)).fetchone()
            if r is None:
                raise HTTPException(404, "Игрок с таким ID не найден")
            if r["id"] == uid:
                raise HTTPException(400, "Нельзя торговать с самим собой")
            f = conn.execute("""SELECT 1 FROM friendships WHERE status='accepted' AND
                 ((user_a=? AND user_b=?) OR (user_a=? AND user_b=?))""", (uid, r["id"], r["id"], uid)).fetchone()
            if f is None:
                raise HTTPException(400, "Трейд можно отправить только другу")
            to_uid = r["id"]
        a_items, a_g = _check_side(uid, conn, items, g)
        code = secrets.token_hex(4)
        now = int(time.time())
        conn.execute("""INSERT INTO trades(id, from_uid, to_uid, a_items, a_g, status, created_at, updated_at)
                        VALUES(?,?,?,?,?,'open',?,?)""",
                     (code, uid, to_uid, json.dumps(a_items), a_g, now, now))
        return _view(conn, _load(conn, code), uid)


def list_for(uid):
    with closing(_db()) as conn:
        rows = conn.execute("SELECT * FROM trades WHERE from_uid=? OR to_uid=? ORDER BY updated_at DESC LIMIT 30",
                            (uid, uid)).fetchall()
        return [_view(conn, r, uid) for r in rows]


def get(uid, code):
    with closing(_db()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        row = _load(conn, code)
        if row["to_uid"] is None and row["from_uid"] != uid:
            return {"id": code, "status": row["status"], "needJoin": True}
        _party(row, uid)
        row = _maybe_execute(conn, row)
        return _view(conn, row, uid)


def join(uid, code):
    with closing(_db()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        row = _load(conn, code)
        if row["to_uid"] is None and row["from_uid"] != uid:
            if row["status"] != "open":
                raise HTTPException(400, "Трейд уже закрыт")
            if _open_count(conn, uid) >= MAX_OPEN:
                raise HTTPException(400, f"Можно вести не больше {MAX_OPEN} трейдов одновременно")
            conn.execute("UPDATE trades SET to_uid=?, updated_at=? WHERE id=?", (uid, int(time.time()), code))
            row = _load(conn, code)
        _party(row, uid)
        return _view(conn, row, uid)


def set_side(uid, code, items, g):
    with closing(_db()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        row = _load(conn, code)
        _party(row, uid)
        if row["status"] not in ACTIVE:
            raise HTTPException(400, "Трейд уже закрыт")
        side_items, side_g = _check_side(uid, conn, items, g)
        col = "a" if row["from_uid"] == uid else "b"
        # Если ничего не поменялось, не сбрасываем подтверждения (иначе второй игрок сбивал первого)
        if sorted(json.loads(row[f"{col}_items"])) == side_items and row[f"{col}_g"] == side_g:
            return _view(conn, row, uid)
        conn.execute(f"""UPDATE trades SET {col}_items=?, {col}_g=?, a_ok=0, b_ok=0, status='open',
                         exec_at=0, note='', updated_at=? WHERE id=?""",
                     (json.dumps(side_items), side_g, int(time.time()), code))
        return _view(conn, _load(conn, code), uid)


def confirm(uid, code):
    with closing(_db()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        row = _load(conn, code)
        _party(row, uid)
        if row["status"] not in ACTIVE:
            raise HTTPException(400, "Трейд уже закрыт")
        if row["to_uid"] is None:
            raise HTTPException(400, "Дождитесь, пока второй игрок откроет трейд")
        if not json.loads(row["a_items"]) and not json.loads(row["b_items"]) and not row["a_g"] and not row["b_g"]:
            raise HTTPException(400, "Добавьте предметы или M")
        col = "a" if row["from_uid"] == uid else "b"
        conn.execute(f"UPDATE trades SET {col}_ok=1, updated_at=? WHERE id=?", (int(time.time()), code))
        row = _load(conn, code)
        if row["a_ok"] and row["b_ok"]:
            conn.execute("UPDATE trades SET status='countdown', exec_at=?, note='' WHERE id=?",
                         (int(time.time()) + COUNTDOWN, code))
            row = _load(conn, code)
        return _view(conn, row, uid)


def cancel(uid, code):
    with closing(_db()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        row = _load(conn, code)
        _party(row, uid)
        if row["status"] in ACTIVE:
            conn.execute("UPDATE trades SET status='cancelled', a_ok=0, b_ok=0, exec_at=0, updated_at=? WHERE id=?",
                         (int(time.time()), code))
        return _view(conn, _load(conn, code), uid)


async def sweeper():
    """Раз в секунду исполняет трейды, у которых истекли 10 секунд, даже если никто не открыт."""
    while True:
        try:
            with closing(_db()) as conn, conn:
                conn.execute("BEGIN IMMEDIATE")
                due = conn.execute("SELECT * FROM trades WHERE status='countdown' AND exec_at<=?",
                                   (int(time.time()),)).fetchall()
                for row in due:
                    _execute(conn, row)
        except Exception:
            pass
        await asyncio.sleep(1)
