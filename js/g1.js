/* ===== Колесо бонусов: разметка 8 секторов, анимация Web Animations (композитор), тики по секторам ===== */
const WHEEL_SECTORS = 8;
const WHEEL_STEP = 360 / WHEEL_SECTORS;      // 45°
const WHEEL_TICK_OFFSET = WHEEL_STEP / 2;    // разделители стоят между секторами
const wheelUI = { busy: false, angle: 0 };
let wheelReadyAt = Infinity;                 // мс: когда снова можно крутить (Infinity — ещё не узнали)

function wheelEase(t) { return 1 - Math.pow(1 - t, 4); }   // быстрый старт, плавная остановка

function wheelBuild() {
  const disc = document.getElementById("whDisc");
  if (!disc || disc.dataset.ready) return;
  disc.innerHTML = `<svg viewBox="0 0 320 320" aria-hidden="true"><circle cx="160" cy="160" r="137" style="fill:var(--surface-2);stroke:var(--border-hi);stroke-width:2"/><g style="stroke:var(--border-hi);stroke-width:2.5;stroke-linecap:round"><line x1="160" y1="160" x2="212.43" y2="33.43"/><line x1="160" y1="160" x2="286.57" y2="107.57"/><line x1="160" y1="160" x2="286.57" y2="212.43"/><line x1="160" y1="160" x2="212.43" y2="286.57"/><line x1="160" y1="160" x2="107.57" y2="286.57"/><line x1="160" y1="160" x2="33.43" y2="212.43"/><line x1="160" y1="160" x2="33.43" y2="107.57"/><line x1="160" y1="160" x2="107.57" y2="33.43"/></g></svg>`;
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

async function initWheel() {
  wheelBuild();
  const disc = document.getElementById("whDisc");
  if (disc) disc.style.transform = wheelRotationFor(wheelUI.angle);
  wheelSetMsg("");
  if (!isLoggedIn()) { wheelReadyAt = Infinity; wheelSetMsg("Войдите, чтобы крутить колесо"); wheelRenderTimer(); return; }
  try { wheelSetReadyIn((await api("/api/wheel")).secondsLeft); } catch (e) { wheelSetMsg(e.message); }
}

async function wheelSpin() {
  if (wheelUI.busy) return;
  if (!isLoggedIn()) { openAuth("Войдите, чтобы крутить колесо"); return; }
  if (Date.now() < wheelReadyAt) return;
  wheelUI.busy = true; wheelSetBtn(); wheelSetMsg("");
  try { audioEnsure(); } catch (e) {}

  let res;
  try { res = await api("/api/wheel/spin", { method: "POST" }); }
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
