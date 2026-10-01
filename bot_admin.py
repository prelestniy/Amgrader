"""
Админ-бот Amgrader: кнопочное меню + пошаговые мастера (как /new).

Как устроено:
  • /start или /menu — главное меню, всё делается кнопками;
  • каждое действие — «мастер»: бот спрашивает по одному шагу, на каждом шаге
    есть быстрые кнопки, «⬅️ Назад» и «❌ Отмена», в конце — проверка и «✅ Подтвердить»;
  • старые слэш-команды (/new, /grant, /luck …) остались и просто запускают нужный мастер.

Чтобы добавить новое действие — опиши Flow в конце файла (шаги + функция run) и
поставь кнопку в MENUS. Больше ничего трогать не нужно.
"""
import asyncio
import html
import inspect
import logging
import os
import re
from dataclasses import dataclass
from typing import Any, Callable, Optional

import httpx
from aiogram import Bot, Dispatcher, F, Router
from aiogram.exceptions import TelegramBadRequest
from aiogram.filters import BaseFilter, Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import BotCommand, CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup, Message

log = logging.getLogger("bot_admin")
TOKEN = os.environ.get("ADMIN_BOT_TOKEN", "")
# бот работает в одном процессе с сервером — ходит к нему по локальному адресу
BACKEND_URL = os.environ.get("BACKEND_URL", f"http://127.0.0.1:{os.environ.get('PORT', '8000')}").rstrip("/")
ADMIN_SECRET = os.environ["ADMIN_SECRET"]
ADMIN_IDS = {int(x) for x in os.environ.get("ADMIN_IDS", "").split(",") if x.strip().isdigit()}
HEADERS = {"X-Admin-Secret": ADMIN_SECRET}


class IsAdmin(BaseFilter):
    async def __call__(self, event) -> bool:
        u = getattr(event, "from_user", None)
        return bool(u and u.id in ADMIN_IDS)


dp = Dispatcher()
admin = Router()      # всё для админов
other = Router()      # «заглушки» для чужих и непонятных сообщений (подключается последним)
admin.message.filter(IsAdmin())
admin.callback_query.filter(IsAdmin())
dp.include_router(admin)
dp.include_router(other)


def enabled() -> bool:
    return bool(TOKEN)


def is_admin(message) -> bool:
    return message.from_user is not None and message.from_user.id in ADMIN_IDS


# ====================================================================
#  Сервер
# ====================================================================
class ApiError(Exception):
    pass


def err_text(r: httpx.Response) -> str:
    try:
        d = r.json().get("detail", r.text)
        return d if isinstance(d, str) else str(d)
    except Exception:
        return r.text


async def api(method: str, path: str, *, json=None, params=None):
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.request(method, f"{BACKEND_URL}{path}", headers=HEADERS, json=json, params=params)
    except httpx.HTTPError as e:
        raise ApiError(f"сервер не отвечает ({e.__class__.__name__})")
    if r.status_code != 200:
        raise ApiError(err_text(r))
    try:
        return r.json()
    except ValueError:
        return None


# ====================================================================
#  Оформление: кнопки, сообщения
# ====================================================================
def esc(x) -> str:
    return html.escape(str(x))


def fmt_g(n) -> str:
    try:
        return f"{int(n):,}".replace(",", " ")
    except (TypeError, ValueError):
        return str(n)


def B(text: str, data: str) -> InlineKeyboardButton:
    return InlineKeyboardButton(text=text, callback_data=data)


def KB(*rows) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[list(r) for r in rows if r])


def grid(buttons: list, per: int) -> list:
    return [buttons[i:i + per] for i in range(0, len(buttons), per)]


HOME = B("🏠 Главное меню", "m:main")


def clip(text: str, limit: int = 3900) -> str:
    return text if len(text) <= limit else text[:limit].rsplit("\n", 1)[0] + "\n…"


async def send(target, text: str, kb: Optional[InlineKeyboardMarkup] = None, edit: bool = True) -> Message:
    """Кнопка → правим то же сообщение (чат не засоряется). Текст от админа → новое сообщение."""
    text = clip(text)
    if isinstance(target, CallbackQuery):
        if edit and target.message:
            try:
                await target.message.edit_text(text, reply_markup=kb, parse_mode="HTML")
                return target.message
            except TelegramBadRequest as e:
                if "not modified" in str(e):
                    return target.message
        return await target.message.answer(text, reply_markup=kb, parse_mode="HTML")
    return await target.answer(text, reply_markup=kb, parse_mode="HTML")


async def strip_kb(bot: Bot, chat_id: int, msg_id: Optional[int]):
    """Убираем кнопки у прошлого вопроса, когда ответ пришёл текстом."""
    if not msg_id:
        return
    try:
        await bot.edit_message_reply_markup(chat_id=chat_id, message_id=msg_id, reply_markup=None)
    except TelegramBadRequest:
        pass


# ====================================================================
#  Меню
# ====================================================================
MENUS = {
    "main": ("🛠 <b>Админ-панель Amgrader</b>\n\nВыберите раздел 👇\n"
             "<i>Каждое действие — по шагам, в любой момент можно отменить.</i>", [
        [("🎟 Промокоды", "m:promo"), ("💰 Баланс", "m:bal")],
        [("👤 Игроки", "m:users"), ("🍀 Удача", "m:luck")],
        [("📋 Задания", "m:tasks"), ("🏆 Топ игроков", "a:top")],
    ]),
    "promo": ("🎟 <b>Промокоды</b>\nСоздавайте коды на баланс или на предмет.", [
        [("➕ Создать промокод", "go:promo")],
        [("📃 Список", "a:promos"), ("🚫 Деактивировать", "a:delpromo")],
        [("🔎 Найти предмет (id)", "go:items")],
    ]),
    "bal": ("💰 <b>Баланс</b>\nНачисление и установка баланса.", [
        [("🎁 Начислить игроку", "go:grant")],
        [("✏️ Установить игроку", "go:setbal")],
        [("➕ Прибавить ВСЕМ", "go:grantall"), ("⚖️ Установить ВСЕМ", "go:setall")],
    ]),
    "users": ("👤 <b>Игроки</b>", [
        [("🔍 Найти игрока", "go:find")],
        [("🏆 Топ по балансу", "a:top")],
    ]),
    "luck": ("🍀 <b>Скрытая удача</b>\nПока показанный шанс ≤ порога, реальный = показанный + бонус.", [
        [("🎯 Игроку", "go:luck"), ("🌍 Всем", "go:gluck")],
        [("👁 Показать правила", "go:luckshow")],
        [("🧹 Убрать у игрока", "go:luckoff"), ("🧹 Убрать у всех", "go:gluckoff")],
    ]),
    "tasks": ("📋 <b>Задания</b>\nПодписки и ссылки за награду.", [
        [("📢 Подписка на канал", "go:task_tg")],
        [("🔗 Задание по ссылке", "go:task_link")],
        [("📃 Список / удалить", "a:tasks")],
    ]),
}


async def show_menu(target, name: str = "main", note: str = ""):
    title, rows = MENUS.get(name, MENUS["main"])
    kb = [[B(t, d) for t, d in row] for row in rows]
    if name != "main":
        kb.append([HOME])
    await send(target, (note + "\n\n" if note else "") + title, InlineKeyboardMarkup(inline_keyboard=kb))


# ====================================================================
#  Движок мастеров (шаги, назад, отмена, подтверждение)
# ====================================================================
class W(StatesGroup):
    step = State()      # ждём ответ на шаг
    confirm = State()   # ждём «Подтвердить»


@dataclass
class Picked:
    value: Any
    label: str


@dataclass
class Pick:
    options: list  # [(label, value)]


@dataclass
class Step:
    key: str
    prompt: Any                      # str или функция(vals) -> str
    label: str = ""                  # как показывать в «уже введено»
    parse: Optional[Callable] = None  # текст -> значение | Picked | Pick (можно async); ошибка = ValueError
    quick: tuple = ()                # быстрые кнопки [(подпись, значение)]
    strict: bool = False             # True — только кнопками, текст не принимается
    per: int = 4                     # кнопок в ряд
    when: Optional[Callable] = None  # показывать шаг только если when(vals)
    fmt: Optional[Callable] = None   # как показывать значение


@dataclass
class Flow:
    name: str
    icon: str
    title: str
    menu: str
    steps: list
    run: Callable
    summary: Optional[Callable] = None
    confirm: bool = True
    again: str = ""


FLOWS: dict = {}


def step_visible(step: Step, vals: dict) -> bool:
    return step.when is None or bool(step.when(vals))


def next_step(flow: Flow, vals: dict, after: int) -> Optional[int]:
    for j in range(after + 1, len(flow.steps)):
        if step_visible(flow.steps[j], vals):
            return j
    return None


def show_val(step: Step, vals: dict) -> str:
    lab = vals.get(step.key + "_label")
    if lab:
        return str(lab)
    v = vals[step.key]
    return step.fmt(v) if step.fmt else str(v)


def render_step(flow: Flow, vals: dict, cur: int, n: int, can_back: bool):
    step = flow.steps[cur]
    head = f"{flow.icon} <b>{esc(flow.title)}</b> · шаг {n}"
    done = [f"▫️ {esc(s.label)}: <b>{esc(show_val(s, vals))}</b>"
            for s in flow.steps[:cur] if s.label and s.key in vals and step_visible(s, vals)]
    prompt = step.prompt(vals) if callable(step.prompt) else step.prompt
    text = head + "\n" + ("\n" + "\n".join(done) + "\n" if done else "") + "\n" + prompt
    rows = grid([B(lbl, f"w:q:{i}") for i, (lbl, _) in enumerate(step.quick)], step.per)
    nav = ([B("⬅️ Назад", "w:back")] if can_back else []) + [B("❌ Отмена", "w:cancel")]
    return text, InlineKeyboardMarkup(inline_keyboard=rows + [nav])


async def start_flow(target, state: FSMContext, name: str):
    flow = FLOWS[name]
    await state.clear()
    await state.update_data(flow=name, vals={}, hist=[], opts=[], pid=None)
    await goto(target, state, flow, next_step(flow, {}, -1))


async def goto(target, state: FSMContext, flow: Flow, i: int):
    d = await state.get_data()
    hist = d["hist"] + [i]
    if isinstance(target, Message):
        await strip_kb(target.bot, target.chat.id, d.get("pid"))
    text, kb = render_step(flow, d["vals"], i, len(hist), len(hist) > 1)
    await state.update_data(hist=hist, opts=[])
    await state.set_state(W.step)
    msg = await send(target, text, kb)
    await state.update_data(pid=msg.message_id)


async def accept(target, state: FSMContext, flow: Flow, step: Step, value, label: Optional[str] = None):
    d = await state.get_data()
    vals = d["vals"]
    vals[step.key] = value
    if label:
        vals[step.key + "_label"] = label
    else:
        vals.pop(step.key + "_label", None)
    await state.update_data(vals=vals)
    nxt = next_step(flow, vals, d["hist"][-1])
    if nxt is not None:
        await goto(target, state, flow, nxt)
    elif flow.confirm:
        await ask_confirm(target, state, flow)
    else:
        await execute(target, state, flow)


async def process(target, state: FSMContext, flow: Flow, step: Step, raw: str):
    try:
        res = step.parse(raw) if step.parse else raw
        if inspect.isawaitable(res):
            res = await res
    except ValueError as e:
        await send(target, f"⚠️ {esc(e)}\n<i>Попробуйте ещё раз.</i>", edit=False)
        return
    if isinstance(res, Pick):
        d = await state.get_data()
        if isinstance(target, Message):
            await strip_kb(target.bot, target.chat.id, d.get("pid"))
        await state.update_data(opts=res.options)
        rows = [[B(lbl[:60], f"w:p:{i}")] for i, (lbl, _) in enumerate(res.options)]
        rows.append([B("⬅️ Назад", "w:back"), B("❌ Отмена", "w:cancel")] if len(d["hist"]) > 1 else [B("❌ Отмена", "w:cancel")])
        msg = await send(target, "🔎 Нашёл несколько вариантов — выберите нужный:", InlineKeyboardMarkup(inline_keyboard=rows))
        await state.update_data(pid=msg.message_id)
        return
    if isinstance(res, Picked):
        await accept(target, state, flow, step, res.value, res.label)
    else:
        await accept(target, state, flow, step, res)


async def ask_confirm(target, state: FSMContext, flow: Flow):
    d = await state.get_data()
    if isinstance(target, Message):
        await strip_kb(target.bot, target.chat.id, d.get("pid"))
    await state.set_state(W.confirm)
    text = f"📝 <b>Проверьте</b>\n\n{flow.summary(d['vals'])}"
    kb = KB([B("✅ Подтвердить", "w:ok"), B("✏️ Заново", "w:redo")],
            [B("⬅️ Назад", "w:back"), B("❌ Отмена", "w:cancel")])
    msg = await send(target, text, kb)
    await state.update_data(pid=msg.message_id)


async def execute(target, state: FSMContext, flow: Flow):
    d = await state.get_data()
    await state.clear()
    if isinstance(target, Message):
        await strip_kb(target.bot, target.chat.id, d.get("pid"))
    after = [[B(flow.again, f"go:{flow.name}")] if flow.again else [], [B("⬅️ К разделу", f"m:{flow.menu}")], [HOME]]
    try:
        text = await flow.run(d["vals"], target.from_user.id)
        kb = KB(*after)
    except ApiError as e:
        text = f"❌ <b>Не получилось</b>\n{esc(e)}"
        kb = KB([B("🔁 Попробовать заново", f"go:{flow.name}")], [B("⬅️ К разделу", f"m:{flow.menu}")], [HOME])
    await send(target, text, kb)


# ---- обработчики мастера ----
@admin.callback_query(F.data.startswith("go:"))
async def cb_go(cb: CallbackQuery, state: FSMContext):
    await cb.answer()
    await start_flow(cb, state, cb.data[3:])


@admin.callback_query(W.step, F.data.startswith("w:q:"))
async def cb_quick(cb: CallbackQuery, state: FSMContext):
    await cb.answer()
    d = await state.get_data()
    flow = FLOWS[d["flow"]]
    step = flow.steps[d["hist"][-1]]
    await process(cb, state, flow, step, step.quick[int(cb.data[4:])][1])


@admin.callback_query(W.step, F.data.startswith("w:p:"))
async def cb_pick(cb: CallbackQuery, state: FSMContext):
    await cb.answer()
    d = await state.get_data()
    flow = FLOWS[d["flow"]]
    step = flow.steps[d["hist"][-1]]
    label, value = d["opts"][int(cb.data[4:])]
    await accept(cb, state, flow, step, value, label)


@admin.message(W.step, F.text, ~F.text.startswith("/"))
async def w_text(message: Message, state: FSMContext):
    d = await state.get_data()
    flow = FLOWS[d["flow"]]
    step = flow.steps[d["hist"][-1]]
    if step.strict:
        await message.answer("Выберите вариант кнопкой 👆")
        return
    await process(message, state, flow, step, message.text.strip())


@admin.callback_query(F.data == "w:back")
async def cb_back(cb: CallbackQuery, state: FSMContext):
    await cb.answer()
    d = await state.get_data()
    if not d.get("flow"):
        return await show_menu(cb, "main")
    flow = FLOWS[d["flow"]]
    hist, vals = d["hist"], d["vals"]
    if await state.get_state() == W.confirm.state:
        i = hist.pop()
    else:
        hist.pop()
        i = hist.pop()
    key = flow.steps[i].key
    vals.pop(key, None)
    vals.pop(key + "_label", None)
    await state.update_data(hist=hist, vals=vals)
    await goto(cb, state, flow, i)


@admin.callback_query(F.data == "w:cancel")
async def cb_cancel(cb: CallbackQuery, state: FSMContext):
    await cb.answer()
    d = await state.get_data()
    await state.clear()
    flow = FLOWS.get(d.get("flow"))
    await show_menu(cb, flow.menu if flow else "main", "❌ Отменено")


@admin.callback_query(W.confirm, F.data == "w:ok")
async def cb_ok(cb: CallbackQuery, state: FSMContext):
    await cb.answer("Выполняю…")
    d = await state.get_data()
    await execute(cb, state, FLOWS[d["flow"]])


@admin.callback_query(F.data == "w:redo")
async def cb_redo(cb: CallbackQuery, state: FSMContext):
    await cb.answer()
    d = await state.get_data()
    if d.get("flow"):
        await start_flow(cb, state, d["flow"])
    else:
        await show_menu(cb, "main")


@admin.callback_query(F.data.startswith("m:"))
async def cb_menu(cb: CallbackQuery, state: FSMContext):
    await cb.answer()
    await state.clear()
    await show_menu(cb, cb.data[2:])


# ====================================================================
#  Разовые действия (списки, топ, удаление) — без мастера
# ====================================================================
def back_kb(menu: str, *extra_rows):
    return KB(*extra_rows, [B("⬅️ К разделу", f"m:{menu}")], [HOME])


def reward_text(p: dict) -> str:
    return f"+{fmt_g(p['reward_value'])} G" if p["reward_type"] == "balance" else f"предмет #{p['reward_value']}"


async def act_top(target):
    try:
        d = await api("GET", "/admin/top")
    except ApiError as e:
        return await send(target, f"❌ {esc(e)}", back_kb("users"))
    medals = ["🥇", "🥈", "🥉"]
    lines = []
    for i, u in enumerate(d["users"]):
        luck = " 🎯" if u.get("luck_rules") not in (None, "", "[]") else ""
        lines.append(f"{medals[i] if i < 3 else str(i + 1) + '.'} <b>{esc(u['login'] or u['nickname'])}</b> · {fmt_g(u['balance'])} G{luck}")
    await send(target, f"🏆 <b>Топ игроков</b>\nИгроков: <b>{d['count']}</b> · на балансах: <b>{fmt_g(d['sum'])} G</b>\n\n" + "\n".join(lines),
               back_kb("users"))


async def act_promos(target):
    try:
        promos = await api("GET", "/admin/promo")
    except ApiError as e:
        return await send(target, f"❌ {esc(e)}", back_kb("promo"))
    if not promos:
        return await send(target, "Промокодов пока нет.", back_kb("promo", [B("➕ Создать", "go:promo")]))
    lines = [f"{'✅' if p['active'] else '🚫'} <code>{esc(p['code'])}</code> — {reward_text(p)} · {p['used_count']}/{p['max_uses'] or '∞'}"
             for p in promos]
    await send(target, "🎟 <b>Промокоды</b>\n\n" + "\n".join(lines), back_kb("promo", [B("➕ Создать", "go:promo")]))


async def act_delpromo(target):
    try:
        promos = [p for p in await api("GET", "/admin/promo") if p["active"]]
    except ApiError as e:
        return await send(target, f"❌ {esc(e)}", back_kb("promo"))
    if not promos:
        return await send(target, "Активных промокодов нет.", back_kb("promo"))
    rows = [[B(f"🚫 {p['code']} · {reward_text(p)}", f"dp:{p['code']}")] for p in promos[:40]]
    await send(target, "Какой промокод деактивировать?", back_kb("promo", *rows))


async def act_tasks(target):
    try:
        tasks = await api("GET", "/admin/task")
    except ApiError as e:
        return await send(target, f"❌ {esc(e)}", back_kb("tasks"))
    if not tasks:
        return await send(target, "Заданий пока нет.", back_kb("tasks", [B("📢 Добавить", "go:task_tg")]))
    lines = [f"#{t['id']} {'📢' if t['kind'] == 'tg' else '🔗'} <b>{esc(t['title'])}</b> · +{fmt_g(t['reward'])} G" for t in tasks]
    rows = [[B(f"🗑 #{t['id']} · {t['title'][:28]}", f"dt:{t['id']}")] for t in tasks[:40]]
    await send(target, "📋 <b>Задания</b>\nНажмите на задание, чтобы удалить.\n\n" + "\n".join(lines), back_kb("tasks", *rows))


ACTIONS = {"top": act_top, "promos": act_promos, "delpromo": act_delpromo, "tasks": act_tasks}


@admin.callback_query(F.data.startswith("a:"))
async def cb_action(cb: CallbackQuery, state: FSMContext):
    await cb.answer()
    await state.clear()
    await ACTIONS[cb.data[2:]](cb)


@admin.callback_query(F.data.startswith("dp:"))
async def cb_dp(cb: CallbackQuery):
    await cb.answer()
    code = cb.data[3:]
    await send(cb, f"Деактивировать промокод <code>{esc(code)}</code>?",
               KB([B("✅ Да", f"dpc:{code}"), B("⬅️ Нет", "a:delpromo")]))


@admin.callback_query(F.data.startswith("dpc:"))
async def cb_dpc(cb: CallbackQuery):
    await cb.answer()
    code = cb.data[4:]
    try:
        await api("POST", "/admin/promo/deactivate", json={"code": code})
        text = f"🚫 Промокод <code>{esc(code)}</code> деактивирован."
    except ApiError as e:
        text = f"❌ {esc(e)}"
    await send(cb, text, back_kb("promo", [B("🚫 Ещё один", "a:delpromo")]))


@admin.callback_query(F.data.startswith("dt:"))
async def cb_dt(cb: CallbackQuery):
    await cb.answer()
    tid = cb.data[3:]
    await send(cb, f"Удалить задание #{esc(tid)}?", KB([B("✅ Да", f"dtc:{tid}"), B("⬅️ Нет", "a:tasks")]))


@admin.callback_query(F.data.startswith("dtc:"))
async def cb_dtc(cb: CallbackQuery):
    await cb.answer()
    tid = cb.data[4:]
    try:
        await api("POST", "/admin/task/delete", json={"id": int(tid)})
        text = f"🗑 Задание #{esc(tid)} удалено."
    except (ApiError, ValueError) as e:
        text = f"❌ {esc(e)}"
    await send(cb, text, back_kb("tasks", [B("🗑 Ещё одно", "a:tasks")]))


# ====================================================================
#  Команды (остались для привычки — открывают то же меню / мастера)
# ====================================================================
COMMAND_FLOWS = {
    "new": "promo", "newpromo": "promo", "newitem": "promo", "items": "items",
    "grant": "grant", "setbal": "setbal", "grantall": "grantall", "setall": "setall",
    "luck": "luck", "gluck": "gluck", "luckoff": "luckoff", "gluckoff": "gluckoff",
    "find": "find", "addtask": "task_tg",
}
COMMAND_ACTIONS = {"top": "top", "promos": "promos", "delpromo": "delpromo", "tasks": "tasks", "deltask": "tasks"}


def cmd_name(message: Message) -> str:
    return message.text.split()[0][1:].split("@")[0].lower()


@admin.message(Command("start", "menu"))
async def cmd_menu(message: Message, state: FSMContext):
    await state.clear()
    await show_menu(message, "main")


@admin.message(Command("cancel"))
async def cmd_cancel(message: Message, state: FSMContext):
    await state.clear()
    await show_menu(message, "main", "❌ Отменено")


@admin.message(Command(*COMMAND_FLOWS))
async def cmd_flow(message: Message, state: FSMContext):
    await start_flow(message, state, COMMAND_FLOWS[cmd_name(message)])


@admin.message(Command(*COMMAND_ACTIONS))
async def cmd_action(message: Message, state: FSMContext):
    await state.clear()
    await ACTIONS[COMMAND_ACTIONS[cmd_name(message)]](message)


# ---- заглушки: чужие и непонятные сообщения ----
@other.message()
async def fb_message(message: Message):
    if is_admin(message):
        await show_menu(message, "main", "Не понял 🤔 Выберите действие кнопкой:")
    else:
        await message.answer("У вас нет доступа к этому боту.")


@other.callback_query()
async def fb_callback(cb: CallbackQuery):
    if cb.from_user.id in ADMIN_IDS:
        await cb.answer()
        await show_menu(cb, "main", "Эта кнопка устарела — вот свежее меню:")
    else:
        await cb.answer("Нет доступа", show_alert=True)


# ====================================================================
#  Разбор ответов (парсеры шагов)
# ====================================================================
def to_int(s: str) -> Optional[int]:
    try:
        return int(s.replace(" ", "").replace("+", "").replace("−", "-"))
    except ValueError:
        return None


def int_parser(lo: Optional[int] = None, hi: Optional[int] = None, nonzero: bool = False):
    def p(t: str) -> int:
        v = to_int(t)
        if v is None:
            raise ValueError("Нужно целое число, например 500.")
        if nonzero and v == 0:
            raise ValueError("Число не может быть нулём.")
        if lo is not None and v < lo:
            raise ValueError(f"Минимум {fmt_g(lo)}.")
        if hi is not None and v > hi:
            raise ValueError(f"Максимум {fmt_g(hi)}.")
        return v
    return p


def p_percent(t: str) -> float:
    try:
        v = float(t.replace(",", ".").replace("%", "").strip())
    except ValueError:
        raise ValueError("Нужно число от 0 до 100, например 5 или 12.5.")
    if not 0 <= v <= 100:
        raise ValueError("Процент должен быть от 0 до 100.")
    return v


def p_code(t: str) -> str:
    code = t.strip().upper()
    if not re.fullmatch(r"[\w-]{3,32}", code):
        raise ValueError("Код: 3–32 символа, только буквы, цифры, _ и -.")
    return code


def p_chat(t: str) -> str:
    m = re.search(r"(?:t\.me/|@)?([A-Za-z]\w{3,31})/?$", t.strip())
    if not m:
        raise ValueError("Пришлите @username канала или ссылку вида t.me/канал.")
    return "@" + m.group(1)


def p_url(t: str) -> str:
    t = t.strip()
    if not re.match(r"https?://\S+\.\S+", t):
        raise ValueError("Нужна ссылка, начинающаяся с https://")
    return t


def p_title(t: str) -> str:
    t = t.strip()
    if not 2 <= len(t) <= 80:
        raise ValueError("Название: от 2 до 80 символов.")
    return t


def p_query(t: str) -> str:
    if not t.strip():
        raise ValueError("Введите хотя бы пару символов.")
    return t.strip()


async def p_user(t: str, allow_all: bool = False):
    q = t.strip().lstrip("@")
    if not q:
        raise ValueError("Введите логин, ник или #id игрока.")
    if q == "*" and allow_all:
        return Picked("", "все игроки")
    if re.fullmatch(r"#\d+", q):
        return Picked(q, q)
    try:
        users = await api("GET", "/admin/users", params={"q": q})
    except ApiError as e:
        raise ValueError(str(e))
    if not users:
        raise ValueError("Игрока с таким логином или ником не нашёл.")

    def ident(u):
        return u.get("login") or f"#{u['id']}"

    def lab(u):
        return f"{u['nickname']} · {ident(u)} · {fmt_g(u['balance'])} G"

    exact = [u for u in users if (u.get("login") or "").lower() == q.lower()]
    if len(exact) == 1 or len(users) == 1:
        u = exact[0] if exact else users[0]
        return Picked(ident(u), lab(u))
    return Pick([(lab(u), ident(u)) for u in users[:8]])


async def p_item(t: str):
    try:
        items = await api("GET", "/admin/items", params={"q": t.strip()})
    except ApiError as e:
        raise ValueError(str(e))
    if not items:
        raise ValueError("Предмет не нашёл. Попробуйте другое слово (можно по-английски).")
    if len(items) == 1:
        return Picked(items[0]["id"], items[0]["name"])
    return Pick([(f"{i['name']} · {fmt_g(i['price'])} G", i["id"]) for i in items[:10]])


AMOUNTS = (("100", "100"), ("500", "500"), ("1 000", "1000"), ("5 000", "5000"))
USER_PROMPT = "Введите <b>логин</b> или ник игрока (или <code>#id</code>).\n<i>Можно часть — я поищу.</i>"


def lab(vals: dict, key: str) -> str:
    return esc(vals.get(key + "_label") or vals.get(key))


def fmt_rules(rules) -> str:
    return "\n".join(f"• показанный шанс ≤ {r[0]:g}% → +{r[1]}%" for r in rules) or "правил нет"


# ====================================================================
#  Описание мастеров
# ====================================================================
# ---- промокод ----
async def run_promo(v: dict, uid: int) -> str:
    await api("POST", "/admin/promo", json={
        "code": v["code"], "reward_type": v["kind"], "reward_value": v["value"],
        "max_uses": v["uses"], "created_by": str(uid)})
    return (f"✅ <b>Промокод создан!</b>\n\n<code>{esc(v['code'])}</code>\n"
            f"{sum_reward(v)}\n👥 Активаций: {'без ограничений' if v['uses'] == 0 else v['uses']}")


def sum_reward(v: dict) -> str:
    return f"💰 {fmt_g(v['value'])} G" if v["kind"] == "balance" else f"🎁 {lab(v, 'value')}"


def sum_promo(v: dict) -> str:
    return (f"🎟 Код: <code>{esc(v['code'])}</code>\n{sum_reward(v)}\n"
            f"👥 Активаций: <b>{'без ограничений' if v['uses'] == 0 else v['uses']}</b>")


FLOWS["promo"] = Flow("promo", "🎟", "Создание промокода", "promo", [
    Step("code", "Придумайте <b>текст промокода</b> — его будут вводить игроки.\n<i>Например: <code>SUMMER26</code> (3–32 символа: буквы, цифры, _ и -)</i>",
         "Код", p_code),
    Step("kind", "Что подарит промокод?", "Награда", lambda t: t,
         quick=(("💰 Сумму (G)", "balance"), ("🎁 Предмет", "item")), strict=True, per=2,
         fmt=lambda v: "💰 сумма" if v == "balance" else "🎁 предмет"),
    Step("value", "Сколько <b>G</b> дарить? Нажмите кнопку или введите число.", "Сумма",
         int_parser(lo=1), quick=AMOUNTS, when=lambda v: v.get("kind") == "balance", fmt=lambda x: f"{fmt_g(x)} G"),
    Step("value", "Введите <b>название предмета</b> (или часть, можно по-английски) — я найду.", "Предмет",
         p_item, when=lambda v: v.get("kind") == "item"),
    Step("uses", "Сколько человек смогут активировать код?\n<i>Нажмите кнопку или введите число.</i>", "Активаций",
         int_parser(lo=0), quick=(("1", "1"), ("10", "10"), ("100", "100"), ("♾ Без лимита", "0")), per=4,
         fmt=lambda x: "∞" if x == 0 else str(x)),
], run_promo, sum_promo, again="➕ Ещё промокод")


# ---- поиск предмета ----
async def run_items(v: dict, uid: int) -> str:
    items = await api("GET", "/admin/items", params={"q": v["q"]})
    if not items:
        return "Ничего не найдено."
    return "🔎 <b>Найденные предметы</b>\n\n" + "\n".join(
        f"<code>#{i['id']}</code> {esc(i['name'])} · {esc(i['rarity'])} · {fmt_g(i['price'])} G" for i in items)


FLOWS["items"] = Flow("items", "🔎", "Поиск предмета", "promo", [
    Step("q", "Введите название предмета (или часть):", "", p_query)], run_items, confirm=False, again="🔎 Искать ещё")


# ---- начислить игроку ----
async def run_grant(v: dict, uid: int) -> str:
    await api("POST", "/admin/grant", json={"login": v["user"], "amount": v["amount"]})
    return f"✅ Игроку <b>{lab(v, 'user')}</b> начислено <b>{fmt_g(v['amount'])} G</b>"


FLOWS["grant"] = Flow("grant", "🎁", "Начислить игроку", "bal", [
    Step("user", USER_PROMPT, "Игрок", p_user),
    Step("amount", "Сколько <b>G</b> начислить?", "Сумма", int_parser(lo=1), quick=AMOUNTS, fmt=lambda x: f"{fmt_g(x)} G"),
], run_grant, lambda v: f"🎁 Игроку: <b>{lab(v, 'user')}</b>\n💰 Начислить: <b>{fmt_g(v['amount'])} G</b>", again="🎁 Ещё начисление")


# ---- установить баланс игроку ----
async def run_setbal(v: dict, uid: int) -> str:
    await api("POST", "/admin/balance", json={"login": v["user"], "amount": v["amount"], "mode": "set"})
    return f"✅ Баланс <b>{lab(v, 'user')}</b> теперь <b>{fmt_g(v['amount'])} G</b>"


FLOWS["setbal"] = Flow("setbal", "✏️", "Установить баланс игроку", "bal", [
    Step("user", USER_PROMPT, "Игрок", p_user),
    Step("amount", "Какой баланс <b>установить</b>? (число, G)", "Баланс", int_parser(lo=0),
         quick=(("0", "0"), ("500", "500"), ("1 000", "1000"), ("10 000", "10000")), fmt=lambda x: f"{fmt_g(x)} G"),
], run_setbal, lambda v: f"✏️ Игрок: <b>{lab(v, 'user')}</b>\n💰 Новый баланс: <b>{fmt_g(v['amount'])} G</b>", again="✏️ Ещё один")


# ---- баланс ВСЕМ ----
def all_runner(mode: str):
    async def run(v: dict, uid: int) -> str:
        r = await api("POST", "/admin/balance", json={"login": "", "amount": v["amount"], "mode": mode})
        return f"✅ Готово! Затронуто игроков: <b>{(r or {}).get('affected')}</b>"
    return run


FLOWS["grantall"] = Flow("grantall", "➕", "Прибавить ВСЕМ", "bal", [
    Step("amount", "Сколько <b>G</b> прибавить <b>всем игрокам</b>?\n<i>Минус — списать, например −100.</i>", "Сумма",
         int_parser(nonzero=True), quick=(("+100", "100"), ("+500", "500"), ("+1 000", "1000"), ("−100", "-100")), per=4,
         fmt=lambda x: f"{x:+,} G".replace(",", " ")),
], all_runner("add"), lambda v: f"⚠️ <b>ВСЕМ игрокам</b>\n{'➕ прибавить' if v['amount'] > 0 else '➖ списать'} <b>{fmt_g(abs(v['amount']))} G</b>",
    again="➕ Ещё раз")

FLOWS["setall"] = Flow("setall", "⚖️", "Установить баланс ВСЕМ", "bal", [
    Step("amount", "Какой баланс <b>установить всем игрокам</b>?", "Баланс", int_parser(lo=0),
         quick=(("0", "0"), ("500", "500"), ("1 000", "1000")), fmt=lambda x: f"{fmt_g(x)} G"),
], all_runner("set"), lambda v: f"⚠️ <b>ВСЕМ игрокам</b>\n⚖️ установить баланс <b>{fmt_g(v['amount'])} G</b>", again="⚖️ Ещё раз")


# ---- удача ----
def luck_steps(with_user: bool) -> list:
    steps = [Step("user", USER_PROMPT, "Игрок", p_user)] if with_user else []
    steps += [
        Step("at", "Порог: пока <b>показанный</b> шанс ≤ …%, удача работает.\n<i>Например 5</i>", "Порог", p_percent,
             quick=(("1", "1"), ("5", "5"), ("10", "10"), ("25", "25")), per=4, fmt=lambda x: f"≤ {x:g}%"),
        Step("bonus", "На сколько <b>% повысить реальный</b> шанс?\n<i>Например 65</i>", "Бонус",
             int_parser(lo=-100, hi=100, nonzero=True), quick=(("+10", "10"), ("+25", "25"), ("+50", "50"), ("+65", "65")), per=4,
             fmt=lambda x: f"+{x}%"),
    ]
    return steps


def sum_luck(v: dict) -> str:
    who = lab(v, "user") if "user" in v else "🌍 все игроки"
    real = max(0, min(100, v["at"] + v["bonus"]))
    return (f"🎯 Кому: <b>{who}</b>\nПорог: показанный шанс ≤ <b>{v['at']:g}%</b>\nБонус: <b>{v['bonus']:+d}%</b>\n\n"
            f"<i>Пример: на экране {v['at']:g}% → реально ≈ {real:g}%</i>")


async def run_luck(v: dict, uid: int) -> str:
    r = await api("POST", "/admin/luck", json={"login": v.get("user", ""), "at": v["at"], "bonus": v["bonus"]})
    return "✅ <b>Правила удачи обновлены</b>\n\n" + esc(fmt_rules(r["rules"]))


FLOWS["luck"] = Flow("luck", "🎯", "Удача игроку", "luck", luck_steps(True), run_luck, sum_luck, again="🎯 Ещё игроку")
FLOWS["gluck"] = Flow("gluck", "🌍", "Удача всем", "luck", luck_steps(False), run_luck, sum_luck, again="🌍 Изменить")


async def run_luckshow(v: dict, uid: int) -> str:
    r = await api("GET", "/admin/luck", params={"login": v["user"]})
    who = lab(v, "user") if v["user"] else "все игроки"
    return f"👁 <b>Правила удачи — {who}</b>\n\n" + esc(fmt_rules(r["rules"]))


FLOWS["luckshow"] = Flow("luckshow", "👁", "Правила удачи", "luck", [
    Step("user", USER_PROMPT, "Игрок", lambda t: p_user(t, True), quick=(("🌍 Все игроки", "*"),), per=1)],
    run_luckshow, confirm=False, again="👁 Посмотреть ещё")


def luckoff_steps(with_user: bool) -> list:
    steps = [Step("user", USER_PROMPT, "Игрок", p_user)] if with_user else []
    steps += [
        Step("mode", "Что убрать?", "Что убрать", lambda t: t, strict=True, per=1,
             quick=(("🧹 Все правила", "all"), ("🎯 Одно правило (по порогу)", "one")),
             fmt=lambda x: "все правила" if x == "all" else "одно правило"),
        Step("at", "Введите <b>порог</b> правила, которое убрать (например 5).", "Порог", p_percent,
             when=lambda v: v.get("mode") == "one", fmt=lambda x: f"≤ {x:g}%"),
    ]
    return steps


def sum_luckoff(v: dict) -> str:
    who = lab(v, "user") if "user" in v else "🌍 все игроки"
    what = "все правила" if v["mode"] == "all" else f"правило с порогом {v['at']:g}%"
    return f"🧹 Кому: <b>{who}</b>\nУбрать: <b>{what}</b>"


async def run_luckoff(v: dict, uid: int) -> str:
    login = v.get("user", "")
    if v["mode"] == "one":
        await api("POST", "/admin/luck", json={"login": login, "at": v["at"], "bonus": 0})
    else:
        await api("POST", "/admin/luck/clear", json={"login": login})
    return "✅ Убрано"


FLOWS["luckoff"] = Flow("luckoff", "🧹", "Убрать удачу у игрока", "luck", luckoff_steps(True), run_luckoff, sum_luckoff)
FLOWS["gluckoff"] = Flow("gluckoff", "🧹", "Убрать удачу у всех", "luck", luckoff_steps(False), run_luckoff, sum_luckoff)


# ---- задания ----
def task_steps(kind: str) -> list:
    first = (Step("target", "Пришлите <b>канал</b>: @username или ссылку t.me/…\n<i>⚠️ Бот должен быть админом этого канала — иначе подписку не проверить.</i>",
                  "Канал", p_chat)
             if kind == "tg" else
             Step("target", "Пришлите <b>ссылку</b> (TikTok, Instagram и т.д.).\n<i>Начинается с https://</i>", "Ссылка", p_url))
    return [first,
            Step("reward", "Сколько <b>G</b> дать за выполнение?", "Награда", int_parser(lo=1),
                 quick=(("50", "50"), ("100", "100"), ("250", "250"), ("500", "500")), per=4, fmt=lambda x: f"{fmt_g(x)} G"),
            Step("title", "Напишите <b>название задания</b> — его увидят игроки.\n<i>Например: Подписаться на наш канал</i>", "Название", p_title)]


def task_runner(kind: str):
    async def run(v: dict, uid: int) -> str:
        if kind == "tg":
            payload = {"title": v["title"], "kind": "tg", "url": "https://t.me/" + v["target"].lstrip("@"),
                       "chat": v["target"], "reward": v["reward"]}
        else:
            payload = {"title": v["title"], "kind": "link", "url": v["target"], "reward": v["reward"]}
        r = await api("POST", "/admin/task", json=payload)
        return f"✅ Задание <b>#{(r or {}).get('id')}</b> добавлено\n{esc(v['title'])} · +{fmt_g(v['reward'])} G"
    return run


def task_summary(v: dict) -> str:
    return f"📋 <b>{esc(v['title'])}</b>\n🔗 {esc(v['target'])}\n💰 Награда: <b>{fmt_g(v['reward'])} G</b>"


FLOWS["task_tg"] = Flow("task_tg", "📢", "Задание: подписка на канал", "tasks", task_steps("tg"), task_runner("tg"), task_summary,
                        again="📢 Ещё задание")
FLOWS["task_link"] = Flow("task_link", "🔗", "Задание по ссылке", "tasks", task_steps("link"), task_runner("link"), task_summary,
                          again="🔗 Ещё задание")


# ---- поиск игрока ----
async def run_find(v: dict, uid: int) -> str:
    users = await api("GET", "/admin/users", params={"q": v["q"]})
    if not users:
        return "Никого не найдено."
    blocks = [f"<b>{esc(u['nickname'])}</b> @{esc(u['username'] or '—')}\n"
              f"#{u['id']} · логин: <code>{esc(u['login'] or '—')}</code> · {fmt_g(u['balance'])} G · код: <code>{esc(u['referral_code'])}</code>"
              for u in users[:15]]
    return "🔍 <b>Найдено</b>\n\n" + "\n\n".join(blocks)


FLOWS["find"] = Flow("find", "🔍", "Поиск игрока", "users", [
    Step("q", "Введите логин, ник или @username (можно часть):", "", p_query)], run_find, confirm=False, again="🔍 Искать ещё")


# ====================================================================
#  Запуск
# ====================================================================
async def run():
    """Запускается из app.py; при падении перезапускается."""
    while True:
        bot = Bot(TOKEN)
        try:
            await bot.delete_webhook(drop_pending_updates=True)
            try:
                await bot.set_my_commands([
                    BotCommand(command="menu", description="🏠 Главное меню"),
                    BotCommand(command="new", description="🎟 Создать промокод"),
                    BotCommand(command="cancel", description="❌ Отмена"),
                ])
            except Exception:
                log.warning("не удалось выставить список команд")
            await dp.start_polling(bot, handle_signals=False)
            return
        except asyncio.CancelledError:
            raise
        except Exception:
            log.exception("админ-бот упал, перезапуск через 5 с")
            await asyncio.sleep(5)
        finally:
            await bot.session.close()
