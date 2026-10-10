"""Колесо бонусов: бесплатная прокрутка раз в 3 часа + запас прокруток (выдаёт админ).
Призы: монеты 5–500 G и 6 самых дешёвых предметов из items.json. Каждую прокрутку набор из 8 призов новый."""
import json
import re
import time
import random
from contextlib import closing

from fastapi import HTTPException

PRIZES_G = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 250, 300, 400, 500]
CHEAP_ITEMS = 6
SECTORS = 8
COOLDOWN = 3 * 3600
_rng = random.SystemRandom()
_db = None
_user_public = None
_pool = []          # [("g", сумма) | ("item", id)]
_items = {}
_cheap = []


def setup(db, user_public, items=()):
    global _db, _user_public, _pool, _items, _cheap
    _db = db
    _user_public = user_public
    _items = {i["id"]: i for i in items}
    cheap = sorted(items, key=lambda i: (i["price"], i["id"]))[:CHEAP_ITEMS]
    _cheap = [{"id": i["id"], "name": i["name"], "rarity": i["rarity"], "price": i["price"]} for i in cheap]
    _pool = [("g", v) for v in PRIZES_G] + [("item", i["id"]) for i in cheap]


def init_db(conn):
    cols = {r["name"] for r in conn.execute("PRAGMA table_info(users)").fetchall()}
    if "wheel_next_at" not in cols:
        conn.execute("ALTER TABLE users ADD COLUMN wheel_next_at INTEGER")
    if "spins" not in cols:
        conn.execute("ALTER TABLE users ADD COLUMN spins INTEGER DEFAULT 0")


def status(uid):
    with closing(_db()) as conn:
        r = conn.execute("SELECT wheel_next_at, spins FROM users WHERE id=?", (uid,)).fetchone()
    left = max(0, int((r["wheel_next_at"] or 0) - time.time()))
    return {"secondsLeft": left, "spins": r["spins"] or 0, "sectors": SECTORS,
            "prizes": {"g": PRIZES_G, "items": _cheap}}


def spin(uid):
    with closing(_db()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        r = conn.execute("SELECT wheel_next_at, spins, inventory FROM users WHERE id=?", (uid,)).fetchone()
        now = int(time.time())
        spins = r["spins"] or 0
        free = (r["wheel_next_at"] or 0) <= now
        if not free and spins <= 0:
            raise HTTPException(400, "Колесо ещё не готово")
        if not _pool:
            raise HTTPException(503, "Призы колеса не настроены")
        # Сначала бесплатная прокрутка по таймеру, потом запас
        if free:
            next_at = now + COOLDOWN
        else:
            next_at = r["wheel_next_at"]
            spins -= 1
        sector = _rng.randrange(SECTORS)
        layout = _rng.sample(_pool, min(SECTORS, len(_pool)))
        kind, value = layout[sector % len(layout)]
        if kind == "g":
            prize = {"type": "g", "amount": value}
            conn.execute("UPDATE users SET balance=balance+?, rev=rev+1, wheel_next_at=?, spins=? WHERE id=?",
                         (value, next_at, spins, uid))
        else:
            item = _items[value]
            inv = json.loads(r["inventory"] or "[]")
            inv.append(value)
            prize = {"type": "item", "id": item["id"], "name": item["name"], "rarity": item["rarity"]}
            conn.execute("UPDATE users SET inventory=?, rev=rev+1, wheel_next_at=?, spins=? WHERE id=?",
                         (json.dumps(inv), next_at, spins, uid))
        row = conn.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
    layout_out = []
    for kind_, value_ in layout:
        if kind_ == "g":
            layout_out.append({"type": "g", "amount": value_})
        else:
            it = _items[value_]
            layout_out.append({"type": "item", "id": it["id"], "name": it["name"]})
    return {"sector": sector, "prize": prize, "layout": layout_out,
            "secondsLeft": max(0, int(next_at - now)), "spins": spins, "user": _user_public(row)}


def grant(who, count):
    """Админ выдаёт прокрутки: who — ID игрока (цифры) или логин."""
    who = (who or "").strip()
    if not who:
        raise HTTPException(400, "Укажите ID игрока или логин")
    if not 1 <= count <= 1000:
        raise HTTPException(400, "Количество: от 1 до 1000")
    with closing(_db()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        if who.isdigit():
            row = conn.execute("SELECT id, nickname, spins FROM users WHERE public_id=?", (who,)).fetchone()
        else:
            row = conn.execute("SELECT id, nickname, spins FROM users WHERE LOWER(login)=?", (who.lower(),)).fetchone()
        if row is None:
            raise HTTPException(404, "Игрок не найден")
        total = (row["spins"] or 0) + count
        conn.execute("UPDATE users SET spins=? WHERE id=?", (total, row["id"]))
    return {"ok": True, "nickname": row["nickname"] or "Игрок", "added": count, "spins": total}