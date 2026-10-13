/* ===== Ник с префиксом и галочкой, магазин префиксов ===== */
const VERIFIED_BADGE = '<svg class="vbadge" viewBox="0 0 100 100" aria-label="Верифицирован"><circle cx="50" cy="50" r="50" fill="#4FEAFF"/><polyline points="29,50 47.8,68 81,32" fill="none" stroke="#FFFFFF" stroke-width="7.2"/></svg>';

/* Ник в одном месте: префикс-плашка, ник (цвет если выдан), галочка если верифицирован */
function nickHTML(u) {
  const s = (u && u.style) || {};
  const name = esc((u && u.nickname) || "Игрок");
  const pre = s.prefix ? `<span class="nk-prefix" style="--pc:${esc(s.prefix.color)}">${esc(s.prefix.text)}</span>` : "";
  const col = s.nameColor ? ` style="color:${esc(s.nameColor)}"` : "";
  const badge = s.verified ? VERIFIED_BADGE : "";
  return `<span class="nk">${pre}<span class="nk-name"${col}>${name}</span>${badge}</span>`;
}

async function openShop() {
  if (!isLoggedIn()) return openAuth("Войдите, чтобы покупать префиксы");
  let d;
  try { d = await api("/api/shop"); } catch (e) { return notify("lose", "Магазин", "Не получилось", e.message, OK_ITEM); }
  const cards = d.items.map((p, i) => {
    const eq = d.equipped === p.id;
    let btn;
    if (eq) btn = `<button class="shop-btn on" onclick="shopEquip(null)">Снять</button>`;
    else if (p.owned) btn = `<button class="shop-btn" onclick="shopEquip(${p.id})">Надеть</button>`;
    else btn = `<button class="shop-btn buy" onclick="shopBuy(${p.id})">${fmt(p.price)} G</button>`;
    return `<div class="shop-card" style="animation-delay:${i * 0.05}s">
      <div class="shop-info"><span class="nk-prefix" style="--pc:${esc(p.color)}">${esc(p.text)}</span>` +
      `<span class="shop-price">${p.owned ? "Куплен" : fmt(p.price) + " G"}</span></div>${btn}</div>`;
  }).join("") || `<div class="pg-hint">Префиксов пока нет</div>`;
  openMisc(miscHead(ic("gift", 24), "Префиксы", "Покупаются за G, видны рядом с ником") +
    `<div class="reg-body"><div class="shop-bal">Баланс: ${fmt(d.balance)} G</div>${cards}</div>`);
}
async function shopBuy(id) {
  try { await api("/api/shop/buy", { method: "POST", body: { id } }); await refreshMeFromServer(); notify("win", "Префикс куплен", "", "", OK_ITEM); openShop(); }
  catch (e) { notify("lose", "Магазин", "Не получилось", e.message, OK_ITEM); }
}
async function shopEquip(id) {
  try { await api("/api/shop/equip", { method: "POST", body: { id } }); await refreshMeFromServer(); openShop(); }
  catch (e) { notify("lose", "Магазин", "Не получилось", e.message, OK_ITEM); }
}
