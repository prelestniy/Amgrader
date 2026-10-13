"""Отдельный бот входа: открывается, когда игрок заходит через Telegram из приложения вне Telegram."""
import asyncio
import logging
import os
import re

from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart, CommandObject
from aiogram.types import Message

import webauth

log = logging.getLogger("auth_bot")
TOKEN = os.environ.get("AUTH_BOT_TOKEN", "")
dp = Dispatcher()
ARG = re.compile(r"^w_([0-9a-f]{24})(?:_([A-Za-z0-9]{1,32}))?$")


def enabled() -> bool:
    return bool(TOKEN)


@dp.message(CommandStart())
async def start(message: Message, command: CommandObject):
    m = ARG.match((command.args or "").strip())
    if not m:
        await message.answer("Откройте приложение Amgrader и нажмите «Войти через Telegram».")
        return
    token, ref = m.group(1), m.group(2)
    u = message.from_user
    tg = {"id": u.id, "username": u.username, "first_name": u.first_name, "last_name": u.last_name}
    try:
        webauth.authorize(token, tg, ref)
    except ValueError as e:
        await message.answer(f"Ссылка не работает: {e}. Нажмите вход в приложении ещё раз.")
        return
    await message.answer("✅ Готово! Вернитесь в приложение — вход выполнится автоматически.")


async def run():
    while True:
        bot = Bot(TOKEN)
        try:
            me = await bot.get_me()
            os.environ["AUTH_BOT_USERNAME"] = me.username or ""
            await bot.delete_webhook(drop_pending_updates=True)
            await dp.start_polling(bot, handle_signals=False)
            return
        except asyncio.CancelledError:
            raise
        except Exception:
            log.exception("бот входа: ошибка, повтор через 5 секунд")
            await asyncio.sleep(5)
        finally:
            await bot.session.close()
