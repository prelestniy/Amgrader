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
