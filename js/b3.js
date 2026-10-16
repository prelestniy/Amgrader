function openMisc(html) { document.getElementById("miscSheet").innerHTML = html; document.getElementById("miscOverlay").classList.add("open"); }
function closeMisc() { document.getElementById("miscOverlay").classList.remove("open"); }
function miscMsg(text, ok) { const el = document.getElementById("miscError"); if (!el) return; el.textContent = text || ""; el.className = "misc-msg" + (ok ? " ok" : ""); }
function miscHead(ico, title, sub) {
  return `<div class="sheet-head"><div class="sheet-badge">${ico}</div><div class="sheet-headtext"><div class="sheet-title">${title}</div><div class="sheet-sub">${sub}</div></div><button class="sheet-close" onclick="closeMisc()">${svgi("close", 20)}</button></div>`;
}

function openPromo() {
  if (!isLoggedIn()) { openAuth("Войдите, чтобы активировать промокод"); return; }
  openMisc(miscHead(ic("gift", 24), "Промокод", "Введите код и получите награду") + `
    <div class="reg-body"><div class="reg-field"><label>Промокод</label>
      <input id="promoInput" type="text" maxlength="32" placeholder="Например, WELCOME" autocapitalize="characters" autocomplete="off" autocorrect="off" spellcheck="false"></div>
      <div class="misc-msg" id="miscError"></div></div>
    <div class="sheet-foot"><button class="primary-btn" id="miscBtn" onclick="submitPromo()">Активировать</button></div>`);
  setTimeout(() => { const i = document.getElementById("promoInput"); if (i) i.focus(); }, 350);
}
async function submitPromo() {
  const code = (document.getElementById("promoInput").value || "").trim();
  if (!code) return miscMsg("Введите промокод");
  const btn = document.getElementById("miscBtn"); btn.disabled = true; miscMsg("");
  try {
    const u = await api("/api/promo/redeem", { method: "POST", body: { code } });
    mergeServerUser(u); closeMisc();
    const r = u.reward || {};
    if (r.type === "item" && getMemeById(r.value)) notify("win", "Промокод активирован", getMemeById(r.value).name, "+ предмет", getMemeById(r.value));
    else notify("win", "Промокод активирован", "Баланс пополнен", "+ " + fmt(r.value || 0), OK_ITEM);
  } catch (e) { btn.disabled = false; miscMsg(e.message); }
}

function copyText(txt, okMsg) {
  const done = () => miscMsg(okMsg, true);
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, () => miscMsg("Не удалось скопировать"));
  else { const ta = document.createElement("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (e) { miscMsg("Не удалось скопировать"); } ta.remove(); }
}
function refLink() { const c = state.profile.referralCode; return apiCfg.botUsername ? `https://t.me/${apiCfg.botUsername}?start=ref_${c}` : ""; }

function openReferral() {
  if (!isLoggedIn()) { openAuth("Войдите, чтобы получить реферальный код"); return; }
  const p = state.profile, link = refLink();
  const bonus = apiCfg.referrerBonus ? `За каждого друга вы получите +${fmt(apiCfg.referrerBonus)}, а он — +${fmt(apiCfg.refereeBonus)}.` : "";
  const applyBlock = p.referredBy ? `<div class="misc-hint">${ic("check", 14)} Вы уже использовали чужой реферальный код.</div>` : `
      <div class="reg-field"><label>Есть код друга?</label>
        <input id="refInput" type="text" maxlength="16" placeholder="Введите код" autocapitalize="characters" autocomplete="off" autocorrect="off" spellcheck="false"></div>
      <button class="ghost-btn" onclick="applyReferral()">Применить код</button>`;
  openMisc(miscHead(ic("users", 24), "Реферальный код", "Приглашайте друзей и получайте G") + `
    <div class="reg-body">
      <div class="code-box"><b>${esc(p.referralCode || "—")}</b></div>
      <div class="misc-btns">
        <button class="ghost-btn" onclick="copyText(state.profile.referralCode, 'Код скопирован')">Копировать код</button>
        <button class="ghost-btn" ${link ? "" : "disabled"} onclick="shareRef()">Поделиться</button>
      </div>
      <div class="misc-hint">${bonus}</div>
      ${applyBlock}
      <div class="misc-msg" id="miscError"></div>
    </div>`);
}
function shareRef() {
  const link = refLink(); if (!link) return;
  const tg = tgApp();
  if (tg && tg.openTelegramLink) tg.openTelegramLink("https://t.me/share/url?url=" + encodeURIComponent(link) + "&text=" + encodeURIComponent("Залетай в Amgrader — амгрейды предметов!"));
  else copyText(link, "Ссылка скопирована");
}
async function applyReferral() {
  const code = (document.getElementById("refInput").value || "").trim();
  if (!code) return miscMsg("Введите код");
  try {
    const u = await api("/api/referral/apply", { method: "POST", body: { code } });
    mergeServerUser(u); openReferral(); miscMsg("Код применён — бонус начислен!", true);
  } catch (e) { miscMsg(e.message); }
}
let cpCount = 2;
function openCreatePromo() {
  if (!isLoggedIn()) { openAuth("Войдите, чтобы создать промокод"); return; }
  cpCount = 2;
  openMisc(miscHead(ic("gift", 24), "Свой промокод", "Один код — несколько активаций") + `
    <div class="reg-body">
      <div class="reg-field"><label>Сумма за одну активацию</label>
        <input id="cpAmount" type="number" inputmode="numeric" min="1" placeholder="Например, 5000"></div>
      <div class="reg-field"><label>Количество активаций</label>
        <div class="count-row">
          <button onclick="cpStep(-1)">${svgi("minus", 18)}</button><b id="cpCountVal">${cpCount}</b><button onclick="cpStep(1)">${svgi("plus", 18)}</button>
        </div></div>
      <button class="ghost-btn" onclick="openMyPromos()">Мои промокоды</button>
      <div class="misc-hint" id="cpTotal">Спишется 0 M с вашего баланса (${fmt(state.balance)} доступно)</div>
      <div class="misc-msg" id="miscError"></div>
    </div>
    <div class="sheet-foot"><button class="primary-btn" id="miscBtn" onclick="submitCreatePromo()">Создать</button></div>`);
  const inp = document.getElementById("cpAmount");
  inp.addEventListener("input", cpUpdateTotal);
  setTimeout(() => inp.focus(), 350);
}
function cpStep(d) {
  cpCount = Math.min(10, Math.max(1, cpCount + d));
  const el = document.getElementById("cpCountVal"); if (el) el.textContent = cpCount;
  cpUpdateTotal();
}
function cpUpdateTotal() {
  const amount = parseInt(document.getElementById("cpAmount").value, 10) || 0;
  const total = amount * cpCount;
  const el = document.getElementById("cpTotal"); if (!el) return;
  el.innerHTML = `Спишется ${fmt(total)} с вашего баланса (${fmt(state.balance)} доступно)`;
  el.classList.toggle("bad", total > state.balance || amount <= 0);
}
async function submitCreatePromo() {
  const amount = parseInt(document.getElementById("cpAmount").value, 10) || 0;
  if (amount <= 0) return miscMsg("Укажите сумму на промокод");
  if (amount * cpCount > state.balance) return miscMsg("Недостаточно баланса");
  const btn = document.getElementById("miscBtn"); btn.disabled = true; miscMsg("");
  try {
    const u = await api("/api/promo/create", { method: "POST", body: { amount, count: cpCount } });
    mergeServerUser(u); closeMisc();
    renderCreatedPromoCodes(u.codes || [], u.amount || amount, u.count || cpCount);
  } catch (e) { btn.disabled = false; miscMsg(e.message); }
}
function renderCreatedPromoCodes(codes, amount, count) {
  const code = codes[0] || "";
  const n = count || 1;
  openMisc(miscHead(ic("gift", 24), "Готово!", `${fmt(amount)} за активацию · ${n} акт.`) + `
    <div class="reg-body">
      <div class="code-list"><div class="code-box"><b>${esc(code)}</b></div></div>
      <div class="misc-hint">Отправьте код друзьям — каждый введёт его в разделе «Промокод» и получит ${fmt(amount)}. Код сработает ${n} ${plural(n, "раз", "раза", "раз")}, по одному разу на человека.</div>
      <div class="misc-msg" id="miscError"></div>
      <button class="ghost-btn" onclick="openMyPromos()">Мои промокоды</button>
    </div>
    <div class="sheet-foot"><button class="primary-btn" onclick="copyText('${esc(code)}','Код скопирован')">Копировать код</button></div>`);
  notify("win", "Промокод создан", `${n} × ${fmt(amount)}`, "готово к отправке", OK_ITEM);
}
async function openMyPromos() {
  if (!isLoggedIn()) { openAuth("Войдите, чтобы увидеть свои промокоды"); return; }
  openMisc(miscHead(ic("gift", 24), "Мои промокоды", "История созданных вами кодов") + `<div class="reg-body"><div class="misc-hint">Загрузка…</div></div>`);
  let list = [];
  try { list = (await api("/api/promo/mine")).promos || []; }
  catch (e) { openMisc(miscHead(ic("gift", 24), "Мои промокоды", "История созданных вами кодов") + `<div class="reg-body"><div class="misc-msg" id="miscError"></div></div>`); miscMsg(e.message); return; }
  const rows = list.map(p => {
    const on = !!p.active;
    const badge = `<span class="promo-badge ${on ? "on" : "off"}">${on ? "Активен" : "Неактивен"}</span>`;
    const st = on ? "" : (p.status === "exhausted" ? " · исчерпан" : " · отключён");
    return `<div class="promo-row">
      <div class="promo-main"><b>${esc(p.code)}</b>${badge}</div>
      <div class="promo-sub">${fmt(p.amount)} · использовано ${p.usedCount}/${p.maxUses}${st}</div>
      <button class="ghost-btn" style="padding:6px 10px" onclick="copyText('${esc(p.code)}','Код скопирован')">Копировать</button>
    </div>`;
  }).join("");
  openMisc(miscHead(ic("gift", 24), "Мои промокоды", "История созданных вами кодов") + `
    <div class="reg-body">
      ${rows || `<div class="misc-hint">Вы пока не создавали промокодов.</div>`}
      <div class="misc-msg" id="miscError"></div>
    </div>
    <div class="sheet-foot"><button class="primary-btn" onclick="openCreatePromo()">Создать промокод</button></div>`);
}
document.getElementById("miscOverlay").addEventListener("click", e => { if (e.target === e.currentTarget) closeMisc(); });

/* ---------- запуск ---------- */
async function init() {
  state.targets = MEMES.map(m => ({ ...m, uid: "t_" + m.id }));
  resetGuestState(); loadGame(); renderAll(); renderProfile();
  loadTopBalances();
  try { selfTest(); } catch (e) {}
  const tg = tgApp();
  if (tg) { try { tg.ready(); tg.expand(); setupTgFullscreen(); } catch (e) {} }
  try { apiCfg = await api("/api/config"); applyCasePrices(); } catch (e) {}
  if (!apiCfg.botUsername) setTimeout(async () => { try { apiCfg = await api("/api/config"); applyCasePrices(); } catch (e) {} }, 4000);
  try {
    let done = false;
    let tk = getToken();
    if (!tk && tg) { tk = await tgCloudGet(TOKEN_KEY); if (tk) { try { localStorage.setItem(TOKEN_KEY, tk); } catch (e) {} } }
    if (tk) {
      try { applyServerUser(await api("/api/me")); done = true; }
      catch (e) {
        if (e.status === 401) setToken("");
        else { try { applyServerUser(await api("/api/me")); done = true; } catch (e2) { /* сеть недоступна — токен не трогаем, попробуем в след. раз */ } }
      }
    }
    if (!done && tg && tg.initData) await telegramLoginRequest();
  } catch (e) { /* остаёмся гостем */ }
  renderAll(); renderProfile();
  setInterval(syncFromServer, 15000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) syncFromServer(); });
}
init();

/* ============================================================
   ВИДЕО-РЕАКЦИИ НА РЕЗУЛЬТАТ (зелёный фон вырезается на лету)
   Файлы лежат в папке videos/ рядом с app.py (можно и в корне).
   ============================================================ */
const SFX = {
  dir: "/videos/",
  // победа: (шанс до N %) -> файл. 21–29% отдельного видео нет — идёт «30-50%».
  win: [[5, "0-5%.mp4"], [10, "6-10%.mp4"], [20, "11-20%.mp4"], [50, "30-50%.mp4"], [100, "50-100%.mp4"]],
  bigWin: "крупная победа.mp4",   // выигранный предмет стоит >= bigPrice
  lose: "проигрыш.mp4",
  bigLose: "крупный проигрыш.mp4", // сгоревшая ставка >= bigPrice
  closeLose: "бляять.mp4",        // был большой шанс выиграть, но проиграл
  closeLoseChance: 70,            // от какого % шанса считать это «почти выиграл»
  bigPrice: 1000
};
const sfx = { on: true, blobs: {}, video: null, stage: null, canvas: null, ctx: null, work: null, wctx: null,
  pending: null, playing: false, raf: 0, guard: 0 };
try { sfx.on = localStorage.getItem("amg_sfx") !== "0"; } catch (e) {}

function sfxName(win, chance, tgtPrice, stake) {
  if (win) {
    if (tgtPrice >= SFX.bigPrice) return SFX.bigWin;
    for (const [max, file] of SFX.win) if (chance <= max) return file;
    return SFX.win[SFX.win.length - 1][1];
  }
  if (chance >= SFX.closeLoseChance) return SFX.closeLose;
  return stake >= SFX.bigPrice ? SFX.bigLose : SFX.lose;
}
function sfxAllNames() { return [...SFX.win.map(w => w[1]), SFX.bigWin, SFX.lose, SFX.bigLose, SFX.closeLose]; }

/* качаем целиком в память: так работает и на iOS (там нужны Range-запросы) */
async function sfxLoad(name) {
  if (sfx.blobs[name]) return sfx.blobs[name];
  try {
    const r = await fetch(SFX.dir + encodeURIComponent(name));
    if (!r.ok) return null;
    return (sfx.blobs[name] = URL.createObjectURL(await r.blob()));
  } catch (e) { return null; }
}
async function sfxPreloadAll() { for (const n of sfxAllNames()) await sfxLoad(n); }

function sfxEnsureDom() {
  if (sfx.video) return;
  const st = document.createElement("div"); st.id = "sfxStage";
  const cv = document.createElement("canvas"); st.appendChild(cv);
  const v = document.createElement("video");
  v.id = "sfxVideo"; v.setAttribute("playsinline", ""); v.setAttribute("webkit-playsinline", ""); v.preload = "auto";
  v.addEventListener("ended", sfxStop);
  document.body.appendChild(st); document.body.appendChild(v);
  sfx.stage = st; sfx.canvas = cv; sfx.ctx = cv.getContext("2d");
  sfx.work = document.createElement("canvas"); sfx.wctx = sfx.work.getContext("2d", { willReadFrequently: true });
  sfx.video = v;
  try { audioAttachVideo(v); } catch (e) {}
}

/* Вызывается в момент нажатия «Амгрейд» (жест пользователя) — «разблокирует» звук */
function mediaPrepare(win, tgt, stake, chance) {
  try { audioEnsure(); } catch (e) {}
  sfxStop(); sfx.pending = null;
  if (!sfx.on) return;
  const name = sfxName(win, chance, tgt.price, stake);
  sfxEnsureDom();
  const v = sfx.video; sfx.pending = name;
  v.muted = false; v.volume = aud.vsrc ? 1 : sfx.vol.video;
  v.src = sfx.blobs[name] || (SFX.dir + encodeURIComponent(name));
  v.load();
  const p = v.play();
  if (p && p.then) p.then(() => { if (!sfx.playing) { v.pause(); v.currentTime = 0; } }).catch(() => {});
  if (!sfx.blobs[name]) sfxLoad(name);
}

/* Вызывается, когда указатель остановился */
function mediaPlay() {
  const v = sfx.video;
  if (!sfx.pending || !sfx.on || !v) return;
  sfx.playing = true;
  v.currentTime = 0; v.muted = false; v.volume = aud.vsrc ? 1 : sfx.vol.video;
  const go = () => {
    const p = v.play();
    if (p && p.catch) p.catch(() => { v.muted = true; v.play().catch(sfxStop); }); // звук заблокирован — хотя бы картинка
  };
  go();
  sfx.stage.classList.add("show");
  sfx.guard = setTimeout(sfxStop, 12000);
  sfxFrame();
}
function sfxStop() {
  sfx.playing = false; sfx.pending = null;
  cancelAnimationFrame(sfx.raf); clearTimeout(sfx.guard);
  if (sfx.stage) sfx.stage.classList.remove("show");
  if (sfx.video) { try { sfx.video.pause(); } catch (e) {} }
}
function sfxFrame() {
  if (!sfx.playing) return;
  const v = sfx.video;
  if (v.videoWidth && v.readyState >= 2) {
    const k = Math.min(1, 480 / Math.max(v.videoWidth, v.videoHeight));
    const w = Math.round(v.videoWidth * k), h = Math.round(v.videoHeight * k);
    if (sfx.canvas.width !== w) { sfx.canvas.width = sfx.work.width = w; sfx.canvas.height = sfx.work.height = h; }
    sfx.wctx.drawImage(v, 0, 0, w, h);
    const img = sfx.wctx.getImageData(0, 0, w, h), d = img.data;
    /* Раньше зелёный считался только по разнице «G минус макс(R,B)» с порогом 22 —
       это ловит яркий сочный хромакей, но пропускает тёмный/приглушённый зелёный
       (студийный свет, компрессия видео). Добавлена вторая проверка — «зелёный
       доминирует над обоими каналами хотя бы на 10%» — она ловит более тусклые
       оттенки, а порог полной прозрачности и сама «зона» смягчения снижены,
       чтобы съедать фон агрессивнее. */
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2], m = r > b ? r : b, diff = g - m;
      const dominant = g > 25 && r < g * 0.9 && b < g * 0.9;
      if (diff > 12 || dominant) {
        const score = Math.max(diff, dominant ? (g - Math.max(r, b) * 0.9) : 0);
        const a = score >= 55 ? 0 : 1 - Math.max(0, score - 12) / 43;   // плавный край
        d[i + 3] = Math.max(0, Math.min(255, a * 255)); d[i + 1] = m;   // убираем зелёный ореол
      }
    }
    sfx.ctx.putImageData(img, 0, 0);
  }
  sfx.raf = requestAnimationFrame(sfxFrame);
}

function sfxLabel() { const el = document.getElementById("sfxRowLabel"); if (el) el.textContent = "Звуки и видео: " + (sfx.on ? "вкл" : "выкл"); }
function toggleSfx() {
  sfx.on = !sfx.on; try { localStorage.setItem("amg_sfx", sfx.on ? "1" : "0"); } catch (e) {}
  if (!sfx.on) sfxStop();
  sfxLabel();
}
sfxLabel();
setTimeout(sfxPreloadAll, 2500);

/* ============================================================
   ЗВУК КОЛЕСА, ГРОМКОСТЬ, БЫСТРАЯ АНИМАЦИЯ
   ============================================================ */
const aud = { ac: null, wg: null, vg: null, vsrc: null, lastK: null, lastT: 0 };
let fastMode = false, spinSkip = false;
try { fastMode = localStorage.getItem("amg_fast") === "1"; } catch (e) {}
sfx.vol = { wheel: 0.7, video: 1 };
try {
  const w = localStorage.getItem("amg_vol_wheel"), v = localStorage.getItem("amg_vol_video");
  if (w !== null && !isNaN(+w)) sfx.vol.wheel = Math.max(0, Math.min(1, +w));
  if (v !== null && !isNaN(+v)) sfx.vol.video = Math.max(0, Math.min(1, +v));
} catch (e) {}

function audioEnsure() {
  if (!aud.ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    aud.ac = new AC();
    aud.wg = aud.ac.createGain(); aud.wg.connect(aud.ac.destination);
    aud.vg = aud.ac.createGain(); aud.vg.connect(aud.ac.destination);
    applyVolumes();
  }
  if (aud.ac.state === "suspended") aud.ac.resume();
}
/* видео пускаем через GainNode — так громкость работает и на iPhone */
function audioAttachVideo(v) {
  if (!aud.ac || aud.vsrc) return;
  try { aud.vsrc = aud.ac.createMediaElementSource(v); aud.vsrc.connect(aud.vg); } catch (e) { aud.vsrc = null; }
  applyVolumes();
}
function applyVolumes() {
  if (aud.wg) aud.wg.gain.value = sfx.vol.wheel;
  if (aud.vg) aud.vg.gain.value = sfx.vol.video;
  if (sfx.video && !aud.vsrc) sfx.video.volume = sfx.vol.video;
}

function isFast() { return fastMode; }
function spinReset() { spinSkip = false; aud.lastK = null; }
function refreshFastUI() {
  document.querySelectorAll(".fast-btn").forEach(b => b.classList.toggle("on", fastMode));
  const t = document.getElementById("fastToggleBtn"); if (t) t.textContent = "Быстрая анимация: " + (fastMode ? "вкл" : "выкл");
}
function toggleFast(fromSheet) {
  if (state.spinning && !fromSheet) { spinSkip = true; return; }   // во время спина — пропустить анимацию
  fastMode = !fastMode;
  try { localStorage.setItem("amg_fast", fastMode ? "1" : "0"); } catch (e) {}
  refreshFastUI();
}

