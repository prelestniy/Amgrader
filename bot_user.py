import os
import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart, CommandObject
from aiogram.types import (Message, WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton, MenuButtonWebApp)

log = logging.getLogger("bot_user")
TOKEN = os.environ.get("BOT_TOKEN", "")
dp = Dispatcher()


def enabled() -> bool:
    return bool(TOKEN)


def webapp_url() -> str:
    url = os.environ.get("WEBAPP_URL", "")
    if not url and os.environ.get("RAILWAY_PUBLIC_DOMAIN"):
        url = "https://" + os.environ["RAILWAY_PUBLIC_DOMAIN"]
    return url.rstrip("/")


@dp.message(CommandStart())
async def start(message: Message, command: CommandObject):
    url = webapp_url()
    if not url:
        await message.answer("Мини-апп пока не настроен (нет WEBAPP_URL).")
        return
    arg = (command.args or "").strip()
    if arg.startswith("ref_"):                      # ссылка-приглашение t.me/бот?start=ref_КОД
        url += "?ref=" + "".join(ch for ch in arg[4:] if ch.isalnum())[:16]
    kb = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="🎮 Играть", web_app=WebAppInfo(url=url))]])
    await message.answer("Добро пожаловать в Amgrader! Нажмите кнопку, чтобы открыть игру.", reply_markup=kb)


async def run():
    """Запускается из app.py; при падении перезапускается."""
    while True:
        bot = Bot(TOKEN)
        try:
            me = await bot.get_me()
            os.environ["BOT_USERNAME"] = me.username or ""
            if webapp_url():
                try:
                    await bot.set_chat_menu_button(menu_button=MenuButtonWebApp(text="Играть", web_app=WebAppInfo(url=webapp_url())))
                except Exception:
                    log.exception("не удалось поставить кнопку меню")
            await bot.delete_webhook(drop_pending_updates=True)
            await dp.start_polling(bot, handle_signals=False)
            return
        except asyncio.CancelledError:
            raise
        except Exception:
            log.exception("бот упал, перезапуск через 5 с")
            await asyncio.sleep(5)
        finally:
            await bot.session.close()
