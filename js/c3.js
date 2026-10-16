let lastCaseResults = null, lastCaseCost = 0;
async function openCases() {
  if (state.spinning) return;
  if (!demo.on && !isLoggedIn()) { openAuth("Войдите, чтобы открывать кейсы"); return; }
  const c = CASES[cs.sel], n = cs.qty;
  const useFree = !demo.on && state.freeCaseSpins > 0 && n === 1;
  const cost = useFree ? 0 : c.price * n;
  if (!useFree && curBal() < cost) { const b = $("caseBtn"); b.textContent = "Не хватает M"; setTimeout(updateCaseBtn, 1400); return; }
  audioEnsure(); state.spinning = true; spinReset();
  if (useFree) state.freeCaseSpins--;
  const token = ++caseRunToken;
  const results = Array.from({ length: n }, () => pickFromCase(c));
  if (!demo.on) state.balance -= cost;               // итог фиксируем сразу, анимация — только показ
  if (!demo.on) results.forEach(m => state.inventory.push({ ...m, uid: makeUid("u") }));
  /* Бонус: 3+ одинаковых предмета за один спин — бесплатный кейс на будущее */
  const dupCounts = {};
  results.forEach(m => dupCounts[m.id] = (dupCounts[m.id] || 0) + 1);
  const gotFreeSpin = !demo.on && Object.values(dupCounts).some(k => k >= 3);
  if (gotFreeSpin) state.freeCaseSpins = (state.freeCaseSpins || 0) + 1;
  if (!demo.on) { await questEvent({ type: "case", drops: results.map(m => m.id) }); saveGame(); }
  updateHeader(); pulseBalance(); updateCaseBtn(); $("caseResult").innerHTML = "";
  const cols = buildStage(n, results);
  const top = results.reduce((a, b) => a.price > b.price ? a : b);
  const topPct = (c.pool.find(p => p.m.id === top.id) || { w: 0 }).w / c.tot * 100;
  try { mediaPrepare(results.reduce((s, m) => s + m.price, 0) >= cost, top, cost, topPct); } catch (e) {}
  await delay(60);
  await Promise.all(cols.map((col, k) => runCol(col, isFast() ? 750 + k * 70 : 4200 + k * 360, k === 0, token)));
  if (token !== caseRunToken) return;
  try { wheelStop(); } catch (e) {}
  try { mediaPlay(); } catch (e) {}
  cols.forEach((col, k) => {
    const cell = col.track.children[col.WIN];
    cell.classList.add("win");
    /* сейчас лента показывала облегчённую (не-видео) иконку — на итоговой
       выигравшей ячейке подменяем на настоящую интерактивную, с плеером */
    cell.innerHTML = renderIcon(results[k], col.vert ? 40 : 56) + `<span>${esc(results[k].name)}</span>`;
  });
  $("caseStage").classList.add("done");
  await delay(650);
  const worth = results.reduce((s, m) => s + m.price, 0);
  lastCaseResults = results; lastCaseCost = cost;
  $("caseResult").innerHTML = results.map(m => `<div class="res-chip">${renderIcon(m, 34)}<div><div>${esc(m.name)}</div><div style="color:var(--accent)">${fmt(m.price)}</div></div></div>`).join("")
    + `<button class="ghost-btn case-sell-btn" onclick="sellCaseResults()">Продать всё за ${fmt(Math.round(worth * SELL_RATE))}</button>`;
  const subText = "Ценность наград " + fmt(worth) + (gotFreeSpin ? " · +1 бесплатный кейс" : "");
  notify(worth >= cost ? "win" : "lose", n > 1 ? "Открыто кейсов: " + n : results[0].name, subText, (worth >= cost ? "+" : "") + fmt(worth - cost), results[0]);
  state.spinning = false; renderAll(); renderProfile(); updateCaseBtn();
}
function sellCaseResults() {
  if (!lastCaseResults || !lastCaseResults.length) return;
  if (demo.on) {   // демо: предметы в инвентарь не попадают — просто возвращаем их цену на виртуальный баланс
    const t = lastCaseResults.reduce((a, m) => a + sellPrice(m), 0);
    lastCaseResults = null; gAdd(t); $("caseResult").innerHTML = "";
    notify("win", "Продано", "Демо-предметы", "+ " + fmt(t), OK_ITEM);
    return;
  }
  // помечаем ровно те экземпляры, что только что выпали (последние n добавленных с такими id)
  const pool = state.inventory.slice(); const toSell = [];
  lastCaseResults.forEach(m => {
    for (let k = pool.length - 1; k >= 0; k--) {
      if (pool[k].id === m.id && !toSell.includes(pool[k])) { toSell.push(pool[k]); break; }
    }
  });
  const total = toSell.reduce((s, i) => s + sellPrice(i), 0);
  const toSellUids = new Set(toSell.map(i => i.uid));
  state.inventory = state.inventory.filter(i => !toSellUids.has(i.uid));
  state.selectedMemeUids = state.selectedMemeUids.filter(u => !toSellUids.has(u));
  fixSelection();
  state.balance += total;
  lastCaseResults = null;
  saveGame(); renderAll(); renderProfile(); pulseBalance();
  $("caseResult").innerHTML = "";
  notify("win", "Продано", toSell.length + " " + plural(toSell.length, "предмет", "предмета", "предметов"), "+ " + fmt(total), OK_ITEM);
}

/* ---------- КРАФТ ---------- */
const CRAFT_COUNT = 10;   // крафт строго из 10 предметов
const craft = { sel: [] };
/* Следующая редкость для крафта — ближайшая выше, в которой есть хотя бы один предмет (пустые тиры пропускаются). */
function craftNext(r) {
  for (let i = RAR_ORDER.indexOf(r) + 1; i < RAR_ORDER.length; i++) if (MEMES.some(m => m.rarity === RAR_ORDER[i])) return RAR_ORDER[i];
  return null;
}
function craftRarity() { const f = state.inventory.find(i => i.uid === craft.sel[0]); return f ? f.rarity : null; }
function toggleCraft(uid) {
  if (state.spinning) return;
  const it = state.inventory.find(i => i.uid === uid); if (!it) return;
  const k = craft.sel.indexOf(uid);
  if (k >= 0) craft.sel.splice(k, 1);
  else {
    const r = craftRarity();
    if ((r && it.rarity !== r) || !craftNext(it.rarity) || craft.sel.length >= CRAFT_COUNT) return;
    craft.sel.push(uid);
  }
  renderCraft();
}
/* Как и в кейсах: внутри следующего тира дешёвые предметы выпадают чаще —
   поэтому исход не гарантирует прибыль, и это видно по процентам.
   У крафта отдельная (более высокая) комиссия — иначе вложение большого
   числа предметов почти гарантированно давало прибыль («дюп»). */
const CRAFT_EDGE = 0.35;      // комиссия крафта: 35% (была общая HOUSE_EDGE = 5%)
const CRAFT_MAX_W = 0.7;      // потолок шанса на самый дорогой предмет тира
function craftPool(next, stake) {
  // вес предмета — как шанс амгрейда на колесе (stake/price): чем больше вложено (штук и ценой),
  // тем выше шанс получить дорогой предмет тира; для маленькой ставки почти весь вес у дешёвых вещей.
  const items = MEMES.filter(m => m.rarity === next);
  const raw = items.map(m => ({ m, w: Math.max(0.01, Math.min(CRAFT_MAX_W, (stake / m.price) * (1 - CRAFT_EDGE))) }));
  const tot = raw.reduce((s, p) => s + p.w, 0);
  return applyPins(raw.map(p => ({ m: p.m, w: p.w / tot })), globalPins()).sort((a, b) => b.m.price - a.m.price);
}
function craftPick(pool) {
  let r = randomCrypto();
  for (const p of pool) { r -= p.w; if (r <= 0) return p.m; }
  return pool[pool.length - 1].m;
}
function renderCraft(keepOut) {
  craft.sel = craft.sel.filter(u => state.inventory.some(i => i.uid === u));
  const r = craftRarity(), next = r ? craftNext(r) : null;
  const picked = craft.sel.map(u => state.inventory.find(i => i.uid === u));
  const cost = picked.reduce((s, m) => s + m.price, 0);
  $("craftIn").innerHTML = picked.length
    ? `<div class="craft-stack">${picked.slice(0, 3).map(m => renderIcon(m, 46)).join("")}</div><b>×${picked.length}</b><span>${RARITY_RU[r]} · ${fmt(cost)}</span>`
    : `<span>Выберите ровно 10 предметов<br>одной редкости</span>`;
  if (!keepOut) $("craftOut").innerHTML = next
    ? `<div class="craft-q" style="--rc:${getRarityHex(next)}">?</div><span style="color:${getRarityHex(next)}">Случайный: ${RARITY_RU[next]}</span>`
    : `<span>Результат</span>`;
  const ready = picked.length === CRAFT_COUNT;
  const b = $("craftBtn"); b.disabled = !ready || !next || !!state.spinning;
  b.textContent = state.spinning ? "Крафтим…" : (ready || !picked.length ? "Скрафтить" : "Нужно ещё " + (CRAFT_COUNT - picked.length));
  $("craftCount").innerHTML = "Выбрано: " + picked.length + " / " + CRAFT_COUNT + (picked.length ? " · стоимость " + fmt(cost) : "");
  if (next) {
    $("craftOddsLabel").style.display = "";
    const pool = craftPool(next, cost || 1);
    $("craftOdds").innerHTML = pool.map(p => `<div class="pool-item" style="--rc:${getRarityHex(p.m.rarity)}">${renderIcon(p.m, 40)}<div class="pi-n">${esc(p.m.name)}</div><div class="pi-p">${fmtCasePct(p.w * 100)}%</div></div>`).join("");
  } else { $("craftOddsLabel").style.display = "none"; $("craftOdds").innerHTML = ""; }
  const inv = state.inventory.slice().sort((a, b) => RAR_ORDER.indexOf(a.rarity) - RAR_ORDER.indexOf(b.rarity) || a.price - b.price);
  $("craftGrid").innerHTML = inv.length ? inv.map(m => cardHTML(m, {
    selected: craft.sel.includes(m.uid), check: true,
    disabled: !craftNext(m.rarity) || (r && m.rarity !== r), onclick: `toggleCraft('${m.uid}')`
  })).join("") : `<div class="pg-hint" style="grid-column:1/-1">В инвентаре пока пусто — купите предметы в магазине или откройте кейс.</div>`;
}
async function doCraft() {
  if (state.spinning) return;
  craft.sel = craft.sel.filter(u => state.inventory.some(i => i.uid === u));
  if (craft.sel.length !== CRAFT_COUNT) { renderCraft(true); return; }
  const r = craftRarity(), next = craftNext(r); if (!next) return;
  if (craft.sel.some(u => { const it = state.inventory.find(i => i.uid === u); return !it || it.rarity !== r; })) { renderCraft(true); return; }
  const stake = craft.sel.reduce((s, u) => { const it = state.inventory.find(i => i.uid === u); return s + (it ? it.price : 0); }, 0);
  const pool = craftPool(next, stake), win = craftPick(pool);
  audioEnsure(); state.spinning = true; spinReset();
  const used = craft.sel.slice();
  state.inventory = state.inventory.filter(i => !used.includes(i.uid));
  state.inventory.push({ ...win, uid: makeUid("u") });
  const pw = pool.find(p => p.m.id === win.id);
  await questEvent({ type: "upgrade", success: true, chance: pw ? +(pw.w * 100).toFixed(2) : null });
  craft.sel = []; saveGame(); renderCraft(true);
  const out = $("craftOut"), dur = isFast() ? 450 : 1600, s = performance.now();
  while (performance.now() - s < dur && !spinSkip) {
    const m = pool[Math.floor(Math.random() * pool.length)].m;
    out.innerHTML = `<div class="craft-win">${renderIcon(m, 64)}</div>`;
    try { caseTick(); } catch (e) {}
    await delay(70 + ((performance.now() - s) / dur) * 150);
  }
  try { wheelStop(); } catch (e) {}
  out.innerHTML = `<div class="craft-win">${renderIcon(win, 72)}<b>${esc(win.name)}</b><span>${fmt(win.price)}</span></div>`;
  notify("win", "Крафт завершён", win.name, RARITY_RU[next], win);
  state.spinning = false; renderAll(); renderProfile(); renderCraft(true);
}

/* ---------- БОНУСЫ ---------- */
/* ---------- квесты (бывшая вкладка «Бонусы»): ежедневный набор, проверка на сервере ---------- */
const bonus = { data: null, at: 0, msg: "" };
async function loadBonus() {
  clearInterval(bonusTimer);
  if (isLoggedIn()) {
    try { bonus.data = await api("/api/quests"); bonus.at = Date.now(); bonus.msg = ""; } catch (e) { bonus.msg = e.message; }
  }
  renderBonus();
  bonusTimer = setInterval(() => { if (state.screen !== "bonus") return clearInterval(bonusTimer); tickBonus(); }, 1000);
}
function leftText(sec) { sec = Math.max(0, sec); const p = n => String(n).padStart(2, "0"); return p(Math.floor(sec / 3600)) + ":" + p(Math.floor(sec % 3600 / 60)) + ":" + p(sec % 60); }
function renderBonus() {
  const b = $("bonusBody");
  if (!isLoggedIn()) { b.innerHTML = `<div class="bcard"><div class="b-ico">${ic("gift", 22)}</div><div class="b-txt"><b>Квесты</b><span>Войдите, чтобы выполнять квесты и получать награды</span></div></div>`; return; }
  const d = bonus.data;
  if (!d) { b.innerHTML = `<div class="b-msg">${esc(bonus.msg || "Загрузка…")}</div>`; return; }
  const left = d.resetIn - Math.floor((Date.now() - bonus.at) / 1000);
  b.innerHTML = `<div class="b-msg" id="bMsg">${esc(bonus.msg)}</div>
    <div class="pg-sub">Новые квесты через <span id="questLeft">${leftText(left)}</span></div>` +
    (d.quests.length ? d.quests.map(q => {
      const pct = Math.min(100, Math.round(q.progress / q.target * 100));
      let btn;
      if (q.claimed) btn = `<button class="b-btn" disabled>${ic("check", 16)}</button>`;
      else if (q.done) btn = `<button class="b-btn" onclick="questClaim('${q.id}')">+${fmt(q.reward)}</button>`;
      else btn = `<button class="b-btn" disabled>${q.progress}/${q.target}</button>`;
      return `<div class="bcard"><div class="b-ico">${ic("gift", 22)}</div><div class="b-txt"><b>${esc(q.title)}</b><span>Награда <em>+${fmt(q.reward)}</em></span>` +
        `<div style="height:4px;border-radius:2px;background:rgba(255,255,255,.12);margin-top:6px;overflow:hidden"><i style="display:block;height:100%;width:${pct}%;background:var(--accent)"></i></div></div>${btn}</div>`;
    }).join("") : `<div class="pg-hint">Квестов пока нет — загляните позже.</div>`);
}
function tickBonus() {
  const d = bonus.data; if (!d) return;
  const el = $("questLeft"); if (!el) return;
  const left = d.resetIn - Math.floor((Date.now() - bonus.at) / 1000);
  if (left <= 0) return loadBonus();
  el.textContent = leftText(left);
}
async function questClaim(id) {
  const q = bonus.data && bonus.data.quests.find(x => x.id === id);
  try {
    mergeServerUser(await api("/api/quests/" + id + "/claim", { method: "POST" }));
    if (q) q.claimed = true;
    bonus.msg = "";
    notify("win", "Квест выполнен", q ? q.title : "", "+" + fmt(q ? q.reward : 0), OK_ITEM);
  } catch (e) { bonus.msg = e.message; }
  renderBonus();
}
/* Игра сообщает серверу результат кейса/апгрейда: сервер сверяет его с инвентарём и засчитывает прогресс */
async function questEvent(payload) {
  if (!isLoggedIn()) return;
  try {
    await api("/api/quests/event", { method: "POST", body: { ...payload, inventory: state.inventory.map(i => i.id) } });
    if (state.screen === "bonus") loadBonus();
  } catch (e) {}
}
function openExternal(url) {
  const tg = tgApp();
  if (tg && /^https?:\/\/t\.me\//i.test(url) && tg.openTelegramLink) tg.openTelegramLink(url);
  else if (tg && tg.openLink) tg.openLink(url);
  else window.open(url, "_blank", "noopener");
}

