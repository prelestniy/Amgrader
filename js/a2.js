/* ============================================================
   ШАНС
   ============================================================ */
/* Шанс = доля ставки от цены с комиссией (15%), потолок 75%.
   Раньше комиссия была 5%, а потолок 95% — при ставке ≈ цене цели шанс
   получался почти гарантированным (95%), апгрейд ощущался как бесплатный
   дюп предмета. Теперь даже при равной ставке шанс не выше 75%, и House Edge
   выше, так что апгрейд остаётся рискованной игрой, а не гарантией. */
const HOUSE_EDGE = 0.15;
function fmtPct(c) {
  c = c >= 10 ? Math.round(c) : c >= 1 ? Math.round(c * 10) / 10 : Math.round(c * 100) / 100;
  return String(c).replace(".", ",");
}
function calcChance(totalStake, tgt) {
  if (!totalStake || !tgt || tgt.price <= 0) return 0;
  const raw = (totalStake / tgt.price) * (1 - HOUSE_EDGE) * 100;
  return Math.max(0.1, Math.min(75, Math.round(raw * 10) / 10));
}

function randomCrypto() {
  if (window.crypto && window.crypto.getRandomValues) {
    const a = new Uint32Array(1);
    window.crypto.getRandomValues(a);
    return a[0] / 4294967296;
  }
  return Math.random();
}

/* ============================================================
   ЕДИНАЯ СИСТЕМА КООРДИНАТ КОЛЕСА
   0° = низ. Положительный угол = ПО ЧАСОВОЙ СТРЕЛКЕ на экране
   (ровно как CSS rotate): 90° = слева, 180° = верх, 270° = справа.
   x = cx − r·sin(θ),  y = cy + r·cos(θ)
   ============================================================ */
const WHEEL_CX = 160;
const WHEEL_CY = 160;
const WHEEL_R  = 128;

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = angleDeg * Math.PI / 180;
  return { x: cx - r * Math.sin(rad), y: cy + r * Math.cos(rad) };
}

/* Зона выигрыша: от −halfDeg до +halfDeg через 0° (низ).
   Две дуги по ≤180°, largeArc=0, sweep=1 (по часовой на экране):
   от −halfDeg (справа) → низ → +halfDeg (слева). */
function describeSymmetricArc(cx, cy, r, halfDeg) {
  if (halfDeg <= 0.01) return "";
  const p1 = polarToCartesian(cx, cy, r, -halfDeg);
  const p2 = polarToCartesian(cx, cy, r, 0);
  const p3 = polarToCartesian(cx, cy, r, +halfDeg);
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} ` +
         `A ${r} ${r} 0 0 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} ` +
         `A ${r} ${r} 0 0 1 ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`;
}

function normalizeAngle(deg) {
  let a = deg % 360;
  if (a > 180) a -= 360;
  if (a <= -180) a += 360;
  return a;
}

function halfDegFor(chance) { return chance * 1.8; }          // chance% от 360°, пополам
function isWin(angle, chance) {                               // ЕДИНАЯ функция результата
  return Math.abs(normalizeAngle(angle)) < halfDegFor(chance);
}


const RARITY_RU = { common:"Обычный", rare:"Редкий", epic:"Эпический", legendary:"Легендарный", mythic:"Мифический", secret:"Секретный", galactic:"Галактический", sausage:"Колбасный", eldovaya:"Елдовая", sasnaya:"Сасная", rubinovaya:"Рубиновая", kratnost:"Кратность" };
const fmt = n => Number(n).toLocaleString("ru-RU") + " M";
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ============================================================
   СОСТОЯНИЕ
   ============================================================ */
const state = {
  inventory: [], targets: [],
  selectedMemeUids: [], targetMemeId: null,
  chance: 0, spinning: false,
  mainTab: "mine", subTab: "inventory", cart: {}, balance: 0,
  sortDir: { inventory: "desc", shop: "desc", wish: "desc" },
  profile: null, screen: "upgrade",
  freeCaseSpins: 0
};

function getMemeById(id) { return MEMES.find(m => m.id === id); }
function getSelectedMemes() { return state.selectedMemeUids.map(uid => state.inventory.find(i => i.uid === uid)).filter(Boolean); }
function getTotalStake() { return getSelectedMemes().reduce((s, m) => s + m.price, 0); }
function getTarget() { return state.targets.find(t => t.uid === state.targetMemeId) || null; }
function currentView() { return state.mainTab === "wish" ? "wish" : state.subTab; }

/* ============================================================
   КОЛЕСО
   ============================================================ */
let arcHalf = 0, arcAnim = 0, lastTargetHalf = 0;
function drawArc(half) {
  arcHalf = half;
  document.getElementById("winArc").setAttribute("d", describeSymmetricArc(WHEEL_CX, WHEEL_CY, WHEEL_R, half));
}
/* Зелёная зона «наливается» от указателя (низ) в обе стороны */
function animateArcTo(targetHalf, dur, finalChance) {
  const id = ++arcAnim, from = arcHalf, start = performance.now();
  const percent = document.getElementById("wheelPercent");
  function frame(now) {
    if (id !== arcAnim) return;
    const t = Math.min((now - start) / dur, 1);
    const half = from + (targetHalf - from) * (1 - Math.pow(1 - t, 3));
    drawArc(t < 1 ? half : targetHalf);
    const shown = half / 1.8;
    if (finalChance > 0) {
      percent.textContent = fmtPct(t < 1 ? shown : finalChance) + "%";
      percent.classList.remove("empty");
    } else if (t < 1 && shown >= 0.5) {
      percent.textContent = fmtPct(shown) + "%";
    } else {
      percent.textContent = "—";
      percent.classList.add("empty");
    }
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
function updateWheel() {
  const stake = getTotalStake(), tgt = getTarget();
  const chance = (stake > 0 && tgt) ? calcChance(stake, tgt) : 0;
  state.chance = chance;
  const targetHalf = halfDegFor(chance);
  if (targetHalf !== lastTargetHalf) {
    lastTargetHalf = targetHalf;
    animateArcTo(targetHalf, chance ? 850 : 350, chance);
  }
}

/* ============================================================
   СЛОТЫ
   ============================================================ */
function slotHTML(label, item, price, extra) {
  return `<div class="slot-label">${label}</div>
    <div class="slot-body">${renderIcon(item, 40)}
      <div style="min-width:0;"><div class="slot-name">${esc(item.name)}${extra || ""}</div>
      <div class="slot-price">${fmt(price)}</div></div></div>`;
}
function setSlot(el, sig, filled, html, rarityColor) {
  const changed = el.dataset.sig !== sig;
  el.dataset.sig = sig;
  el.className = filled ? "slot filled" : "slot empty";
  if (rarityColor) el.style.setProperty("--rc", rarityColor);
  else el.style.removeProperty("--rc");
  if (changed || !el.querySelector(".meme-vid-wrap.playing")) el.innerHTML = html;
  if (filled && changed) {                 // перезапуск анимации «наливания»
    el.classList.remove("filled");
    void el.offsetWidth;
    el.classList.add("filled");
  }
}
function renderSlots() {
  const s = document.getElementById("slotStake"), t = document.getElementById("slotTarget");
  const sel = getSelectedMemes(), tgt = getTarget();
  const empty = label => `<div class="slot-plus">${svgi("plus", 24)}</div><div class="slot-empty-label">${label}</div>`;
  if (sel.length) setSlot(s, state.selectedMemeUids.join(","), true, slotHTML("Ставка", sel[0], getTotalStake(), sel.length > 1 ? ` +${sel.length - 1}` : ""), getRarityHex(sel[0].rarity));
  else setSlot(s, "", false, empty("Ставка"));
  if (tgt) setSlot(t, tgt.uid, true, slotHTML("Цель", tgt, tgt.price), getRarityHex(tgt.rarity));
  else setSlot(t, "", false, empty("Цель"));
}

/* ============================================================
   КАРТОЧКИ И СЕТКА
   ============================================================ */
function cardHTML(m, opts) {
  const color = getRarityHex(m.rarity);
  const sel = opts.selected || opts.qty > 0;
  const cardAttr = opts.play ? ` data-cardplay="1" onclick="cardTap(event,this)"` : (opts.onclick ? ` onclick="${opts.onclick}"` : "");
  const btns = (opts.select ? `<button class="buy-btn ${sel ? "on" : ""}" onclick="event.stopPropagation(); ${opts.select}">${sel ? "Выбрано" : "Выбрать"}</button>` : "") +
    (opts.buy ? `<button class="buy-btn" onclick="event.stopPropagation(); addToCart(${m.id})">Добавить</button>` : "") +
    (opts.sell ? `<button class="buy-btn" onclick="event.stopPropagation(); openSell('${m.uid}')">Продать</button>` : "");
  return `<div class="card ${sel ? "selected" : ""} ${opts.disabled ? "disabled" : ""}"${cardAttr}>
    <div class="card-price">${fmt(m.price)}</div>
    ${opts.check ? `<div class="card-check"${opts.select ? ` onclick="event.stopPropagation(); ${opts.select}"` : ""}>${ic("check", 14)}</div>` : ""}
    ${opts.qty > 0 ? `<div class="card-qty">×${opts.qty}</div>` : ""}
    <div class="card-art">${renderIcon(m, 72)}</div>
    <div>
      <div class="card-rarity">${RARITY_RU[m.rarity] || ""}</div>
      <div class="card-name">${esc(m.name)}</div>
      ${m.nameEn ? `<div class="card-name-en">${esc(m.nameEn)}</div>` : ""}
    </div>
    ${btns ? `<div class="card-btns">${btns}</div>` : ""}
    <div class="card-line" style="background:${color}"></div>
  </div>`;
}

function parseNum(v) { const n = parseInt(String(v).replace(/\D/g, ""), 10); return isNaN(n) ? null : n; }

function applyFilters(list, view) {
  const q = (document.getElementById(view === "wish" ? "searchWish" : "searchMine").value || "").trim().toLowerCase();
  /* поиск по названию И по цене: "100" — цена содержит 100, "100-500" — диапазон цен */
  const qd = q.replace(/[\s\u00a0g]/g, "").replace(/[–—]/g, "-");
  const range = qd.match(/^(\d+)-(\d+)$/);
  const isNum = /^\d+$/.test(qd);
  let out = list.filter(m => {
    if (!q) return true;
    if (m.name.toLowerCase().includes(q)) return true;
    if (range) { const a = +range[1], b = +range[2]; return m.price >= Math.min(a, b) && m.price <= Math.max(a, b); }
    return isNum && String(m.price).includes(qd);
  });
  if (view === "wish") {
    const from = parseNum(document.getElementById("priceFrom").value);
    const to = parseNum(document.getElementById("priceTo").value);
    if (from !== null) out = out.filter(m => m.price >= from);
    if (to !== null) out = out.filter(m => m.price <= to);
  }
  const dir = state.sortDir[view] === "asc" ? 1 : -1;
  return out.slice().sort((a, b) => (a.price - b.price) * dir);
}

function renderGrid() {
  const gm = document.getElementById("gridMine"), gw = document.getElementById("gridWish");
  const sm = gm.scrollTop, sw = gw.scrollTop;
  _renderGrid();
  gm.scrollTop = sm; gw.scrollTop = sw;
}
function _renderGrid() {
  if (state.mainTab === "wish") {
    const el = document.getElementById("gridWish");
    const stake = getTotalStake();
    if (stake === 0) { el.innerHTML = '<div class="empty-state">Сначала выбери ставку в инвентаре</div>'; return; }
    const list = applyFilters(state.targets.filter(m => m.price > stake), "wish");
    el.innerHTML = list.length
      ? list.map(m => cardHTML(m, { selected: state.targetMemeId === m.uid, check: true, select: `selectTarget('${m.uid}')`, play: true })).join("")
      : '<div class="empty-state">Ничего не найдено</div>';
    return;
  }
  const el = document.getElementById("gridMine");
  if (state.subTab === "shop") {
    const list = applyFilters(MEMES, "shop");
    el.innerHTML = list.length ? list.map(m => cardHTML(m, { buy: true, qty: state.cart[m.id] || 0, play: true })).join("") : '<div class="empty-state">Ничего не найдено</div>';
  } else {
    if (!state.inventory.length) { el.innerHTML = '<div class="empty-state">Инвентарь пуст — загляни в магазин</div>'; return; }
    const list = applyFilters(state.inventory, "inventory");
    el.innerHTML = list.length
      ? list.map(m => cardHTML(m, { selected: state.selectedMemeUids.includes(m.uid), check: true, select: `toggleMeme('${m.uid}')`, play: true })).join("")
      : '<div class="empty-state">Ничего не найдено</div>';
  }
}

function updateSortLabels() {
  const v = currentView();
  const label = "Цена " + svgi(state.sortDir[v] === "asc" ? "arrowUp" : "arrowDown", 13);
  document.getElementById("sortMine").innerHTML = label;
  document.getElementById("sortWish").innerHTML = label;
}

function renderAll() {
  renderSlots(); renderGrid(); updateWheel(); updateButton(); updateHeader(); updateSortLabels(); updateCartBar(); updateSellCartBtn(); updateSelectAllBtn();
}

function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}
/* ============ ДЕМО-РЕЖИМ: виртуальный баланс для кейсов, мин и лесенки ============ */
const demo = { on: false, bal: 100000 };
function curBal() { return demo.on ? demo.bal : state.balance; }
function gAdd(x) {
  if (demo.on) demo.bal += x; else { state.balance += x; saveGame(); }
  updateHeader(); pulseBalance();
}
function syncDemoUI() {
  document.body.classList.toggle("demo-on", demo.on);
  document.querySelectorAll(".demo-box").forEach(b => {
    b.innerHTML = `<button class="demo-pill${demo.on ? " on" : ""}" onclick="toggleDemo()"><i></i>Демо</button>` +
      (demo.on ? `<button class="demo-reset" onclick="resetDemo()">Сбросить</button>` : "");
  });
}
function setDemo(on) {
  demo.on = on; syncDemoUI(); updateHeader();
  try { renderMinesHud(); ladderRenderHud(); updateCaseBtn(); } catch (e) {}
}
function toggleDemo() {
  if (state.spinning || mines.phase === "playing" || ladder.phase === "playing") {
    notify("lose", "Демо", "Сначала закончите текущую игру", "—", OK_ITEM); return;
  }
  setDemo(!demo.on);
}
function resetDemo() { demo.bal = 100000; updateHeader(); pulseBalance(); }
let shownBalance = 0, balanceAnim = 0;
function updateHeader() {
  const el = document.getElementById("headerMeta");
  const el2 = document.getElementById("spinBalance");
  const from = shownBalance, to = curBal();
  if (from === to) { el.textContent = fmt(to); if (el2) el2.textContent = fmt(to); return; }
  const id = ++balanceAnim, start = performance.now(), dur = 600;
  (function frame(now) {
    if (id !== balanceAnim) return;
    const t = Math.min((now - start) / dur, 1);
    shownBalance = Math.round(from + (to - from) * (1 - Math.pow(1 - t, 3)));
    el.textContent = fmt(shownBalance);
    if (el2) el2.textContent = fmt(shownBalance);
    if (t < 1) requestAnimationFrame(frame);
  })(start);
}
function pulseBalance() {
  const el = document.getElementById("headerMeta");
  el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
}
function updateButton() {
  const btn = document.getElementById("spinBtn");
  if (state.spinning) { btn.disabled = true; btn.classList.add("spinning"); btn.innerHTML = "Крутим…"; return; }
  btn.classList.remove("spinning");
  if (!isLoggedIn()) {
    btn.disabled = false;
    btn.innerHTML = `<span class="gate-btn">${ICON_LOCK}<span>Войти, чтобы амгрейдить</span></span>`;
    return;
  }
  btn.disabled = !(state.selectedMemeUids.length > 0 && !!state.targetMemeId);
  btn.textContent = "Амгрейд";
}

/* ============================================================
   ВКЛАДКИ, ФИЛЬТРЫ, ВЫБОР
   ============================================================ */
function setMain(tab) {
  state.mainTab = tab;
  document.getElementById("mainMine").classList.toggle("active", tab === "mine");
  document.getElementById("mainWish").classList.toggle("active", tab === "wish");
  document.getElementById("paneMine").style.display = tab === "mine" ? "" : "none";
  document.getElementById("paneWish").style.display = tab === "wish" ? "" : "none";
  renderAll();
}
function setSub(tab) {
  state.subTab = tab;
  document.getElementById("subInventory").classList.toggle("active", tab === "inventory");
  document.getElementById("subShop").classList.toggle("active", tab === "shop");
  renderAll();
}
function slotTap(e, tab) {
  if (e.target.closest && e.target.closest(".meme-vid-wrap")) return;   // тап по видео-мему = двойной тап для воспроизведения
  goTab(tab);
}
function goTab(tab) {
  if (state.spinning) return;
  setMain(tab);
  document.getElementById("browser").scrollIntoView({ behavior: "smooth", block: "start" });
}
function onFilter() { renderGrid(); }
function toggleSort() {
  const v = currentView();
  state.sortDir[v] = state.sortDir[v] === "asc" ? "desc" : "asc";
  renderAll();
}

function toggleMeme(uid) {
  if (state.spinning) return;
  const idx = state.selectedMemeUids.indexOf(uid);
  if (idx >= 0) state.selectedMemeUids.splice(idx, 1);
  else state.selectedMemeUids.push(uid);
  const tgt = getTarget();
  if (tgt && (getTotalStake() === 0 || tgt.price <= getTotalStake())) state.targetMemeId = null;
  renderAll();
}
function selectTarget(uid) {
  if (state.spinning) return;
  state.targetMemeId = state.targetMemeId === uid ? null : uid;
  renderAll();
}
function selectAllSell() {
  if (state.spinning) return;
  const list = applyFilters(state.inventory, "inventory");
  if (!list.length) return;
  const allSelected = list.every(m => state.selectedMemeUids.includes(m.uid));
  state.selectedMemeUids = allSelected ? [] : list.map(m => m.uid);
  const tgt = getTarget();
  if (tgt && (getTotalStake() === 0 || tgt.price <= getTotalStake())) state.targetMemeId = null;
  renderAll();
}

/* Быстрый подбор цели по нужному проценту шанса: ищем среди «Желаемых»
   предмет, чья цена даёт шанс ближе всего к запрошенному (30/50/70%). */
function pickByChance(pct, btnEl) {
  if (state.spinning) return;
  const stake = getTotalStake();
  if (!stake) {
    document.getElementById("slotStake").classList.remove("nudge");
    void document.getElementById("slotStake").offsetWidth;
    document.getElementById("slotStake").classList.add("nudge");
    return;
  }
  const candidates = state.targets.filter(m => m.price > stake);
  if (!candidates.length) return;
  let best = null, bestDiff = Infinity;
  for (const m of candidates) {
    const diff = Math.abs(calcChance(stake, m) - pct);
    if (diff < bestDiff || (diff === bestDiff && best && m.price < best.price)) { bestDiff = diff; best = m; }
  }
  if (!best) return;

  document.getElementById("searchWish").value = "";
  document.getElementById("priceFrom").value = "";
  document.getElementById("priceTo").value = "";
  state.targetMemeId = best.uid;
  if (state.mainTab !== "wish") setMain("wish"); else renderAll();

  if (btnEl) { btnEl.classList.remove("pulse"); void btnEl.offsetWidth; btnEl.classList.add("pulse"); }
  window.scrollTo({ top: 0, behavior: "smooth" });
}
/* ============================================================
   ПРОДАЖА ПРЕДМЕТОВ
   ============================================================ */
const SELL_RATE = 1;                 // доля цены при продаже (1 = 100%, 0.9 = 90%)
let sellUid = null;
function sellPrice(m) { return Math.round(m.price * SELL_RATE); }

function openSell(uid) {
  if (state.spinning || paying) return;
  if (!state.inventory.find(i => i.uid === uid)) return;
  if (!isLoggedIn()) { openAuth("Войдите, чтобы продавать предметы"); return; }
  sellUid = uid;
  buyMode = "sell";
  renderSellSheet();
  document.getElementById("buyOverlay").classList.add("open");
}
function renderSellSheet() {
  const m = state.inventory.find(i => i.uid === sellUid);
  if (!m) return;
  const price = sellPrice(m);
  document.getElementById("buySheet").innerHTML = `
    <div class="sheet-head">
      <div class="sheet-badge">1</div>
      <div class="sheet-headtext">
        <div class="sheet-title">Продать предмет</div>
        <div class="sheet-sub">Предмет уйдёт из инвентаря</div>
      </div>
      <button class="sheet-close" onclick="closeBuy()">${svgi("close", 20)}</button>
    </div>
    <div class="sheet-list">
      <div class="buy-row">
        ${renderIcon(m, 56)}
        <div class="buy-info">
          <div class="buy-name">${esc(m.name)}</div>
          ${m.nameEn ? `<div class="buy-name-en">${esc(m.nameEn)}</div>` : ""}
          <div class="buy-rarity">${RARITY_RU[m.rarity] || ""}</div>
          <div class="buy-price">${fmt(price)}</div>
        </div>
      </div>
    </div>
    <div class="sheet-foot">
      <div class="total-row"><span class="total-label">Вы получите:</span><span class="total-value">${fmt(price)}</span></div>
      <div class="balance-note">Баланс после: ${fmt(state.balance + price)}</div>
      <div class="btn-row">
        <button class="ghost-btn" onclick="closeBuy()">Отмена</button>
        <button class="pay-btn" id="payBtn" onclick="confirmSell()"><span>Продать</span></button>
      </div>
    </div>`;
}
function confirmSell() {
  if (paying) return;
  paying = true;
  const btn = document.getElementById("payBtn");
  btn.classList.add("paying");
  btn.querySelector("span").textContent = "Продано";
  setTimeout(finishSell, 750);
}
function finishSell() {
  const m = state.inventory.find(i => i.uid === sellUid);
  paying = false;
  document.getElementById("buyOverlay").classList.remove("open");
  if (!m) return;
  const price = sellPrice(m);
  state.inventory = state.inventory.filter(i => i.uid !== m.uid);
  const si = state.selectedMemeUids.indexOf(m.uid);
  if (si >= 0) state.selectedMemeUids.splice(si, 1);
  const tgt = getTarget();
  if (tgt && (getTotalStake() === 0 || tgt.price <= getTotalStake())) state.targetMemeId = null;
  state.balance += price;
  sellUid = null;
  saveGame();
  renderAll();
  renderProfile();
  pulseBalance();
  const invOverlay = document.getElementById("invFullOverlay");
  if (invOverlay && !invOverlay.hidden) renderProfileInventoryGrid();
  notify("win", "Продано", m.name, "+ " + fmt(price), m);
}

