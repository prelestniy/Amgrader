const VERIFIED_BADGE = '<svg class="vbadge" viewBox="0 0 100 100" aria-label="Верифицирован"><path d="M99.0,50.0 L98.1,52.4 L95.8,54.5 L93.4,56.4 L92.2,58.4 L92.6,60.7 L94.0,63.4 L95.3,66.2 L95.3,68.8 L93.5,70.6 L90.6,71.7 L87.6,72.6 L85.8,73.9 L85.2,76.1 L85.6,79.2 L85.7,82.3 L84.6,84.6 L82.3,85.7 L79.2,85.6 L76.1,85.2 L73.9,85.8 L72.6,87.6 L71.7,90.6 L70.6,93.5 L68.8,95.3 L66.2,95.3 L63.4,94.0 L60.7,92.6 L58.4,92.2 L56.4,93.4 L54.5,95.8 L52.4,98.1 L50.0,99.0 L47.6,98.1 L45.5,95.8 L43.6,93.4 L41.6,92.2 L39.3,92.6 L36.6,94.0 L33.8,95.3 L31.2,95.3 L29.4,93.5 L28.3,90.6 L27.4,87.6 L26.1,85.8 L23.9,85.2 L20.8,85.6 L17.7,85.7 L15.4,84.6 L14.3,82.3 L14.4,79.2 L14.8,76.1 L14.2,73.9 L12.4,72.6 L9.4,71.7 L6.5,70.6 L4.7,68.8 L4.7,66.2 L6.0,63.4 L7.4,60.7 L7.8,58.4 L6.6,56.4 L4.2,54.5 L1.9,52.4 L1.0,50.0 L1.9,47.6 L4.2,45.5 L6.6,43.6 L7.8,41.6 L7.4,39.3 L6.0,36.6 L4.7,33.8 L4.7,31.2 L6.5,29.4 L9.4,28.3 L12.4,27.4 L14.2,26.1 L14.8,23.9 L14.4,20.8 L14.3,17.7 L15.4,15.4 L17.7,14.3 L20.8,14.4 L23.9,14.8 L26.1,14.2 L27.4,12.4 L28.3,9.4 L29.4,6.5 L31.2,4.7 L33.8,4.7 L36.6,6.0 L39.3,7.4 L41.6,7.8 L43.6,6.6 L45.5,4.2 L47.6,1.9 L50.0,1.0 L52.4,1.9 L54.5,4.2 L56.4,6.6 L58.4,7.8 L60.7,7.4 L63.4,6.0 L66.2,4.7 L68.8,4.7 L70.6,6.5 L71.7,9.4 L72.6,12.4 L73.9,14.2 L76.1,14.8 L79.2,14.4 L82.3,14.3 L84.6,15.4 L85.7,17.7 L85.6,20.8 L85.2,23.9 L85.8,26.1 L87.6,27.4 L90.6,28.3 L93.5,29.4 L95.3,31.2 L95.3,33.8 L94.0,36.6 L92.6,39.3 L92.2,41.6 L93.4,43.6 L95.8,45.5 L98.1,47.6 Z" fill="#4FEAFF"/><polyline points="34,51 45,62 67,40" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
/* ===== Ник с префиксом и галочкой, магазин префиксов ===== */

/* Ник в одном месте: префикс-плашка, ник (цвет если выдан), галочка если верифицирован */
function nickHTML(u) {
  const s = (u && u.style) || {};
  const name = esc((u && u.nickname) || "Игрок");
  const pc = s.nameColor || "#FFFFFF";
  const pre = s.prefix ? `<span class="nk-prefix" style="--pc:${esc(pc)}">${esc(s.prefix.text)}</span>` : "";
  const badge = s.verified ? VERIFIED_BADGE : "";
  return `<span class="nk">${pre}<span class="nk-name">${name}</span>${badge}</span>`;
}

async function openShop(page) {
  if (!isLoggedIn()) return openAuth("Войдите, чтобы покупать префиксы");
  let d;
  try { d = await api("/api/shop"); } catch (e) { return notify("lose", "Магазин", "Не получилось", e.message, OK_ITEM); }
  const tabs = `<div class="shop-tabs"><button class="shop-tab${page === 1 ? "" : " on"}" onclick="openShop(0)">Префиксы</button><button class="shop-tab${page === 1 ? " on" : ""}" onclick="openShop(1)">Цвета</button></div>`;
  let cards, title, sub;
  if (page === 1) {
    title = "Цвета префиксов"; sub = "Цвет плашки префикса, по умолчанию белый";
    const def = `<div class="shop-card"><div class="shop-info"><span class="nk-prefix" style="--pc:#FFFFFF">Белый</span><span class="shop-price">По умолчанию</span></div>` +
      (d.equippedColor ? `<button class="shop-btn" onclick="shopColorEquip(null)">Надеть</button>` : `<button class="shop-btn on" onclick="shopColorEquip(null)">Надето</button>`) + `</div>`;
    cards = def + (d.colors || []).map((c, i) => {
      let btn;
      if (d.equippedColor === c.hex) btn = `<button class="shop-btn on" onclick="shopColorEquip(null)">Снять</button>`;
      else if (c.owned) btn = `<button class="shop-btn" onclick="shopColorEquip('${c.hex}')">Надеть</button>`;
      else btn = `<button class="shop-btn buy" onclick="shopColorBuy('${c.hex}')">${fmt(c.price)}</button>`;
      return `<div class="shop-card" style="animation-delay:${i * 0.03}s"><div class="shop-info"><span class="nk-prefix" style="--pc:${c.hex}">Ник</span>` +
        `<span class="shop-price">${c.owned ? "Куплен" : fmt(c.price)}</span></div>${btn}</div>`;
    }).join("") || `<div class="pg-hint">Цветов пока нет</div>`;
  } else {
    title = "Префиксы"; sub = "Покупаются за M, видны рядом с ником";
    cards = d.items.map((p, i) => {
      const eq = d.equipped === p.id;
      let btn;
      if (eq) btn = `<button class="shop-btn on" onclick="shopEquip(null)">Снять</button>`;
      else if (p.owned) btn = `<button class="shop-btn" onclick="shopEquip(${p.id})">Надеть</button>`;
      else btn = `<button class="shop-btn buy" onclick="shopBuy(${p.id})">${fmt(p.price)}</button>`;
      return `<div class="shop-card" style="animation-delay:${i * 0.05}s"><div class="shop-info"><span class="nk-prefix" style="--pc:#FFFFFF">${esc(p.text)}</span>` +
        `<span class="shop-price">${p.owned ? "Куплен" : fmt(p.price)}</span></div>${btn}</div>`;
    }).join("") || `<div class="pg-hint">Префиксов пока нет</div>`;
  }
  openMisc(miscHead(ic("gift", 24), title, sub) +
    `<div class="reg-body"><div class="shop-bal">Баланс: ${fmt(d.balance)}</div>${tabs}${cards}</div>`);
}
function openColorShop() { return openShop(1); }
async function shopColorBuy(hex) {
  if (demo.on) return notify("lose", "Демо", "В демо-режиме нельзя покупать", "—", OK_ITEM);
  try { await api("/api/shop/color/buy", { method: "POST", body: { hex } }); await refreshMeFromServer(); notify("win", "Цвет куплен", "", "", OK_ITEM); openShop(1); }
  catch (e) { notify("lose", "Магазин", "Не получилось", e.message, OK_ITEM); }
}
async function shopColorEquip(hex) {
  try { await api("/api/shop/color/equip", { method: "POST", body: { hex } }); await refreshMeFromServer(); openShop(1); }
  catch (e) { notify("lose", "Магазин", "Не получилось", e.message, OK_ITEM); }
}
async function shopBuy(id) {
  if (demo.on) return notify("lose", "Демо", "В демо-режиме нельзя покупать", "—", OK_ITEM);
  try { await api("/api/shop/buy", { method: "POST", body: { id } }); await refreshMeFromServer(); notify("win", "Префикс куплен", "", "", OK_ITEM); openShop(0); }
  catch (e) { notify("lose", "Магазин", "Не получилось", e.message, OK_ITEM); }
}
async function shopEquip(id) {
  try { await api("/api/shop/equip", { method: "POST", body: { id } }); await refreshMeFromServer(); openShop(0); }
  catch (e) { notify("lose", "Магазин", "Не получилось", e.message, OK_ITEM); }
}
