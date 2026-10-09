/* ============================================================
   МАССОВАЯ ПРОДАЖА (корзина продажи)
   Появляется, когда в инвентаре отмечено 2+ предмета.
   ============================================================ */
function sellCartEntries() {
  return state.selectedMemeUids.map(uid => state.inventory.find(i => i.uid === uid)).filter(Boolean);
}
function sellCartTotal() { return sellCartEntries().reduce((s, m) => s + sellPrice(m), 0); }

function updateSelectAllBtn() {
  const btn = document.getElementById("selectAllBtn");
  if (!btn) return;
  const list = applyFilters(state.inventory, "inventory");
  const show = state.mainTab === "mine" && state.subTab === "inventory" && !state.spinning && list.length > 0;
  btn.classList.toggle("show", show);
  const allSelected = show && list.every(m => state.selectedMemeUids.includes(m.uid));
  btn.classList.toggle("all", allSelected);
  btn.setAttribute("aria-label", allSelected ? "Снять выбор" : "Выбрать все");
}

function updateSellCartBtn() {
  const btn = document.getElementById("sellCartBtn");
  const row = document.getElementById("searchRowMine");
  if (!btn || !row) return;
  const n = state.selectedMemeUids.length;
  const show = n >= 1 && state.mainTab === "mine" && state.subTab === "inventory" && !state.spinning;
  const wasShown = btn.classList.contains("show");
  btn.classList.toggle("show", show);
  row.classList.toggle("compact", show);
  const badge = document.getElementById("sellCartBadge");
  if (badge) {
    badge.textContent = n;
    if (show && wasShown) { badge.classList.remove("pop"); void badge.offsetWidth; badge.classList.add("pop"); }
  }
}

function openSellCart() {
  if (state.spinning || paying) return;
  const n = state.selectedMemeUids.length;
  if (n < 1) return;
  if (!isLoggedIn()) { openAuth("Войдите, чтобы продавать предметы"); return; }
  buyMode = "sellCart";
  renderSellCartSheet();
  document.getElementById("buyOverlay").classList.add("open");
}

function renderSellCartSheet() {
  const list = sellCartEntries(), n = list.length, total = sellCartTotal();
  const sheet = document.getElementById("buySheet");
  const oldList = sheet.querySelector(".sheet-list");
  const keep = oldList ? oldList.scrollTop : 0;

  const rows = list.map(m => `
    <div class="buy-row">
      ${renderIcon(m, 56)}
      <div class="buy-info">
        <div class="buy-name">${esc(m.name)}</div>
        ${m.nameEn ? `<div class="buy-name-en">${esc(m.nameEn)}</div>` : ""}
        <div class="buy-rarity">${RARITY_RU[m.rarity] || ""}</div>
        <div class="buy-price">${fmt(sellPrice(m))}</div>
      </div>
      <div class="buy-side">
        <button class="remove-btn" onclick="removeFromSellCart('${m.uid}')">Убрать</button>
      </div>
    </div>`).join("");

  sheet.innerHTML = `
    <div class="sheet-head">
      <div class="sheet-badge">${n}</div>
      <div class="sheet-headtext">
        <div class="sheet-title">Продажа предметов</div>
        <div class="sheet-sub">${n} ${plural(n, "предмет", "предмета", "предметов")} · уйдут из инвентаря</div>
      </div>
      <button class="sheet-close" onclick="closeBuy()">${svgi("close", 20)}</button>
    </div>
    <div class="sheet-list">${rows}</div>
    <div class="sheet-foot">
      <div class="total-row"><span class="total-label">Вы получите:</span><span class="total-value">${fmt(total)}</span></div>
      <div class="balance-note">Баланс после: ${fmt(state.balance + total)}</div>
      <div class="btn-row">
        <button class="ghost-btn" onclick="closeBuy()">Отмена</button>
        <button class="pay-btn" id="payBtn" onclick="confirmSellCart()"><span>Продать всё (${n})</span></button>
      </div>
    </div>`;
  const nl = sheet.querySelector(".sheet-list");
  if (nl) nl.scrollTop = keep;
}

function removeFromSellCart(uid) {
  const idx = state.selectedMemeUids.indexOf(uid);
  if (idx >= 0) state.selectedMemeUids.splice(idx, 1);
  renderAll();
  refreshInvFull();
  if (state.selectedMemeUids.length < 1) { closeBuy(); return; }
  renderSellCartSheet();
}

function confirmSellCart() {
  if (paying) return;
  paying = true;
  const btn = document.getElementById("payBtn");
  btn.classList.add("paying");
  btn.querySelector("span").textContent = "Продано";
  setTimeout(finishSellCart, 750);
}

function finishSellCart() {
  const list = sellCartEntries(), n = list.length, total = sellCartTotal();
  paying = false;
  document.getElementById("buyOverlay").classList.remove("open");
  if (!list.length) return;
  const uids = list.map(m => m.uid);
  state.inventory = state.inventory.filter(i => !uids.includes(i.uid));
  state.selectedMemeUids = state.selectedMemeUids.filter(u => !uids.includes(u));
  const tgt = getTarget();
  if (tgt && (getTotalStake() === 0 || tgt.price <= getTotalStake())) state.targetMemeId = null;
  state.balance += total;
  saveGame();
  renderAll();
  renderProfile();
  pulseBalance();
  refreshInvFull();
  notify("win", "Продано", n + " " + plural(n, "предмет", "предмета", "предметов"), "+ " + fmt(total), list[0]);
}

/* ============================================================
   КОРЗИНА И ПОКУПКА
   1 предмет → окно подтверждения, 2+ → корзина.
   ============================================================ */
const MAX_QTY = 20;
let buyMode = null, paying = false;

function cartEntries() {
  return Object.keys(state.cart).map(id => ({ m: getMemeById(+id), qty: state.cart[id] })).filter(e => e.m && e.qty > 0);
}
function cartCount() { return cartEntries().reduce((s, e) => s + e.qty, 0); }
function cartTotal() { return cartEntries().reduce((s, e) => s + e.m.price * e.qty, 0); }

function addToCart(id) {
  const q = state.cart[id] || 0;
  if (q >= MAX_QTY) return;
  state.cart[id] = q + 1;
  renderGrid(); updateCartBar();
}
function changeQty(id, d) {
  const q = (state.cart[id] || 0) + d;
  if (q <= 0) delete state.cart[id]; else state.cart[id] = Math.min(q, MAX_QTY);
  afterCartChange();
}
function removeFromCart(id) { delete state.cart[id]; afterCartChange(); }
function clearCart() { state.cart = {}; afterCartChange(); }
function afterCartChange() {
  renderGrid(); updateCartBar();
  if (!cartCount()) closeBuy(); else renderBuySheet();
}

function updateCartBar() {
  const n = cartCount();
  const show = n > 0 && state.mainTab === "mine" && state.subTab === "shop";
  document.getElementById("cartBar").classList.toggle("show", show);
  if (n) {
    document.getElementById("cartCount").textContent = "В корзине: " + n + " " + plural(n, "предмет", "предмета", "предметов");
    const ct = document.getElementById("cartTotal");
    ct.textContent = fmt(cartTotal());
    ct.classList.toggle("bad", cartTotal() > state.balance);
  }
}

function openBuy() {
  const n = cartCount();
  if (!n) return;
  if (!isLoggedIn()) { openAuth("Войдите, чтобы совершить покупку"); return; }
  buyMode = n === 1 ? "confirm" : "cart";
  renderBuySheet();
  document.getElementById("buyOverlay").classList.add("open");
}
function closeBuy() {
  if (paying) return;
  document.getElementById("buyOverlay").classList.remove("open");
}

function renderBuySheet() {
  const list = cartEntries(), n = cartCount(), total = cartTotal();
  const enough = total <= state.balance;
  const cartMode = buyMode === "cart";
  const sheet = document.getElementById("buySheet");
  const oldList = sheet.querySelector(".sheet-list");
  const keep = oldList ? oldList.scrollTop : 0;

  const rows = list.map(({ m, qty }) => `
    <div class="buy-row">
      ${renderIcon(m, 56)}
      <div class="buy-info">
        <div class="buy-name">${esc(m.name)}</div>
        ${m.nameEn ? `<div class="buy-name-en">${esc(m.nameEn)}</div>` : ""}
        <div class="buy-rarity">${RARITY_RU[m.rarity] || ""}</div>
        <div class="buy-price">${fmt(m.price * qty)}</div>
      </div>
      <div class="buy-side">
        ${cartMode ? `<div class="stepper">
          <button onclick="changeQty(${m.id},-1)">${svgi("minus", 16)}</button><span>${qty}</span><button onclick="changeQty(${m.id},1)">${svgi("plus", 16)}</button>
        </div>` : ""}
        <button class="remove-btn" onclick="removeFromCart(${m.id})">Удалить</button>
      </div>
    </div>`).join("");

  sheet.innerHTML = `
    <div class="sheet-head">
      <div class="sheet-badge">${n}</div>
      <div class="sheet-headtext">
        <div class="sheet-title">${cartMode ? "Корзина покупок" : "Подтвердить покупку"}</div>
        <div class="sheet-sub">${n} ${plural(n, "предмет", "предмета", "предметов")}</div>
      </div>
      <button class="sheet-close" onclick="closeBuy()">${svgi("close", 20)}</button>
    </div>
    <div class="sheet-list">${rows}</div>
    <div class="sheet-foot">
      <div class="total-row"><span class="total-label">Общая сумма:</span><span class="total-value">${fmt(total)}</span></div>
      <div class="balance-note ${enough ? "" : "bad"}">Баланс: ${fmt(state.balance)}</div>
      <div class="btn-row">
        ${cartMode ? '<button class="ghost-btn" onclick="clearCart()">Очистить</button>' : '<button class="ghost-btn" onclick="closeBuy()">Отмена</button>'}
        <button class="pay-btn" id="payBtn" onclick="pay()" ${enough ? "" : "disabled"}><span>${enough ? (cartMode ? "Оплатить (" + n + ")" : "Купить") : "Не хватает " + fmt(total - state.balance)}</span></button>
      </div>
    </div>`;
  const nl = sheet.querySelector(".sheet-list");
  if (nl) nl.scrollTop = keep;
}

function pay() {
  if (paying || !cartCount() || cartTotal() > state.balance) return;
  paying = true;
  const btn = document.getElementById("payBtn");
  btn.classList.add("paying");
  btn.querySelector("span").textContent = "Куплено";
  setTimeout(finishPurchase, 750);
}

function finishPurchase() {
  const list = cartEntries(), n = cartCount(), total = cartTotal();
  list.forEach(({ m, qty }) => { for (let i = 0; i < qty; i++) state.inventory.push({ ...m, uid: makeUid("u") }); });
  state.cart = {};
  state.balance -= total;
  paying = false;
  saveGame();
  document.getElementById("buyOverlay").classList.remove("open");
  renderAll();
  renderProfile();
  pulseBalance();
  notify("win", "Куплено",
    n === 1 ? list[0].m.name : `${n} ${plural(n, "предмет", "предмета", "предметов")} в инвентаре`,
    "− " + fmt(total), list[0].m);
}

/* ============================================================
   АНИМАЦИЯ УКАЗАТЕЛЯ
   ============================================================ */
let pointerRotation = 0;
function setPointer(deg) {
  pointerRotation = deg;
  document.getElementById("wheelPointer").style.transform = `rotate(${deg}deg)`;
}
function animatePointerTo(finalAngle, duration) {
  const extraTurns = (isFast() ? 1 : 4) + Math.floor(randomCrypto() * 3);
  const total = extraTurns * 360 + finalAngle;
  const start = performance.now();
  return new Promise(resolve => {
    function frame(now) {
      const t = spinSkip ? 1 : Math.min((now - start) / duration, 1);
      setPointer(total * (1 - Math.pow(1 - t, 4)));
      try { wheelTick(pointerRotation); } catch (e) {}
      if (t < 1) requestAnimationFrame(frame); else { setPointer(total); resolve(); }
    }
    requestAnimationFrame(frame);
  });
}
function returnPointerToStart(duration) {
  const from = pointerRotation;
  const norm = ((from % 360) + 360) % 360;
  const to = from + (norm <= 180 ? -norm : 360 - norm);
  const start = performance.now();
  return new Promise(resolve => {
    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      setPointer(from + (to - from) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(frame); else { setPointer(0); resolve(); }
    }
    requestAnimationFrame(frame);
  });
}

/* ============================================================
   СПИН
   ============================================================ */
function onSpinClick() {
  if (!isLoggedIn()) { openAuth("Войдите, чтобы совершить амгрейд"); return; }
  spin();
}
async function spin() {
  if (state.spinning) return;
  if (!isLoggedIn()) { openAuth("Войдите, чтобы совершить амгрейд"); return; }
  const selected = getSelectedMemes(), tgt = getTarget();
  if (!selected.length || !tgt) return;

  state.spinning = true;
  updateButton();
  spinReset();

  const chance = state.chance;
  const stakeTotal = getTotalStake();
  const roll = rollOutcome(chance);
  const finalAngle = roll.angle, win = roll.win;
  try { mediaPrepare(win, tgt, stakeTotal, chance); } catch (e) {}

  await animatePointerTo(finalAngle, isFast() ? 650 : 3400);
  showBubble(win, tgt, stakeTotal);          // сразу, как только указатель остановился
  try { wheelStop(); } catch (e) {}
  try { mediaPlay(); } catch (e) {}

  await new Promise(r => setTimeout(r, isFast() ? 250 : 700));
  await returnPointerToStart(isFast() ? 150 : 500);

  const used = state.selectedMemeUids.slice();
  state.inventory = state.inventory.filter(i => !used.includes(i.uid));
  if (win) state.inventory.push({ ...tgt, uid: makeUid("u") });

  pushHistory({ time: Date.now(), stake: selected.map(m => ({ id: m.id, name: m.name, rarity: m.rarity, price: m.price })),
    stakeTotal, target: { id: tgt.id, name: tgt.name, rarity: tgt.rarity, price: tgt.price }, chance, win });

  state.selectedMemeUids = [];
  state.targetMemeId = null;
  state.spinning = false;

  saveGame();
  renderAll();
  renderProfile();
}

/* ============================================================
   БАБЛ РЕЗУЛЬТАТА
   ============================================================ */
let bubbleTimer = null;
function resetBubbleStyle(el) {
  el.style.transition = "";
  el.style.transform = "";
  el.style.opacity = "";
}
function hideBubble() {
  clearTimeout(bubbleTimer);
  const el = document.getElementById("bubble");
  resetBubbleStyle(el);
  el.classList.remove("show");
}
/* Смахивание вверх — единственный способ закрыть уведомление руками */
function dismissBubble() {
  clearTimeout(bubbleTimer);
  const el = document.getElementById("bubble");
  el.style.transition = "transform .3s cubic-bezier(.4,0,1,1), opacity .28s ease-in";
  el.style.transform = "translate(-50%,-170%) scale(0.92)";
  el.style.opacity = "0";
  setTimeout(() => { el.classList.remove("show"); resetBubbleStyle(el); }, 300);
}
function initBubbleSwipe() {
  const el = document.getElementById("bubble");
  let dragging = false, startY = 0, dy = 0;
  const start = e => {
    if (!el.classList.contains("show")) return;
    dragging = true;
    startY = e.clientY;
    dy = 0;
    el.style.transition = "none";
    clearTimeout(bubbleTimer);
    try { el.setPointerCapture(e.pointerId); } catch (err) {}
  };
  const move = e => {
    if (!dragging) return;
    dy = e.clientY - startY;
    const drag = dy < 0 ? dy : dy * 0.15;              // сопротивление вниз
    el.style.transform = `translate(-50%, ${drag}px) scale(1)`;
    el.style.opacity = String(Math.max(1 - Math.max(0, -drag) / 130, 0.1));
  };
  const end = () => {
    if (!dragging) return;
    dragging = false;
    if (dy < -48) {
      dismissBubble();
    } else {
      el.style.transition = "";                         // плавный «пружинный» возврат из CSS
      el.style.transform = "";
      el.style.opacity = "";
      bubbleTimer = setTimeout(hideBubble, 1600);
    }
  };
  el.addEventListener("pointerdown", start);
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);
}
function notify(kind, title, sub, badge, item) {
  if (demo.on) title = "Демо · " + title;
  const el = document.getElementById("bubble");
  clearTimeout(bubbleTimer);
  el.classList.remove("show");
  resetBubbleStyle(el);
  void el.offsetWidth;
  el.classList.remove("win", "lose");
  el.classList.add(kind);
  document.getElementById("bubbleIcon").innerHTML = renderIcon(item, 44);
  document.getElementById("bubbleTitle").textContent = title;
  document.getElementById("bubbleSub").textContent = sub;
  document.getElementById("bubbleBadge").textContent = badge;
  requestAnimationFrame(() => el.classList.add("show"));
  bubbleTimer = setTimeout(hideBubble, 3200);
}
function showBubble(win, item, stakeTotal) {
  notify(win ? "win" : "lose",
    win ? "Победа" : "Не повезло",
    win ? `Получено: ${item.name}` : `Ставка сгорела · цель: ${item.name}`,
    win ? `+ ${fmt(item.price)}` : `− ${fmt(stakeTotal)}`, item);
}

/* ============================================================
   SELF-TEST
   ============================================================ */
function selfTest() {
  const assert = (ok, msg) => { if (!ok) { try { console.error("SELF-TEST FAIL: " + msg); } catch (e) {} } };
  const near = (a, b) => Math.abs(a - b) < 0.01;
  const p0 = polarToCartesian(160, 160, 100, 0);
  assert(near(p0.x, 160) && near(p0.y, 260), "0° = низ", p0);
  const p90 = polarToCartesian(160, 160, 100, 90);
  assert(near(p90.x, 60) && near(p90.y, 160), "90° = слева", p90);
  const p180 = polarToCartesian(160, 160, 100, 180);
  assert(near(p180.x, 160) && near(p180.y, 60), "180° = верх", p180);
  const p270 = polarToCartesian(160, 160, 100, 270);
  assert(near(p270.x, 260) && near(p270.y, 160), "270° = справа", p270);
  const a = polarToCartesian(160, 160, 100, -37), b = polarToCartesian(160, 160, 100, 37);
  assert(near(a.y, b.y) && near((a.x + b.x) / 2, 160), "Зона симметрична относительно низа");
  const arc = describeSymmetricArc(160, 160, 100, 45);
  const m = arc.match(/^M ([\d.]+) ([\d.]+)/);
  assert(m && parseFloat(m[1]) > 160, "Дуга начинается справа от низа");
  assert((arc.match(/ 0 0 1 /g) || []).length === 2, "Две дуги largeArc=0 sweep=1");
  assert(isWin(44.9, 25) && !isWin(45, 25), "25%: граница ±45°");
  assert(isWin(-44.9, 25) && !isWin(-45, 25), "25%: симметрия");
  assert(isWin(89.9, 50) && !isWin(90, 50), "50%: граница ±90°");
  assert(isWin(170, 95) && !isWin(172, 95), "95%: граница ±171°");
  assert(isWin(3.5, 2) && !isWin(3.7, 2), "2%: граница ±3.6°");
  assert(isWin(0, 2) && !isWin(180, 95), "центр = победа, верх = проигрыш");
  assert(isWin(370, 25) && isWin(-350, 25), "нормализация углов");
  try { console.log("Amgrader self-test: done"); } catch (e) {}
}

/* ============================================================
   НАВИГАЦИЯ ПО ЭКРАНАМ
   ============================================================ */
function showScreen(name) {
  if (state.spinning) return;
  state.screen = name;
  ["upgrade", "cases", "profile"].forEach(s => {
    document.getElementById("screen" + s[0].toUpperCase() + s.slice(1)).hidden = (s !== name);
  });
  document.getElementById("navUpgrade").classList.toggle("active", name === "upgrade");
  document.getElementById("navProfile").classList.toggle("active", name === "profile");
  if (name === "profile") renderProfile();
  window.scrollTo(0, 0);
}
const _goTab = goTab;
goTab = function (tab) {
  if (state.spinning) return;
  showScreen("upgrade");
  _goTab(tab);
};

/* ============================================================
   СОХРАНЕНИЕ ПРОГРЕССА (за аккаунтом, локально на устройстве)
   ============================================================ */
function isLoggedIn() { return !!(state.profile && state.profile.accountKey); }

function saveGame() {
  if (!isLoggedIn()) return;                 // у гостя прогресс не сохраняется
  try {
    const accounts = getAccounts();
    const acc = accounts[state.profile.accountKey];
    if (!acc) return;
    acc.balance = state.balance;
    acc.inventory = state.inventory.map(i => i.id);
    saveAccounts(accounts);
  } catch (e) {}
}
function loadGame() {
  shownBalance = state.balance;
}
function loadAccountIntoState(key, acc) {
  state.balance = typeof acc.balance === "number" ? acc.balance : 100000;
  state.inventory = (acc.inventory || []).map(id => getMemeById(id)).filter(Boolean).map(m => ({ ...m, uid: makeUid("u") }));
  state.selectedMemeUids = [];
  state.targetMemeId = null;
  state.cart = {};
  shownBalance = state.balance;
}
function resetGuestState() {
  state.balance = 100000;
  state.inventory = [];
  state.selectedMemeUids = [];
  state.targetMemeId = null;
  state.cart = {};
  shownBalance = state.balance;
}

/* ============================================================
   АККАУНТЫ: РЕГИСТРАЦИЯ, ВХОД, TELEGRAM, ВЫХОД
   ============================================================ */
function initials(name) { return (name || "?").trim().slice(0, 1).toUpperCase() || "?"; }

function getAccounts() {
  try { return JSON.parse(localStorage.getItem("amg_accounts") || "{}"); } catch (e) { return {}; }
}
function saveAccounts(obj) { try { localStorage.setItem("amg_accounts", JSON.stringify(obj)); } catch (e) {} }
function saveSession(key) { try { localStorage.setItem("amg_session", key || ""); } catch (e) {} }

/* Простое хеширование пароля (не криптостойкое — для локальной демо-игры достаточно) */
function simpleHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
  return "h" + (h >>> 0).toString(36);
}

