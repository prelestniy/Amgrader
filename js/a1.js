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
  { id: 47, name: "Арест", nameEn: "", rarity: "mythic", price: 4800, video: "Арест.mp4" },
  { id: 48, name: "Спасибо Хорошо", nameEn: "", rarity: "secret", price: 8000, video: "спасибо_хорошо.mp4" },
  { id: 49, name: "Здравствуйте Андрей", nameEn: "", rarity: "secret", price: 9000, video: "здравствуйте_андрей.mp4" },
  { id: 50, name: "Потужненько", nameEn: "", rarity: "secret", price: 10500, video: "потужненько.mp4" },
  { id: 51, name: "Ты Не Бойся Ночи", nameEn: "", rarity: "secret", price: 12000, video: "ты_не_бойся_ночи.mp4" },
  { id: 52, name: "Классно Буду Знать", nameEn: "", rarity: "secret", price: 13500, video: "классно_буду_знать.mp4" },
  { id: 53, name: "Всё Будет Хорошо", nameEn: "", rarity: "secret", price: 15000, video: "всё_будет_хорошо.mp4" },
  { id: 54, name: "Прощай Дота", nameEn: "", rarity: "secret", price: 17000, video: "прощай_дота.mp4" },
  { id: 55, name: "У Ыа Уа", nameEn: "", rarity: "galactic", price: 21000, video: "у_ыа_уа.mp4" },
  { id: 56, name: "Чикен Ган", nameEn: "", rarity: "galactic", price: 25000, video: "чикен_ган.mp4" },
  { id: 57, name: "Собаку Пёр", nameEn: "", rarity: "galactic", price: 29000, video: "собаку_пёр.mp4" },
  { id: 58, name: "Шо Ты Масса", nameEn: "", rarity: "galactic", price: 33000, video: "шо_ты_масса.mp4" },
  { id: 59, name: "Только Ставки", nameEn: "", rarity: "galactic", price: 37000, video: "только_ставки.mp4" },
  { id: 60, name: "Сыр Сочится", nameEn: "", rarity: "galactic", price: 41000, video: "сыр_сочится.mp4" },
  { id: 61, name: "Сливы Один Арбуз", nameEn: "", rarity: "galactic", price: 46000, video: "сливы_один_арбуз.mp4" },
  { id: 62, name: "А Где Колбаска", nameEn: "", rarity: "sausage", price: 55000, video: "а_где_колбаска.mp4" },
  { id: 63, name: "Квас Тарас", nameEn: "", rarity: "sausage", price: 65000, video: "квас_тарас.mp4" },
  { id: 64, name: "Не Дай Бог Похудею", nameEn: "", rarity: "sausage", price: 78000, video: "не_дай_бог_похудею.mp4" },
  { id: 65, name: "Работает Спецназ", nameEn: "", rarity: "sausage", price: 92000, video: "работает_спецназ.mp4" },
  { id: 66, name: "Пошла Валютная Возня", nameEn: "", rarity: "sausage", price: 110000, video: "пошла_валютная_возня.mp4" },
  { id: 67, name: "Позови Меня С Собой", nameEn: "", rarity: "sausage", price: 130000, video: "позови_меня_с_собой.mp4" },
];

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
    case "secret":    return "#2EE6D0";
    case "galactic":  return "#E04BFF";
    case "sausage":   return "#E8896B";
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

