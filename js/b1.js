/* ============================================================
   СЕРВЕРНЫЕ АККАУНТЫ, ПРОМОКОДЫ, РЕФЕРАЛКА
   (переопределяет локальные функции из основного скрипта)
   ============================================================ */
const TOKEN_KEY = "amg_token";
let apiCfg = { botUsername: "", referrerBonus: 0, refereeBonus: 0 };
let lastSaveAt = 0;

/* Telegram: полноэкранный режим — вместо чёрной полосы остаются две плавающие кнопки (Закрыть и ⌄ ⋮) */
function applyTgInsets() {
  const tg = tgApp(); if (!tg) return;
  const px = n => Math.max(0, Number(n) || 0) + "px", r = document.documentElement.style;
  const sa = tg.safeAreaInset || {}, ca = tg.contentSafeAreaInset || {};
  r.setProperty("--tg-top", px((sa.top || 0) + (ca.top || 0)));
  r.setProperty("--tg-bottom", px((sa.bottom || 0) + (ca.bottom || 0)));
}
function setupTgFullscreen() {
  const tg = tgApp(); if (!tg || tg.__fsSetup) return; tg.__fsSetup = true;
  try { tg.setHeaderColor && tg.setHeaderColor("#09090B"); } catch (e) {}
  try { tg.setBackgroundColor && tg.setBackgroundColor("#09090B"); } catch (e) {}
  try { tg.setBottomBarColor && tg.setBottomBarColor("#09090B"); } catch (e) {}
  try { tg.disableVerticalSwipes && tg.disableVerticalSwipes(); } catch (e) {}
  ["safeAreaChanged", "contentSafeAreaChanged", "fullscreenChanged", "viewportChanged"].forEach(ev => { try { tg.onEvent(ev, applyTgInsets); } catch (e) {} });
  try { if (tg.requestFullscreen && !tg.isFullscreen && /android|ios|iphone|ipad/i.test(tg.platform || "")) tg.requestFullscreen(); } catch (e) {}
  applyTgInsets();
}
function tgApp() { return window.Telegram && window.Telegram.WebApp; }

/* Telegram Mini Apps: localStorage может НЕ переживать перезапуск приложения
   (особенно на iOS) — Telegram для этого даёт CloudStorage. Дублируем токен
   туда, чтобы вход не слетал при каждом новом открытии мини-аппа. */
function tgCloudSet(key, value) {
  return new Promise(resolve => {
    const tg = tgApp();
    if (tg && tg.CloudStorage && tg.CloudStorage.setItem) { try { tg.CloudStorage.setItem(key, value, () => resolve()); } catch (e) { resolve(); } }
    else resolve();
  });
}
function tgCloudGet(key) {
  return new Promise(resolve => {
    const tg = tgApp();
    if (tg && tg.CloudStorage && tg.CloudStorage.getItem) { try { tg.CloudStorage.getItem(key, (err, value) => resolve(err ? "" : (value || ""))); } catch (e) { resolve(""); } }
    else resolve("");
  });
}
function tgCloudRemove(key) {
  return new Promise(resolve => {
    const tg = tgApp();
    if (tg && tg.CloudStorage && tg.CloudStorage.removeItem) { try { tg.CloudStorage.removeItem(key, () => resolve()); } catch (e) { resolve(); } }
    else resolve();
  });
}

function getToken() { try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; } }
function setToken(t) {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch (e) {}
  if (t) tgCloudSet(TOKEN_KEY, t); else tgCloudRemove(TOKEN_KEY);
}
function getRefFromUrl() {
  let r = "";
  try { r = new URLSearchParams(location.search).get("ref") || ""; } catch (e) {}
  if (!r) { const sp = tgApp() && tgApp().initDataUnsafe && tgApp().initDataUnsafe.start_param; if (sp && sp.indexOf("ref_") === 0) r = sp.slice(4); }
  return r.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() || undefined;
}

/* Адрес бэкенда: при открытии index.html из папки (file://) — локальный сервер на 8000, иначе тот же домен */
const API_BASE = window.AMG_API_BASE || (location.protocol === "file:" ? "http://localhost:8000" : "");
async function api(path, opts) {
  opts = opts || {};
  const headers = { "Content-Type": "application/json" };
  const tk = getToken(); if (tk) headers["Authorization"] = "Bearer " + tk;
  let r;
  try { r = await fetch(API_BASE + path, { method: opts.method || "GET", headers, body: opts.body ? JSON.stringify(opts.body) : undefined }); }
  catch (e) { throw new Error("Нет связи с сервером"); }
  let data = null; try { data = await r.json(); } catch (e) {}
  if (!r.ok) {
    const d = data && data.detail;
    const err = new Error(typeof d === "string" ? d : "Проверьте введённые данные");
    err.status = r.status; throw err;
  }
  return data;
}

function mergeServerUser(u) {
  state.balance = u.balance; state.rev = u.rev || 0; state.luck = u.luck || [];
  setInventoryFromIds(u.inventory || []);
  if (state.profile) { state.profile.referralCode = u.referralCode; state.profile.referredBy = u.referredBy;
    if (u.publicId) { state.profile.publicId = u.publicId; state.profile.about = u.about || ""; } }
  renderAll(); renderProfile(); pulseBalance();
}
function fixSelection() {
  state.selectedMemeUids = state.selectedMemeUids.filter(u => state.inventory.some(i => i.uid === u));
  const tgt = getTarget();
  if (tgt && (getTotalStake() === 0 || tgt.price <= getTotalStake())) state.targetMemeId = null;
}
function setInventoryFromIds(ids) {
  const pool = state.inventory.slice(), next = [];
  ids.forEach(id => {
    const k = pool.findIndex(x => x.id === id);
    if (k >= 0) next.push(pool.splice(k, 1)[0]);
    else { const m = getMemeById(id); if (m) next.push({ ...m, uid: makeUid("u") }); }
  });
  state.inventory = next;
  fixSelection();
}
function applyServerUser(u) {
  state.profile = { accountKey: String(u.id), style: u.style || null, nickname: u.nickname || u.login || "Игрок", username: u.username || null,
    photo: u.photo || null, source: u.source, login: u.login, referralCode: u.referralCode, referredBy: u.referredBy,
    publicId: u.publicId, about: u.about || "", hasPassword: !!u.hasPassword };
  state.balance = u.balance; state.rev = u.rev || 0; state.luck = u.luck || [];
  state.cart = {};
  setInventoryFromIds(u.inventory || []);
}
const OK_ITEM = { name: "OK", rarity: "common", icon: '<svg class="ic" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>' };

function saveGame() {
  const tk = getToken();
  if (!isLoggedIn() || !tk) return;
  lastSaveAt = Date.now();
  fetch(API_BASE + "/api/state", { method: "POST", keepalive: true,
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tk },
    body: JSON.stringify({ balance: state.balance, inventory: state.inventory.map(i => i.id), rev: state.rev }) })
    .then(r => r.json()).then(d => { if (d && d.stale && d.user) mergeServerUser(d.user); }).catch(() => {});
}
function resetGuestState() {
  state.rev = 0; state.luck = []; state.balance = 0; state.inventory = []; state.selectedMemeUids = []; state.targetMemeId = null; state.cart = {}; shownBalance = 0;
}

/* ---------- история амгрейдов (хранится на сервере, видна с любого устройства) ---------- */
function pushHistory(entry) {
  if (!isLoggedIn()) return;
  api("/api/history/add", { method: "POST", body: { entry } }).catch(() => {});
}
function clearHistory() {
  api("/api/history/clear", { method: "POST" }).catch(() => {});
  openHistory();
}
function historyRow(h) {
  const stakeLabel = h.stake.length === 1 ? h.stake[0].name : `${h.stake.length} ${plural(h.stake.length, "предмет", "предмета", "предметов")}`;
  const time = new Date(h.time).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  const cls = h.win ? "win" : "lose";
  const sum = h.win ? "+" + fmt(h.target.price) : "−" + fmt(h.stakeTotal);
  return `<div class="hist-row">${renderIcon(h.target, 40)}
    <div class="hist-mid"><b>${esc(stakeLabel)} ${svgi("arrowR", 13, true)} ${esc(h.target.name)}</b><span>${fmtPct(h.chance)}% шанс · ${time}</span></div>
    <div class="hist-right ${cls}"><b>${sum}</b><span>${h.win ? "успех" : "неудача"}</span></div>
  </div>`;
}
async function openHistory() {
  if (!isLoggedIn()) { openAuth("Войдите, чтобы увидеть историю амгрейдов"); return; }
  openMisc(miscHead(ic("history", 24), "История амгрейдов", "Загрузка…") + `<div class="sheet-list"><div class="hist-empty">Загрузка…</div></div>`);
  let list = [];
  try { const r = await api("/api/history"); list = r.history || []; } catch (e) {}
  const body = list.length
    ? `<div class="sheet-list">${list.map(historyRow).join("")}</div>`
    : `<div class="hist-empty">Пока пусто — сделайте первый амгрейд</div>`;
  openMisc(miscHead(ic("history", 24), "История амгрейдов", `Последние ${list.length ? list.length : ""} результатов`) + body +
    (list.length ? `<div class="sheet-foot"><button class="ghost-btn" onclick="clearHistory()">Очистить историю</button></div>` : ""));
}

async function syncFromServer() {
  if (!isLoggedIn() || document.hidden || state.spinning || paying) return;
  if (document.getElementById("buyOverlay").classList.contains("open")) return;
  if (Date.now() - lastSaveAt < 3000) return;
  try {
    const u = await api("/api/me");
    const a = (u.inventory || []).slice().sort((x, y) => x - y).join(), b = state.inventory.map(i => i.id).sort((x, y) => x - y).join();
    if (u.balance !== state.balance || a !== b || (u.rev || 0) !== state.rev || JSON.stringify(u.luck || []) !== JSON.stringify(state.luck || [])) mergeServerUser(u);
  } catch (e) { if (e.status === 401) { setToken(""); } }
}

/* ---------- вход / регистрация ---------- */
async function submitAuth() {
  const isReg = document.getElementById("authTabRegister").classList.contains("active");
  const login = (document.getElementById("authLogin").value || "").trim();
  const pass = document.getElementById("authPassword").value || "";
  const confirmPass = document.getElementById("authConfirm").value || "";
  clearAuthError();
  if (login.length < 3) return showAuthError("Логин должен быть не короче 3 символов");
  if (pass.length < 4) return showAuthError("Пароль должен быть не короче 4 символов");
  if (isReg && pass !== confirmPass) return showAuthError("Пароли не совпадают");
  const btn = document.getElementById("authSubmitBtn");
  btn.classList.add("loading");
  try {
    const body = { login, password: pass };
    if (isReg) body.ref = getRefFromUrl();
    const u = await api(isReg ? "/api/auth/register" : "/api/auth/login", { method: "POST", body });
    setToken(u.token); applyServerUser(u);
    btn.classList.remove("loading");
    closeAuth(); renderAll(); renderProfile(); pulseBalance();
    notify("win", isReg ? "Аккаунт создан" : "Вы вошли", state.profile.nickname, "", OK_ITEM);
  } catch (e) { btn.classList.remove("loading"); showAuthError(e.message); }
}

async function telegramLoginRequest() {
  const tg = tgApp();
  const u = await api("/api/auth/telegram", { method: "POST", body: { initData: tg.initData, ref: getRefFromUrl() } });
  setToken(u.token); applyServerUser(u);
}
async function loginWithTelegram() {
  const tg = tgApp();
  if (!tg || !tg.initData) { webLoginStart(); return; }
  try { await telegramLoginRequest(); closeAuth(); renderAll(); renderProfile(); pulseBalance(); }
  catch (e) { showAuthError(e.message); }
}

async function logoutAccount() {
  if (!isLoggedIn()) return;
  if (!(await askConfirm("Выйти из аккаунта? Прогресс сохранён на сервере и ждёт вас при следующем входе."))) return;
  saveGame(); setToken(""); state.profile = null; resetGuestState();
  showScreen("profile"); renderAll(); renderProfile();
}
async function resetProfile() {
  if (!isLoggedIn()) { openAuth(); return; }
  if (!(await askConfirm("Удалить аккаунт и весь прогресс безвозвратно?"))) return;
  try { await api("/api/me", { method: "DELETE" }); } catch (e) { alert(e.message); return; }
  setToken(""); location.reload();
}

/* ---------- плашка в профиле ---------- */
const _renderProfile = renderProfile;
renderProfile = function () {
  _renderProfile();
  const c = state.profile && state.profile.referralCode;
  document.getElementById("tileRefSub").textContent = c ? "Ваш код: " + c : "Приглашайте друзей";
};

/* ============================================================
   ПРОФИЛЬ: редактирование, поиск по ID, просмотр чужих профилей
   ============================================================ */
function gid(id) { return document.getElementById(id); }
function avatarHTML(photo, nick) { return photo ? `<img src="${esc(photo)}" alt="">` : esc(initials(nick)); }

const _renderProfileBase = renderProfile;
renderProfile = function () {
  _renderProfileBase();
  const p = state.profile || {}, li = isLoggedIn();
  const idEl = gid("profileId"), abEl = gid("profileAbout"), edBtn = gid("profileEditBtn");
  if (idEl) idEl.textContent = li && p.publicId ? "ID: " + p.publicId + " · нажмите, чтобы скопировать" : "";
  if (abEl) abEl.textContent = li ? (p.about || "") : "";
  if (edBtn) edBtn.style.display = li ? "" : "none";
  if (li) loadFriends(false); else { __friends = null; updateFriendsBadge(); }
};

function applyProfileFields(u) {
  const p = state.profile; if (!p) return;
  p.publicId = u.publicId; p.about = u.about || ""; p.photo = u.photo || null;
  p.login = u.login; p.hasPassword = !!u.hasPassword;
  __topBalanceCache = null;
  renderProfile();
}

function copyMyId() {
  const id = state.profile && state.profile.publicId; if (!id) return;
  const done = () => notify("win", "ID скопирован", id, "OK", OK_ITEM);
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(id).then(done, () => {});
  else { const ta = document.createElement("textarea"); ta.value = id; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (e) {} ta.remove(); }
}

/* ---------- редактирование своего профиля ---------- */
async function openEditProfile() {
  if (!isLoggedIn()) { openAuth("Войдите, чтобы редактировать профиль"); return; }
  const p = state.profile;
  let shop = null;
  try { shop = await api("/api/shop"); } catch (e) {}
  const owned = shop ? shop.items.filter(x => x.owned) : [];
  const cur = shop ? shop.equipped : null;
  const prefBlock = owned.length
    ? `<div class="reg-field"><label>Префикс</label><div class="ep-prefix-list" id="epPrefixList" data-cur="${cur == null ? "" : cur}">`
      + `<button type="button" class="ep-pref${cur == null ? " on" : ""}" data-id="" onclick="pickEpPrefix(this)">Без префикса</button>`
      + owned.map(x => `<button type="button" class="ep-pref${cur === x.id ? " on" : ""}" data-id="${x.id}" onclick="pickEpPrefix(this)"><span class="nk-prefix" style="--pc:${esc(x.color)}">${esc(x.text)}</span></button>`).join("")
      + `</div></div>`
    : `<div class="misc-hint">Купите префикс в разделе «Префиксы», и он появится здесь.</div>`;
  const pwBlock = p.hasPassword
    ? `<div class="reg-field"><label>Текущий пароль (нужен, чтобы сменить логин или пароль)</label><input id="epCurPw" type="password" maxlength="64" autocomplete="current-password"></div>`
    : `<div class="misc-hint">Задайте логин и пароль — тогда можно будет входить не только через Telegram.</div>`;
  openMisc(miscHead(ic("users", 24), "Редактирование профиля", "Ник и ID изменить нельзя") + `
    <div class="reg-body" style="overflow-y:auto;min-height:0">
      <div class="ep-avatar-row">
        <div class="ep-avatar" id="epAvatar">${avatarHTML(p.photo, p.nickname)}</div>
        <button class="ghost-btn" onclick="gid('epFile').click()">Фото из галереи</button>
        <input id="epFile" type="file" accept="image/*" hidden onchange="pickAvatar(this)">
      </div>
      <div class="reg-field"><label>О себе (до 20 символов)</label>
        <input id="epAbout" type="text" maxlength="20" value="${esc(p.about || "")}" placeholder="Например, коллекционер" autocomplete="off"></div>
      <div class="reg-field"><label>Логин</label>
        <input id="epLogin" type="text" maxlength="32" value="${esc(p.login || "")}" placeholder="Придумайте логин" autocapitalize="none" autocomplete="off" autocorrect="off" spellcheck="false"></div>
      ${prefBlock}
      ${pwBlock}
      <div class="reg-field"><label>${p.hasPassword ? "Новый пароль (если нужно сменить)" : "Пароль"}</label>
        <input id="epNewPw" type="password" maxlength="64" autocomplete="new-password"></div>
      <div class="misc-msg" id="miscError"></div>
    </div>
    <div class="sheet-foot"><button class="primary-btn" id="miscBtn" onclick="saveProfile()">Сохранить</button></div>`);
}

function pickAvatar(inp) {
  const f = inp.files && inp.files[0]; inp.value = "";
  if (!f) return;
  miscMsg("Загрузка фото…", true);
  const url = URL.createObjectURL(f), img = new Image();
  img.onload = async () => {
    try {
      const S = 256, c = document.createElement("canvas"); c.width = c.height = S;
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = (img.naturalWidth - side) / 2, sy = (img.naturalHeight - side) / 2;
      const ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, S, S);
      ctx.drawImage(img, sx, sy, side, side, 0, 0, S, S);
      const u = await api("/api/me/avatar", { method: "POST", body: { image: c.toDataURL("image/jpeg", 0.85) } });
      applyProfileFields(u);
      const a = gid("epAvatar"); if (a) a.innerHTML = avatarHTML(u.photo, state.profile.nickname);
      miscMsg("Фото обновлено", true);
    } catch (e) { miscMsg(e.message || "Не удалось загрузить фото"); }
    URL.revokeObjectURL(url);
  };
  img.onerror = () => { URL.revokeObjectURL(url); miscMsg("Не удалось открыть картинку"); };
  img.src = url;
}

async function saveProfile() {
  const p = state.profile, btn = gid("miscBtn");
  const about = gid("epAbout").value.trim().replace(/\s+/g, " ");
  const login = gid("epLogin").value.trim().toLowerCase();
  const newPw = gid("epNewPw").value;
  const curEl = gid("epCurPw"), curPw = curEl ? curEl.value : "";
  const pl = gid("epPrefixList");
  const curPid = pl ? (pl.dataset.cur === "" ? null : Number(pl.dataset.cur)) : undefined;
  const selBtn = pl ? pl.querySelector(".ep-pref.on") : null;
  const newPid = selBtn ? (selBtn.dataset.id === "" ? null : Number(selBtn.dataset.id)) : undefined;
  const prefChanged = pl && newPid !== curPid;
  const loginChanged = !!login && login !== (p.login || "");
  if (about.length > 20) return miscMsg("«О себе»: не больше 20 символов");
  if (loginChanged && login.length < 3) return miscMsg("Логин слишком короткий");
  if (newPw && newPw.length < 4) return miscMsg("Пароль слишком короткий");
  if (p.hasPassword && (loginChanged || newPw) && !curPw) return miscMsg("Введите текущий пароль");
  btn.disabled = true; miscMsg("");
  try {
    if (about !== (p.about || "")) applyProfileFields(await api("/api/me/profile", { method: "POST", body: { about } }));
    if (loginChanged || newPw) applyProfileFields(await api("/api/me/credentials", { method: "POST",
      body: { login: loginChanged ? login : undefined, new_password: newPw || undefined, current_password: curPw || undefined } }));
    if (prefChanged) { await api("/api/shop/equip", { method: "POST", body: { id: newPid } }); await refreshMeFromServer(); }
    closeMisc();
    notify("win", "Профиль сохранён", "Изменения применены", "OK", OK_ITEM);
  } catch (e) { btn.disabled = false; miscMsg(e.message); }
}

function pickEpPrefix(btn) {
  document.querySelectorAll("#epPrefixList .ep-pref").forEach(b => b.classList.toggle("on", b === btn));
}

/* ---------- поиск игрока по ID ---------- */
function openFindPlayer() {
  if (!isLoggedIn()) { openAuth("Войдите, чтобы искать игроков"); return; }
  openMisc(miscHead(svgi("search", 24), "Поиск игрока", "Введите ID игрока") + `
    <div class="reg-body">
      <div class="reg-field"><label>ID игрока</label>
        <input id="fpInput" type="text" maxlength="16" placeholder="Например, 123456" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false"></div>
      <div id="fpResult"></div>
      <div class="misc-msg" id="miscError"></div>
    </div>
    <div class="sheet-foot"><button class="primary-btn" id="miscBtn" onclick="submitFindPlayer()">Найти</button></div>`);
  const i = gid("fpInput");
  i.addEventListener("keydown", e => { if (e.key === "Enter") submitFindPlayer(); });
  setTimeout(() => i.focus(), 350);
}
async function submitFindPlayer() {
  const q = gid("fpInput").value.trim().replace(/^#/, "");
  const out = gid("fpResult"); out.innerHTML = "";
  if (!q) return miscMsg("Введите ID");
  const btn = gid("miscBtn"); btn.disabled = true; miscMsg("");
  try {
    const r = await api("/api/users/search?q=" + encodeURIComponent(q));
    const u = (r.users || [])[0];
    if (!u) miscMsg("Игрок с таким ID не найден");
    else out.innerHTML = `<div class="fp-row" onclick="openUserProfile('${esc(u.publicId)}')">
      <div class="fp-av">${avatarHTML(u.photo, u.nickname)}</div>
      <div><div class="fp-name">${esc(u.nickname)}${u.isMe ? " (вы)" : ""}</div><div class="fp-id">ID: ${esc(u.publicId)}</div></div></div>`;
  } catch (e) { miscMsg(e.message); }
  btn.disabled = false;
}

/* ---------- чужой профиль (баланс и инвентарь — внизу; кнопки: друзья, блок) ---------- */
function userActionsHTML(u) {
  if (u.isMe) return "";
  const p = esc(u.publicId), err = '<div class="misc-msg" id="upError"></div>';
  let top = "";
  if (u.relation === "blocked") {
    return `<div class="up-actions"><div class="misc-hint">Вы заблокировали этого игрока</div>
      <button class="ghost-btn" onclick="userAct('unblock','${p}')">Разблокировать</button>${err}</div>`;
  }
  if (u.relation === "friend") top = `<button class="ghost-btn" onclick="userAct('unfriend','${p}')">В друзьях · удалить</button>`;
  else if (u.relation === "outgoing") top = `<button class="ghost-btn" onclick="userAct('remove','${p}')">Заявка отправлена · отменить</button>`;
  else if (u.relation === "incoming") top = `<div class="up-two"><button class="primary-btn" onclick="userAct('accept','${p}')">Принять</button><button class="ghost-btn" onclick="userAct('remove','${p}')">Отклонить</button></div>`;
  else top = `<button class="primary-btn" onclick="userAct('request','${p}')">Добавить в друзья</button>`;
  return `<div class="up-actions">${top}<div class="up-two"><button class="ghost-btn bad" onclick="userAct('block','${p}')">Заблокировать</button></div>${err}</div>`;
}
