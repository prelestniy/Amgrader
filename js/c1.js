const ICO = {"gift": "<rect x=\"3\" y=\"8\" width=\"18\" height=\"4\" rx=\"1\"/><path d=\"M12 8v13M19 12v9H5v-9M7.5 8a2.5 2.5 0 1 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 1 1 0 5\"/>", "users": "<path d=\"M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9.5\" cy=\"7\" r=\"4\"/><path d=\"M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8\"/>", "bag": "<path d=\"M6 8a6 6 0 0 1 12 0v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z\"/><path d=\"M9 21v-6h6v6M9 8h6\"/>", "box": "<path d=\"M21 8l-9-5-9 5v8l9 5 9-5z\"/><path d=\"M3 8l9 5 9-5M12 13v8\"/>", "layers": "<path d=\"M12 3l9 5-9 5-9-5z\"/><path d=\"M3 13l9 5 9-5M3 17.5l9 5 9-5\"/>", "volume": "<path d=\"M11 5L6 9H2v6h4l5 4z\"/><path d=\"M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14\"/>", "bolt": "<path d=\"M13 2L4 14h7l-1 8 9-12h-7z\"/>", "logout": "<path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9\"/>", "trash": "<path d=\"M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6\"/>", "check": "<path d=\"M5 12.5l4.5 4.5L19 7\"/>", "x": "<path d=\"M6 6l12 12M18 6L6 18\"/>", "cart": "<circle cx=\"9\" cy=\"20\" r=\"1.4\"/><circle cx=\"18\" cy=\"20\" r=\"1.4\"/><path d=\"M2 3h3l2.7 12.4a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6\"/>", "calendar": "<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M8 3v4M16 3v4M3 10h18\"/>", "telegram": "<path d=\"M21 4L3 11l6 2.5L11.5 20l3-4.5L19 19z\"/><path d=\"M9 13.5L21 4\"/>", "tiktok": "<path d=\"M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5\"/><path d=\"M14 3c.3 2.6 2 4.4 5 4.6\"/>", "link": "<path d=\"M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1\"/>", "history": "<path d=\"M3 12a9 9 0 1 0 3-6.7\"/><path d=\"M3 4v5h5\"/><path d=\"M12 7v5l4 2\"/>"};
/* ============================================================
   V6: экраны и переходы, кейсы, крафт, бонусы, скрытая удача
   ============================================================ */
const $ = id => document.getElementById(id);
const RAR_ORDER = ["common", "rare", "epic", "legendary", "mythic", "secret", "galactic", "sausage"];
const delay = ms => new Promise(r => setTimeout(r, ms));
function ic(n, s) {
  s = s || 20;
  return `<svg class="ic" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICO[n] || ""}</svg>`;
}

/* ---------- скрытая удача (правила задаёт админ) ---------- */
/* Показанный шанс не меняется. Если показанный шанс <= порога правила, реальный = показанный + бонус. */
function luckBonus(chance) {
  const rules = (state.luck || []).filter(r => chance <= r[0] + 1e-9)
    .sort((a, b) => (a[2] === "u" ? 0 : 1) - (b[2] === "u" ? 0 : 1) || a[0] - b[0]);
  return rules.length ? rules[0][1] : 0;
}
function rollOutcome(chance) {
  const real = Math.max(0, Math.min(100, chance + luckBonus(chance)));
  const win = randomCrypto() * 100 < real;
  const half = halfDegFor(chance);                       // сектор на колесе — по показанному шансу
  const angle = win
    ? (randomCrypto() * 2 - 1) * half * 0.98
    : normalizeAngle(half * 1.02 + randomCrypto() * (360 - half * 2.04));
  return { angle, win };
}

/* ---------- переключение экранов с анимацией ---------- */
const SCREENS = ["mines", "cases", "craft", "upgrade", "bonus", "wheel", "profile", "ladder"];
const cap = s => s[0].toUpperCase() + s.slice(1);
let screenToken = 0, bonusTimer = 0;
function showScreen(name) {
  if (state.spinning) return;
  { const uo = document.getElementById("userOverlay"); if (uo && !uo.hidden && typeof closeUserProfile === "function") closeUserProfile(); }
  if (typeof closeTrade === "function") closeTrade();
  if (demo.on && !["cases", "mines", "ladder"].includes(name)) setDemo(false);
  syncDemoUI();
  const els = SCREENS.map(s => $("screen" + cap(s))).filter(Boolean);   // экран может отсутствовать в старой index.html
  const out = els.find(e => !e.hidden) || null, inn = $("screen" + cap(name));
  if (!inn) { if (typeof state !== "undefined") state.screen = name; return; }
  state.screen = name;
  SCREENS.forEach(s => { const b = $("nav" + cap(s)); if (b) b.classList.toggle("active", s === name); });
  updateNavScale(name);
  if (out === inn) { window.scrollTo(0, 0); return; }
  const dir = out ? (SCREENS.indexOf(name) > SCREENS.indexOf(out.id.slice(6).toLowerCase()) ? 1 : -1) : 1;
  const token = ++screenToken;
  const enter = () => {
    if (token !== screenToken) return;
    els.forEach(e => { if (e !== inn) { e.hidden = true; e.classList.remove("leaving", "entering"); } });
    inn.style.setProperty("--dx", (dir * 24) + "px");
    inn.hidden = false; inn.classList.remove("leaving"); inn.classList.add("entering");
    if (name === "profile") renderProfile();
    if (name === "cases") { cs.view = "lobby"; const ov = $("caseOpenView"), lv = $("caseLobbyView"); ov.hidden = true; ov.classList.remove("leaving", "entering"); lv.hidden = false; lv.classList.remove("leaving", "entering"); renderCaseLobby(); refreshCaseConfig(); }
    if (name === "craft") { renderCraft(); refreshCaseConfig(); }
    if (name === "bonus") loadBonus();
    if (name === "wheel") initWheel();
    if (name === "mines") renderMinesScreen();
    if (name === "ladder") renderLadderScreen();
    window.scrollTo(0, 0);
    setTimeout(() => inn.classList.remove("entering"), 380);
  };
  if (out) { out.style.setProperty("--dx", (-dir * 18) + "px"); out.classList.add("leaving"); setTimeout(enter, 130); } else enter();
}

/* ============================================================
   МАСШТАБ ИКОНОК НАВИГАЦИИ — выбранная крупнее, по бокам плавно мельче
   ============================================================ */
const NAV_SIDE = ["cases", "craft", "mines", "ladder", "bonus", "profile"];
function navScaleFor(dist) { return Math.max(0.74, 1.28 - dist * 0.14); }
function updateNavScale(name) {
  const idx = NAV_SIDE.indexOf(name);
  const fromCenter = idx === -1; // активен центральный "Амгрейд" — используем виртуальный центр
  NAV_SIDE.forEach((s, i) => {
    const btn = $("nav" + cap(s));
    if (!btn) return;
    const icon = btn.querySelector(".nav-icon");
    if (!icon) return;
    const dist = fromCenter ? Math.abs(i - 2.5) : Math.abs(i - idx);
    icon.style.setProperty("--nav-scale", navScaleFor(dist).toFixed(3));
  });
}

/* ============================================================
   МИНЫ — игра на баланс
   ============================================================ */
const MINES_TOTAL = 25, MINES_EDGE = 0.97;
(function(){ if (document.getElementById('gfxDefs')) return; const d = document.createElement('div'); d.id = 'gfxDefs'; d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none'; d.innerHTML = '<svg width="0" height="0" style="position:absolute"><defs><linearGradient id="gmA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6FFD0"/><stop offset="1" stop-color="#C4F760"/></linearGradient><linearGradient id="gmB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C2F55A"/><stop offset="1" stop-color="#79C21B"/></linearGradient><linearGradient id="gmC" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8CD026"/><stop offset="1" stop-color="#3F8A0E"/></linearGradient><radialGradient id="bmB" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#7C8294"/><stop offset=".45" stop-color="#2E313C"/><stop offset="1" stop-color="#0E0F14"/></radialGradient><linearGradient id="mtl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5A5F6C"/><stop offset=".4" stop-color="#C3C8D4"/><stop offset="1" stop-color="#4A4E5A"/></linearGradient><linearGradient id="stA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C9CEDA"/><stop offset="1" stop-color="#8E94A3"/></linearGradient><linearGradient id="stB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8A90A0"/><stop offset="1" stop-color="#5A5F6E"/></linearGradient><linearGradient id="stC" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5E6371"/><stop offset="1" stop-color="#2F323C"/></linearGradient><linearGradient id="runG" gradientUnits="userSpaceOnUse" x1="0" y1="4" x2="0" y2="21"><stop offset="0" stop-color="#F0FFB8"/><stop offset="1" stop-color="#8FD12A"/></linearGradient></defs></svg>'; const add = () => document.body.appendChild(d); if (document.body) add(); else document.addEventListener('DOMContentLoaded', add); })();
const ICON_GEM = '<svg viewBox="0 0 48 48"><polygon points="14,6 34,6 44,18 24,44 4,18" fill="url(#gmB)"/><polygon points="14,6 34,6 30,18 18,18" fill="url(#gmA)"/><polygon points="14,6 18,18 4,18" fill="url(#gmB)"/><polygon points="34,6 44,18 30,18" fill="url(#gmC)"/><polygon points="4,18 18,18 24,44" fill="url(#gmB)"/><polygon points="18,18 30,18 24,44" fill="url(#gmA)" opacity=".85"/><polygon points="30,18 44,18 24,44" fill="url(#gmC)"/><polygon points="16,8 22,8 18,16 14,16" fill="#fff" opacity=".55"/><polygon points="14,6 34,6 44,18 24,44 4,18" fill="none" stroke="#F6FFD0" stroke-opacity=".7" stroke-width="1.2" stroke-linejoin="round"/><path d="M38 4v6M35 7h6" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>';
const ICON_BOMB = '<svg viewBox="0 0 48 48"><circle cx="22" cy="28" r="16" fill="url(#bmB)"/><circle cx="22" cy="28" r="15.4" fill="none" stroke="#FF5A4A" stroke-opacity=".55" stroke-width="1.2"/><ellipse cx="15.5" cy="21" rx="5.5" ry="3.4" transform="rotate(-35 15.5 21)" fill="#fff" opacity=".28"/><rect x="16.5" y="8" width="11" height="8" rx="2.2" fill="url(#mtl)"/><rect x="16.5" y="12.4" width="11" height="1.4" fill="#2A2D36" opacity=".6"/><path d="M27 10.5Q33 8.5 36 4" fill="none" stroke="#E3BC73" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="3 1.6"/><polygon points="39,-1 41,4 46,5 41.6,8 43,13 39,10 35,13 36.4,8 32,5 37,4" fill="#FF8A1F"/><polygon points="39,2 40.2,5 43,5.6 40.6,7.6 41.2,10.2 39,8.6 36.8,10.2 37.4,7.6 35,5.6 37.8,5" fill="#FFE27A"/><circle cx="39" cy="6.6" r="1.6" fill="#fff"/></svg>';
let mines = { phase: "idle", bet: 100, count: 3, bombs: [], opened: [] };
function minesLoadPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem("minesPrefs") || "null");
    if (p) { if (p.bet > 0) mines.bet = p.bet; if (p.count >= 1 && p.count <= 24) mines.count = p.count; }
  } catch (e) {}
}
function minesSavePrefs() { try { localStorage.setItem("minesPrefs", JSON.stringify({ bet: mines.bet, count: mines.count })); } catch (e) {} }
function minesNextMult(opened, bombs) { const safe = MINES_TOTAL - bombs; return (MINES_TOTAL - opened) / (safe - opened); }
function minesCurMult(opened, bombs) { let m = 1; for (let i = 0; i < opened; i++) m *= minesNextMult(i, bombs); return m * MINES_EDGE; }
function minesOnBetInput() { mines.bet = Math.max(1, Math.round(Number($("minesBetInput").value) || 1)); minesSavePrefs(); }
function minesOnCountInput() {
  let v = Math.round(Number($("minesCountInput").value) || 1); v = Math.max(1, Math.min(24, v));
  mines.count = v; $("minesCountInput").value = v; minesSavePrefs();
  if (mines.phase === "idle") renderMinesGrid();
}
function minesStakeAction(i) {
  if (mines.phase === "playing") return;
  if (i === 0) mines.bet = Math.max(1, Math.round(mines.bet / 2));
  else if (i === 1) mines.bet = Math.round(mines.bet * 2);
  else mines.bet = Math.max(1, Math.floor(curBal()));
  $("minesBetInput").value = mines.bet; minesSavePrefs();
}
function renderMinesScreen() {
  minesLoadPrefs();
  $("minesBetInput").value = mines.bet;
  $("minesCountInput").value = mines.count;
  $("minesStakeRow").innerHTML = ["½", "2x", "Макс"].map((l, i) => `<button onclick="minesStakeAction(${i})">${l}</button>`).join("");
  renderMinesGrid(); renderMinesHud();
}
function renderMinesGrid() {
  const grid = $("minesGrid"); if (!grid) return;
  let html = "";
  for (let i = 0; i < MINES_TOTAL; i++) {
    const opened = mines.opened.includes(i);
    const isBomb = mines.bombs.includes(i);
    let cls = "mine-cell";
    if (mines.phase !== "playing" && !(mines.phase === "lost" && opened)) cls += " locked";
    if (mines.phase === "lost") { if (isBomb) cls += " bomb open"; else if (opened) cls += " safe open"; }
    else if (opened) cls += isBomb ? " bomb open" : " safe open";
    if (mines.phase === "playing" && opened) cls += " disabled";
    html += `<div class="${cls}" data-i="${i}" onclick="minesClickCell(${i})">` +
      (((mines.phase === "lost" && isBomb) || (opened && isBomb)) ? ICON_BOMB : (opened ? ICON_GEM : "")) + `</div>`;
  }
  grid.innerHTML = html;
}
function renderMinesHud() {
  const n = mines.opened.length;
  const mult = mines.phase === "idle" ? 1 : minesCurMult(n, mines.count);
  $("minesMult").textContent = "x" + mult.toFixed(2);
  $("minesWin").textContent = (mines.phase !== "idle" && n > 0) ? ("Выигрыш: " + fmt(Math.round(mines.bet * mult))) : "";
  const btn = $("minesMainBtn"); const note = $("minesNote");
  btn.classList.remove("cashout", "lost"); btn.disabled = false;
  const betIn = $("minesBetInput"), cntIn = $("minesCountInput");
  if (mines.phase === "idle") {
    btn.textContent = "Начнём"; betIn.disabled = false; cntIn.disabled = false; note.textContent = "";
  } else if (mines.phase === "playing") {
    betIn.disabled = true; cntIn.disabled = true;
    if (n === 0) { btn.textContent = "Выберите клетку"; btn.disabled = true; note.textContent = "Жмите на поле — баланс раунда растёт с каждой открытой клеткой"; }
    else { btn.textContent = "Забрать " + fmt(Math.round(mines.bet * mult)); btn.classList.add("cashout"); note.textContent = "Можно забрать в любой момент или рискнуть дальше"; }
  } else if (mines.phase === "lost") {
    betIn.disabled = false; cntIn.disabled = false;
    btn.textContent = "Играть снова"; btn.classList.add("lost"); note.textContent = "Бум! Ставка сгорела — " + fmt(mines.bet);
  }
}
function minesMainAction() {
  if (mines.phase === "idle") minesStart();
  else if (mines.phase === "playing" && mines.opened.length > 0) minesCashout();
  else if (mines.phase === "lost") { mines.phase = "idle"; mines.opened = []; mines.bombs = []; renderMinesGrid(); renderMinesHud(); }
}
function minesStart() {
  if (mines.phase !== "idle") return;
  const bet = mines.bet;
  if (!(bet > 0)) { $("minesNote").textContent = "Укажите ставку"; return; }
  if (bet > curBal()) { $("minesNote").textContent = "Не хватает " + fmt(bet - curBal()); return; }
  gAdd(-bet);
  const bombs = [];
  while (bombs.length < mines.count) { const r = Math.floor(Math.random() * MINES_TOTAL); if (!bombs.includes(r)) bombs.push(r); }
  mines.bombs = bombs; mines.opened = []; mines.phase = "playing";
  renderMinesGrid(); renderMinesHud();
}
function minesClickCell(i) {
  if (mines.phase !== "playing" || mines.opened.includes(i)) return;
  if (mines.bombs.includes(i)) {
    mines.opened.push(i); mines.phase = "lost";
    renderMinesGrid(); renderMinesHud();
    notify("lose", "Мины", "Взрыв", "- " + fmt(mines.bet), OK_ITEM);
    return;
  }
  mines.opened.push(i);
  renderMinesGrid(); renderMinesHud();
  if (mines.opened.length >= MINES_TOTAL - mines.count) minesCashout();
}
function minesCashout() {
  if (mines.phase !== "playing" || mines.opened.length === 0) return;
  const mult = minesCurMult(mines.opened.length, mines.count);
  const win = Math.round(mines.bet * mult);
  gAdd(win);
  notify("win", "Мины", "Забрано", "+ " + fmt(win), OK_ITEM);
  mines.phase = "idle"; mines.bombs = []; mines.opened = [];
  renderMinesGrid(); renderMinesHud();
}

/* ============================================================
   ЛЕСЕНКА — человечек бежит по клеткам, сверху падают камни
   ============================================================ */
const LADDER_COLS = 8, LADDER_EDGE = 0.97, LADDER_MAX_ROWS = 12;
const ICON_RUN = '<svg viewBox="0 0 24 24" width="36" height="36"><g class="lm lb"><path d="M13.8 9.8L16.8 5.6" stroke="url(#runG)" stroke-width="2.6" stroke-linecap="round"/><circle cx="17" cy="5.2" r="1.4" fill="#FFE27A"/></g><g class="lm la"><path d="M10.2 9.8L7.2 5.6" stroke="url(#runG)" stroke-width="2.6" stroke-linecap="round"/><circle cx="7" cy="5.2" r="1.4" fill="#FFE27A"/></g><g class="lm lb"><path d="M11 15L8.4 19.6" stroke="url(#runG)" stroke-width="2.8" stroke-linecap="round"/><ellipse cx="8" cy="20.4" rx="1.8" ry="1.2" fill="#FFB020"/></g><g class="lm la"><path d="M13 15L15.6 19.6" stroke="url(#runG)" stroke-width="2.8" stroke-linecap="round"/><ellipse cx="16" cy="20.4" rx="1.8" ry="1.2" fill="#FFB020"/></g><path d="M9.4 8.4h5.2l-.9 7.2h-3.4z" fill="url(#runG)"/><path d="M9.4 12.4h5.2" stroke="#6FA81A" stroke-width=".8"/><circle cx="12" cy="5.2" r="2.6" fill="url(#runG)"/><path d="M9.2 5.2a2.8 2.8 0 0 1 5.6 0z" fill="#FFB020"/><rect x="9" y="4.6" width="6" height=".9" rx=".4" fill="#E08A00"/></svg>';
const ICON_STONE = '<svg viewBox="0 0 48 48" width="32" height="32"><polygon points="6,32 11,16 23,8 38,13 43,28 33,41 14,41" fill="url(#stB)"/><polygon points="11,16 23,8 38,13 27,21" fill="url(#stA)"/><polygon points="27,21 38,13 43,28 33,41" fill="url(#stC)"/><polygon points="6,32 11,16 27,21 14,41" fill="url(#stB)" opacity=".9"/><polygon points="14,41 27,21 33,41" fill="url(#stC)" opacity=".7"/><path d="M27 21l-4 9 5 4M18 20l3 5" fill="none" stroke="#23252D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><polygon points="14,17 22,11 26,13 18,20" fill="#fff" opacity=".35"/></svg>';
let ladder = { phase: "idle", bet: 100, stones: 3, row: 0, resolving: false };
function ladderLoadPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem("ladderPrefs") || "null");
    if (p) { if (p.bet > 0) ladder.bet = p.bet; if (p.stones >= 1 && p.stones <= 7) ladder.stones = p.stones; }
  } catch (e) {}
}
function ladderSavePrefs() { try { localStorage.setItem("ladderPrefs", JSON.stringify({ bet: ladder.bet, stones: ladder.stones })); } catch (e) {} }
function ladderSafeCols() { return LADDER_COLS - ladder.stones; }
function ladderStepMult() { return LADDER_COLS / ladderSafeCols(); }
function ladderCurMult(row) { return row <= 0 ? 1 : Math.pow(ladderStepMult(), row) * LADDER_EDGE; }
/* Поля ставки и камней: при вводе только цифры, без перезаписи значения на каждом символе; проверка — при уходе из поля */
function ladderDigitsOnly(el) { el.value = el.value.replace(/\D/g, ""); }
function ladderBetTyping() {
  const el = $("ladderBetInput"); ladderDigitsOnly(el);
  const v = parseInt(el.value, 10); if (v > 0) { ladder.bet = v; ladderSavePrefs(); }
}
function ladderOnBetInput() {
  const el = $("ladderBetInput");
  const v = Math.max(1, parseInt(el.value, 10) || 1);
  ladder.bet = v; el.value = v; ladderSavePrefs();
}
function ladderStonesTyping() {
  const el = $("ladderStonesInput"); ladderDigitsOnly(el);
  const v = parseInt(el.value, 10); if (v >= 1 && v <= 7) { ladder.stones = v; ladderSavePrefs(); }
}
function ladderOnStonesInput() {
  const el = $("ladderStonesInput");
  const v = Math.max(1, Math.min(7, parseInt(el.value, 10) || 1));   // 8 колонок на поле — максимум 7 камней
  ladder.stones = v; el.value = v; ladderSavePrefs();
}
function ladderStakeAction(i) {
  if (ladder.phase === "playing") return;
  if (i === 0) ladder.bet = Math.max(1, Math.round(ladder.bet / 2));
  else if (i === 1) ladder.bet = Math.round(ladder.bet * 2);
  else ladder.bet = Math.max(1, Math.floor(curBal()));
  $("ladderBetInput").value = ladder.bet; ladderSavePrefs();
}
function renderLadderScreen() {
  ladderLoadPrefs();
  $("ladderBetInput").value = ladder.bet;
  $("ladderStonesInput").value = ladder.stones;
  $("ladderStakeRow").innerHTML = ["½", "2x", "Макс"].map((l, i) => `<button onclick="ladderStakeAction(${i})">${l}</button>`).join("");
  ladder.phase = "idle"; ladder.row = 0; ladder.resolving = false;
  ladderRenderTrail(); ladderRenderRow(); ladderRenderHud();
}
function ladderRenderTrail() {
  const trail = $("ladderTrail"); if (!trail) return;
  let html = "";
  for (let r = 1; r <= ladder.row; r++) html += `<div class="ladder-chip done">x${ladderCurMult(r).toFixed(2)}</div>`;
  const next = ladder.row + 1;
  if (ladder.phase === "playing" && next <= LADDER_MAX_ROWS) html += `<div class="ladder-chip">x${ladderCurMult(next).toFixed(2)}</div>`;
  trail.innerHTML = html || `<div class="ladder-chip">x${ladderStepMult().toFixed(2)} за шаг</div>`;
  trail.scrollLeft = trail.scrollWidth;
}
const LADDER_STEP = 58;
function ladderX(c) { return `calc((100% - 42px) / 8 * ${c} + ${6 * c}px)`; }
function ladderRenderRow() {
  const row = $("ladderRow"); if (!row) return;
  if (ladder.row === 0) ladder.picks = [];
  const picks = ladder.picks || (ladder.picks = []);
  const playing = ladder.phase === "playing";
  const locked = !playing || ladder.resolving;
  let lines = "";
  for (let r = 0; r <= LADDER_MAX_ROWS; r++) {
    const st = r === 0 ? "ground" : r <= ladder.row ? "done" : (r === ladder.row + 1 && playing) ? "active" : "future";
    let cells = "";
    for (let c = 0; c < LADDER_COLS; c++) {
      const ok = st === "done" && picks[r - 1] === c ? " ok" : "";
      const click = st === "active" ? ` onclick="ladderPickCell(${c})"` : "";
      cells += `<div class="ladder-cell${ok}${locked ? " disabled" : ""}" data-c="${c}"${click}></div>`;
    }
    lines += `<div class="ladder-line ${st}"><div class="ladder-lbl">${r === 0 ? "" : "x" + ladderCurMult(r).toFixed(2)}</div>${cells}</div>`;
  }
  const col = picks.length ? picks[picks.length - 1] : 0;
  const off = Math.min(ladder.row, LADDER_MAX_ROWS - 3) * LADDER_STEP;
  const prev = ladder._off || 0;
  row.innerHTML = `<div class="ladder-board" id="ladderBoard" style="transform:translateY(${prev}px)">${lines}` +
    `<div class="ladder-over" id="ladderOver"><div class="ladder-char" id="ladderChar" style="left:${ladderX(col)};width:calc((100% - 42px) / 8);bottom:${ladder.row * LADDER_STEP}px;opacity:${playing ? 1 : .35}">${ICON_RUN}</div></div></div>`;
  ladder._off = off;
  requestAnimationFrame(() => requestAnimationFrame(() => { const b = $("ladderBoard"); if (b) b.style.transform = `translateY(${off}px)`; }));
}
function ladderRenderHud() {
  const n = ladder.row;
  const mult = ladder.phase === "idle" ? 1 : ladderCurMult(n);
  $("ladderMult").textContent = "x" + mult.toFixed(2);
  $("ladderWin").textContent = (ladder.phase === "playing" && n > 0) ? ("Выигрыш: " + fmt(Math.round(ladder.bet * mult))) : "";
  const btn = $("ladderMainBtn"); const note = $("ladderNote");
  btn.classList.remove("cashout", "lost"); btn.disabled = false;
  const betIn = $("ladderBetInput"), stonesIn = $("ladderStonesInput");
  if (ladder.phase === "idle") {
    btn.textContent = "Начнём"; betIn.disabled = false; stonesIn.disabled = false; note.textContent = "";
  } else if (ladder.phase === "playing") {
    betIn.disabled = true; stonesIn.disabled = true;
    if (ladder.resolving) { btn.textContent = "…"; btn.disabled = true; note.textContent = "Камень падает…"; }
    else if (n === 0) { btn.textContent = "Выберите деление"; btn.disabled = true; note.textContent = "Жмите на клетку — человечек побежит туда и полезет выше"; }
    else { btn.textContent = "Забрать " + fmt(Math.round(ladder.bet * mult)); btn.classList.add("cashout"); note.textContent = "Заберите выигрыш или рискните подняться выше"; }
  } else if (ladder.phase === "lost") {
    betIn.disabled = false; stonesIn.disabled = false;
    btn.textContent = "Играть снова"; btn.classList.add("lost"); note.textContent = "Придавило камнем — ставка сгорела: " + fmt(ladder.bet);
  }
}
