/* ===== Трейды: обмен предметами (и G сверху) с другом или по ссылке ===== */
let tradeView = null, tradeDraft = { items: {}, g: 0 }, tradePollTimer = null, tradeTick = 0, tradeNoteText = "";
const TRADE_PENDING_KEY = "amg_pending_trade";

function tItem(id) { return (typeof MEMES !== "undefined" && MEMES.find(m => m.id === id)) || { id, name: "Предмет #" + id, rarity: "common", price: 0 }; }
function tCounts(list) { const o = {}; (list || []).forEach(i => { o[i] = (o[i] || 0) + 1; }); return o; }
function tFlat(counts) { const out = []; Object.keys(counts).forEach(k => { for (let n = 0; n < counts[k]; n++) out.push(+k); }); return out; }
function tOwned() { const o = {}; (state.inventory || []).forEach(i => { o[i.id] = (o[i.id] || 0) + 1; }); return o; }
function tDraftFee() {
  const pct = (tradeView && tradeView.feePct) || 0;
  const value = tFlat(tradeDraft.items).reduce((s, id) => s + (tItem(id).price || 0), 0) + tradeDraft.g;
  return Math.round(value * pct / 100);
}
function tSideList(items, g) {
  const c = tCounts(items);
  const rows = Object.keys(c).map(k => `<div class="tr-it"><span>${esc(tItem(+k).name)}</span><b>×${c[k]}</b></div>`).join("");
  return (rows || "") + (g ? `<div class="tr-g">+ ${fmt(g)}</div>` : "") || `<div class="tr-empty">пусто</div>`;
}
function tStatusText(v) {
  if (v.status === "countdown") return `Подтверждено · обмен через <span id="trTimer">${v.secondsLeft}</span> с`;
  return { open: "Открыт — подтвердите предложение", done: "Обмен завершён", cancelled: "Трейд отменён" }[v.status] || v.status;
}

function tradeHTML() {
  const v = tradeView;
  const mine = v.you === "a" ? v.a : v.b, other = v.you === "a" ? v.b : v.a;
  const editable = v.status === "open";
  const owned = tOwned();
  const tiles = Object.keys(owned).map(k => {
    const id = +k, have = owned[k], n = tradeDraft.items[id] || 0, m = tItem(id);
    return `<div class="tr-tile${n ? " on" : ""}">` +
      `<button class="tr-tile-main" onclick="tradeAdd(${id},1)" ${editable && n < have ? "" : "disabled"}>` +
      `<b>${esc(m.name)}</b><small>в трейде ${n} из ${have}</small></button>` +
      (editable && n ? `<button class="tr-tile-minus" onclick="tradeAdd(${id},-1)" aria-label="убрать">−</button>` : "") + `</div>`;
  }).join("") || `<div class="tr-empty">В инвентаре нет предметов</div>`;
  const max = Math.max(0, state.balance || 0), step = Math.max(1, Math.floor(max / 400));
  const pctFill = max ? Math.min(100, tradeDraft.g / max * 100) : 0;
  const slider = editable
    ? `<input class="tr-range" type="range" min="0" max="${max}" step="${step}" value="${tradeDraft.g}" ` +
      `oninput="tradeLiveG(this.value)" onchange="tradeSetG(this.value)" ${max ? "" : "disabled"}>` : "";
  const unsaved = JSON.stringify(tFlat(tradeDraft.items).sort()) !== JSON.stringify((mine.items || []).slice().sort()) || tradeDraft.g !== mine.g;
  const who = other.publicId ? `${esc(other.nickname)} <small>#${esc(other.publicId)}</small>` : "ждём второго игрока";
  const shareBtn = !other.publicId && editable ? `<button class="ghost-btn" onclick="tradeShare()">Поделиться ссылкой</button>` : "";
  const status = v.status === "open" && mine.ok ? "Вы подтвердили · ждём партнёра" : tStatusText(v);
  return `<div class="tr-screen">
    <div class="tr-status">${status}</div>
    <div class="tr-panels">
      <div class="tr-panel mine"><div class="tr-h">Вы отдаёте${unsaved ? ' <small class="tr-unsaved">не сохранено</small>' : ""}</div>${tSideList(tFlat(tradeDraft.items), tradeDraft.g)}</div>
      <div class="tr-arrows" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h15l-4-4M20 15H5l4 4"/></svg></div>
      <div class="tr-panel theirs"><div class="tr-h">Вы получаете</div>${tSideList(other.items, other.g)}</div>
    </div>
    <div class="tr-who">Партнёр: ${who}</div>
    <div class="tr-gbox">
      <div class="tr-gbar"><div class="tr-gfill" id="trGFill" style="width:${pctFill}%"></div><span id="trGVal">${fmt(tradeDraft.g)}</span></div>
      ${slider}
    </div>
    ${editable ? `<div class="tr-h">Ваш инвентарь</div><div class="tr-tiles">${tiles}</div>` : ""}
    ${editable ? `<div class="tr-fee">Комиссия ${v.feePct || 0}%: ${fmt(tDraftFee())}</div>` : ""}
    ${v.note ? `<div class="tr-note">${esc(v.note)}</div>` : ""}
    <div class="tr-btns">
      ${editable ? `<button class="ghost-btn" onclick="tradeSave()">Сохранить</button><button class="primary-btn" onclick="tradeConfirm()">Подтвердить</button>` : ""}
      ${v.status === "countdown" ? `<button class="ghost-btn bad" onclick="tradeCancel()">Отменить обмен</button>` : ""}
      ${v.status === "open" ? `<button class="ghost-btn bad" onclick="tradeCancel()">Закрыть трейд</button>` : ""}
      ${shareBtn}
    </div></div>`;
}
function renderTrade() {
  if (!tradeView) return;
  closeMisc();
  document.getElementById("tradeBody").innerHTML = tradeHTML();
  const ov = document.getElementById("tradeOverlay"); ov.hidden = false; ov.scrollTop = 0;
}
function closeTrade() { const ov = document.getElementById("tradeOverlay"); if (ov) ov.hidden = true; }
function tradeLiveG(v) {
  const max = Math.max(0, state.balance || 0);
  tradeDraft.g = Math.max(0, Math.min(max, Math.floor(+v || 0)));
  const f = document.getElementById("trGFill"), t = document.getElementById("trGVal");
  if (f) f.style.width = (max ? Math.min(100, tradeDraft.g / max * 100) : 0) + "%";
  if (t) t.innerHTML = fmt(tradeDraft.g);
}
function tradeAdd(id, d) {
  const owned = tOwned()[id] || 0, cur = tradeDraft.items[id] || 0;
  const n = Math.max(0, Math.min(owned, cur + d));
  if (n) tradeDraft.items[id] = n; else delete tradeDraft.items[id];
  renderTrade();
}
function tradeSetG(v) {
  tradeDraft.g = Math.max(0, Math.min(state.balance || 0, Math.floor(+v || 0)));
  renderTrade();
}
function tradeApply(v) {
  const before = tradeView && tradeView.status;
  tradeView = v; trSyncTimer(v);
  if (v.status === "done" && before !== "done") { tradeDraft = { items: {}, g: 0 }; refreshMeFromServer(); }
  if (before !== v.status || v.status !== "countdown") renderTrade(); else { const t = document.getElementById("trTimer"); if (t) t.textContent = v.secondsLeft; }
}
async function refreshMeFromServer() {
  try { mergeServerUser(await api("/api/me")); } catch (e) {}
}
function tradeErr(e) { notify("lose", "Трейд", "Не получилось", e.message, OK_ITEM); }

async function openTrade(id, joinFirst) {
  try {
    if (joinFirst) { try { await api(`/api/trades/${id}/join`, { method: "POST" }); } catch (e) {} }
    const v = await api(`/api/trades/${id}`);
    if (v.needJoin) { await api(`/api/trades/${id}/join`, { method: "POST" }); return openTrade(id, false); }
    tradeView = v; trSyncTimer(v);
    const mine = v.you === "a" ? v.a : v.b;
    tradeDraft = { items: tCounts(mine.items), g: mine.g };
    renderTrade();
    startTradePoll(id);
  } catch (e) { tradeErr(e); }
}
function startTradePoll(id) {
  clearInterval(tradePollTimer);
  tradePollTimer = setInterval(async () => {
    const overlay = document.getElementById("miscOverlay");
    if (!tradeView || !overlay || !overlay.classList.contains("open")) return clearInterval(tradePollTimer);
    tradeTick++;
    const busy = tradeView.status === "countdown";
    if (!busy && tradeTick % 3 !== 0) return;
    try { tradeApply(await api(`/api/trades/${id}`)); } catch (e) {}
  }, 1000);
}

async function tradeSave() {
  if (!tradeView) return;
  const v = await api(`/api/trades/${tradeView.id}/set`, { method: "POST", body: { items: tFlat(tradeDraft.items), g: tradeDraft.g } });
  tradeApply(v);
  return v;
}
async function tradeConfirm() {
  try {
    const mine = tradeView.you === "a" ? tradeView.a : tradeView.b;
    const dirty = JSON.stringify(tFlat(tradeDraft.items).sort()) !== JSON.stringify((mine.items || []).slice().sort()) || tradeDraft.g !== mine.g;
    if (dirty) await tradeSave();
    tradeApply(await api(`/api/trades/${tradeView.id}/confirm`, { method: "POST" }));
    const after = tradeView.status === "countdown" ? "Обмен через 10 сек — можно отменить" : "Ждём подтверждения партнёра";
    notify("win", "Трейд", "Вы подтвердили", after, OK_ITEM);
  } catch (e) { tradeErr(e); }
}
async function tradeCancel() {
  try { tradeApply(await api(`/api/trades/${tradeView.id}/cancel`, { method: "POST" })); } catch (e) { tradeErr(e); }
}
async function tradeShare() {
  const url = tradeView.link || (location.origin + "/t/" + tradeView.id);
  try {
    if (navigator.share) await navigator.share({ title: "Трейд в Амгрейд", url });
    else if (navigator.clipboard) { await navigator.clipboard.writeText(url); notify("win", "Трейд", "Ссылка скопирована", "", OK_ITEM); }
    else notify("win", "Трейд", "Ссылка", url, OK_ITEM);
  } catch (e) {}
}

async function openTrades() {
  if (!isLoggedIn()) return openAuth("Войдите, чтобы торговать");
  let list = [];
  try { list = await api("/api/trades"); } catch (e) {}
  const rows = list.map(t => {
    const other = t.you === "a" ? t.b : t.a;
    const who = other && other.publicId ? esc(other.nickname) : "ждём партнёра";
    return `<button class="tr-row" onclick="openTrade('${t.id}', false)"><span>${who}</span><small>${esc(tStatusLabel(t.status))}</small></button>`;
  }).join("");
  openMisc(miscHead(ic("gift", 24), "Трейды", "Обмен предметами с друзьями") +
    `<div class="reg-body"><div class="tr-new">
       <div class="tr-h">Трейд другу</div>
       <div class="th-form"><input type="text" id="trFriend" class="th-name" placeholder="ID друга (6 цифр)" maxlength="12">
         <button class="primary-btn" onclick="tradeCreate(document.getElementById('trFriend').value)">Открыть трейд</button></div>
       <div class="tr-h">Трейд по ссылке</div>
       <button class="ghost-btn" onclick="tradeCreate('')">Создать ссылку-приглашение</button>
     </div>
     <div class="tr-h">Мои трейды</div><div class="tr-list">${rows || '<div class="tr-empty">Трейдов пока нет</div>'}</div></div>`);
}
function tStatusLabel(s) { return { open: "открыт", countdown: "подтверждён", done: "завершён", cancelled: "отменён" }[s] || s; }
async function tradeCreate(friendId) {
  try {
    const body = { items: [], g: 0 };
    if (friendId && friendId.trim()) body.to = friendId.trim();
    const v = await api("/api/trades", { method: "POST", body });
    await openTrade(v.id, false);
  } catch (e) { tradeErr(e); }
}

/* Приглашение по ссылке: ?trade=КОД. Гость сначала входит, потом трейд откроется сам. */
function tradeFromUrl() {
  let p = new URLSearchParams(location.search).get("trade");
  const m = location.pathname.match(/\/t\/([0-9a-f]{8})\/?$/i);
  if (!p && m) p = m[1];
  if (!p) return;
  try { localStorage.setItem(TRADE_PENDING_KEY, p); } catch (e) {}
  try { history.replaceState(null, "", "/"); } catch (e) {}
}
function tradeCheckPending() {
  if (!isLoggedIn()) return;
  let p = null;
  try { p = localStorage.getItem(TRADE_PENDING_KEY); } catch (e) {}
  if (!p) return;
  try { localStorage.removeItem(TRADE_PENDING_KEY); } catch (e) {}
  openTrade(p, true);
}
tradeFromUrl();
setInterval(tradeCheckPending, 1500);

let __trEnd = 0;
function trSyncTimer(v) {
  if (!v || v.status !== "countdown") { __trEnd = 0; return; }
  const want = Date.now() + (v.secondsLeft || 0) * 1000;
  if (!__trEnd || Math.abs(want - __trEnd) > 1500) __trEnd = want;
}
setInterval(() => {
  const t = document.getElementById("trTimer");
  if (!t || !__trEnd) return;
  t.textContent = Math.max(0, Math.ceil((__trEnd - Date.now()) / 1000));
}, 250);
