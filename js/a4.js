function tryTelegramAuth() {
  try {
    const tg = window.Telegram && window.Telegram.WebApp;
    if (!tg) return null;
    tg.ready();
    tg.expand();
    setupTgFullscreen();
    const u = tg.initDataUnsafe && tg.initDataUnsafe.user;
    if (!u) return null;
    return {
      nickname: [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || "Игрок",
      username: u.username || null,
      photo: u.photo_url || null,
      source: "telegram",
      id: u.id
    };
  } catch (e) { return null; }
}

/* Тихое восстановление сессии при запуске — БЕЗ принудительного окна входа */
function initAuth() {
  let sessionKey = null;
  try { sessionKey = localStorage.getItem("amg_session") || null; } catch (e) {}
  const accounts = getAccounts();

  if (sessionKey && accounts[sessionKey]) {
    applyAccountSession(sessionKey, accounts[sessionKey]);
    return;
  }

  const tgProfile = tryTelegramAuth();
  if (tgProfile) {
    const key = "tg_" + tgProfile.id;
    let acc = accounts[key];
    if (!acc) {
      acc = { nickname: tgProfile.nickname, username: tgProfile.username, photo: tgProfile.photo,
        source: "telegram", balance: 100000, inventory: [], createdAt: Date.now() };
      accounts[key] = acc;
      saveAccounts(accounts);
    }
    applyAccountSession(key, acc);
    saveSession(key);
    return;
  }

  resetGuestState();
}

function applyAccountSession(key, acc) {
  state.profile = { accountKey: key, nickname: acc.nickname, username: acc.username || null,
    photo: acc.photo || null, source: acc.source };
  loadAccountIntoState(key, acc);
}

function setAuthTab(tab) {
  const isReg = tab === "register";
  document.getElementById("authTabLogin").classList.toggle("active", !isReg);
  document.getElementById("authTabRegister").classList.toggle("active", isReg);
  document.getElementById("authConfirmWrap").style.display = isReg ? "" : "none";
  document.getElementById("authHeading").textContent = isReg ? "Создать аккаунт" : "С возвращением";
  document.getElementById("authSub").textContent = isReg
    ? "Придумайте логин и пароль — прогресс будет сохранён за вашим аккаунтом."
    : "Войдите, чтобы амгрейдить предметы и сохранить прогресс за собой.";
  document.getElementById("authSubmitBtn").querySelector(".label").textContent = isReg ? "Зарегистрироваться" : "Войти";
  document.getElementById("authSwitch").innerHTML = isReg
    ? 'Уже есть аккаунт? <b onclick="setAuthTab(\'login\')">Войти</b>'
    : 'Нет аккаунта? <b onclick="setAuthTab(\'register\')">Зарегистрироваться</b>';
  clearAuthError();
  const pass = document.getElementById("authPassword");
  pass.setAttribute("autocomplete", isReg ? "new-password" : "current-password");
}

function showAuthError(msg) {
  const el = document.getElementById("authError");
  el.textContent = msg;
  el.classList.add("show");
  const fields = document.getElementById("authFields");
  fields.classList.remove("shake"); void fields.offsetWidth; fields.classList.add("shake");
}
function clearAuthError() {
  const el = document.getElementById("authError");
  el.textContent = ""; el.classList.remove("show");
}

function openAuth(message) {
  const ov = document.getElementById("authOverlay");
  clearAuthError();
  document.getElementById("authLogin").value = "";
  document.getElementById("authPassword").value = "";
  document.getElementById("authConfirm").value = "";
  setAuthTab("login");
  if (typeof webTgUpdate === "function") webTgUpdate();
  if (message) document.getElementById("authSub").textContent = message;
  ov.classList.add("open");
  setTimeout(() => document.getElementById("authLogin").focus(), 350);
}
function closeAuth() {
  document.getElementById("authOverlay").classList.remove("open");
}
function onAuthChipClick() {
  if (isLoggedIn()) showScreen("profile");
  else openAuth();
}

function submitAuth() {
  const isReg = document.getElementById("authTabRegister").classList.contains("active");
  const login = (document.getElementById("authLogin").value || "").trim();
  const pass = document.getElementById("authPassword").value || "";
  const confirm = document.getElementById("authConfirm").value || "";
  clearAuthError();

  if (login.length < 3) return showAuthError("Логин должен быть не короче 3 символов");
  if (pass.length < 4) return showAuthError("Пароль должен быть не короче 4 символов");
  if (isReg && pass !== confirm) return showAuthError("Пароли не совпадают");

  const btn = document.getElementById("authSubmitBtn");
  btn.classList.add("loading");

  setTimeout(() => {
    const accounts = getAccounts();
    const key = "u_" + login.toLowerCase();

    if (isReg) {
      if (accounts[key]) { btn.classList.remove("loading"); return showAuthError("Такой логин уже занят"); }
      accounts[key] = { nickname: login, passHash: simpleHash(pass), source: "manual",
        balance: 100000, inventory: [], createdAt: Date.now() };
      saveAccounts(accounts);
      applyAccountSession(key, accounts[key]);
      saveSession(key);
    } else {
      const acc = accounts[key];
      if (!acc || acc.passHash !== simpleHash(pass)) { btn.classList.remove("loading"); return showAuthError("Неверный логин или пароль"); }
      applyAccountSession(key, acc);
      saveSession(key);
    }

    btn.classList.remove("loading");
    closeAuth();
    renderAll();
    renderProfile();
    pulseBalance();
    notify("win", isReg ? "Аккаунт создан" : "Вы вошли", state.profile.nickname, "", null);
  }, 380);
}

function loginWithTelegram() {
  const tgProfile = tryTelegramAuth();
  if (!tgProfile) { webLoginStart(); return; }
  const accounts = getAccounts();
  const key = "tg_" + tgProfile.id;
  let acc = accounts[key];
  if (!acc) {
    acc = { nickname: tgProfile.nickname, username: tgProfile.username, photo: tgProfile.photo,
      source: "telegram", balance: 100000, inventory: [], createdAt: Date.now() };
    accounts[key] = acc;
    saveAccounts(accounts);
  }
  applyAccountSession(key, acc);
  saveSession(key);
  closeAuth();
  renderAll();
  renderProfile();
  pulseBalance();
}

async function logoutAccount() {
  if (!isLoggedIn()) return;
  if (!(await askConfirm("Выйти из аккаунта? Прогресс сохранится и будет ждать вас при следующем входе."))) return;
  saveGame();
  saveSession(null);
  state.profile = null;
  resetGuestState();
  showScreen("profile");
  renderAll();
  renderProfile();
}

async function resetProfile() {
  if (!isLoggedIn()) { openAuth(); return; }
  if (!(await askConfirm("Удалить аккаунт и весь прогресс безвозвратно?"))) return;
  try {
    const accounts = getAccounts();
    delete accounts[state.profile.accountKey];
    saveAccounts(accounts);
    localStorage.removeItem("amg_session");
  } catch (e) {}
  location.reload();
}

function renderProfile() {
  const p = state.profile || {};
  const loggedIn = isLoggedIn();
  const avatar = document.getElementById("profileAvatar");
  if (p.photo) avatar.innerHTML = `<img src="${p.photo}" alt="">`;
  else if (loggedIn) avatar.textContent = initials(p.nickname);
  else avatar.innerHTML = ICON_LOCK;

  document.getElementById("profileName").textContent = loggedIn ? (p.nickname || "Игрок") : "Гость";
  document.getElementById("profileSub").textContent = loggedIn
    ? (p.source === "telegram" ? (p.username ? "@" + p.username : "Telegram-аккаунт") : ("Логин: " + (p.login || p.nickname)))
    : "Не выполнен вход";

  document.getElementById("guestBanner").style.display = loggedIn ? "none" : "";
  document.getElementById("rowLogout").style.display = loggedIn ? "" : "none";

  const navIcon = document.getElementById("navProfileIcon");
  navIcon.innerHTML = p.photo
    ? `<span class="nav-avatar"><img src="${p.photo}" alt=""></span>`
    : `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="3.6" stroke="currentColor" stroke-width="1.7"/><path d="M4.5 20C5.6 16.3 8.5 14.3 12 14.3C15.5 14.3 18.4 16.3 19.5 20" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`;

  const chip = document.getElementById("authChip");
  if (loggedIn) {
    chip.classList.remove("guest");
    chip.classList.add("logged");
    chip.innerHTML = p.photo
      ? `<span class="auth-chip-avatar"><img src="${p.photo}" alt=""></span><span>${esc(p.nickname || "Профиль")}</span>`
      : `<span class="auth-chip-avatar">${initials(p.nickname)}</span><span>${esc(p.nickname || "Профиль")}</span>`;
  } else {
    chip.classList.add("guest");
    chip.classList.remove("logged");
    chip.textContent = "Войти";
  }

  document.getElementById("statBalance").textContent = fmt(state.balance);
  document.getElementById("statItems").textContent = state.inventory.length;

  renderTopBalanceSlider();
}

/* ---------- мини-слайдер «Топ по балансу» (реальные игроки с сервера) ---------- */
let __topBalanceCache = null, __topBalanceLoading = false, __topBalanceFailed = false;
async function loadTopBalances() {
  if (__topBalanceCache || __topBalanceLoading) return;
  __topBalanceLoading = true; __topBalanceFailed = false;
  try {
    const r = await api("/api/leaderboard");
    const list = (r && r.top) || [];
    __topBalanceCache = list.map(u => ({ nickname: u.nickname || "Игрок", balance: u.balance || 0, photo: u.photo, publicId: u.publicId || u.public_id || "", raw: u }));
  } catch (e) {
    /* сервер недоступен / эндпоинта ещё нет на этом окружении — оставляем
       блок пустым, никаких выдуманных игроков не показываем */
    __topBalanceCache = null; __topBalanceFailed = true;
  }
  __topBalanceLoading = false;
  renderTopBalanceSlider();
}
async function openTopUser(i) {
  const u = (window.__topList || [])[i]; if (!u) return;
  if (!isLoggedIn()) { openAuth("Войдите, чтобы смотреть профили"); return; }
  const tryOpen = async pid => {
    if (!pid) return false;
    try { await api("/api/users/" + encodeURIComponent(pid)); } catch (e) { return false; }
    u.publicId = String(pid); openUserProfile(String(pid)); return true;
  };
  /* своя карточка: профиль собираем локально, без запроса /api/users — он для себя может не отвечать */
  if (u.me) { openLocalProfile(u); return; }
  /* 1) любые id-поля, которые сервер положил в запись топа */
  const raw = u.raw || {}, cands = [];
  const add = v => { if (v != null && v !== "" && typeof v !== "object" && !cands.includes(String(v))) cands.push(String(v)); };
  add(u.publicId);
  ["publicId", "public_id", "pid", "shortId", "short_id", "displayId", "userId", "user_id", "uid", "id"].forEach(k => add(raw[k]));
  Object.keys(raw).forEach(k => { if (/id$/i.test(k)) add(raw[k]); });
  for (const c of cands) if (await tryOpen(c)) return;
  /* 2) поиск по нику */
  try {
    const r = await api("/api/users/search?q=" + encodeURIComponent(u.nickname));
    const found = (r.users || []).find(x => x.nickname === u.nickname);
    if (found && await tryOpen(found.publicId)) return;
  } catch (e) {}
  /* сервер не дал ID — показываем то, что известно из топа (ник, фото, баланс), вместо ошибки */
  openLocalProfile(u);
}
function openLocalProfile(u) {
  closeMisc();
  const ov = gid("userOverlay"), body = gid("userBody");
  const p = state.profile || {};
  const pid = u.me ? (p.publicId || u.publicId || "") : (u.publicId || "");
  const items = u.me ? state.inventory : null;
  body.innerHTML = `
    <div class="profile-card">
      <div class="profile-avatar">${avatarHTML(u.photo || (u.me ? p.photo : ""), u.nickname)}</div>
      <div class="profile-info">
        <div class="profile-name">${esc(u.nickname)}</div>
        <div class="profile-sub">${pid ? "ID: " + esc(pid) : "Игрок из топа"}</div>
      </div>
    </div>
    <div class="profile-stats">
      <div class="stat-card"><div class="stat-value">${fmt(u.balance)}</div><div class="stat-label">Баланс</div></div>
      <div class="stat-card"><div class="stat-value">${items ? items.length : "—"}</div><div class="stat-label">Предметов</div></div>
    </div>
    ${items ? `<div class="pg-sub">Инвентарь</div><div class="grid">${items.length ? items.map(m => cardHTML(m, {})).join("") : '<div class="empty-state">Инвентарь пуст</div>'}</div>` : ""}`;
  ov.hidden = false; ov.scrollTop = 0;
}
function renderTopBalanceSlider() {
  const el = document.getElementById("topBalanceSlider");
  if (!el) return;
  if (!__topBalanceCache) {
    if (!__topBalanceLoading && !__topBalanceFailed) loadTopBalances();
    el.innerHTML = __topBalanceFailed ? `<div class="misc-hint">Топ пока недоступен</div>` : "";
    return;
  }
  const p = state.profile || {}, loggedIn = isLoggedIn();
  let list = __topBalanceCache.map(u => {
    /* «это я»: совпал публичный ID; если сервер ID в топе не отдал — совпал ник */
    const mine = loggedIn && (
      (p.publicId && u.publicId && String(u.publicId) === String(p.publicId)) ||
      (!u.publicId && u.nickname === p.nickname)
    );
    /* всегда показываем актуальный баланс — он мог измениться после загрузки топа */
    return mine ? { ...u, me: true, balance: state.balance, photo: p.photo || u.photo, publicId: p.publicId || u.publicId } : { ...u, me: false };
  });
  if (loggedIn && !list.some(u => u.me)) {
    list.push({ nickname: p.nickname || "Игрок", balance: state.balance, photo: p.photo, me: true, publicId: p.publicId || "" });
  }
  /* на всякий случай: «я» — только одна карточка */
  { let seen = false; list = list.filter(u => { if (!u.me) return true; if (seen) return false; seen = true; return true; }); }
  list.sort((a, b) => b.balance - a.balance);
  list = list.slice(0, 10);
  if (!list.length) { el.innerHTML = `<div class="misc-hint">Пока никто не в топе</div>`; return; }
  window.__topList = list;
  el.innerHTML = list.map((u, i) => {
    const rank = i + 1;
    const av = u.photo ? `<img src="${u.photo}" alt="">` : esc(initials(u.nickname));
    return `<div class="top-card ${u.me ? "me" : ""} ${rank <= 3 ? "top" + rank : ""}" onclick="openTopUser(${i})" role="button">` +
      `<div class="top-rank">#${rank}${u.me ? " · вы" : ""}</div>` +
      `<div class="top-av">${av}</div>` +
      `<div class="top-nick">${esc(u.nickname)}</div>` +
      `<div class="top-bal">${fmt(u.balance)}</div>` +
      `</div>`;
  }).join("");
}

/* ---------- отдельный полноэкранный инвентарь (открывается из профиля) ---------- */
function renderProfileInventoryGrid() {
  const el = document.getElementById("invFullGrid");
  const list = state.inventory;
  el.innerHTML = list.length
    ? list.map(m => cardHTML(m, { selected: state.selectedMemeUids.includes(m.uid), check: true, select: `toggleInvSel('${m.uid}')`, play: true })).join("")
    : '<div class="empty-state">Инвентарь пуст</div>';
  updateInvSellUI();
}
function updateInvSellUI() {
  const all = document.getElementById("invSelAll"), btn = document.getElementById("invSellBtn"), badge = document.getElementById("invSellBadge");
  if (!all || !btn) return;
  const list = state.inventory, n = sellCartEntries().length;
  const showAll = list.length > 0, showSell = n >= 1;
  all.classList.toggle("show", showAll);
  all.classList.toggle("all", showAll && list.every(m => state.selectedMemeUids.includes(m.uid)));
  const was = btn.classList.contains("show");
  btn.classList.toggle("show", showSell);
  if (badge) { badge.textContent = n; if (showSell && was) { badge.classList.remove("pop"); void badge.offsetWidth; badge.classList.add("pop"); } }
}
function toggleInvSel(uid) {
  if (state.spinning) return;
  const idx = state.selectedMemeUids.indexOf(uid);
  if (idx >= 0) state.selectedMemeUids.splice(idx, 1); else state.selectedMemeUids.push(uid);
  const tgt = getTarget();
  if (tgt && (getTotalStake() === 0 || tgt.price <= getTotalStake())) state.targetMemeId = null;
  renderAll();
  renderProfileInventoryGrid();
}
function invSelectAll() {
  if (state.spinning || !state.inventory.length) return;
  const allSel = state.inventory.every(m => state.selectedMemeUids.includes(m.uid));
  state.selectedMemeUids = allSel ? [] : state.inventory.map(m => m.uid);
  const tgt = getTarget();
  if (tgt && (getTotalStake() === 0 || tgt.price <= getTotalStake())) state.targetMemeId = null;
  renderAll();
  renderProfileInventoryGrid();
}
function refreshInvFull() {
  const o = document.getElementById("invFullOverlay");
  if (o && !o.hidden) renderProfileInventoryGrid();
}
function openProfileInventory() {
  if (state.spinning) return;
  renderProfileInventoryGrid();
  document.getElementById("invFullOverlay").hidden = false;
  window.scrollTo(0, 0);
}
function closeProfileInventory() {
  document.getElementById("invFullOverlay").hidden = true;
}

/* ============================================================
   ИНИЦИАЛИЗАЦИЯ
   ============================================================ */
function init() {
  state.targets = MEMES.map(m => ({ ...m, uid: "t_" + m.id }));
  initAuth();
  loadGame();
  renderAll();
  renderProfile();
  updateNavScale(state.screen || "upgrade");
  try { selfTest(); } catch (e) {}
}
document.getElementById("spinBtn").addEventListener("click", onSpinClick);
initBubbleSwipe();
document.getElementById("buyOverlay").addEventListener("click", e => { if (e.target === e.currentTarget) closeBuy(); });
document.getElementById("authOverlay").addEventListener("click", e => { if (e.target === e.currentTarget) closeAuth(); });
