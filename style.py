"""Префиксы (покупаются за G, цену ставит админ), верификация и цвет ника. Админка через мини-апп."""
import json
import os
import re
from contextlib import closing

from fastapi import HTTPException

_db = None
_verify = None          # функция: initData -> dict пользователя Telegram (с проверкой подписи)
HEX = re.compile(r"^#[0-9a-fA-F]{6}$")


def setup(db, verify_init_data):
    global _db, _verify
    _db = db
    _verify = verify_init_data


def init_db(conn):
    cols = {r["name"] for r in conn.execute("PRAGMA table_info(users)").fetchall()}
    for col, typ in (("verified", "INTEGER DEFAULT 0"), ("name_color", "TEXT"),
                     ("prefix_id", "INTEGER"), ("owned_prefixes", "TEXT DEFAULT '[]'")):
        if col not in cols:
            conn.execute(f"ALTER TABLE users ADD COLUMN {col} {typ}")
    conn.execute("""CREATE TABLE IF NOT EXISTS prefixes(
        id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT NOT NULL, color TEXT NOT NULL,
        price INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1)""")


def admin_ids():
    raw = os.environ.get("ADMIN_IDS", "")
    return {int(x) for x in re.split(r"[,\s]+", raw) if x.isdigit()}


def admin_uid(init_data):
    tg = _verify(init_data or "")
    tid = int(tg.get("id", 0) or 0)
    if tid not in admin_ids():
        raise HTTPException(403, "Нет доступа")
    return tid


def _prefix(conn, pid):
    if not pid:
        return None
    p = conn.execute("SELECT * FROM prefixes WHERE id=?", (pid,)).fetchone()
    return {"id": p["id"], "text": p["text"], "color": p["color"]} if p else None


def style_fields(row):
    with closing(_db()) as conn:
        return {
            "verified": bool(row["verified"]),
            "nameColor": row["name_color"] or None,
            "prefix": _prefix(conn, row["prefix_id"]),
            "ownedPrefixes": json.loads(row["owned_prefixes"] or "[]"),
        }


# ---------- для игрока ----------
def shop(uid):
    with closing(_db()) as conn:
        u = conn.execute("SELECT balance, prefix_id, owned_prefixes FROM users WHERE id=?", (uid,)).fetchone()
        owned = set(json.loads(u["owned_prefixes"] or "[]"))
        rows = conn.execute("SELECT * FROM prefixes WHERE active=1 ORDER BY price, id").fetchall()
    return {"balance": u["balance"] or 0, "equipped": u["prefix_id"],
            "items": [{"id": r["id"], "text": r["text"], "color": r["color"], "price": r["price"],
                       "owned": r["id"] in owned} for r in rows]}


def buy(uid, pid):
    with closing(_db()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        u = conn.execute("SELECT balance, owned_prefixes FROM users WHERE id=?", (uid,)).fetchone()
        p = conn.execute("SELECT * FROM prefixes WHERE id=? AND active=1", (pid,)).fetchone()
        if p is None:
            raise HTTPException(404, "Префикс не найден")
        owned = json.loads(u["owned_prefixes"] or "[]")
        if pid in owned:
            raise HTTPException(400, "Этот префикс уже куплен")
        if (u["balance"] or 0) < p["price"]:
            raise HTTPException(400, "Не хватает G")
        owned.append(pid)
        conn.execute("UPDATE users SET balance=balance-?, owned_prefixes=?, rev=rev+1 WHERE id=?",
                     (p["price"], json.dumps(owned), uid))
    return {"ok": True}


def equip(uid, pid):
    with closing(_db()) as conn, conn:
        u = conn.execute("SELECT owned_prefixes FROM users WHERE id=?", (uid,)).fetchone()
        if pid is not None and pid not in json.loads(u["owned_prefixes"] or "[]"):
            raise HTTPException(400, "Сначала купите префикс")
        conn.execute("UPDATE users SET prefix_id=?, rev=rev+1 WHERE id=?", (pid, uid))
    return {"ok": True}


# ---------- для админа ----------
def _find_user(conn, who):
    who = (who or "").strip()
    if who.isdigit():
        r = conn.execute("SELECT * FROM users WHERE public_id=?", (who,)).fetchone()
        if r:
            return r
    r = conn.execute("SELECT * FROM users WHERE LOWER(login)=?", (who.lower(),)).fetchone()
    if r is None:
        raise HTTPException(404, "Игрок не найден")
    return r


def admin_users(q, offset):
    q = (q or "").strip()
    like = f"%{q}%"
    with closing(_db()) as conn:
        rows = conn.execute("""SELECT id, public_id, nickname, login, balance, verified, name_color, prefix_id
            FROM users WHERE (?='' OR public_id LIKE ? OR nickname LIKE ? OR login LIKE ?)
            ORDER BY id DESC LIMIT 30 OFFSET ?""", (q, like, like, like, max(0, offset))).fetchall()
    with closing(_db()) as conn:
        out = []
        for r in rows:
            out.append({"id": r["id"], "publicId": r["public_id"], "nickname": r["nickname"], "login": r["login"],
                        "balance": r["balance"] or 0, "verified": bool(r["verified"]), "nameColor": r["name_color"],
                        "prefixId": r["prefix_id"], "prefix": _prefix(conn, r["prefix_id"])})
    return out


def admin_user_update(who, body):
    with closing(_db()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        u = _find_user(conn, who)
        sets, args = [], []
        if "verified" in body:
            sets.append("verified=?"); args.append(1 if body["verified"] else 0)
        if "nameColor" in body:
            c = body["nameColor"] or None
            if c and not HEX.match(c):
                raise HTTPException(400, "Цвет в формате #RRGGBB")
            sets.append("name_color=?"); args.append(c)
        if "prefixId" in body:
            pid = body["prefixId"] or None
            if pid:
                if conn.execute("SELECT 1 FROM prefixes WHERE id=?", (pid,)).fetchone() is None:
                    raise HTTPException(404, "Такого префикса нет")
                owned = json.loads(u["owned_prefixes"] or "[]")
                if pid not in owned:
                    owned.append(pid)
                    sets.append("owned_prefixes=?"); args.append(json.dumps(owned))
            sets.append("prefix_id=?"); args.append(pid)
        if sets:
            conn.execute(f"UPDATE users SET {', '.join(sets)}, rev=rev+1 WHERE id=?", (*args, u["id"]))
    return {"ok": True}


def admin_prefixes():
    with closing(_db()) as conn:
        rows = conn.execute("SELECT * FROM prefixes ORDER BY id").fetchall()
    return [{"id": r["id"], "text": r["text"], "color": r["color"], "price": r["price"], "active": bool(r["active"])}
            for r in rows]


def admin_prefix_save(body):
    text = (body.get("text") or "").strip()
    color = body.get("color") or "#B6F24A"
    price = int(body.get("price") or 0)
    active = 1 if body.get("active", True) else 0
    if not 1 <= len(text) <= 12:
        raise HTTPException(400, "Префикс: от 1 до 12 символов")
    if not HEX.match(color):
        raise HTTPException(400, "Цвет в формате #RRGGBB")
    if price < 0 or price > 10**12:
        raise HTTPException(400, "Некорректная цена")
    with closing(_db()) as conn, conn:
        if body.get("id"):
            conn.execute("UPDATE prefixes SET text=?, color=?, price=?, active=? WHERE id=?",
                         (text, color, price, active, int(body["id"])))
        else:
            conn.execute("INSERT INTO prefixes(text, color, price, active) VALUES(?,?,?,?)",
                         (text, color, price, active))
    return {"ok": True}


# ---------- список игроков (поиск + подгрузка) ----------
def players(q, offset):
    q = (q or "").strip()
    like = f"%{q}%"
    with closing(_db()) as conn:
        rows = conn.execute("""SELECT * FROM users
            WHERE (?='' OR public_id LIKE ? OR nickname LIKE ?)
            ORDER BY id DESC LIMIT 30 OFFSET ?""", (q, like, like, max(0, offset))).fetchall()
        out = []
        for r in rows:
            out.append({"publicId": r["public_id"], "nickname": r["nickname"] or "Игрок",
                        "photo": r["photo"], "style": style_fields(r)})
    return out


def admin_grant_g(who, amount):
    if not 1 <= amount <= 10**12:
        raise HTTPException(400, "Сумма G: от 1 до 10^12")
    with closing(_db()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        u = _find_user(conn, who)
        conn.execute("UPDATE users SET balance=COALESCE(balance,0)+?, rev=rev+1 WHERE id=?", (amount, u["id"]))
        return {"nickname": u["nickname"] or "Игрок"}
