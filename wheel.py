"""Колесо бонусов: бесплатная прокрутка раз в 3 часа, 8 секторов с одинаковым шансом.
Призы: монеты 5–500 G и 6 самых дешёвых предметов из items.json. Каждую прокрутку набор из 8 призов новый."""
import json
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
    global _db, _user_public, _pool, _items
    _db = db
    _user_public = user_public
    _items = {i["id"]: i for i in items}
    global _cheap
    cheap = sorted(items, key=lambda i: (i["price"], i["id"]))[:CHEAP_ITEMS]
    _cheap = [{"id": i["id"], "name": i["name"], "rarity": i["rarity"], "price": i["price"]} for i in cheap]
    _pool = [("g", v) for v in PRIZES_G] + [("item", i["id"]) for i in cheap]


def init_db(conn):
    cols = {r["name"] for r in conn.execute("PRAGMA table_info(users)").fetchall()}
    if "wheel_next_at" not in cols:
        conn.execute("ALTER TABLE users ADD COLUMN wheel_next_at INTEGER")


def status(uid):
    with closing(_db()) as conn:
        r = conn.execute("SELECT wheel_next_at FROM users WHERE id=?", (uid,)).fetchone()
    left = max(0, int((r["wheel_next_at"] or 0) - time.time()))
    return {"secondsLeft": left, "sectors": SECTORS, "prizes": {"g": PRIZES_G, "items": _cheap}}


def spin(uid):
    with closing(_db()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        r = conn.execute("SELECT wheel_next_at, inventory FROM users WHERE id=?", (uid,)).fetchone()
        now = int(time.time())
        if (r["wheel_next_at"] or 0) > now:
            raise HTTPException(400, "Колесо ещё не готово")
        if not _pool:
            raise HTTPException(503, "Призы колеса не настроены")
        sector = _rng.randrange(SECTORS)
        layout = _rng.sample(_pool, min(SECTORS, len(_pool)))
        kind, value = layout[sector % len(layout)]
        if kind == "g":
            prize = {"type": "g", "amount": value}
            conn.execute("UPDATE users SET balance=balance+?, rev=rev+1, wheel_next_at=? WHERE id=?",
                         (value, now + COOLDOWN, uid))
        else:
            item = _items[value]
            inv = json.loads(r["inventory"] or "[]")
            inv.append(value)
            prize = {"type": "item", "id": item["id"], "name": item["name"], "rarity": item["rarity"]}
            conn.execute("UPDATE users SET inventory=?, rev=rev+1, wheel_next_at=? WHERE id=?",
                         (json.dumps(inv), now + COOLDOWN, uid))
        row = conn.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
    layout_out = []
    for kind_, value_ in layout:
        if kind_ == "g":
            layout_out.append({"type": "g", "amount": value_})
        else:
            it = _items[value_]
            layout_out.append({"type": "item", "id": it["id"], "name": it["name"]})
    return {"sector": sector, "prize": prize, "layout": layout_out, "secondsLeft": COOLDOWN, "user": _user_public(row)}