"""Вход через Telegram из приложения (APK / браузер): одноразовая ссылка на отдельного бота.
Сайт создаёт сессию входа → открывается бот с параметром → бот подтверждает Telegram-аккаунт
(и реферальный код) → сайт получает токен и входит. Токен отдаётся один раз."""
import re
import secrets
import time
from contextlib import closing

from fastapi import HTTPException

TTL = 600          # сессия входа живёт 10 минут
_db = None
_user_public = None
_upsert = None     # функция: (tg_user dict, ref) -> строка пользователя


def setup(db, user_public, upsert):
    global _db, _user_public, _upsert
    _db = db
    _user_public = user_public
    _upsert = upsert


def init_db(conn):
    conn.execute("""CREATE TABLE IF NOT EXISTS web_logins(
        token TEXT PRIMARY KEY, ref TEXT, status TEXT DEFAULT 'pending', user_id INTEGER, created_at INTEGER)""")


def _clean_ref(ref):
    return re.sub(r"[^A-Za-z0-9]", "", ref or "")[:32]


def start(ref):
    token = secrets.token_hex(12)          # 24 hex-символа: безопасно для параметра start
    ref = _clean_ref(ref)
    with closing(_db()) as conn, conn:
        conn.execute("INSERT INTO web_logins(token, ref, status, created_at) VALUES(?,?,'pending',?)",
                     (token, ref, int(time.time())))
    return token, ref


def authorize(token, tg_user, ref_from_link):
    """Вызывается ботом, когда игрок нажал «Start» по ссылке."""
    with closing(_db()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        row = conn.execute("SELECT * FROM web_logins WHERE token=?", (token,)).fetchone()
        if row is None:
            raise ValueError("сессия не найдена")
        if time.time() - row["created_at"] > TTL:
            conn.execute("DELETE FROM web_logins WHERE token=?", (token,))
            raise ValueError("время входа истекло")
        if row["status"] != "pending":
            raise ValueError("вход уже выполнен")
        ref = _clean_ref(ref_from_link) or row["ref"] or None
        user = _upsert(tg_user, ref)
        conn.execute("UPDATE web_logins SET status='ok', user_id=? WHERE token=?", (user["id"], token))


def status(token):
    with closing(_db()) as conn, conn:
        row = conn.execute("SELECT * FROM web_logins WHERE token=?", (token,)).fetchone()
        if row is None:
            return {"status": "expired"}
        if time.time() - row["created_at"] > TTL:
            conn.execute("DELETE FROM web_logins WHERE token=?", (token,))
            return {"status": "expired"}
        if row["status"] == "pending":
            return {"status": "pending"}
        user = conn.execute("SELECT * FROM users WHERE id=?", (row["user_id"],)).fetchone()
        conn.execute("DELETE FROM web_logins WHERE token=?", (token,))     # токен отдаём один раз
        if user is None:
            return {"status": "expired"}
        return {"status": "ok", "user": _user_public(user)}
