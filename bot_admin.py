import os
import re
import asyncio
import logging

import httpx
from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart, Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton

log = logging.getLogger("bot_admin")
TOKEN = os.environ.get("ADMIN_BOT_TOKEN", "")
# бот работает в одном процессе с сервером — ходит к нему по локальному адресу
BACKEND_URL = os.environ.get("BACKEND_URL", f"http://127.0.0.1:{os.environ.get('PORT', '8000')}").rstrip("/")
ADMIN_SECRET = os.environ["ADMIN_SECRET"]
ADMIN_IDS = {int(x) for x in os.environ.get("ADMIN_IDS", "").split(",") if x.strip().isdigit()}

dp = Dispatcher()
HEADERS = {"X-Admin-Secret": ADMIN_SECRET}


def enabled() -> bool:
    return bool(TOKEN)


def is_admin(message) -> bool:
    return message.from_user is not None and message.from_user.id in ADMIN_IDS


def err_text(r: httpx.Response) -> str:
    try:
        return r.json().get("detail", r.text)
    except Exception:
        return r.text


@dp.message(CommandStart())
async def start(message: Message):
    if not is_admin(message):
        await message.answer("У вас нет доступа к этому боту.")
        return
    await message.answer(
        "🛠 Админ-панель Amgrader\n\n"
        "/new — создать промокод по шагам (рекомендую)\n"
        "/items текст — найти id предмета по названию\n"
        "/newpromo КОД сумма [макс_использований] — промокод на баланс (G)\n"
        "/newitem КОД id_предмета [макс_использований] — промокод на предмет\n"
        "/promos — список всех промокодов\n"
        "/delpromo КОД — деактивировать промокод\n"
        "/grant логин сумма — начислить баланс пользователю напрямую\n"
        "/find текст — найти пользователя по логину/нику\n\n"
        "Пример: /newpromo WELCOME2026 500 100\n"
        "→ 100 человек смогут получить по 500 G по коду WELCOME2026"
    )


@dp.message(Command("newpromo"))
async def new_promo(message: Message):
    if not is_admin(message):
        return
    parts = message.text.split()
    if len(parts) < 3:
        await message.answer("Использование: /newpromo КОД сумма [макс_использований]")
        return
    code, amount = parts[1], parts[2]
    max_uses = int(parts[3]) if len(parts) > 3 else 1
    try:
        amount_i = int(amount)
    except ValueError:
        await message.answer("Сумма должна быть числом.")
        return

    async with httpx.AsyncClient() as client:
        r = await client.post(f"{BACKEND_URL}/admin/promo", headers=HEADERS, json={
            "code": code, "reward_type": "balance", "reward_value": amount_i,
            "max_uses": max_uses, "created_by": str(message.from_user.id),
        })
    if r.status_code == 200:
        await message.answer(f"✅ Промокод {code.upper()} создан: +{amount_i} G, использований: {max_uses}")
    else:
        await message.answer(f"❌ Ошибка: {err_text(r)}")


@dp.message(Command("newitem"))
async def new_item(message: Message):
    if not is_admin(message):
        return
    parts = message.text.split()
    if len(parts) < 3:
        await message.answer("Использование: /newitem КОД id_предмета [макс_использований]\n(id предметов см. в items.json бэкенда)")
        return
    code, item_id = parts[1], parts[2]
    max_uses = int(parts[3]) if len(parts) > 3 else 1
    try:
        item_id_i = int(item_id)
    except ValueError:
        await message.answer("id предмета должен быть числом.")
        return

    async with httpx.AsyncClient() as client:
        r = await client.post(f"{BACKEND_URL}/admin/promo", headers=HEADERS, json={
            "code": code, "reward_type": "item", "reward_value": item_id_i,
            "max_uses": max_uses, "created_by": str(message.from_user.id),
        })
    if r.status_code == 200:
        await message.answer(f"✅ Промокод {code.upper()} создан: предмет #{item_id_i}, использований: {max_uses}")
    else:
        await message.answer(f"❌ Ошибка: {err_text(r)}")


@dp.message(Command("promos"))
async def list_promos(message: Message):
    if not is_admin(message):
        return
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{BACKEND_URL}/admin/promo", headers=HEADERS)
    if r.status_code != 200:
        await message.answer(f"❌ Ошибка: {err_text(r)}")
        return
    promos = r.json()
    if not promos:
        await message.answer("Промокодов пока нет.")
        return
    lines = []
    for p in promos:
        status = "✅" if p["active"] else "🚫"
        reward = f"+{p['reward_value']} G" if p["reward_type"] == "balance" else f"предмет #{p['reward_value']}"
        lines.append(f"{status} {p['code']} — {reward} ({p['used_count']}/{p['max_uses'] or '∞'})")
    await message.answer("\n".join(lines))


@dp.message(Command("delpromo"))
async def del_promo(message: Message):
    if not is_admin(message):
        return
    parts = message.text.split()
    if len(parts) < 2:
        await message.answer("Использование: /delpromo КОД")
        return
    async with httpx.AsyncClient() as client:
        r = await client.post(f"{BACKEND_URL}/admin/promo/deactivate", headers=HEADERS, json={"code": parts[1]})
    if r.status_code == 200:
        await message.answer(f"Промокод {parts[1].upper()} деактивирован.")
    else:
        await message.answer(f"❌ Ошибка: {err_text(r)}")


@dp.message(Command("grant"))
async def grant(message: Message):
    if not is_admin(message):
        return
    parts = message.text.split()
    if len(parts) < 3:
        await message.answer("Использование: /grant логин сумма")
        return
    login, amount = parts[1], parts[2]
    try:
        amount_i = int(amount)
    except ValueError:
        await message.answer("Сумма должна быть числом.")
        return
    async with httpx.AsyncClient() as client:
        r = await client.post(f"{BACKEND_URL}/admin/grant", headers=HEADERS, json={"login": login, "amount": amount_i})
    if r.status_code == 200:
        await message.answer(f"✅ Пользователю {login} начислено {amount_i} G")
    else:
        await message.answer(f"❌ Ошибка: {err_text(r)}")


@dp.message(Command("find"))
async def find_user(message: Message):
    if not is_admin(message):
        return
    parts = message.text.split(maxsplit=1)
    q = parts[1] if len(parts) > 1 else ""
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{BACKEND_URL}/admin/users", headers=HEADERS, params={"q": q})
    if r.status_code != 200:
        await message.answer(f"❌ Ошибка: {err_text(r)}")
        return
    users = r.json()
    if not users:
        await message.answer("Никого не найдено.")
        return
    lines = [
        f"#{u['id']} {u['nickname']} (@{u['username'] or '—'}) "
        f"логин:{u['login'] or '—'} баланс:{u['balance']} код:{u['referral_code']}"
        for u in users
    ]
    await message.answer("\n".join(lines))


@dp.message(Command("items"))
async def items_cmd(message: Message):
    if not is_admin(message):
        return
    parts = message.text.split(maxsplit=1)
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{BACKEND_URL}/admin/items", headers=HEADERS, params={"q": parts[1] if len(parts) > 1 else ""})
    await message.answer("\n".join(f"#{i['id']} {i['name']} ({i['rarity']}) — {i['price']} G" for i in r.json()) or "Ничего не найдено")


# ---------------- пошаговое создание промокода: /new ----------------
class New(StatesGroup):
    code = State()
    kind = State()
    value = State()
    item = State()
    uses = State()


@dp.message(Command("cancel"))
async def cancel(message: Message, state: FSMContext):
    await state.clear()
    await message.answer("Отменено.")


@dp.message(Command("new"))
async def new_start(message: Message, state: FSMContext):
    if not is_admin(message):
        return
    await state.set_state(New.code)
    await message.answer("Введите текст промокода (буквы/цифры, например SUMMER26).\n/cancel — отмена")


@dp.message(New.code, F.text)
async def new_code(message: Message, state: FSMContext):
    code = message.text.strip().upper()
    if not re.fullmatch(r"[\w-]{3,32}", code):
        await message.answer("Код: 3–32 символа, только буквы, цифры, _ и -. Попробуйте ещё раз.")
        return
    await state.update_data(code=code)
    await state.set_state(New.kind)
    kb = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="💰 Сумма (G)", callback_data="k:balance"),
        InlineKeyboardButton(text="🎁 Предмет", callback_data="k:item"),
    ]])
    await message.answer(f"Промокод: {code}\nЧто дарить?", reply_markup=kb)


@dp.callback_query(New.kind, F.data.startswith("k:"))
async def new_kind(cb: CallbackQuery, state: FSMContext):
    if cb.from_user.id not in ADMIN_IDS:
        return
    kind = cb.data[2:]
    await state.update_data(kind=kind)
    if kind == "balance":
        await state.set_state(New.value)
        await cb.message.answer("Введите сумму в G (число):")
    else:
        await state.set_state(New.item)
        await cb.message.answer("Введите название предмета (или часть названия, можно по-английски):")
    await cb.answer()


@dp.message(New.value, F.text)
async def new_value(message: Message, state: FSMContext):
    txt = message.text.replace(" ", "")
    if not txt.isdigit() or int(txt) <= 0:
        await message.answer("Нужно положительное число.")
        return
    await state.update_data(value=int(txt))
    await state.set_state(New.uses)
    await message.answer("Сколько человек смогут активировать? (число, 0 = без ограничений)")


@dp.message(New.item, F.text)
async def new_item_search(message: Message, state: FSMContext):
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{BACKEND_URL}/admin/items", headers=HEADERS, params={"q": message.text})
    found = r.json()
    if not found:
        await message.answer("Ничего не нашёл, попробуйте другое слово.")
        return
    kb = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text=f"{i['name']} · {i['price']} G", callback_data=f"i:{i['id']}")] for i in found])
    await message.answer("Выберите предмет:", reply_markup=kb)


@dp.callback_query(New.item, F.data.startswith("i:"))
async def new_item_pick(cb: CallbackQuery, state: FSMContext):
    if cb.from_user.id not in ADMIN_IDS:
        return
    await state.update_data(value=int(cb.data[2:]))
    await state.set_state(New.uses)
    await cb.message.answer("Сколько человек смогут активировать? (число, 0 = без ограничений)")
    await cb.answer()


@dp.message(New.uses, F.text)
async def new_uses(message: Message, state: FSMContext):
    if not message.text.strip().isdigit():
        await message.answer("Нужно число (0 = без ограничений).")
        return
    d = await state.get_data()
    await state.clear()
    async with httpx.AsyncClient() as client:
        r = await client.post(f"{BACKEND_URL}/admin/promo", headers=HEADERS, json={
            "code": d["code"], "reward_type": d["kind"], "reward_value": d["value"],
            "max_uses": int(message.text), "created_by": str(message.from_user.id)})
    if r.status_code == 200:
        what = f"+{d['value']} G" if d["kind"] == "balance" else f"предмет #{d['value']}"
        await message.answer(f"✅ Готово! Промокод {d['code']}: {what}, активаций: {message.text.strip() or '∞'}")
    else:
        await message.answer(f"❌ Ошибка: {err_text(r)}")


async def run():
    """Запускается из app.py; при падении перезапускается."""
    while True:
        bot = Bot(TOKEN)
        try:
            await bot.delete_webhook(drop_pending_updates=True)
            await dp.start_polling(bot, handle_signals=False)
            return
        except asyncio.CancelledError:
            raise
        except Exception:
            log.exception("админ-бот упал, перезапуск через 5 с")
            await asyncio.sleep(5)
        finally:
            await bot.session.close()
