/* ################ data.js ################ */
/* ============================================================
   ИНСТРУКЦИЯ ПО ИКОНКАМ:
   Чтобы добавить иконку предмету — заполни поле icon у нужного
   объекта в MEMES (URL картинки или строка "<svg…>").
   Если icon === null, будет показана заглушка с первой буквой.
   ============================================================ */

const MEMES = [
  { id: 1, name: "67", nameEn: "", rarity: "common", price: 8, video: "67.mp4" },
  { id: 2, name: "Ааа", nameEn: "", rarity: "common", price: 9, video: "ааа.mp4" },
  { id: 3, name: "Амамам", nameEn: "", rarity: "common", price: 10, video: "амамам.mp4" },
  { id: 4, name: "Ахаха Это Пиздец", nameEn: "", rarity: "common", price: 12, video: "ахаха_это_пиздец.mp4" },
  { id: 5, name: "Бем Бем Бурмалда", nameEn: "", rarity: "common", price: 13, video: "бем_бем_бурмалда.mp4" },
  { id: 6, name: "Бембем", nameEn: "", rarity: "common", price: 14, video: "бембем.mp4" },
  { id: 7, name: "Блогер Меллстрой", nameEn: "", rarity: "common", price: 15, video: "блогер_меллстрой.mp4" },
  { id: 8, name: "Бля Прикольно", nameEn: "", rarity: "common", price: 16, video: "бля_прикольно.mp4" },
  { id: 9, name: "Блять Есть", nameEn: "", rarity: "common", price: 18, video: "блять_есть.mp4" },
  { id: 10, name: "Вроде Да А Вроде Нет", nameEn: "", rarity: "common", price: 19, video: "вроде_да_а_вроде_нет.mp4" },
  { id: 11, name: "Денс Денс", nameEn: "", rarity: "common", price: 20, video: "денс_денс.mp4" },
  { id: 12, name: "Ебать", nameEn: "", rarity: "rare", price: 24, video: "ебать.mp4" },
  { id: 13, name: "Ебать Мой Хуй", nameEn: "", rarity: "rare", price: 28, video: "ебать_мой_хуй.mp4" },
  { id: 14, name: "Завтра Завтра", nameEn: "", rarity: "rare", price: 32, video: "завтра_завтра.mp4" },
  { id: 15, name: "Красность", nameEn: "", rarity: "rare", price: 36, video: "красность.mp4" },
  { id: 16, name: "Кто Лучший", nameEn: "", rarity: "rare", price: 39, video: "кто_лучший.mp4" },
  { id: 17, name: "Меллстрой У Кошечки", nameEn: "", rarity: "rare", price: 43, video: "меллстрой_у_кошечки.mp4" },
  { id: 18, name: "На Лодочке", nameEn: "", rarity: "rare", price: 47, video: "на_лодочке.mp4" },
  { id: 19, name: "Наконец То", nameEn: "", rarity: "rare", price: 51, video: "наконец_то.mp4" },
  { id: 20, name: "Не Успел", nameEn: "", rarity: "rare", price: 55, video: "не_успел.mp4" },
  { id: 21, name: "Обидно Блять", nameEn: "", rarity: "rare", price: 58, video: "обидно_блять.mp4" },
  { id: 22, name: "Ода Детка", nameEn: "", rarity: "rare", price: 62, video: "ода_детка.mp4" },
  { id: 23, name: "Один Банан", nameEn: "", rarity: "rare", price: 66, video: "один_банан.mp4" },
  { id: 24, name: "Ой Ой Ой", nameEn: "", rarity: "rare", price: 70, video: "ой_ой_ой.mp4" },
  { id: 25, name: "Омайгад", nameEn: "", rarity: "epic", price: 100, video: "омайгад.mp4" },
  { id: 26, name: "Ох Бля", nameEn: "", rarity: "epic", price: 111, video: "ох_бля.mp4" },
  { id: 27, name: "Подразбить Бы", nameEn: "", rarity: "epic", price: 122, video: "подразбить_бы.mp4" },
  { id: 28, name: "Пожалуйста Дай", nameEn: "", rarity: "epic", price: 133, video: "пожалуйста_дай.mp4" },
  { id: 29, name: "Прикольно", nameEn: "", rarity: "epic", price: 144, video: "прикольно.mp4" },
  { id: 30, name: "Психопат", nameEn: "", rarity: "epic", price: 155, video: "психопат.mp4" },
  { id: 31, name: "Раз В День Пукать", nameEn: "", rarity: "epic", price: 166, video: "раз_в_день_пукать.mp4" },
  { id: 32, name: "Реально Красавчик", nameEn: "", rarity: "epic", price: 177, video: "реально_красавчик.mp4" },
  { id: 33, name: "Сливы И Яблоко Одно", nameEn: "", rarity: "epic", price: 188, video: "сливы_и_яблоко_одно.mp4" },
  { id: 34, name: "Спит", nameEn: "", rarity: "epic", price: 199, video: "спит.mp4" },
  { id: 35, name: "Тарас Бульба", nameEn: "", rarity: "epic", price: 210, video: "тарас_бульба.mp4" },
  { id: 36, name: "Темный Друн", nameEn: "", rarity: "legendary", price: 320, video: "темный_друн.mp4" },
  { id: 37, name: "Ты Блять Долбаеб Нахуй", nameEn: "", rarity: "legendary", price: 396, video: "ты_блять_долбаеб_нахуй.mp4" },
  { id: 38, name: "Ты Просто Босс", nameEn: "", rarity: "legendary", price: 471, video: "ты_просто_босс.mp4" },
  { id: 39, name: "Уааа", nameEn: "", rarity: "legendary", price: 547, video: "уааа.mp4" },
  { id: 40, name: "Убить Всех", nameEn: "", rarity: "legendary", price: 623, video: "убить_всех.mp4" },
  { id: 41, name: "Улыбается", nameEn: "", rarity: "legendary", price: 699, video: "улыбается.mp4" },
  { id: 42, name: "Хахаха", nameEn: "", rarity: "legendary", price: 774, video: "хахаха.mp4" },
  { id: 43, name: "Шлюха Дай", nameEn: "", rarity: "legendary", price: 850, video: "шлюха_дай.mp4" },
  { id: 44, name: "Ыыы", nameEn: "", rarity: "mythic", price: 1300, video: "ыыы.mp4" },
  { id: 45, name: "Это Он", nameEn: "", rarity: "mythic", price: 3650, video: "это_он.mp4" },
  { id: 46, name: "Я Обосрался", nameEn: "", rarity: "mythic", price: 6000, video: "я_обосрался.mp4" },
];

/* ################ utils.js ################ */
/* ============================================================
   УТИЛИТЫ
   ============================================================ */
const ICON_LOCK = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="10.5" width="14" height="9.5" rx="2.4" stroke="currentColor" stroke-width="1.8"/><path d="M8 10.5V7.5C8 5 9.8 3.3 12 3.3C14.2 3.3 16 5 16 7.5V10.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="15" r="1.4" fill="currentColor"/></svg>';
const SVGI = { search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>', chevL:'<path d="M15 5l-7 7 7 7"/>', chevR:'<path d="M9 5l7 7-7 7"/>', arrowR:'<path d="M5 12h14M13 6l6 6-6 6"/>', arrowUp:'<path d="M12 19V5M6 11l6-6 6 6"/>', arrowDown:'<path d="M12 5v14M6 13l6 6 6-6"/>', plus:'<path d="M12 5v14M5 12h14"/>', minus:'<path d="M5 12h14"/>', close:'<path d="M6 6l12 12M18 6L6 18"/>' };
function svgi(n, s, inline) { s = s || 18; return '<svg class="ic" viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (inline ? ' style="display:inline-block;vertical-align:-2px"' : '') + '>' + (SVGI[n] || '') + '</svg>'; }
let __uidCounter = 0;
function makeUid(prefix) {
  __uidCounter++;
  return prefix + Date.now().toString(36) + "_" + __uidCounter.toString(36) + "_" +
         Math.random().toString(36).slice(2, 7);
}

function getRarityHex(rarity) {
  switch (rarity) {
    case "rare":      return "#4C8DFF";
    case "epic":      return "#A66BFF";
    case "legendary": return "#FFB020";
    case "mythic":    return "#FF5A4A";
    default:          return "#6B6B75";
  }
}

/* Двойной тап по предмету: запускает его видео со звуком (никакого автоплея —
   ролик грузится и играет только по явному действию пользователя). Повторный
   двойной тап останавливает. Одновременно громко может играть только один. */
const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
/* Вырезание зелёного фона у РЕАЛЬНО играющего видео мема: тот же алгоритм,
   что и у праздничного оверлея (#sfxStage) — сам <video> прячется (opacity:0),
   а поверх него каждый кадр рисуется на canvas с прозрачным фоном там, где
   был зелёный. Работает только для видео, которое сейчас реально играет —
   не для превью, чтобы не грузить телефон десятками одновременных canvas. */
function __startVideoKey(wrap, video) {
  __stopVideoKey(wrap);
  let canvas = wrap.querySelector(".meme-vid-canvas");
  if (!canvas) { canvas = document.createElement("canvas"); canvas.className = "meme-vid-canvas"; wrap.appendChild(canvas); }
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  video.style.opacity = "0"; canvas.style.display = "block";
  let raf;
  function frame() {
    if (video.paused || video.ended) { __stopVideoKey(wrap); return; }
    const cw = wrap.clientWidth || 1, ch = wrap.clientHeight || 1;
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    const vw = video.videoWidth, vh = video.videoHeight;
    if (vw && vh) {
      const scale = Math.max(cw / vw, ch / vh);
      const sw = cw / scale, sh = ch / scale, sx = (vw - sw) / 2, sy = (vh - sh) / 2;
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, cw, ch);
      const img = ctx.getImageData(0, 0, cw, ch), d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2], m = r > b ? r : b, diff = g - m;
        const dominant = g > 25 && r < g * 0.9 && b < g * 0.9;
        if (diff > 12 || dominant) {
          const score = Math.max(diff, dominant ? (g - Math.max(r, b) * 0.9) : 0);
          const a = score >= 55 ? 0 : 1 - Math.max(0, score - 12) / 43;
          d[i + 3] = Math.max(0, Math.min(255, a * 255)); d[i + 1] = m;
        }
      }
      ctx.putImageData(img, 0, 0);
    }
    raf = requestAnimationFrame(frame);
  }
  frame();
  wrap.__keyRaf = () => cancelAnimationFrame(raf);
}
function __stopVideoKey(wrap) {
  if (!wrap) return;
  if (wrap.__keyRaf) { wrap.__keyRaf(); wrap.__keyRaf = null; }
  const canvas = wrap.querySelector(".meme-vid-canvas");
  if (canvas) canvas.style.display = "none";
  const v = wrap.querySelector(".meme-vid");
  if (v) v.style.opacity = "";
}
let __loudVideo = null, __loudWrap = null;
function __stopLoud() {
  if (!__loudVideo) return;
  __stopVideoKey(__loudWrap);
  const lv = __loudVideo;
  lv.pause();
  lv.muted = true;
  try { lv.currentTime = 0; } catch (e) {}
  lv.removeAttribute("src"); lv.load();
  __loudVideo = null; __loudWrap = null;
}
function toggleMemeSound(e, wrap) {
  e.stopPropagation();
  const vid = wrap && wrap.querySelector("video");
  if (!vid) return;
  if (__loudVideo === vid) { __stopLoud(); return; }
  __stopLoud();
  if (!vid.src && vid.dataset.src) vid.src = vid.dataset.src;
  vid.muted = false;
  vid.currentTime = 0;
  const p = vid.play();
  if (p && p.catch) p.catch(() => { vid.muted = true; });
  __loudVideo = vid; __loudWrap = wrap;
  __startVideoKey(wrap, vid);
}
/* Нативный dblclick на тачскринах срабатывает не всегда (особенно с
   touch-action:manipulation, которое как раз нужно для быстрого отклика на тап),
   поэтому двойной тап считаем сами по времени между двумя click. Работает
   одинаково и с мышью, и с пальцем. */
const __tapAt = new WeakMap();
function memeTap(e, wrap) {
  const now = Date.now();
  const last = __tapAt.get(wrap) || 0;
  if (now - last < 400) {
    __tapAt.set(wrap, 0);
    toggleMemeSound(e, wrap);
  } else {
    __tapAt.set(wrap, now);
  }
}

const __iconCache = new Map();
function renderIcon(item, sizePx) {
  const key = item.id + "_" + sizePx;
  if (__iconCache.has(key)) return __iconCache.get(key);
  const html = renderIconRaw(item, sizePx);
  __iconCache.set(key, html);
  return html;
}
/* Лёгкая версия иконки для бегущей ленты кейсов (см. renderIconRaw staticOnly) */
function renderIconReel(item, sizePx) {
  const key = item.id + "_" + sizePx + "_reel";
  if (__iconCache.has(key)) return __iconCache.get(key);
  const html = renderIconRaw(item, sizePx, true);
  __iconCache.set(key, html);
  return html;
}

/* ---------- видео предметов: без автоплея ----------
   Раньше видео-иконки (мемы в кейсах/инвентаре/ленте открытия) стартовали
   autoplay сразу, как только попадали в кадр — в ленте открытия кейса это
   до сотни видео одновременно, браузер их декодировал → лаги, и был виден
   сырой первый кадр ролика вместо фона предмета.
   Теперь видео не грузится и не играет само по себе: пользователь запускает
   его сам двойным тапом (сразу со звуком), а пока ролик не запущен — виден
   просто фон предмета, окрашенный в цвет редкости. Наблюдатель ниже только
   останавливает уже играющее видео, если оно уходит за пределы экрана. */
const __vidIO = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) __queueThumb(en.target);
    else if (en.target === __loudVideo) __stopLoud();
  });
}, { rootMargin: "80px" });
/* Раньше тут подгружался и рисовался первый кадр видео заранее (превью).
   Убрано: у многих роликов на первом кадре — зелёный хромакей-фон самой
   съёмки, и его перекрыть цветом редкости через CSS нельзя, это пиксели
   видео. Теперь до тапа видно только цветную плашку редкости с иконкой
   play, а кадр/звук подгружается и стартует именно по двойному тапу. */
/* ---------- превью (первый кадр) видео-мемов ----------
   Кадр берётся отдельным временным <video>, рисуется на маленький canvas,
   зелёный хромакей вырезается (как при воспроизведении) и результат кладётся
   в <img class="meme-thumb"> под видео. Кэшируется по файлу, грузится только
   когда предмет near-viewport и не больше 3 роликов одновременно. */
function __chromaKey(d) {
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2], m = r > b ? r : b, diff = g - m;
    const dominant = g > 25 && r < g * 0.9 && b < g * 0.9;
    if (diff > 12 || dominant) {
      const score = Math.max(diff, dominant ? (g - Math.max(r, b) * 0.9) : 0);
      const a = score >= 55 ? 0 : 1 - Math.max(0, score - 12) / 43;
      d[i + 3] = Math.max(0, Math.min(255, a * 255)); d[i + 1] = m;
    }
  }
}
const __thumbCache = new Map(), __thumbWaiting = new Map(), __thumbQueue = []; let __thumbActive = 0;
function __setThumb(wrap, dataUrl) {
  if (!wrap.isConnected || wrap.querySelector(".meme-thumb")) return;
  const img = new Image(); img.className = "meme-thumb"; img.alt = ""; img.draggable = false; img.src = dataUrl;
  wrap.insertBefore(img, wrap.firstChild);
}
function __queueThumb(video) {
  const src = video.dataset && video.dataset.src, wrap = video.closest && video.closest(".meme-vid-wrap");
  if (!src || !wrap || wrap.querySelector(".meme-thumb")) return;
  if (__thumbCache.has(src)) { const d = __thumbCache.get(src); if (d) __setThumb(wrap, d); return; }
  const waiting = __thumbWaiting.get(src);
  if (waiting) { waiting.add(wrap); return; }
  __thumbWaiting.set(src, new Set([wrap]));
  __thumbQueue.push(src); __pumpThumbs();
}
function __pumpThumbs() {
  while (__thumbActive < 3 && __thumbQueue.length) {
    const src = __thumbQueue.shift(); __thumbActive++;
    __makeThumb(src).then(d => {
      __thumbCache.set(src, d || "");
      const set = __thumbWaiting.get(src); __thumbWaiting.delete(src);
      if (d && set) set.forEach(w => __setThumb(w, d));
    }).finally(() => { __thumbActive--; __pumpThumbs(); });
  }
}
function __makeThumb(src) {
  return new Promise(resolve => {
    const v = document.createElement("video");
    v.muted = true; v.playsInline = true; v.setAttribute("playsinline", ""); v.preload = "auto";
    let done = false, t = 0;
    const finish = d => { if (done) return; done = true; clearTimeout(t); v.removeAttribute("src"); v.load(); resolve(d); };
    t = setTimeout(() => finish(null), 8000);
    function draw() {
      try {
        const vw = v.videoWidth, vh = v.videoHeight;
        if (!vw || !vh) return finish(null);
        const S = 144, c = document.createElement("canvas"); c.width = c.height = S;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        const scale = Math.max(S / vw, S / vh), sw = S / scale, sh = S / scale;
        ctx.drawImage(v, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, S, S);
        const img = ctx.getImageData(0, 0, S, S); __chromaKey(img.data); ctx.putImageData(img, 0, 0);
        finish(c.toDataURL("image/png"));
      } catch (e) { finish(null); }
    }
    v.onerror = () => finish(null);
    v.onloadeddata = () => { try { v.currentTime = 0.05; } catch (e) { draw(); } };
    v.onseeked = draw;
    v.src = src;
  });
}
function __observeMemeVideos(root) {
  if (!root || !root.querySelectorAll) return;
  (root.matches && root.matches(".meme-vid") ? [root] : []).concat([...root.querySelectorAll(".meme-vid")])
    .forEach(v => { __vidIO.observe(v); });
}
new MutationObserver(muts => {
  for (const m of muts) m.addedNodes.forEach(n => { if (n.nodeType === 1) __observeMemeVideos(n); });
}).observe(document.body, { childList: true, subtree: true });
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") __stopLoud();
});
function renderIconRaw(item, sizePx, staticOnly) {
  const size = sizePx ? (typeof sizePx === "number" ? sizePx + "px" : sizePx) : "var(--icon-size)";
  const color = getRarityHex(item.rarity);
  const box = `width:${size};height:${size};background:${color}2e;border:1px solid ${color}4d;`;

  if (item.video) {
    /* staticOnly: используется в бегущей ленте кейсов — ролик там всё равно
       не виден за скоростью прокрутки и не кликабелен, а создание <video> +
       IntersectionObserver на десятки ячеек разом (3-5 кейсов × длинная лента)
       и было основной причиной лагов при старте анимации. Даём лёгкую
       статичную плашку без видео/наблюдателя; настоящий видео-блок
       подставляется только для итоговой ячейки после остановки ленты. */
    if (staticOnly) {
      return `<div class="icon meme-vid-wrap novideo" style="${box}position:relative;overflow:hidden;padding:0;">` +
        `<span class="play-hint">${ICON_PLAY}</span>` +
        `</div>`;
    }
    return `<div class="icon meme-vid-wrap" style="${box}position:relative;overflow:hidden;padding:0;" onclick="memeTap(event,this)">` +
      `<video class="meme-vid" data-src="/videos/${encodeURIComponent(item.video)}" loop muted playsinline webkit-playsinline preload="none" onplay="this.closest('.meme-vid-wrap').classList.add('playing')" onpause="this.closest('.meme-vid-wrap').classList.remove('playing')" onended="this.closest('.meme-vid-wrap').classList.remove('playing')" onerror="this.closest('.meme-vid-wrap').classList.add('novideo')"></video>` +
      `<span class="play-hint">${ICON_PLAY}</span>` +
      `</div>`;
  }
  if (item.icon && typeof item.icon === "string") {
    if (item.icon.trim().startsWith("<svg")) {
      return `<div class="icon" style="${box}">${item.icon}</div>`;
    }
    return `<div class="icon" style="${box}"><img src="${item.icon}" alt=""></div>`;
  }
  const letter = (item.name || "?").trim().charAt(0).toUpperCase();
  return `<div class="icon" style="${box}color:${color};">${letter}</div>`;
}

/* ################ upgrade.js ################ */
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


const RARITY_RU = { common:"Обычный", rare:"Редкий", epic:"Эпический", legendary:"Легендарный", mythic:"Мифический" };
const fmt = n => Number(n).toLocaleString("ru-RU") + " G";
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
let shownBalance = 0, balanceAnim = 0;
function updateHeader() {
  const el = document.getElementById("headerMeta");
  const el2 = document.getElementById("spinBalance");
  const from = shownBalance, to = state.balance;
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
  const card = document.querySelector(`#gridWish .card.selected`);
  if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
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

/* ################ nav-accounts.js ################ */
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

function tryTelegramAuth() {
  try {
    const tg = window.Telegram && window.Telegram.WebApp;
    if (!tg) return null;
    tg.ready();
    tg.expand();
    const u = tg.initDataUnsafe && tg.initDataUnsafe.user;
    if (!u) return null;
    return {
      nickname: [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || "Игрок",
      username: u.username || null,
      photo: u.photo_url || null,
      source: "telegram",
      id: u.id
    };
  } catch (e) { return null; }
}

/* Тихое восстановление сессии при запуске — БЕЗ принудительного окна входа */
function initAuth() {
  let sessionKey = null;
  try { sessionKey = localStorage.getItem("amg_session") || null; } catch (e) {}
  const accounts = getAccounts();

  if (sessionKey && accounts[sessionKey]) {
    applyAccountSession(sessionKey, accounts[sessionKey]);
    return;
  }

  const tgProfile = tryTelegramAuth();
  if (tgProfile) {
    const key = "tg_" + tgProfile.id;
    let acc = accounts[key];
    if (!acc) {
      acc = { nickname: tgProfile.nickname, username: tgProfile.username, photo: tgProfile.photo,
        source: "telegram", balance: 100000, inventory: [], createdAt: Date.now() };
      accounts[key] = acc;
      saveAccounts(accounts);
    }
    applyAccountSession(key, acc);
    saveSession(key);
    return;
  }

  resetGuestState();
}

function applyAccountSession(key, acc) {
  state.profile = { accountKey: key, nickname: acc.nickname, username: acc.username || null,
    photo: acc.photo || null, source: acc.source };
  loadAccountIntoState(key, acc);
}

function setAuthTab(tab) {
  const isReg = tab === "register";
  document.getElementById("authTabLogin").classList.toggle("active", !isReg);
  document.getElementById("authTabRegister").classList.toggle("active", isReg);
  document.getElementById("authConfirmWrap").style.display = isReg ? "" : "none";
  document.getElementById("authHeading").textContent = isReg ? "Создать аккаунт" : "С возвращением";
  document.getElementById("authSub").textContent = isReg
    ? "Придумайте логин и пароль — прогресс будет сохранён за вашим аккаунтом."
    : "Войдите, чтобы амгрейдить предметы и сохранить прогресс за собой.";
  document.getElementById("authSubmitBtn").querySelector(".label").textContent = isReg ? "Зарегистрироваться" : "Войти";
  document.getElementById("authSwitch").innerHTML = isReg
    ? 'Уже есть аккаунт? <b onclick="setAuthTab(\'login\')">Войти</b>'
    : 'Нет аккаунта? <b onclick="setAuthTab(\'register\')">Зарегистрироваться</b>';
  clearAuthError();
  const pass = document.getElementById("authPassword");
  pass.setAttribute("autocomplete", isReg ? "new-password" : "current-password");
}

function showAuthError(msg) {
  const el = document.getElementById("authError");
  el.textContent = msg;
  el.classList.add("show");
  const fields = document.getElementById("authFields");
  fields.classList.remove("shake"); void fields.offsetWidth; fields.classList.add("shake");
}
function clearAuthError() {
  const el = document.getElementById("authError");
  el.textContent = ""; el.classList.remove("show");
}

function openAuth(message) {
  const ov = document.getElementById("authOverlay");
  clearAuthError();
  document.getElementById("authLogin").value = "";
  document.getElementById("authPassword").value = "";
  document.getElementById("authConfirm").value = "";
  setAuthTab("login");
  if (message) document.getElementById("authSub").textContent = message;
  ov.classList.add("open");
  setTimeout(() => document.getElementById("authLogin").focus(), 350);
}
function closeAuth() {
  document.getElementById("authOverlay").classList.remove("open");
}
function onAuthChipClick() {
  if (isLoggedIn()) showScreen("profile");
  else openAuth();
}

function submitAuth() {
  const isReg = document.getElementById("authTabRegister").classList.contains("active");
  const login = (document.getElementById("authLogin").value || "").trim();
  const pass = document.getElementById("authPassword").value || "";
  const confirm = document.getElementById("authConfirm").value || "";
  clearAuthError();

  if (login.length < 3) return showAuthError("Логин должен быть не короче 3 символов");
  if (pass.length < 4) return showAuthError("Пароль должен быть не короче 4 символов");
  if (isReg && pass !== confirm) return showAuthError("Пароли не совпадают");

  const btn = document.getElementById("authSubmitBtn");
  btn.classList.add("loading");

  setTimeout(() => {
    const accounts = getAccounts();
    const key = "u_" + login.toLowerCase();

    if (isReg) {
      if (accounts[key]) { btn.classList.remove("loading"); return showAuthError("Такой логин уже занят"); }
      accounts[key] = { nickname: login, passHash: simpleHash(pass), source: "manual",
        balance: 100000, inventory: [], createdAt: Date.now() };
      saveAccounts(accounts);
      applyAccountSession(key, accounts[key]);
      saveSession(key);
    } else {
      const acc = accounts[key];
      if (!acc || acc.passHash !== simpleHash(pass)) { btn.classList.remove("loading"); return showAuthError("Неверный логин или пароль"); }
      applyAccountSession(key, acc);
      saveSession(key);
    }

    btn.classList.remove("loading");
    closeAuth();
    renderAll();
    renderProfile();
    pulseBalance();
    notify("win", isReg ? "Аккаунт создан" : "Вы вошли", state.profile.nickname, "", null);
  }, 380);
}

function loginWithTelegram() {
  const tgProfile = tryTelegramAuth();
  if (!tgProfile) { showAuthError("Откройте Amgrader внутри Telegram, чтобы войти через него"); return; }
  const accounts = getAccounts();
  const key = "tg_" + tgProfile.id;
  let acc = accounts[key];
  if (!acc) {
    acc = { nickname: tgProfile.nickname, username: tgProfile.username, photo: tgProfile.photo,
      source: "telegram", balance: 100000, inventory: [], createdAt: Date.now() };
    accounts[key] = acc;
    saveAccounts(accounts);
  }
  applyAccountSession(key, acc);
  saveSession(key);
  closeAuth();
  renderAll();
  renderProfile();
  pulseBalance();
}

function logoutAccount() {
  if (!isLoggedIn()) return;
  if (!confirm("Выйти из аккаунта? Прогресс сохранится и будет ждать вас при следующем входе.")) return;
  saveGame();
  saveSession(null);
  state.profile = null;
  resetGuestState();
  showScreen("profile");
  renderAll();
  renderProfile();
}

function resetProfile() {
  if (!isLoggedIn()) { openAuth(); return; }
  if (!confirm("Удалить аккаунт и весь прогресс безвозвратно?")) return;
  try {
    const accounts = getAccounts();
    delete accounts[state.profile.accountKey];
    saveAccounts(accounts);
    localStorage.removeItem("amg_session");
  } catch (e) {}
  location.reload();
}

function renderProfile() {
  const p = state.profile || {};
  const loggedIn = isLoggedIn();
  const avatar = document.getElementById("profileAvatar");
  if (p.photo) avatar.innerHTML = `<img src="${p.photo}" alt="">`;
  else if (loggedIn) avatar.textContent = initials(p.nickname);
  else avatar.innerHTML = ICON_LOCK;

  document.getElementById("profileName").textContent = loggedIn ? (p.nickname || "Игрок") : "Гость";
  document.getElementById("profileSub").textContent = loggedIn
    ? (p.source === "telegram" ? (p.username ? "@" + p.username : "Telegram-аккаунт") : ("Логин: " + (p.login || p.nickname)))
    : "Не выполнен вход";

  document.getElementById("guestBanner").style.display = loggedIn ? "none" : "";
  document.getElementById("rowLogout").style.display = loggedIn ? "" : "none";

  const navIcon = document.getElementById("navProfileIcon");
  navIcon.innerHTML = p.photo
    ? `<span class="nav-avatar"><img src="${p.photo}" alt=""></span>`
    : `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="3.6" stroke="currentColor" stroke-width="1.7"/><path d="M4.5 20C5.6 16.3 8.5 14.3 12 14.3C15.5 14.3 18.4 16.3 19.5 20" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`;

  const chip = document.getElementById("authChip");
  if (loggedIn) {
    chip.classList.remove("guest");
    chip.classList.add("logged");
    chip.innerHTML = p.photo
      ? `<span class="auth-chip-avatar"><img src="${p.photo}" alt=""></span><span>${esc(p.nickname || "Профиль")}</span>`
      : `<span class="auth-chip-avatar">${initials(p.nickname)}</span><span>${esc(p.nickname || "Профиль")}</span>`;
  } else {
    chip.classList.add("guest");
    chip.classList.remove("logged");
    chip.textContent = "Войти";
  }

  document.getElementById("statBalance").textContent = fmt(state.balance);
  document.getElementById("statItems").textContent = state.inventory.length;

  renderTopBalanceSlider();
}

/* ---------- мини-слайдер «Топ по балансу» (реальные игроки с сервера) ---------- */
let __topBalanceCache = null, __topBalanceLoading = false, __topBalanceFailed = false;
async function loadTopBalances() {
  if (__topBalanceCache || __topBalanceLoading) return;
  __topBalanceLoading = true; __topBalanceFailed = false;
  try {
    const r = await api("/api/leaderboard");
    const list = (r && r.top) || [];
    __topBalanceCache = list.map(u => ({ nickname: u.nickname || "Игрок", balance: u.balance || 0, photo: u.photo }));
  } catch (e) {
    /* сервер недоступен / эндпоинта ещё нет на этом окружении — оставляем
       блок пустым, никаких выдуманных игроков не показываем */
    __topBalanceCache = null; __topBalanceFailed = true;
  }
  __topBalanceLoading = false;
  renderTopBalanceSlider();
}
function renderTopBalanceSlider() {
  const el = document.getElementById("topBalanceSlider");
  if (!el) return;
  if (!__topBalanceCache) {
    if (!__topBalanceLoading && !__topBalanceFailed) loadTopBalances();
    el.innerHTML = __topBalanceFailed ? `<div class="misc-hint">Топ пока недоступен</div>` : "";
    return;
  }
  const p = state.profile || {}, loggedIn = isLoggedIn();
  let list = __topBalanceCache.map(u => ({ ...u, me: false }));
  if (loggedIn && !list.some(u => u.nickname === p.nickname && u.balance === state.balance)) {
    list.push({ nickname: p.nickname || "Игрок", balance: state.balance, photo: p.photo, me: true });
  }
  list.sort((a, b) => b.balance - a.balance);
  list = list.slice(0, 10);
  if (!list.length) { el.innerHTML = `<div class="misc-hint">Пока никто не в топе</div>`; return; }
  el.innerHTML = list.map((u, i) => {
    const rank = i + 1;
    const av = u.photo ? `<img src="${u.photo}" alt="">` : esc(initials(u.nickname));
    return `<div class="top-card ${u.me ? "me" : ""} ${rank <= 3 ? "top" + rank : ""}">` +
      `<div class="top-rank">#${rank}${u.me ? " · вы" : ""}</div>` +
      `<div class="top-av">${av}</div>` +
      `<div class="top-nick">${esc(u.nickname)}</div>` +
      `<div class="top-bal">${fmt(u.balance)}</div>` +
      `</div>`;
  }).join("");
}

/* ---------- отдельный полноэкранный инвентарь (открывается из профиля) ---------- */
function renderProfileInventoryGrid() {
  const el = document.getElementById("invFullGrid");
  const list = state.inventory;
  el.innerHTML = list.length
    ? list.map(m => cardHTML(m, { play: true })).join("")
    : '<div class="empty-state">Инвентарь пуст</div>';
}
function openProfileInventory() {
  if (state.spinning) return;
  renderProfileInventoryGrid();
  document.getElementById("invFullOverlay").hidden = false;
  window.scrollTo(0, 0);
}
function closeProfileInventory() {
  document.getElementById("invFullOverlay").hidden = true;
}

/* ============================================================
   ИНИЦИАЛИЗАЦИЯ
   ============================================================ */
function init() {
  state.targets = MEMES.map(m => ({ ...m, uid: "t_" + m.id }));
  initAuth();
  loadGame();
  renderAll();
  renderProfile();
  updateNavScale(state.screen || "upgrade");
  try { selfTest(); } catch (e) {}
}
document.getElementById("spinBtn").addEventListener("click", onSpinClick);
initBubbleSwipe();
document.getElementById("buyOverlay").addEventListener("click", e => { if (e.target === e.currentTarget) closeBuy(); });
document.getElementById("authOverlay").addEventListener("click", e => { if (e.target === e.currentTarget) closeAuth(); });

/* ################ server.js ################ */
/* ============================================================
   СЕРВЕРНЫЕ АККАУНТЫ, ПРОМОКОДЫ, РЕФЕРАЛКА
   (переопределяет локальные функции из основного скрипта)
   ============================================================ */
const TOKEN_KEY = "amg_token";
let apiCfg = { botUsername: "", referrerBonus: 0, refereeBonus: 0 };
let lastSaveAt = 0;

function tgApp() { return window.Telegram && window.Telegram.WebApp; }

/* Telegram Mini Apps: localStorage может НЕ переживать перезапуск приложения
   (особенно на iOS) — Telegram для этого даёт CloudStorage. Дублируем токен
   туда, чтобы вход не слетал при каждом новом открытии мини-аппа. */
function tgCloudSet(key, value) {
  return new Promise(resolve => {
    const tg = tgApp();
    if (tg && tg.CloudStorage && tg.CloudStorage.setItem) { try { tg.CloudStorage.setItem(key, value, () => resolve()); } catch (e) { resolve(); } }
    else resolve();
  });
}
function tgCloudGet(key) {
  return new Promise(resolve => {
    const tg = tgApp();
    if (tg && tg.CloudStorage && tg.CloudStorage.getItem) { try { tg.CloudStorage.getItem(key, (err, value) => resolve(err ? "" : (value || ""))); } catch (e) { resolve(""); } }
    else resolve("");
  });
}
function tgCloudRemove(key) {
  return new Promise(resolve => {
    const tg = tgApp();
    if (tg && tg.CloudStorage && tg.CloudStorage.removeItem) { try { tg.CloudStorage.removeItem(key, () => resolve()); } catch (e) { resolve(); } }
    else resolve();
  });
}

function getToken() { try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; } }
function setToken(t) {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch (e) {}
  if (t) tgCloudSet(TOKEN_KEY, t); else tgCloudRemove(TOKEN_KEY);
}
function getRefFromUrl() {
  let r = "";
  try { r = new URLSearchParams(location.search).get("ref") || ""; } catch (e) {}
  if (!r) { const sp = tgApp() && tgApp().initDataUnsafe && tgApp().initDataUnsafe.start_param; if (sp && sp.indexOf("ref_") === 0) r = sp.slice(4); }
  return r.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() || undefined;
}

async function api(path, opts) {
  opts = opts || {};
  const headers = { "Content-Type": "application/json" };
  const tk = getToken(); if (tk) headers["Authorization"] = "Bearer " + tk;
  let r;
  try { r = await fetch(path, { method: opts.method || "GET", headers, body: opts.body ? JSON.stringify(opts.body) : undefined }); }
  catch (e) { throw new Error("Нет связи с сервером"); }
  let data = null; try { data = await r.json(); } catch (e) {}
  if (!r.ok) {
    const d = data && data.detail;
    const err = new Error(typeof d === "string" ? d : "Проверьте введённые данные");
    err.status = r.status; throw err;
  }
  return data;
}

function mergeServerUser(u) {
  state.balance = u.balance; state.rev = u.rev || 0; state.luck = u.luck || [];
  setInventoryFromIds(u.inventory || []);
  if (state.profile) { state.profile.referralCode = u.referralCode; state.profile.referredBy = u.referredBy; }
  renderAll(); renderProfile(); pulseBalance();
}
function fixSelection() {
  state.selectedMemeUids = state.selectedMemeUids.filter(u => state.inventory.some(i => i.uid === u));
  const tgt = getTarget();
  if (tgt && (getTotalStake() === 0 || tgt.price <= getTotalStake())) state.targetMemeId = null;
}
function setInventoryFromIds(ids) {
  const pool = state.inventory.slice(), next = [];
  ids.forEach(id => {
    const k = pool.findIndex(x => x.id === id);
    if (k >= 0) next.push(pool.splice(k, 1)[0]);
    else { const m = getMemeById(id); if (m) next.push({ ...m, uid: makeUid("u") }); }
  });
  state.inventory = next;
  fixSelection();
}
function applyServerUser(u) {
  state.profile = { accountKey: String(u.id), nickname: u.nickname || u.login || "Игрок", username: u.username || null,
    photo: u.photo || null, source: u.source, login: u.login, referralCode: u.referralCode, referredBy: u.referredBy };
  state.balance = u.balance; state.rev = u.rev || 0; state.luck = u.luck || [];
  state.cart = {};
  setInventoryFromIds(u.inventory || []);
}
const OK_ITEM = { name: "OK", rarity: "common", icon: '<svg class="ic" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>' };

function saveGame() {
  const tk = getToken();
  if (!isLoggedIn() || !tk) return;
  lastSaveAt = Date.now();
  fetch("/api/state", { method: "POST", keepalive: true,
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tk },
    body: JSON.stringify({ balance: state.balance, inventory: state.inventory.map(i => i.id), rev: state.rev }) })
    .then(r => r.json()).then(d => { if (d && d.stale && d.user) mergeServerUser(d.user); }).catch(() => {});
}
function resetGuestState() {
  state.rev = 0; state.luck = []; state.balance = 0; state.inventory = []; state.selectedMemeUids = []; state.targetMemeId = null; state.cart = {}; shownBalance = 0;
}

/* ---------- история амгрейдов (хранится на сервере, видна с любого устройства) ---------- */
function pushHistory(entry) {
  if (!isLoggedIn()) return;
  api("/api/history/add", { method: "POST", body: { entry } }).catch(() => {});
}
function clearHistory() {
  api("/api/history/clear", { method: "POST" }).catch(() => {});
  openHistory();
}
function historyRow(h) {
  const stakeLabel = h.stake.length === 1 ? h.stake[0].name : `${h.stake.length} ${plural(h.stake.length, "предмет", "предмета", "предметов")}`;
  const time = new Date(h.time).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  const cls = h.win ? "win" : "lose";
  const sum = h.win ? "+" + fmt(h.target.price) : "−" + fmt(h.stakeTotal);
  return `<div class="hist-row">${renderIcon(h.target, 40)}
    <div class="hist-mid"><b>${esc(stakeLabel)} ${svgi("arrowR", 13, true)} ${esc(h.target.name)}</b><span>${fmtPct(h.chance)}% шанс · ${time}</span></div>
    <div class="hist-right ${cls}"><b>${sum}</b><span>${h.win ? "успех" : "неудача"}</span></div>
  </div>`;
}
async function openHistory() {
  if (!isLoggedIn()) { openAuth("Войдите, чтобы увидеть историю амгрейдов"); return; }
  openMisc(miscHead(ic("history", 24), "История амгрейдов", "Загрузка…") + `<div class="sheet-list"><div class="hist-empty">Загрузка…</div></div>`);
  let list = [];
  try { const r = await api("/api/history"); list = r.history || []; } catch (e) {}
  const body = list.length
    ? `<div class="sheet-list">${list.map(historyRow).join("")}</div>`
    : `<div class="hist-empty">Пока пусто — сделайте первый амгрейд</div>`;
  openMisc(miscHead(ic("history", 24), "История амгрейдов", `Последние ${list.length ? list.length : ""} результатов`) + body +
    (list.length ? `<div class="sheet-foot"><button class="ghost-btn" onclick="clearHistory()">Очистить историю</button></div>` : ""));
}

async function syncFromServer() {
  if (!isLoggedIn() || document.hidden || state.spinning || paying) return;
  if (document.getElementById("buyOverlay").classList.contains("open")) return;
  if (Date.now() - lastSaveAt < 3000) return;
  try {
    const u = await api("/api/me");
    const a = (u.inventory || []).slice().sort((x, y) => x - y).join(), b = state.inventory.map(i => i.id).sort((x, y) => x - y).join();
    if (u.balance !== state.balance || a !== b || (u.rev || 0) !== state.rev || JSON.stringify(u.luck || []) !== JSON.stringify(state.luck || [])) mergeServerUser(u);
  } catch (e) { if (e.status === 401) { setToken(""); } }
}

/* ---------- вход / регистрация ---------- */
async function submitAuth() {
  const isReg = document.getElementById("authTabRegister").classList.contains("active");
  const login = (document.getElementById("authLogin").value || "").trim();
  const pass = document.getElementById("authPassword").value || "";
  const confirmPass = document.getElementById("authConfirm").value || "";
  clearAuthError();
  if (login.length < 3) return showAuthError("Логин должен быть не короче 3 символов");
  if (pass.length < 4) return showAuthError("Пароль должен быть не короче 4 символов");
  if (isReg && pass !== confirmPass) return showAuthError("Пароли не совпадают");
  const btn = document.getElementById("authSubmitBtn");
  btn.classList.add("loading");
  try {
    const body = { login, password: pass };
    if (isReg) body.ref = getRefFromUrl();
    const u = await api(isReg ? "/api/auth/register" : "/api/auth/login", { method: "POST", body });
    setToken(u.token); applyServerUser(u);
    btn.classList.remove("loading");
    closeAuth(); renderAll(); renderProfile(); pulseBalance();
    notify("win", isReg ? "Аккаунт создан" : "Вы вошли", state.profile.nickname, "", OK_ITEM);
  } catch (e) { btn.classList.remove("loading"); showAuthError(e.message); }
}

async function telegramLoginRequest() {
  const tg = tgApp();
  const u = await api("/api/auth/telegram", { method: "POST", body: { initData: tg.initData, ref: getRefFromUrl() } });
  setToken(u.token); applyServerUser(u);
}
async function loginWithTelegram() {
  const tg = tgApp();
  if (!tg || !tg.initData) { showAuthError("Откройте Amgrader внутри Telegram, чтобы войти через него"); return; }
  try { await telegramLoginRequest(); closeAuth(); renderAll(); renderProfile(); pulseBalance(); }
  catch (e) { showAuthError(e.message); }
}

async function logoutAccount() {
  if (!isLoggedIn()) return;
  if (!confirm("Выйти из аккаунта? Прогресс сохранён на сервере и ждёт вас при следующем входе.")) return;
  saveGame(); setToken(""); state.profile = null; resetGuestState();
  showScreen("profile"); renderAll(); renderProfile();
}
async function resetProfile() {
  if (!isLoggedIn()) { openAuth(); return; }
  if (!confirm("Удалить аккаунт и весь прогресс безвозвратно?")) return;
  try { await api("/api/me", { method: "DELETE" }); } catch (e) { alert(e.message); return; }
  setToken(""); location.reload();
}

/* ---------- плашка в профиле ---------- */
const _renderProfile = renderProfile;
renderProfile = function () {
  _renderProfile();
  const c = state.profile && state.profile.referralCode;
  document.getElementById("tileRefSub").textContent = c ? "Ваш код: " + c : "Приглашайте друзей";
};

/* ---------- окна: промокод и реферальный код ---------- */
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
      <div class="misc-hint" id="cpTotal">Спишется 0 G с вашего баланса (${fmt(state.balance)} доступно)</div>
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
  el.textContent = `Спишется ${fmt(total)} с вашего баланса (${fmt(state.balance)} доступно)`;
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
  if (tg) { try { tg.ready(); tg.expand(); } catch (e) {} }
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

function tickSound(t, f, vol) {
  const o = aud.ac.createOscillator(), g = aud.ac.createGain();
  o.type = "square";
  o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.55, t + 0.03);
  g.gain.setValueAtTime(vol * 0.35, t); g.gain.exponentialRampToValueAtTime(0.0008, t + 0.04);
  o.connect(g); g.connect(aud.wg); o.start(t); o.stop(t + 0.05);
}
/* «трещотка»: щелчок каждые 15° — сначала частый гул, к концу отдельные щелчки */
function wheelTick(rot) {
  if (!sfx.on || !aud.ac || aud.ac.state !== "running" || sfx.vol.wheel <= 0) return;
  const k = Math.floor(rot / 15);
  if (aud.lastK === null) { aud.lastK = k; return; }
  if (k === aud.lastK) return;
  const n = Math.abs(k - aud.lastK); aud.lastK = k;
  const now = aud.ac.currentTime;
  if (now - aud.lastT < 0.018) return;
  aud.lastT = now;
  const speed = Math.min(1, n / 3);
  tickSound(now, 900 + speed * 500 + Math.random() * 60, 0.55 - speed * 0.2);
}
/* глухой «стук» в момент остановки */
function wheelStop() {
  if (!sfx.on || !aud.ac || aud.ac.state !== "running" || sfx.vol.wheel <= 0) return;
  const t = aud.ac.currentTime, o = aud.ac.createOscillator(), g = aud.ac.createGain();
  o.type = "sine"; o.frequency.setValueAtTime(170, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.22);
  g.gain.setValueAtTime(0.7, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
  o.connect(g); g.connect(aud.wg); o.start(t); o.stop(t + 0.3);
}

/* ---------- окно настроек ---------- */
function refreshSoundUI() {
  const b = document.getElementById("sfxToggleBtn"); if (b) b.textContent = "Звуки и видео: " + (sfx.on ? "вкл" : "выкл");
  const w = document.getElementById("volWheel"), v = document.getElementById("volVideo");
  if (w) { w.value = Math.round(sfx.vol.wheel * 100); document.getElementById("volWheelV").textContent = w.value + "%"; }
  if (v) { v.value = Math.round(sfx.vol.video * 100); document.getElementById("volVideoV").textContent = v.value + "%"; }
  refreshFastUI();
}
function setVol(kind, val) {
  sfx.vol[kind] = Math.max(0, Math.min(1, (+val) / 100));
  try { localStorage.setItem("amg_vol_" + kind, String(sfx.vol[kind])); } catch (e) {}
  applyVolumes(); refreshSoundUI();
}
function volPreview(kind) {
  audioEnsure();
  if (kind === "wheel" && aud.ac && sfx.vol.wheel > 0) { const t = aud.ac.currentTime; for (let i = 0; i < 4; i++) tickSound(t + i * 0.09, 950, 0.5); }
}
function openSoundSettings() {
  openMisc(miscHead(ic("volume", 24), "Звук и анимация", "Громкость и скорость") + `
    <div class="reg-body">
      <button class="ghost-btn" id="sfxToggleBtn" onclick="toggleSfx(); refreshSoundUI()"></button>
      <div class="vol-row"><label><span>Звук колеса</span><b id="volWheelV"></b></label>
        <input type="range" id="volWheel" min="0" max="100" step="5" oninput="setVol('wheel', this.value)" onchange="volPreview('wheel')"></div>
      <div class="vol-row"><label><span>Видео-реакции (вылетающие)</span><b id="volVideoV"></b></label>
        <input type="range" id="volVideo" min="0" max="100" step="5" oninput="setVol('video', this.value)"></div>
      <button class="ghost-btn" id="fastToggleBtn" onclick="toggleFast(true)"></button>
      <div class="misc-hint">Кнопка с молнией на экранах амгрейда и кейсов: тап до старта включает быструю анимацию (около 1 секунды), тап во время прокрутки пропускает её сразу. На iPhone звук не слышен, если включён беззвучный режим.</div>
    </div>`);
  refreshSoundUI();
}
refreshFastUI();

/* ################ v6-core.js ################ */
const ICO = {"gift": "<rect x=\"3\" y=\"8\" width=\"18\" height=\"4\" rx=\"1\"/><path d=\"M12 8v13M19 12v9H5v-9M7.5 8a2.5 2.5 0 1 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 1 1 0 5\"/>", "users": "<path d=\"M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9.5\" cy=\"7\" r=\"4\"/><path d=\"M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8\"/>", "bag": "<path d=\"M6 8a6 6 0 0 1 12 0v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z\"/><path d=\"M9 21v-6h6v6M9 8h6\"/>", "box": "<path d=\"M21 8l-9-5-9 5v8l9 5 9-5z\"/><path d=\"M3 8l9 5 9-5M12 13v8\"/>", "layers": "<path d=\"M12 3l9 5-9 5-9-5z\"/><path d=\"M3 13l9 5 9-5M3 17.5l9 5 9-5\"/>", "volume": "<path d=\"M11 5L6 9H2v6h4l5 4z\"/><path d=\"M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14\"/>", "bolt": "<path d=\"M13 2L4 14h7l-1 8 9-12h-7z\"/>", "logout": "<path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9\"/>", "trash": "<path d=\"M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6\"/>", "check": "<path d=\"M5 12.5l4.5 4.5L19 7\"/>", "x": "<path d=\"M6 6l12 12M18 6L6 18\"/>", "cart": "<circle cx=\"9\" cy=\"20\" r=\"1.4\"/><circle cx=\"18\" cy=\"20\" r=\"1.4\"/><path d=\"M2 3h3l2.7 12.4a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6\"/>", "calendar": "<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M8 3v4M16 3v4M3 10h18\"/>", "telegram": "<path d=\"M21 4L3 11l6 2.5L11.5 20l3-4.5L19 19z\"/><path d=\"M9 13.5L21 4\"/>", "tiktok": "<path d=\"M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5\"/><path d=\"M14 3c.3 2.6 2 4.4 5 4.6\"/>", "link": "<path d=\"M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1\"/>", "history": "<path d=\"M3 12a9 9 0 1 0 3-6.7\"/><path d=\"M3 4v5h5\"/><path d=\"M12 7v5l4 2\"/>"};
/* ============================================================
   V6: экраны и переходы, кейсы, крафт, бонусы, скрытая удача
   ============================================================ */
const $ = id => document.getElementById(id);
const RAR_ORDER = ["common", "rare", "epic", "legendary", "mythic"];
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
const SCREENS = ["mines", "cases", "craft", "upgrade", "bonus", "profile", "ladder"];
const cap = s => s[0].toUpperCase() + s.slice(1);
let screenToken = 0, bonusTimer = 0;
function showScreen(name) {
  if (state.spinning) return;
  const els = SCREENS.map(s => $("screen" + cap(s)));
  const out = els.find(e => !e.hidden) || null, inn = $("screen" + cap(name));
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

/* ################ mines.js ################ */
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
  else mines.bet = Math.max(1, Math.floor(state.balance));
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
  if (bet > state.balance) { $("minesNote").textContent = "Не хватает " + fmt(bet - state.balance); return; }
  state.balance -= bet; updateHeader(); pulseBalance(); saveGame();
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
  state.balance += win; updateHeader(); pulseBalance(); saveGame();
  notify("win", "Мины", "Забрано", "+ " + fmt(win), OK_ITEM);
  mines.phase = "idle"; mines.bombs = []; mines.opened = [];
  renderMinesGrid(); renderMinesHud();
}

/* ################ ladder.js ################ */
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
function ladderOnBetInput() { ladder.bet = Math.max(1, Math.round(Number($("ladderBetInput").value) || 1)); ladderSavePrefs(); }
function ladderOnStonesInput() {
  let v = Math.round(Number($("ladderStonesInput").value) || 1); v = Math.max(1, Math.min(7, v));
  ladder.stones = v; $("ladderStonesInput").value = v; ladderSavePrefs();
}
function ladderStakeAction(i) {
  if (ladder.phase === "playing") return;
  if (i === 0) ladder.bet = Math.max(1, Math.round(ladder.bet / 2));
  else if (i === 1) ladder.bet = Math.round(ladder.bet * 2);
  else ladder.bet = Math.max(1, Math.floor(state.balance));
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
function ladderMainAction() {
  if (ladder.phase === "idle") ladderStart();
  else if (ladder.phase === "playing" && ladder.row > 0 && !ladder.resolving) ladderCashout(false);
  else if (ladder.phase === "lost") { ladder.phase = "idle"; ladder.row = 0; ladderRenderTrail(); ladderRenderRow(); ladderRenderHud(); }
}
function ladderStart() {
  if (ladder.phase !== "idle") return;
  const bet = ladder.bet;
  if (!(bet > 0)) { $("ladderNote").textContent = "Укажите ставку"; return; }
  if (bet > state.balance) { $("ladderNote").textContent = "Не хватает " + fmt(bet - state.balance); return; }
  state.balance -= bet; updateHeader(); pulseBalance(); saveGame();
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
  state.balance += win; updateHeader(); pulseBalance(); saveGame();
  notify("win", "Лесенка", top ? "Вершина лесенки!" : "Забрано", "+ " + fmt(win), OK_ITEM);
  ladder.phase = "idle"; ladder.row = 0; ladder.resolving = false;
  ladderRenderTrail(); ladderRenderRow(); ladderRenderHud();
}

/* ################ cases.js ################ */
/* ---------- КЕЙСЫ ---------- */
const CASES = [
  { id: "c1", name: "Каменный Тайник", tone: "#9AA0A6", w: { common: 60, rare: 32, epic: 8 } },
  { id: "c5", name: "Песчаный Тайник", tone: "#D8B871", w: { common: 70, rare: 30 } },
  { id: "c2", name: "Ледяной Тайник", tone: "#4DA3FF", w: { rare: 45, epic: 40, legendary: 15 } },
  { id: "c6", name: "Изумрудный Тайник", tone: "#3ECF8E", w: { rare: 20, epic: 55, legendary: 25 } },
  { id: "c3", name: "Портальный Разлом", tone: "#B26BFF", w: { epic: 42, legendary: 42, mythic: 16 } },
  { id: "c7", name: "Грозовой Разряд", tone: "#6C7BFF", w: { epic: 20, legendary: 50, mythic: 30 } },
  { id: "c4", name: "Огненное Ядро", tone: "#FFB020", w: { legendary: 45, mythic: 55 } },
  { id: "c8", name: "Древний Реликт", tone: "#E0473F", w: { legendary: 20, mythic: 80 } }
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
const ART_FN = { c1: artStone, c5: artSand, c2: artIce, c6: artEmerald, c3: artPortal, c7: artStorm, c4: artFire, c8: artRelic };
CASES.forEach(c => { c.art = (ART_FN[c.id] || artStone)(c.tone); });
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
  const hasFree = state.freeCaseSpins > 0 && cs.qty === 1;
  b.innerHTML = state.spinning ? "Открываем…" : !isLoggedIn() ? "Войти, чтобы открывать" : hasFree ? `Открыть бесплатно ${ic("gift", 14)}` : "Открыть за " + fmt(c.price * cs.qty);
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
let lastCaseResults = null, lastCaseCost = 0;
async function openCases() {
  if (state.spinning) return;
  if (!isLoggedIn()) { openAuth("Войдите, чтобы открывать кейсы"); return; }
  const c = CASES[cs.sel], n = cs.qty;
  const useFree = state.freeCaseSpins > 0 && n === 1;
  const cost = useFree ? 0 : c.price * n;
  if (!useFree && state.balance < cost) { const b = $("caseBtn"); b.textContent = "Не хватает G"; setTimeout(updateCaseBtn, 1400); return; }
  audioEnsure(); state.spinning = true; spinReset();
  if (useFree) state.freeCaseSpins--;
  const token = ++caseRunToken;
  const results = Array.from({ length: n }, () => pickFromCase(c));
  state.balance -= cost;                                                   // итог фиксируем сразу, анимация — только показ
  results.forEach(m => state.inventory.push({ ...m, uid: makeUid("u") }));
  /* Бонус: 3+ одинаковых предмета за один спин — бесплатный кейс на будущее */
  const dupCounts = {};
  results.forEach(m => dupCounts[m.id] = (dupCounts[m.id] || 0) + 1);
  const gotFreeSpin = Object.values(dupCounts).some(k => k >= 3);
  if (gotFreeSpin) state.freeCaseSpins = (state.freeCaseSpins || 0) + 1;
  saveGame(); updateHeader(); pulseBalance(); updateCaseBtn(); $("caseResult").innerHTML = "";
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

/* ################ craft-bonus.js ################ */
/* ---------- КРАФТ ---------- */
const CRAFT_COUNT = 10;   // крафт строго из 10 предметов
const craft = { sel: [] };
function craftRarity() { const f = state.inventory.find(i => i.uid === craft.sel[0]); return f ? f.rarity : null; }
function toggleCraft(uid) {
  if (state.spinning) return;
  const it = state.inventory.find(i => i.uid === uid); if (!it) return;
  const k = craft.sel.indexOf(uid);
  if (k >= 0) craft.sel.splice(k, 1);
  else {
    const r = craftRarity();
    if ((r && it.rarity !== r) || it.rarity === "mythic" || craft.sel.length >= CRAFT_COUNT) return;
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
  const r = craftRarity(), next = r ? RAR_ORDER[RAR_ORDER.indexOf(r) + 1] : null;
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
  $("craftCount").textContent = "Выбрано: " + picked.length + " / " + CRAFT_COUNT + (picked.length ? " · стоимость " + fmt(cost) : "");
  if (next) {
    $("craftOddsLabel").style.display = "";
    const pool = craftPool(next, cost || 1);
    $("craftOdds").innerHTML = pool.map(p => `<div class="pool-item" style="--rc:${getRarityHex(p.m.rarity)}">${renderIcon(p.m, 40)}<div class="pi-n">${esc(p.m.name)}</div><div class="pi-p">${fmtCasePct(p.w * 100)}%</div></div>`).join("");
  } else { $("craftOddsLabel").style.display = "none"; $("craftOdds").innerHTML = ""; }
  const inv = state.inventory.slice().sort((a, b) => RAR_ORDER.indexOf(a.rarity) - RAR_ORDER.indexOf(b.rarity) || a.price - b.price);
  $("craftGrid").innerHTML = inv.length ? inv.map(m => cardHTML(m, {
    selected: craft.sel.includes(m.uid), check: true,
    disabled: m.rarity === "mythic" || (r && m.rarity !== r), onclick: `toggleCraft('${m.uid}')`
  })).join("") : `<div class="pg-hint" style="grid-column:1/-1">В инвентаре пока пусто — купите предметы в магазине или откройте кейс.</div>`;
}
async function doCraft() {
  if (state.spinning) return;
  craft.sel = craft.sel.filter(u => state.inventory.some(i => i.uid === u));
  if (craft.sel.length !== CRAFT_COUNT) { renderCraft(true); return; }
  const r = craftRarity(), next = RAR_ORDER[RAR_ORDER.indexOf(r) + 1]; if (!next) return;
  if (craft.sel.some(u => { const it = state.inventory.find(i => i.uid === u); return !it || it.rarity !== r; })) { renderCraft(true); return; }
  const stake = craft.sel.reduce((s, u) => { const it = state.inventory.find(i => i.uid === u); return s + (it ? it.price : 0); }, 0);
  const pool = craftPool(next, stake), win = craftPick(pool);
  audioEnsure(); state.spinning = true; spinReset();
  const used = craft.sel.slice();
  state.inventory = state.inventory.filter(i => !used.includes(i.uid));
  state.inventory.push({ ...win, uid: makeUid("u") });
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
const bonus = { data: null, at: 0, msg: "", go: {} };
async function loadBonus() {
  clearInterval(bonusTimer);
  if (isLoggedIn()) {
    try { bonus.data = await api("/api/bonus"); bonus.at = Date.now(); bonus.msg = ""; } catch (e) { bonus.msg = e.message; }
  }
  renderBonus();
  bonusTimer = setInterval(() => { if (state.screen !== "bonus") return clearInterval(bonusTimer); tickBonus(); }, 1000);
}
function leftText(sec) { sec = Math.max(0, sec); const p = n => String(n).padStart(2, "0"); return p(Math.floor(sec / 3600)) + ":" + p(Math.floor(sec % 3600 / 60)) + ":" + p(sec % 60); }
function taskIcon(t) { return /tiktok/i.test(t.url) ? "tiktok" : /t\.me/i.test(t.url) ? "telegram" : "link"; }
function renderBonus() {
  const b = $("bonusBody");
  if (!isLoggedIn()) { b.innerHTML = `<div class="bcard"><div class="b-ico">${ic("gift", 22)}</div><div class="b-txt"><b>Бонусы для игроков</b><span>Войдите, чтобы получать награды</span></div><button class="b-btn" onclick="openAuth()">Войти</button></div>`; return; }
  const d = bonus.data;
  if (!d) { b.innerHTML = `<div class="b-msg">${esc(bonus.msg || "Загрузка…")}</div>`; return; }
  const left = d.daily.secondsLeft - Math.floor((Date.now() - bonus.at) / 1000);
  b.innerHTML = `<div class="b-msg" id="bMsg">${esc(bonus.msg)}</div>
    <div class="bcard"><div class="b-ico">${ic("calendar", 22)}</div><div class="b-txt"><b>Ежедневный бонус</b><span><em>+${fmt(d.daily.amount)}</em> каждый день</span></div>
      <button class="b-btn" id="dailyBtn" ${d.daily.available ? "" : "disabled"} onclick="claimDaily()">${d.daily.available ? "Забрать" : leftText(left)}</button></div>
    <div class="pg-sub">Задания</div>` +
    (d.tasks.length ? d.tasks.map(t => {
      let btn;
      if (t.done) btn = `<button class="b-btn" disabled>${ic("check", 16)}</button>`;
      else if (t.started || bonus.go[t.id]) btn = `<button class="b-btn" id="tb${t.id}" onclick="taskClaim(${t.id})">Проверить</button>`;
      else btn = `<button class="b-btn" onclick="taskGo(${t.id})">Выполнить</button>`;
      return `<div class="bcard"><div class="b-ico">${ic(taskIcon(t), 22)}</div><div class="b-txt"><b>${esc(t.title)}</b><span><em>+${fmt(t.reward)}</em></span></div>${btn}</div>`;
    }).join("") : `<div class="pg-hint">Заданий пока нет — загляните позже.</div>`);
}
function tickBonus() {
  const d = bonus.data; if (!d) return;
  const btn = $("dailyBtn"); if (!btn || d.daily.available) return;
  const left = d.daily.secondsLeft - Math.floor((Date.now() - bonus.at) / 1000);
  if (left <= 0) return loadBonus();
  btn.textContent = leftText(left);
}
async function claimDaily() {
  try { mergeServerUser(await api("/api/bonus/daily", { method: "POST" })); notify("win", "Ежедневный бонус", "Награда получена", "+" + fmt(bonus.data.daily.amount), OK_ITEM); } catch (e) { bonus.msg = e.message; }
  loadBonus();
}
function openExternal(url) {
  const tg = tgApp();
  if (tg && /^https?:\/\/t\.me\//i.test(url) && tg.openTelegramLink) tg.openTelegramLink(url);
  else if (tg && tg.openLink) tg.openLink(url);
  else window.open(url, "_blank", "noopener");
}
async function taskGo(id) {
  const t = bonus.data.tasks.find(x => x.id === id); if (!t) return;
  openExternal(t.url); bonus.go[id] = true;
  try { await api("/api/tasks/" + id + "/start", { method: "POST" }); t.started = true; } catch (e) { bonus.msg = e.message; }
  renderBonus();
}
async function taskClaim(id) {
  const t = bonus.data.tasks.find(x => x.id === id); if (!t) return;
  try {
    mergeServerUser(await api("/api/tasks/" + id + "/claim", { method: "POST", body: { initData: (tgApp() && tgApp().initData) || undefined } }));
    t.done = true; bonus.msg = ""; notify("win", "Задание выполнено", t.title, "+" + fmt(t.reward), OK_ITEM);
  } catch (e) { bonus.msg = e.message; }
  renderBonus();
}

/* ################ patches.js ################ */
/* фикс видео-мемов: карточки магазина/инвентаря/желаемых — тап по карточке только воспроизводит (двойной тап), действия — кнопками */
(function () {
  var key = "", at = 0, wrapRef = null, card = null, timer = 0;      // старый режим (крафт: тап по карточке = выбор)
  var cKey = "", cAt = 0, cEl = null;                                 // режим «вся карточка = воспроизведение»
  function flush() {
    if (!timer) return;
    clearTimeout(timer); timer = 0;
    var c = card; card = null;
    if (c && c.isConnected) c.click();
  }
  window.cardTap = function (e, cardEl) {
    if (e.target.closest("button")) return;
    var wrap = cardEl.querySelector(".meme-vid-wrap"); if (!wrap) return;
    var vid = wrap.querySelector("video"), k = vid ? (vid.dataset.src || "") : "", now = Date.now();
    if (k && k === cKey && now - cAt < 400 && cEl && (cEl === cardEl || !cEl.isConnected)) {
      cKey = ""; cAt = 0; cEl = null;
      toggleMemeSound(e, wrap);
    } else { cKey = k; cAt = now; cEl = cardEl; }
  };
  window.memeTap = function (e, wrap) {
    var vid = wrap.querySelector("video");
    var k = vid ? (vid.dataset.src || "") : "";
    var c = wrap.closest(".card");
    if (c && c.hasAttribute("data-cardplay")) return;   // обрабатывает cardTap на всей карточке
    var now = Date.now();
    if (c) e.stopPropagation();
    var same = k && k === key && now - at < 400 && wrapRef && (wrapRef === wrap || !wrapRef.isConnected);
    if (same) {
      clearTimeout(timer); timer = 0; card = null; key = ""; at = 0; wrapRef = null;
      toggleMemeSound(e, wrap);
      return;
    }
    flush();
    key = k; at = now; wrapRef = wrap;
    if (c) { card = c; timer = setTimeout(flush, 380); }
  };
  window.__stopLoud = function () {
    if (!__loudVideo) return;
    var lv = __loudVideo, wrap = __loudWrap;
    __loudVideo = null; __loudWrap = null;
    __stopVideoKey(wrap);
    lv.pause(); lv.muted = true;
    try { lv.currentTime = 0; } catch (e) {}
    lv.removeAttribute("src"); lv.load();
    if (wrap) wrap.classList.remove("playing");
    try { __queueThumb(lv); } catch (e) {}
  };
})();
