"""Темы оформления в аккаунте: выбранная тема и свои темы (до 8). Цвет — #RRGGBB."""
import json
import re
import secrets
from contextlib import closing

from fastapi import HTTPException

BUILTIN = {"lime", "blue", "red", "orange", "yellow", "green", "cyan", "violet", "pink", "white", "graphite", "brown"}
HEX = re.compile(r"^#[0-9a-fA-F]{6}$")
MAX_CUSTOM = 8
_db = None


def setup(db):
    global _db
    _db = db


def init_db(conn):
    cols = {r["name"] for r in conn.execute("PRAGMA table_info(users)").fetchall()}
    if "theme" not in cols:
        conn.execute("ALTER TABLE users ADD COLUMN theme TEXT")
    if "custom_themes" not in cols:
        conn.execute("ALTER TABLE users ADD COLUMN custom_themes TEXT")


def _load(conn, uid):
    r = conn.execute("SELECT theme, custom_themes FROM users WHERE id=?", (uid,)).fetchone()
    if r is None:
        raise HTTPException(401, "invalid token")
    return (r["theme"] or "lime"), json.loads(r["custom_themes"] or "[]")


def get(uid):
    with closing(_db()) as conn:
        theme, custom = _load(conn, uid)
    return {"theme": theme, "custom": custom}


def set_theme(uid, value):
    value = (value or "").strip()
    with closing(_db()) as conn, conn:
        theme, custom = _load(conn, uid)
        if HEX.match(value):
            value = value.lower()
        elif value not in BUILTIN and not any(c["id"] == value for c in custom):
            raise HTTPException(400, "Неизвестная тема")
        conn.execute("UPDATE users SET theme=? WHERE id=?", (value, uid))
    return {"theme": value, "custom": custom}


def add_custom(uid, name, color):
    name = (name or "").strip()
    if not 1 <= len(name) <= 20:
        raise HTTPException(400, "Название: от 1 до 20 символов")
    if not HEX.match(color or ""):
        raise HTTPException(400, "Некорректный цвет")
    with closing(_db()) as conn, conn:
        theme, custom = _load(conn, uid)
        if len(custom) >= MAX_CUSTOM:
            raise HTTPException(400, f"Можно сохранить не больше {MAX_CUSTOM} своих тем")
        custom.append({"id": "c" + secrets.token_hex(3), "name": name, "color": color.lower()})
        conn.execute("UPDATE users SET custom_themes=? WHERE id=?", (json.dumps(custom, ensure_ascii=False), uid))
    return {"theme": theme, "custom": custom}


def delete_custom(uid, cid):
    with closing(_db()) as conn, conn:
        theme, custom = _load(conn, uid)
        left = [c for c in custom if c["id"] != cid]
        if len(left) == len(custom):
            raise HTTPException(404, "Нет такой темы")
        if theme == cid:
            theme = "lime"
        conn.execute("UPDATE users SET custom_themes=?, theme=? WHERE id=?",
                     (json.dumps(left, ensure_ascii=False), theme, uid))
    return {"theme": theme, "custom": left}
