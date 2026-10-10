/* ===== Колесо бонусов: разметка 8 секторов, анимация Web Animations (композитор), тики по секторам ===== */
const WHEEL_SECTORS = 8;
const WHEEL_STEP = 360 / WHEEL_SECTORS;      // 45°
const WHEEL_TICK_OFFSET = WHEEL_STEP / 2;    // разделители стоят между секторами
const wheelUI = { busy: false, angle: 0 };
let wheelReadyAt = Infinity;                 // мс: когда снова можно крутить (Infinity — ещё не узнали)

function wheelEase(t) { return 1 - Math.pow(1 - t, 4); }   // быстрый старт, плавная остановка

let wheelLabelsNow = null;   // текущие 8 призов по секторам (или null — ещё не получено)
function wheelSvgHtml(list) {
  const R = 137 * 0.6;
  const lines = [];
  for (let k = 0; k < WHEEL_SECTORS; k++) {
    const a = (k * WHEEL_STEP + WHEEL_STEP / 2) * Math.PI / 180;
    lines.push(`<line x1="160" y1="160" x2="${(160 + 137 * Math.sin(a)).toFixed(2)}" y2="${(160 - 137 * Math.cos(a)).toFixed(2)}"/>`);
  }
  const labels = (list || []).map((p, k) => {
    const a = k * WHEEL_STEP, rad = a * Math.PI / 180;
    const x = 160 + R * Math.sin(rad), y = 160 - R * Math.cos(rad);
    const isG = p.type === "g";
    const text = isG ? `+${p.amount}G` : esc(String(p.name || "").slice(0, 10));
    return `<text transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a - 90})" text-anchor="middle" dominant-baseline="middle" ` +
      `style="fill:var(--text);font:800 ${isG ? 14 : 11}px Arteks,Manrope,system-ui,sans-serif">${text}</text>`;
  }).join("");
  return `<svg viewBox="0 0 320 320" aria-hidden="true">` +
    `<circle cx="160" cy="160" r="137" style="fill:var(--surface-2);stroke:var(--border-hi);stroke-width:2"/>` +
    `<g style="stroke:var(--border-hi);stroke-width:2.5;stroke-linecap:round">${lines.join("")}</g>` +
    `<g>${labels}</g></svg>`;
}
function wheelBuild() {
  const disc = document.getElementById("whDisc");
  if (!disc) return;
  disc.innerHTML = wheelSvgHtml(wheelLabelsNow);
  disc.dataset.ready = "1";
}

function wheelRotationFor(angle) { return `rotate(${angle}deg)`; }

/* Кадры считаются по той же кривой, что и тики — звук совпадает с картинкой */
function wheelFrames(from, to) {
  const N = 120, frames = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    frames.push({ offset: t, transform: wheelRotationFor(from + (to - from) * wheelEase(t)) });
  }
  return frames;
}

/* Моменты, когда указатель проходит разделитель между секторами */
function wheelTickTimes(from, to, dur) {
  const times = [];
  const idx = a => Math.floor((a + WHEEL_TICK_OFFSET) / WHEEL_STEP);
  let last = idx(from);
  for (let t = 0; t <= dur; t += 4) {
    const cur = idx(from + (to - from) * wheelEase(t / dur));
    if (cur !== last) { times.push(t); last = cur; }
  }
  return times;
}

/* Подписи призов на секторах (радиально, как на макете). list — 8 призов по секторам */
function wheelDrawLabels(list) {
  if (!list || !list.length) return;
  wheelLabelsNow = list;
  const disc = document.getElementById("whDisc");
  if (!disc) return;
  disc.innerHTML = wheelSvgHtml(list);
  disc.dataset.ready = "1";
}
/* До первой прокрутки подписи — случайная выборка из того, что может выпасть (только для вида) */
function wheelPreviewLabels(p) {
  if (!p) return;
  const pool = (p.g || []).map(v => ({ type: "g", amount: v })).concat((p.items || []).map(i => ({ type: "item", name: i.name })));
  if (!pool.length || wheelLabelsNow) return;
  const list = [];
  for (let k = 0; k < WHEEL_SECTORS; k++) list.push(pool[Math.floor(Math.random() * pool.length)]);
  wheelDrawLabels(list);
}
function wheelSetMsg(text) { const m = document.getElementById("whMsg"); if (m) m.textContent = text; }
function wheelSetBtn() {
  const b = document.getElementById("whBtn");
  if (b) b.disabled = wheelUI.busy || Date.now() < wheelReadyAt;
}
function wheelPlayTick(freq, vol) {
  if (!sfx.on || !aud.ac || aud.ac.state !== "running" || sfx.vol.wheel <= 0) return;
  tickSound(aud.ac.currentTime, freq, vol);
}

/* Таймер до следующей прокрутки (обновляется раз в секунду) */
function wheelRenderTimer() {
  const el = document.getElementById("whTimer");
  if (el) {
    const left = Math.max(0, Math.ceil((wheelReadyAt - Date.now()) / 1000));
    el.textContent = !isFinite(wheelReadyAt) ? "" : left > 0 ? "Следующая прокрутка через " + leftText(left) : "Колесо готово";
  }
  wheelSetBtn();
}
setInterval(wheelRenderTimer, 1000);

function wheelSetReadyIn(secs) { wheelReadyAt = Date.now() + secs * 1000; wheelRenderTimer(); }

function wheelRenderPrizes(p) {
  const el = document.getElementById("whPrizes");
  if (!el || !p) return;
  const gs = (p.g || []).map(v => `<span class="wh-chip gold">${fmt(v)}</span>`).join("");
  const its = (p.items || []).map(i => `<span class="wh-chip">${esc(i.name)}</span>`).join("");
  el.innerHTML = `<div class="wh-ph">Может выпасть</div><div class="wh-chips">${gs}${its}</div>`;
}
async function initWheel() {
  wheelBuild();
  const disc = document.getElementById("whDisc");
  if (disc) disc.style.transform = wheelRotationFor(wheelUI.angle);
  wheelSetMsg("");
  if (!isLoggedIn()) { wheelReadyAt = Infinity; wheelSetMsg("Войдите, чтобы крутить колесо"); wheelRenderTimer(); return; }
  try {
    const s = await api("/api/wheel");
    wheelSetReadyIn(s.secondsLeft);
    wheelRenderPrizes(s.prizes);
    if (!wheelLabelsNow) wheelPreviewLabels(s.prizes);
  } catch (e) { wheelSetMsg(e.message); }
}

async function wheelSpin() {
  if (wheelUI.busy) return;
  if (!isLoggedIn()) { openAuth("Войдите, чтобы крутить колесо"); return; }
  if (Date.now() < wheelReadyAt) return;
  wheelUI.busy = true; wheelSetBtn(); wheelSetMsg("");
  try { audioEnsure(); } catch (e) {}

  let res;
  try { res = await api("/api/wheel/spin", { method: "POST" }); if (res.layout) wheelDrawLabels(res.layout); }
  catch (e) { wheelUI.busy = false; wheelSetMsg(e.message); initWheel(); return; }

  const disc = document.getElementById("whDisc");
  wheelBuild();
  const sector = res.sector;
  const turns = isFast() ? 2 : 5 + Math.floor(Math.random() * 2);
  const from = wheelUI.angle;
  const back = (360 - sector * WHEEL_STEP) % 360;             // поворот, чтобы центр сектора встал наверху
  let to = Math.floor(from / 360) * 360 + turns * 360 + back;
  while (to <= from) to += 360;
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dur = isFast() ? 900 : (reduce ? 500 : 3800);

  const timers = wheelTickTimes(from, to, dur).map(t =>
    setTimeout(() => wheelPlayTick(900 + Math.random() * 60, 0.5), t));

  const anim = disc.animate(wheelFrames(from, to), { duration: dur, easing: "linear", fill: "forwards" });
  anim.onfinish = () => {
    disc.style.transform = wheelRotationFor(to);
    anim.cancel();
    wheelUI.angle = to;
    timers.forEach(clearTimeout);
    try { wheelStop(); } catch (e) {}
    mergeServerUser(res.user);
    wheelUI.busy = false;
    wheelSetReadyIn(res.secondsLeft);
    const p = res.prize;
    if (p.type === "g") {
      wheelSetMsg(`+${fmt(p.amount)} G`);
      notify("win", "Колесо бонусов", "Награда получена", "+" + fmt(p.amount), OK_ITEM);
    } else {
      const m = (typeof MEMES !== "undefined" && MEMES.find(x => x.id === p.id)) || { name: p.name, rarity: p.rarity, icon: "" };
      wheelSetMsg(`Выпал предмет: ${p.name}`);
      notify("win", "Колесо бонусов", "Предмет в инвентаре", p.name, m);
    }
  };
}