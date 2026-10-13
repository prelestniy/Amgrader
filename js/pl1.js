/* ===== Все игроки: поиск по нику и ID, подгрузка, карточки с префиксом и галочкой ===== */
let plQuery = "", plOffset = 0, plBusy = false, plTimer = null;
async function openPlayers() {
  if (!isLoggedIn()) return openAuth("Войдите, чтобы смотреть игроков");
  plQuery = ""; plOffset = 0;
  openMisc(miscHead(ic("gift", 24), "Игроки", "Поиск по нику или ID") +
    `<div class="reg-body pl-wrap">
       <input id="plSearch" class="pl-search" placeholder="Ник или ID" oninput="plOnSearch()" autocomplete="off">
       <div id="plList" class="pl-list"></div>
       <button id="plMore" class="ghost-btn pl-more" onclick="plLoad()">Ещё</button>
     </div>`);
  plLoad(true);
}
function plOnSearch() {
  clearTimeout(plTimer);
  plTimer = setTimeout(() => {
    plQuery = (document.getElementById("plSearch") || {}).value || "";
    plOffset = 0; plLoad(true);
  }, 300);
}
async function plLoad(reset) {
  if (plBusy) return;
  plBusy = true;
  const list = document.getElementById("plList");
  if (!list) { plBusy = false; return; }
  if (reset) list.innerHTML = `<div class="pl-hint">Загрузка…</div>`;
  try {
    const rows = await api(`/api/players?q=${encodeURIComponent(plQuery)}&offset=${plOffset}`);
    if (reset) list.innerHTML = "";
    if (reset && !rows.length) list.innerHTML = `<div class="pl-hint">Никого не нашли</div>`;
    rows.forEach((u, i) => {
      const d = document.createElement("div");
      d.className = "pl-card";
      d.style.animationDelay = (i * 0.03) + "s";
      d.innerHTML = `<div class="pl-av">${typeof avatarHTML === "function" ? avatarHTML(u.photo, u.nickname) : esc(initials(u.nickname))}</div>
        <div class="pl-info"><div>${nickHTML(u)}</div><div class="pl-id">ID: ${esc(u.publicId)}</div></div>`;
      d.onclick = () => { if (typeof openUserProfile === "function") openUserProfile(u.publicId); };
      list.appendChild(d);
    });
    plOffset += rows.length;
    const more = document.getElementById("plMore");
    if (more) more.style.display = rows.length < 30 ? "none" : "";
  } catch (e) {
    list.innerHTML = `<div class="pl-hint">${esc(e.message)}</div>`;
  } finally { plBusy = false; }
}
