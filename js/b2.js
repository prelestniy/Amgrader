async function openUserProfile(pid, silent) {
  if (!isLoggedIn()) { openAuth("Войдите, чтобы смотреть профили"); return; }
  closeMisc();
  const ov = gid("userOverlay"), body = gid("userBody");
  if (!silent) { body.innerHTML = '<div class="empty-state">Загрузка…</div>'; ov.hidden = false; ov.scrollTop = 0; }
  try {
    const u = await api("/api/users/" + encodeURIComponent(pid));
    const since = u.createdAt ? new Date(u.createdAt * 1000).toLocaleDateString("ru-RU") : "";
    const items = (u.inventory || []).map(id => getMemeById(id)).filter(Boolean);
    body.innerHTML = `
      <div class="profile-card">
        <div class="profile-avatar">${avatarHTML(u.photo, u.nickname)}</div>
        <div class="profile-info">
          <div class="profile-name">${nickHTML(u)}</div>
          <div class="profile-sub">ID: ${esc(u.publicId)}${since ? " · в игре с " + since : ""}</div>
          ${u.about ? `<div class="profile-about">${esc(u.about)}</div>` : ""}
        </div>
      </div>
      ${userActionsHTML(u)}
      <div class="profile-stats">
        <div class="stat-card"><div class="stat-value">${fmt(u.balance)}</div><div class="stat-label">Баланс</div></div>
        <div class="stat-card"><div class="stat-value">${items.length}</div><div class="stat-label">Предметов</div></div>
      </div>
      <div class="pg-sub">Инвентарь</div>
      <div class="grid">${items.length ? items.map(m => cardHTML(m, {})).join("") : '<div class="empty-state">Инвентарь пуст</div>'}</div>`;
  } catch (e) { body.innerHTML = `<div class="empty-state">${esc(e.message)}</div>`; }
}
function closeUserProfile() { gid("userOverlay").hidden = true; }

function askConfirm(text) {
  return new Promise(res => {
    openMisc(miscHead(ic("gift", 24), "Подтвердите", "") +
      `<div class="reg-body"><div class="misc-hint" style="font-size:15px;line-height:1.5">${esc(text)}</div>` +
      `<div class="tr-btns" style="margin-top:14px"><button class="primary-btn" id="cfOk">Да</button>` +
      `<button class="ghost-btn" id="cfNo">Отмена</button></div></div>`);
    setTimeout(() => {
      const ok = document.getElementById("cfOk"), no = document.getElementById("cfNo");
      if (ok) ok.onclick = () => { closeMisc(); res(true); };
      if (no) no.onclick = () => { closeMisc(); res(false); };
    }, 0);
  });
}
async function userAct(kind, pid) {
  const er = gid("upError"); if (er) er.textContent = "";
  try {
    if (kind === "block") {
      if (!(await askConfirm("Заблокировать игрока? Дружба удалится, заявки от него отправлять нельзя."))) return;
      await api("/api/blocks", { method: "POST", body: { publicId: pid, block: true } });
    } else if (kind === "unblock") {
      await api("/api/blocks", { method: "POST", body: { publicId: pid, block: false } });
    } else if (kind === "unfriend") {
      if (!(await askConfirm("Удалить игрока из друзей?"))) return;
      await api("/api/friends/remove", { method: "POST", body: { publicId: pid } });
    } else {
      await api("/api/friends/" + kind, { method: "POST", body: { publicId: pid } });
    }
    __friendsAt = 0; loadFriends(true);
    await openUserProfile(pid, true);
  } catch (e) { const el = gid("upError"); if (el) el.textContent = e.message; }
}

/* ---------- друзья: список, заявки, чёрный список ---------- */
let __friends = null, __friendsAt = 0, __friendsLoading = false;
async function loadFriends(force) {
  if (!isLoggedIn() || !getToken()) return null;
  if (__friendsLoading) return __friends;
  if (!force && __friendsAt && Date.now() - __friendsAt < 20000) return __friends;
  __friendsLoading = true;
  try { __friends = await api("/api/friends"); } catch (e) {}
  __friendsAt = Date.now(); __friendsLoading = false;
  updateFriendsBadge();
  return __friends;
}
function updateFriendsBadge() {
  const el = gid("friendsBadge"); if (!el) return;
  const n = __friends ? (__friends.incoming || []).length : 0;
  el.textContent = n; el.hidden = !n;
}
function frRow(u, actions) {
  return `<div class="fp-row" onclick="openUserProfile('${esc(u.publicId)}')">
    <div class="fp-av">${avatarHTML(u.photo, u.nickname)}</div>
    <div style="min-width:0"><div class="fp-name">${esc(u.nickname)}</div><div class="fp-id">ID: ${esc(u.publicId)}</div></div>
    ${actions ? `<div class="fp-actions" onclick="event.stopPropagation()">${actions}</div>` : ""}</div>`;
}
function openFriends() {
  if (!isLoggedIn()) { openAuth("Войдите, чтобы пользоваться друзьями"); return; }
  openMisc(miscHead(ic("users", 24), "Друзья", "Друзья и заявки") + `
    <div class="reg-body" style="overflow-y:auto;min-height:0">
      <div class="fr-list" id="friendsList"><div class="hist-empty">Загрузка…</div></div>
      <button class="ghost-btn" onclick="openBlocked()">Заблокированные</button>
      <div class="misc-msg" id="miscError"></div>
    </div>
    <div class="sheet-foot"><button class="primary-btn" onclick="openFindPlayer()">Найти игрока по ID</button></div>`);
  renderFriends(true);
}
async function renderFriends(force) {
  const d = await loadFriends(force), el = gid("friendsList");
  if (!el) return;
  if (!d) { el.innerHTML = '<div class="hist-empty">Не удалось загрузить</div>'; return; }
  const part = (title, list, act) => list.length ? `<div class="misc-hint">${title}</div>` + list.map(u => frRow(u, act ? act(u) : "")).join("") : "";
  const html =
    part("Входящие заявки", d.incoming, u => `<button class="mini-btn ok" onclick="friendAct('accept','${esc(u.publicId)}')">Принять</button><button class="mini-btn" onclick="friendAct('remove','${esc(u.publicId)}')">Отклонить</button>`) +
    part("Отправленные заявки", d.outgoing, u => `<button class="mini-btn" onclick="friendAct('remove','${esc(u.publicId)}')">Отмена</button>`) +
    part(`Друзья (${d.friends.length})`, d.friends);
  el.innerHTML = html || '<div class="hist-empty">Пока никого — найдите игрока по ID и добавьте в друзья</div>';
}
async function friendAct(kind, pid) {
  miscMsg("");
  try { await api("/api/friends/" + kind, { method: "POST", body: { publicId: pid } }); await renderFriends(true); }
  catch (e) { miscMsg(e.message); }
}
async function openBlocked() {
  openMisc(miscHead(ic("users", 24), "Заблокированные", "Они не могут отправлять вам заявки") + `
    <div class="reg-body" style="overflow-y:auto;min-height:0"><div class="fr-list" id="blockedList"><div class="hist-empty">Загрузка…</div></div>
      <div class="misc-msg" id="miscError"></div></div>
    <div class="sheet-foot"><button class="ghost-btn" style="width:100%" onclick="openFriends()">Назад к друзьям</button></div>`);
  await renderBlocked();
}
async function renderBlocked() {
  const el = gid("blockedList"); if (!el) return;
  try {
    const r = await api("/api/blocks"), list = r.blocked || [];
    el.innerHTML = list.length
      ? list.map(u => frRow(u, `<button class="mini-btn" onclick="unblockFromList('${esc(u.publicId)}')">Разблокировать</button>`)).join("")
      : '<div class="hist-empty">Список пуст</div>';
  } catch (e) { el.innerHTML = `<div class="hist-empty">${esc(e.message)}</div>`; }
}
async function unblockFromList(pid) {
  try { await api("/api/blocks", { method: "POST", body: { publicId: pid, block: false } }); await renderBlocked(); }
  catch (e) { miscMsg(e.message); }
}


/* ---------- сообщения ---------- */
