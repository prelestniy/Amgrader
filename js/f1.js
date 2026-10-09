/* ===== Бабл-меню разделов: Игры / Бонусы ===== */
(function () {
  const BUBBLES = {
    games: { title: "Игры", btn: "navGames", screens: ["ladder", "mines", "craft"], items: [
      { screen: "ladder", name: "Лесенка", tone: "#FFB020", tag: "Поднимайся выше", ico: "<svg class=\"ic\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 20V4M4 4h4M4 9h5M4 14h6M4 19h7M20 4v16M20 20h-4M20 15h-5M20 10h-6M20 5h-7\"/></svg>" },
      { screen: "mines",  name: "Мины", tone: "#FF5A4F", tag: "Обходи ловушки", ico: "<svg class=\"ic\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"6.2\"/><path d=\"M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6\"/></svg>" },
      { screen: "craft",  name: "Крафт", tone: "#B26BFF", tag: "Собери новое", ico: "<svg class=\"ic\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 3l9 5-9 5-9-5z\"/><path d=\"M3 13l9 5 9-5M3 17.5l9 5 9-5\"/></svg>" }
    ]},
    bonus: { title: "Квесты", btn: "navBonus", screens: ["bonus", "wheel"], items: [
      { screen: "bonus", name: "Квесты", sub: "ежедневные задания", tone: "var(--accent)", tag: "Выполняй задания", ico: "<svg class=\"ic\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"3\"/><path d=\"M3 10h18M8 3v4M16 3v4\"/></svg>" },
      { screen: "wheel", name: "Колесо бонусов", sub: "крути и выигрывай", tone: "#FFB020", tag: "Крути и выигрывай", ico: "<svg class=\"ic\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 3v9l6 3\"/><circle cx=\"12\" cy=\"12\" r=\"1\"/></svg>" }
    ]}
  };
  let openKey = null;
  const $id = id => document.getElementById(id);

  function renderBubble(key) {
    const cfg = BUBBLES[key], cur = (typeof state !== "undefined" && state.screen) || "";
    $id("gbTitle").textContent = cfg.title;
    $id("gbList").innerHTML = cfg.items.map((it, i) => {
      const cls = "gb-item" + (it.soon ? " soon" : "") + (!it.soon && it.screen === cur ? " current" : "");
      const sub = it.sub ? `<small>${it.sub}</small>` : "";
      const pill = it.soon ? `<span class="gb-pill">в разработке</span>` : "";
      const act = it.soon ? `onclick="bubbleSoon(this)"` : `onclick="bubbleGo('${it.screen}', this)"`;
      return `<button class="${cls}" style="--i:${i}" role="menuitem" ${act}><span class="gb-ico">${it.ico}</span><span class="gb-txt"><b>${it.name}</b>${sub}</span>${pill}</button>`;
    }).join("");
  }

  window.toggleBubble = function (key, btn) {
    if (openKey === key) return closeBubble();
    const b = $id("glassBubble");
    const wasOpen = openKey !== null;
    openKey = key;
    renderBubble(key);
    document.querySelectorAll(".nav-btn[aria-expanded]").forEach(x => { x.setAttribute("aria-expanded", x === btn ? "true" : "false"); x.classList.toggle("open", x === btn); });
    // позиция: над кнопкой, бабл «вырастает» из неё
    const nav = $id("bottomNav").getBoundingClientRect(), r = btn.getBoundingClientRect();
    const vw = document.documentElement.clientWidth, w = 236, cx = r.left + r.width / 2;
    const left = Math.min(Math.max(10, cx - w / 2), vw - w - 10);
    b.style.left = left + "px";
    b.style.bottom = (window.innerHeight - nav.top + 10) + "px";
    b.style.setProperty("--ox", (cx - left) + "px");
    if (wasOpen) { b.classList.remove("on"); void b.offsetWidth; }
    b.classList.add("on"); b.setAttribute("aria-hidden", "false");
    $id("glassScrim").classList.add("on");
    try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) {}
  };

  window.closeBubble = function () {
    openKey = null;
    $id("glassBubble").classList.remove("on"); $id("glassBubble").setAttribute("aria-hidden", "true");
    $id("glassScrim").classList.remove("on");
    document.querySelectorAll(".nav-btn[aria-expanded]").forEach(x => { x.setAttribute("aria-expanded", "false"); x.classList.remove("open"); });
  };
  window.bubbleGo = function (screen, el) {
    const g = Object.values(BUBBLES).flatMap(b => b.items).find(i => i.screen === screen && i.tone);
    const fx = $id("modeFx");
    const calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!g || !el || !fx || calm || fx.classList.contains("in") || (typeof state !== "undefined" && state.spinning)) { closeBubble(); showScreen(screen); return; }
    const r = (el.querySelector(".gb-ico") || el).getBoundingClientRect();
    closeBubble();
    fx.style.setProperty("--x", (r.left + r.width / 2) + "px");
    fx.style.setProperty("--y", (r.top + r.height / 2) + "px");
    fx.style.setProperty("--tone", g.tone);
    fx.innerHTML = '<div class="mfx-bg"></div><div class="mfx-core"><div class="mfx-ring"></div><div class="mfx-ring r2"></div>' +
      '<div class="mfx-ico">' + g.ico + '</div><div class="mfx-name">' + g.name + '</div><div class="mfx-tag">' + g.tag + '</div></div>';
    fx.className = "mode-fx"; void fx.offsetWidth; fx.classList.add("in");
    try { if (navigator.vibrate) navigator.vibrate([10, 40, 14]); } catch (e) {}
    setTimeout(() => showScreen(screen), 430);
    setTimeout(() => fx.classList.add("out"), 1150);
    setTimeout(() => { fx.className = "mode-fx"; fx.innerHTML = ""; }, 1650);
  };
  window.bubbleSoon = function (el) { el.classList.remove("nudge"); void el.offsetWidth; el.classList.add("nudge"); };
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeBubble(); });
  window.addEventListener("resize", () => closeBubble());

  // подсветка «Игры» / «Бонусы» по текущему экрану + закрытие бабла при смене экрана
  function syncNav(name) {
    Object.keys(BUBBLES).forEach(k => {
      const b = $id(BUBBLES[k].btn); if (b) b.classList.toggle("active", BUBBLES[k].screens.includes(name));
    });
  }
  const _show = showScreen;
  showScreen = function (name) { closeBubble(); const r = _show.apply(this, arguments); syncNav(name); return r; };
  window.showScreen = showScreen;
  syncNav((typeof state !== "undefined" && state.screen) || "upgrade");
})();
