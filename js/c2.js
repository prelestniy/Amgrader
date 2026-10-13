function ladderMainAction() {
  if (ladder.phase === "idle") ladderStart();
  else if (ladder.phase === "playing" && ladder.row > 0 && !ladder.resolving) ladderCashout(false);
  else if (ladder.phase === "lost") { ladder.phase = "idle"; ladder.row = 0; ladderRenderTrail(); ladderRenderRow(); ladderRenderHud(); }
}
function ladderStart() {
  if (ladder.phase !== "idle") return;
  const bet = ladder.bet;
  if (!(bet > 0)) { $("ladderNote").textContent = "Укажите ставку"; return; }
  if (bet > curBal()) { $("ladderNote").textContent = "Не хватает " + fmt(bet - curBal()); return; }
  gAdd(-bet);
  ladder.phase = "playing"; ladder.row = 0; ladder.resolving = false;
  ladderRenderTrail(); ladderRenderRow(); ladderRenderHud();
}
function ladderPickCell(c) {
  if (ladder.phase !== "playing" || ladder.resolving) return;
  ladder.resolving = true;
  const rowEl = $("ladderRow"), stage = rowEl.parentElement;
  rowEl.querySelectorAll(".ladder-cell").forEach(el => el.classList.add("disabled"));
  const char = $("ladderChar"), target = ladder.row + 1;
  char.style.opacity = 1; char.classList.add("go"); char.style.left = ladderX(c);
  ladderRenderHud();
  // 1) бежит к клетке -> 2) лезет на ступень -> 3) падают камни
  setTimeout(() => {
    char.style.transition = "left .3s ease, bottom .8s cubic-bezier(.45,.05,.55,.95), opacity .2s ease";
    char.style.bottom = (target * LADDER_STEP) + "px";
  }, 320);
  setTimeout(() => {
    char.classList.remove("go");
    const stoneCols = [];
    while (stoneCols.length < ladder.stones) { const r = Math.floor(Math.random() * LADDER_COLS); if (!stoneCols.includes(r)) stoneCols.push(r); }
    stoneCols.forEach(sc => {
      const st = document.createElement("div");
      st.className = "ladder-stone"; st.style.left = ladderX(sc); st.style.width = "calc((100% - 42px) / 8)";
      st.style.bottom = (target * LADDER_STEP) + "px"; st.innerHTML = ICON_STONE;
      if (sc === c) st.dataset.hit = "1";
      $("ladderOver").appendChild(st);
      requestAnimationFrame(() => requestAnimationFrame(() => st.classList.add("fall")));
    });
    const hit = stoneCols.includes(c);
    setTimeout(() => {
      if (hit) {
        char.classList.add("hit"); stage.classList.add("shake");
        rowEl.querySelectorAll(".ladder-stone[data-hit='1']").forEach(st => st.classList.add("hit"));
        ladder.phase = "lost"; ladder.resolving = false;
        notify("lose", "Лесенка", "Придавило", "- " + fmt(ladder.bet), OK_ITEM);
        ladderRenderHud();
        setTimeout(() => { stage.classList.remove("shake"); ladderRenderRow(); }, 900);
      } else {
        (ladder.picks = ladder.picks || []).push(c);
        ladder.row++;
        setTimeout(() => {
          ladder.resolving = false;
          ladderRenderTrail(); ladderRenderHud(); ladderRenderRow();
          if (ladder.row >= LADDER_MAX_ROWS) setTimeout(() => ladderCashout(true), 260);
        }, 500);
      }
    }, 420);
  }, 1160);
}
function ladderCashout(top) {
  if (ladder.phase !== "playing" || ladder.row <= 0) return;
  const mult = ladderCurMult(ladder.row);
  const win = Math.round(ladder.bet * mult);
  gAdd(win);
  notify("win", "Лесенка", top ? "Вершина лесенки!" : "Забрано", "+ " + fmt(win), OK_ITEM);
  ladder.phase = "idle"; ladder.row = 0; ladder.resolving = false;
  ladderRenderTrail(); ladderRenderRow(); ladderRenderHud();
}

/* ---------- КЕЙСЫ ---------- */
const CASES = [
  { id: "c1", name: "Каменный Тайник", tone: "#9AA0A6", w: { common: 60, rare: 32, epic: 8 } },
  { id: "c5", name: "Песчаный Тайник", tone: "#D8B871", w: { common: 70, rare: 30 } },
  { id: "c2", name: "Ледяной мелстрой", tone: "#4DA3FF", w: { rare: 45, epic: 40, legendary: 15 } },
  { id: "c6", name: "Дикое сафари", tone: "#3ECF8E", w: { rare: 20, epic: 55, legendary: 25 } },
  { id: "c3", name: "Портальный раздом", tone: "#B26BFF", w: { epic: 42, legendary: 42, mythic: 16 } },
  { id: "c7", name: "Изумрудный тайник", tone: "#6C7BFF", w: { epic: 20, legendary: 50, mythic: 30 } },
  { id: "c4", name: "Былый рейма", tone: "#FFB020", w: { legendary: 45, mythic: 55 } },
  { id: "c8", name: "Древний мелстрой", tone: "#E0473F", w: { legendary: 20, mythic: 80 } },
  { id: "c9", name: "Тайный Сейф", tone: "#FF4FA3", w: { mythic: 75, secret: 25 } },
  { id: "c10", name: "Звёздный Купол", tone: "#3FD9E8", w: { secret: 70, galactic: 30 } },
  { id: "c11", name: "Колбасный тайник", tone: "#FF8A4C", w: { galactic: 75, sausage: 25 } },
  { id: "c12", name: "Колбасный Король", tone: "#D4A017", w: { galactic: 60, sausage: 40 } },
  { id: "c13", name: "Елдовая вечеринка", tone: "#FF6F91", w: { eldovaya: 75, sasnaya: 25 } },
  { id: "c14", name: "Полная кратность", tone: "#8B5CF6", w: { rubinovaya: 60, krasnost: 40 } }
];
/* ---------- иллюстрации кейсов: блоки в изометрии, в стиле иконок предметов ---------- */
function shade(hex, pct) {
  hex = hex.replace("#", ""); if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  const num = parseInt(hex, 16), amt = Math.round(2.55 * pct);
  let r = (num >> 16) & 0xFF, g = (num >> 8) & 0xFF, b = num & 0xFF;
  r = Math.max(0, Math.min(255, r + amt)); g = Math.max(0, Math.min(255, g + amt)); b = Math.max(0, Math.min(255, b + amt));
  return "#" + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function cCube(cx, cy, s, tone, op) {
  const top = shade(tone, 26), left = shade(tone, -6), right = shade(tone, -26);
  const tx = (cx - 32 * s).toFixed(1), ty = (cy - 32 * s).toFixed(1);
  return `<g transform="translate(${tx} ${ty}) scale(${s})" opacity="${op == null ? 1 : op}">` +
    `<polygon points="32,3 60,18 32,33 4,18" fill="${top}"/>` +
    `<polygon points="4,18 32,33 32,61 4,46" fill="${left}"/>` +
    `<polygon points="60,18 32,33 32,61 60,46" fill="${right}"/></g>`;
}
function cSpark(cx, cy, r, color, op) { return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${op}"/>`; }
function caseArtBase(tone, extra) {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">` +
    `<circle cx="100" cy="98" r="84" fill="${tone}" opacity="0.15"/>` +
    `<circle cx="100" cy="98" r="52" fill="${tone}" opacity="0.14"/>` +
    (extra.back || "") +
    cSpark(36, 48, 3, shade(tone, 45), 0.75) + cSpark(162, 62, 2.4, shade(tone, 45), 0.7) +
    cSpark(152, 142, 2.8, shade(tone, 45), 0.6) + cSpark(42, 150, 2.2, shade(tone, 45), 0.65) +
    cCube(150, 74, 0.55, tone, 0.55) + cCube(44, 66, 0.5, tone, 0.5) + cCube(128, 48, 0.4, tone, 0.45) +
    cCube(74, 120, 1.35, tone, 1) + cCube(128, 128, 1.15, tone, 1) + cCube(100, 152, 1.5, tone, 1) +
    (extra.front || "") + `</svg>`;
}
function artStone(tone) {
  return caseArtBase(tone, { front:
    `<path d="M100 30 L108 10 L100 4 L92 10 Z" fill="${shade(tone,-35)}"/><rect x="97" y="10" width="6" height="22" fill="${shade(tone,-15)}"/>` });
}
function artSand(tone) {
  return caseArtBase(tone, { back:
    `<circle cx="152" cy="38" r="14" fill="${shade(tone,35)}" opacity="0.55"/>` +
    `<path d="M34 168 Q60 158 86 168 Q112 158 138 168 Q152 163 166 168" stroke="${shade(tone,-30)}" stroke-width="3" fill="none" opacity="0.5"/>` });
}
function artIce(tone) {
  return caseArtBase(tone, { back:
    `<polygon points="170,92 180,114 160,112" fill="#EAF6FF" opacity="0.55"/><polygon points="26,118 38,138 18,136" fill="#EAF6FF" opacity="0.5"/>` +
    `<polygon points="96,20 104,38 88,38" fill="#EAF6FF" opacity="0.6"/>` });
}
function artEmerald(tone) {
  return caseArtBase(tone, { back:
    `<polygon points="100,8 114,42 100,56 86,42" fill="${shade(tone,25)}" opacity="0.65"/>` +
    `<polygon points="164,86 174,104 158,106 152,90" fill="${shade(tone,20)}" opacity="0.5"/>` +
    `<polygon points="26,96 36,114 20,116 14,100" fill="${shade(tone,20)}" opacity="0.5"/>` });
}
function artPortal(tone) {
  return caseArtBase(tone, { back:
    `<circle cx="100" cy="98" r="70" fill="none" stroke="${shade(tone,25)}" stroke-width="2" stroke-dasharray="3 7" opacity="0.55"/>` +
    `<circle cx="100" cy="98" r="30" fill="${shade(tone,20)}" opacity="0.3"/>` });
}
function artStorm(tone) {
  return caseArtBase(tone, { back:
    `<circle cx="100" cy="98" r="72" fill="none" stroke="${shade(tone,25)}" stroke-width="2" stroke-dasharray="2 8" opacity="0.5"/>` +
    `<path d="M112 14 L92 58 L106 58 L86 102 L120 52 L104 52 Z" fill="${shade(tone,40)}" opacity="0.8"/>` });
}
function artFire(tone) {
  return caseArtBase(tone, { back:
    `<path d="M66 44 Q73 24 82 44 Q86 56 76 60 Q64 60 66 44Z" fill="#FF7A3D" opacity="0.6"/>` +
    `<path d="M126 34 Q131 20 138 34 Q141 44 133 46 Q124 46 126 34Z" fill="#FF9A4A" opacity="0.55"/>` });
}
function artRelic(tone) {
  return caseArtBase(tone, { back:
    `<circle cx="100" cy="98" r="74" fill="none" stroke="${shade(tone,30)}" stroke-width="1.5" opacity="0.6"/>` +
    `<polygon points="100,26 106,38 94,38" fill="${shade(tone,30)}" opacity="0.7"/>` +
    `<polygon points="172,98 160,104 160,92" fill="${shade(tone,30)}" opacity="0.6"/>` +
    `<polygon points="28,98 40,104 40,92" fill="${shade(tone,30)}" opacity="0.6"/>` });
}
function artSecret(tone) {
  return caseArtBase(tone, { back:
    `<circle cx="100" cy="98" r="70" fill="none" stroke="${shade(tone,25)}" stroke-width="2" stroke-dasharray="1 6" opacity="0.6"/>` +
    `<rect x="92" y="14" width="16" height="16" rx="3" transform="rotate(45 100 22)" fill="${shade(tone,30)}" opacity="0.7"/>` +
    `<rect x="160" y="96" width="10" height="10" rx="2" transform="rotate(45 165 101)" fill="${shade(tone,25)}" opacity="0.55"/>` +
    `<rect x="24" y="100" width="10" height="10" rx="2" transform="rotate(45 29 105)" fill="${shade(tone,25)}" opacity="0.55"/>` });
}
function artGalaxy(tone) {
  return caseArtBase(tone, { back:
    `<ellipse cx="100" cy="98" rx="80" ry="26" fill="none" stroke="${shade(tone,25)}" stroke-width="2" opacity="0.55" transform="rotate(-20 100 98)"/>` +
    `<ellipse cx="100" cy="98" rx="62" ry="18" fill="none" stroke="${shade(tone,35)}" stroke-width="1.5" opacity="0.45" transform="rotate(25 100 98)"/>` +
    `<circle cx="168" cy="72" r="5" fill="${shade(tone,45)}" opacity="0.85"/><circle cx="30" cy="132" r="4" fill="${shade(tone,45)}" opacity="0.8"/>` +
    `<polygon points="100,12 104,24 116,24 106,31 110,43 100,36 90,43 94,31 84,24 96,24" fill="${shade(tone,40)}" opacity="0.75"/>` });
}
function artSausage(tone) {
  return caseArtBase(tone, { back:
    `<rect x="46" y="22" width="108" height="28" rx="14" transform="rotate(-16 100 36)" fill="${shade(tone,18)}" opacity="0.7"/>` +
    `<path d="M70 26 L78 48 M92 22 L100 44 M114 18 L122 40" stroke="${shade(tone,-35)}" stroke-width="3" stroke-linecap="round" opacity="0.55" transform="rotate(-16 100 36)"/>` +
    `<circle cx="168" cy="96" r="6" fill="${shade(tone,40)}" opacity="0.7"/><circle cx="28" cy="110" r="5" fill="${shade(tone,40)}" opacity="0.65"/>` });
}
const ART_FN = { c1: artStone, c5: artSand, c2: artIce, c6: artEmerald, c3: artPortal, c7: artStorm, c4: artFire, c8: artRelic,
  c9: artSecret, c10: artGalaxy, c11: artSausage, c12: artSausage };
CASES.forEach(c => { c.art = (ART_FN[c.id] || artStone)(c.tone); });
/* Фото кейсов: если для кейса есть картинка в img/cases, показываем её вместо рисунка */
const CASE_PHOTO = { c1: "img/cases/c1.webp", c2: "img/cases/c2.webp", c3: "img/cases/c3.webp", c4: "img/cases/c4.webp", c5: "img/cases/c5.webp", c6: "img/cases/c6.webp", c7: "img/cases/c7.webp", c8: "img/cases/c8.webp", c9: "img/cases/c9.webp", c10: "img/cases/c10.webp", c11: "img/cases/c11.webp", c12: "img/cases/c12.webp" };
CASES.forEach(c => { if (CASE_PHOTO[c.id]) c.art = `<img class="case-photo" src="${CASE_PHOTO[c.id]}" alt="" draggable="false">`; });
/* Внутри одной редкости шанс обратно пропорционален цене: дешёвые предметы тира
   выпадают чаще дорогих. Так проценты выглядят «по-настоящему», а не одинаковыми
   у всех предметов тира, и открытие кейса не гарантирует прибыль. */
CASES.forEach(c => {
  const byR = {}; MEMES.forEach(m => { if (c.w[m.rarity]) (byR[m.rarity] = byR[m.rarity] || []).push(m); });
  c.pool = []; c.tot = 0; let ev = 0;
  Object.keys(byR).forEach(r => {
    const items = byR[r], invSum = items.reduce((s, m) => s + 1 / m.price, 0);
    items.forEach(m => { const w = c.w[r] * (1 / m.price) / invSum; c.pool.push({ m, w }); c.tot += w; ev += w * m.price; });
  });
  c.price = Math.max(10, Math.round(ev / c.tot * 0.80 / 5) * 5);        // цена = средняя награда − 20% (комиссия кейса, раньше была 2% — почти без риска, ощущалось как дюп)
  c.pool.sort((a, b) => b.m.price - a.m.price);
});
function pickFromCase(c) {
  let r = randomCrypto() * c.tot;
  for (const p of c.pool) { r -= p.w; if (r <= 0) return p.m; }
  return c.pool[c.pool.length - 1].m;
}
/* Цены кейсов, заданные админом (админ-бот → /api/config → casePrices).
   Если для кейса цена не задана — остаётся автоматическая (по формуле выше). */
/* Шансы, заданные админом: apiCfg.chances = { global: {id: %}, cases: {caseId: {id: %}} }.
   Закреплённый предмет получает ровно свой %, остальные делят остаток пропорционально
   своим обычным весам. Правило кейса важнее общего (global). Общие правила действуют и в крафте. */
function applyPins(list, pins) {
  const pinned = {}; let s = 0, free = 0;
  list.forEach(p => { const v = Number(pins && pins[p.m.id]); if (v > 0) { pinned[p.m.id] = v / 100; s += v / 100; } });
  if (!s) return list;
  list.forEach(p => { if (!(p.m.id in pinned)) free += p.w; });
  const norm = free <= 0 || s >= 1;
  return list.map(p => ({ m: p.m, w: p.m.id in pinned ? (norm ? pinned[p.m.id] / s : pinned[p.m.id]) : (norm ? 0 : p.w / free * (1 - s)) }));
}
function globalPins() { return ((apiCfg && apiCfg.chances) || {}).global || {}; }
function applyCaseChances() {
  const ch = (apiCfg && apiCfg.chances) || {};
  CASES.forEach(c => {
    if (!c.basePool) c.basePool = c.pool.map(p => ({ m: p.m, w: p.w / c.tot }));
    const pins = Object.assign({}, ch.global || {}, (ch.cases || {})[c.id] || {});
    c.pool = applyPins(c.basePool, pins).sort((a, b) => b.m.price - a.m.price);
    c.tot = c.pool.reduce((t, p) => t + p.w, 0) || 1;
  });
}
function applyCasePrices() {
  applyCaseChances();
  const ov = (apiCfg && apiCfg.casePrices) || {};
  CASES.forEach(c => {
    if (c.autoPrice == null) c.autoPrice = c.price;
    const v = Math.round(Number(ov[c.id]));
    c.price = v > 0 ? v : c.autoPrice;
  });
  try { renderCaseLobby(); } catch (e) {}
  try { if (cs.view === "open") renderCases(); else updateCaseBtn(); } catch (e) {}
}
async function refreshCaseConfig() {
  try {
    const c = await api("/api/config"); apiCfg = Object.assign({}, apiCfg, c); applyCasePrices();
    if (state.screen === "craft" && !state.spinning) renderCraft();
  } catch (e) {}
}
const cs = { sel: 0, qty: 1, view: "lobby" };
function renderCaseLobby() {
  const box = $("caseLobby"); if (!box) return;
  box.innerHTML = CASES.map((c, i) => {
    const tot = Object.values(c.w).reduce((s, x) => s + x, 0);
    const bar = Object.keys(c.w).map(r => `<b style="flex:${c.w[r]} 0 0;background:${getRarityHex(r)}"></b>`).join("");
    const free = (i === 0 && state.freeCaseSpins > 0) ? `<div class="case-lobby-free">${ic("gift", 13)} ×${state.freeCaseSpins}</div>` : "";
    return `<div class="case-lobby-card" onclick="openCaseFromLobby(${i})">` +
      `<div class="case-lobby-art" style="background:radial-gradient(circle at 50% 32%, ${c.tone}3d 0%, var(--surface-2) 78%);">${c.art}` +
      free + `<div class="case-lobby-price">${fmt(c.price)}</div></div>` +
      `<div class="case-lobby-bar">${bar}</div>` +
      `<div class="case-lobby-name">${esc(c.name)}</div></div>`;
  }).join("");
  const t = $("casesLobbyTitle");
  if (t) t.innerHTML = "Кейсы" + (state.freeCaseSpins > 0 ? ` <span class="soon-badge" style="margin-left:6px;">${ic("gift", 13)} бесплатных: ${state.freeCaseSpins}</span>` : "");
}
function switchCaseView(toOpen) {
  const outEl = toOpen ? $("caseLobbyView") : $("caseOpenView");
  const inEl = toOpen ? $("caseOpenView") : $("caseLobbyView");
  const token = ++caseViewToken;
  outEl.classList.add("leaving");
  setTimeout(() => {
    if (token !== caseViewToken) return;
    outEl.hidden = true; outEl.classList.remove("leaving");
    inEl.hidden = false; inEl.classList.remove("entering"); void inEl.offsetWidth; inEl.classList.add("entering");
    window.scrollTo(0, 0);
    setTimeout(() => inEl.classList.remove("entering"), 360);
  }, 150);
}
let caseViewToken = 0;
function openCaseFromLobby(i) {
  if (state.spinning) return;
  cs.sel = i; cs.view = "open";
  renderCases(); switchCaseView(true);
}
function showCaseLobby() {
  if (state.spinning) return;
  cs.view = "lobby";
  renderCaseLobby(); switchCaseView(false);
}
/* Длина ленты уменьшается с ростом числа одновременно открываемых кейсов:
   при n колонках суммарное число ячеек росло как n×46 (до 230 при n=5),
   отсюда и лаги в момент построения/старта анимации. Видно всё равно только
   несколько последних ячеек перед остановкой, так что длину можно сократить
   без потери ощущения прокрутки. */
function caseLen(n) {
  const base = isFast() ? 20 : 46;
  if (n >= 4) return Math.round(base * 0.55);
  if (n >= 2) return Math.round(base * 0.7);
  return base;
}
function caseWinIdx(n) { return caseLen(n) - 6; }

function pickCase(i) { if (state.spinning) return; cs.sel = i; renderCases(); }
function pickQty(n) { if (state.spinning) return; cs.qty = n; renderCases(); }
function updateCaseBtn() {
  const b = $("caseBtn"), c = CASES[cs.sel];
  b.disabled = !!state.spinning;
  const hasFree = !demo.on && state.freeCaseSpins > 0 && cs.qty === 1;
  b.innerHTML = state.spinning ? "Открываем…" : (!isLoggedIn() && !demo.on) ? "Войти, чтобы открывать" : hasFree ? `Открыть бесплатно ${ic("gift", 14)}` : "Открыть за " + fmt(c.price * cs.qty);
}
function renderCases() {
  const c = CASES[cs.sel];
  const capEl = $("casesTitle");
  if (capEl) capEl.innerHTML = esc(c.name) + (state.freeCaseSpins > 0 && cs.sel === 0 ? ` <span class="soon-badge" style="margin-left:6px;">${ic("gift", 13)} ×${state.freeCaseSpins}</span>` : "");
  $("caseQty").innerHTML = [1, 2, 3, 4, 5].map(n => `<button class="qty-chip ${n === cs.qty ? "on" : ""}" onclick="pickQty(${n})">${n}</button>`).join("");
  $("casePool").innerHTML = c.pool.map(p => `<div class="pool-item" style="--rc:${getRarityHex(p.m.rarity)}">${renderIcon(p.m, 44)}<div class="pi-n">${esc(p.m.name)}</div><div class="pi-p">${fmtCasePct(p.w / c.tot * 100)}%</div></div>`).join("");
  updateCaseBtn();
  if (!state.spinning) { $("caseResult").innerHTML = ""; buildStage(cs.qty, null); }
}
/* проценты кейсов: всегда видимая точность, без «0,00%» и без лишних нулей */
function fmtCasePct(c) {
  if (c >= 10) return String(Math.round(c));
  if (c >= 1) return String(Math.round(c * 10) / 10).replace(".", ",");
  if (c >= 0.01) return String(Math.round(c * 100) / 100).replace(".", ",");
  return "<0,01";
}
function setTrack(col, vert, off) { col.track.style.transform = vert ? `translate3d(0,${-off}px,0)` : `translate3d(${-off}px,0,0)`; }
function buildStage(n, results) {
  const st = $("caseStage"), c = CASES[cs.sel], vert = n > 1, GAP = 8, LEN = caseLen(n), WIN = caseWinIdx(n);
  const cw = st.clientWidth || 340;
  const cell = vert ? 84 : Math.max(80, Math.min(104, Math.floor(cw / 3.6)));
  const across = vert ? Math.floor((cw - GAP * (n - 1)) / n) : cell + 26;
  const step = cell + GAP, viewGuess = Math.round(step * 3.6);
  st.className = "case-stage " + (vert ? "v" : "h"); st.innerHTML = "";
  const cols = [];
  for (let k = 0; k < n; k++) {
    const items = []; for (let i = 0; i < LEN; i++) items.push(pickFromCase(c));
    if (results) items[WIN] = results[k];
    const strip = document.createElement("div");
    strip.className = "strip " + (vert ? "v" : "h");
    strip.style.cssText = vert ? `width:${across}px;height:${viewGuess}px` : "width:100%";
    strip.innerHTML = `<div class="vp" style="${vert ? "" : `height:${across}px`}"><div class="track">${items.map(m =>
      `<div class="cc" style="--rc:${getRarityHex(m.rarity)};${vert ? `height:${cell}px;margin-bottom:${GAP}px;width:100%` : `width:${cell}px;margin-right:${GAP}px;height:${across}px`}">${renderIconReel(m, vert ? 40 : 56)}<span>${esc(m.name)}</span></div>`).join("")}</div></div><div class="ptr"><i></i></div>`;
    st.appendChild(strip);
    cols.push({ strip, vp: strip.firstChild, track: strip.firstChild.firstChild, ptr: strip.lastChild, step, cell, LEN, WIN, vert });
  }
  // измеряем РЕАЛЬНЫЙ размер окна просмотра (после вставки в DOM) — нужен для точного расчёта дистанции прокрутки
  cols.forEach(col => { col.view = col.vert ? col.vp.clientHeight : col.vp.clientWidth; setTrack(col, col.vert, 0); });
  return cols;
}
function caseTick() {
  if (!sfx.on || !aud.ac || aud.ac.state !== "running" || sfx.vol.wheel <= 0) return;
  const now = aud.ac.currentTime; if (now - aud.lastT < 0.03) return; aud.lastT = now;
  tickSound(now, 800 + Math.random() * 90, 0.45);
}
let caseRunToken = 0;
/* Указатель неподвижен по центру: едет лента, и выигрышный блок точно
   останавливается по её центру — «предметы стягиваются к указателю». */
function runCol(col, dur, tickOn, token) {
  // 1) едем от начала ленты и тормозим где-то ВНУТРИ выигрышного блока (не строго по центру) —
  //    предмет «выпадает» естественно, как будто лента правда остановилась там сама.
  // 2) отдельным плавным движением дотягиваем блок точно до центра указателя («стягивание»).
  const cellOffset = (0.14 + randomCrypto() * 0.72) * col.cell;
  const roughTotal = col.WIN * col.step + cellOffset - col.view / 2;
  const total = col.WIN * col.step + col.cell / 2 - col.view / 2;
  let lastK = -1;
  return new Promise(res => {
    const s = performance.now();
    (function f(now) {
      if (token !== caseRunToken) return res();
      const t = spinSkip ? 1 : Math.min((now - s) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      const off = roughTotal * ease;
      setTrack(col, col.vert, off);
      const k = Math.floor((off + col.view / 2) / col.step);
      if (k !== lastK) { lastK = k; if (tickOn) caseTick(); }
      if (t < 1) requestAnimationFrame(f); else settle();
    })(s);
    function settle() {
      const s2 = performance.now(), dur2 = spinSkip ? 90 : 340;
      (function g(now) {
        if (token !== caseRunToken) return res();
        const t = spinSkip ? 1 : Math.min((now - s2) / dur2, 1);
        const e = 1 - Math.pow(1 - t, 3);
        setTrack(col, col.vert, roughTotal + (total - roughTotal) * e);
        if (t < 1) requestAnimationFrame(g); else { setTrack(col, col.vert, total); res(); }
      })(s2);
    }
  });
}
