/* ===== Темы оформления: встроенные, свой цвет и свои темы (в аккаунте) ===== */
const THEMES = [
  { id: "lime",     name: "Лайм",        accent: "#B6F24A" },
  { id: "blue",     name: "Синий",       accent: "#3A68B8" },
  { id: "red",      name: "Красный",     accent: "#E5484D" },
  { id: "orange",   name: "Оранжевый",   accent: "#FF8A3D" },
  { id: "yellow",   name: "Жёлтый",      accent: "#F5C542" },
  { id: "green",    name: "Зелёный",     accent: "#2FBF71" },
  { id: "cyan",     name: "Бирюзовый",   accent: "#2EC4D6" },
  { id: "violet",   name: "Фиолетовый",  accent: "#8B5CF6" },
  { id: "pink",     name: "Розовый",     accent: "#F2619B" },
  { id: "white",    name: "Белый",       accent: "#E8E8EC" },
  { id: "graphite", name: "Графит",      accent: "#6B7280" },
  { id: "brown",    name: "Коричневый",  accent: "#A86B3C" },
];
const THEME_KEY = "amg_theme";           // значение: id встроенной | id своей (c…) | "#rrggbb"
const THEME_CUSTOM_KEY = "amg_theme_custom";
const PAL_VARS = ["--bg", "--surface-1", "--surface-2", "--surface-3", "--text", "--text-dim", "--text-mute",
  "--accent", "--border", "--border-hi"];
let themeCustom = [];
let themeFormOpen = false;
try { themeCustom = JSON.parse(localStorage.getItem(THEME_CUSTOM_KEY) || "[]"); } catch (e) { themeCustom = []; }

function themeMix(c1, c2, t) {
  const a = [1, 3, 5].map(i => parseInt(c1.substr(i, 2), 16)), b = [1, 3, 5].map(i => parseInt(c2.substr(i, 2), 16));
  return "#" + a.map((x, i) => Math.round(x + (b[i] - x) * t).toString(16).padStart(2, "0")).join("");
}
function themeResolve(v) {
  if (THEMES.some(t => t.id === v)) return { accent: THEMES.find(t => t.id === v).accent, data: v };
  if (/^#[0-9a-f]{6}$/i.test(v || "")) return { accent: v.toLowerCase(), data: "custom" };
  const c = themeCustom.find(x => x.id === v);
  if (c) return { accent: c.color, data: "custom" };
  return { accent: "#B6F24A", data: "lime" };
}
function getThemeValue() { try { return localStorage.getItem(THEME_KEY) || "lime"; } catch (e) { return "lime"; } }

/* Цвета из одного акцента: тот же расчёт, что в css/themes.css */
function themePalette(acc) {
  return {
    "--bg": themeMix("#000000", acc, 0.05), "--surface-1": themeMix("#000000", acc, 0.085),
    "--surface-2": themeMix("#000000", acc, 0.12), "--surface-3": themeMix("#000000", acc, 0.16),
    "--text": "#F4F4F5", "--text-dim": "#8E8E98", "--text-mute": "#5A5A64", "--accent": acc,
    "--border": "rgba(255,255,255,0.06)", "--border-hi": "rgba(255,255,255,0.12)",
  };
}
function applyTheme(v) {
  const r = themeResolve(v), root = document.documentElement;
  PAL_VARS.forEach(p => root.style.removeProperty(p));
  root.setAttribute("data-theme", r.data);
  if (r.data === "custom") {
    const pal = themePalette(r.accent);
    Object.keys(pal).forEach(k => root.style.setProperty(k, pal[k]));
  }
  try { localStorage.setItem(THEME_KEY, v); } catch (e) {}
  return v;
}
async function themeSyncFromServer() {
  if (!isLoggedIn()) return;
  try {
    const d = await api("/api/theme");
    themeCustom = d.custom || [];
    try { localStorage.setItem(THEME_CUSTOM_KEY, JSON.stringify(themeCustom)); } catch (e) {}
    if (d.theme !== getThemeValue()) applyTheme(d.theme);
  } catch (e) {}
}
async function setThemeValue(v) {
  applyTheme(v);
  if (isLoggedIn()) { try { await api("/api/theme", { method: "POST", body: { theme: v } }); } catch (e) {} }
  openThemes();
}
function themeCell(id, name, color, on, isCustom) {
  const del = isCustom ? `<span class="th-del" onclick="event.stopPropagation();delCustomTheme('${id}')" aria-label="Удалить">✕</span>` : "";
  return `<button class="theme-item${on ? " on" : ""}" onclick="setThemeValue('${id}')" style="--ta:${color}">${del}` +
    `<span class="theme-sw"></span><span class="theme-name">${esc(name)}</span></button>`;
}
let thH = 200, thS = 60, thV = 80;     // текущий цвет своей темы (оттенок, насыщенность, яркость)
const CP_PRESETS = ["#B6F24A","#3A68B8","#E5484D","#FF8A3D","#F5C542","#2FBF71","#2EC4D6","#8B5CF6",
  "#F2619B","#E8E8EC","#6B7280","#A86B3C","#FF5C8A","#00C2A8","#FFD166","#7C5CFF"];
function hsvToHex(h, s, v) {
  s /= 100; v /= 100;
  const f = n => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
  return "#" + [f(5), f(3), f(1)].map(x => Math.round(x * 255).toString(16).padStart(2, "0")).join("");
}
function hexToHsv(hex) {
  const r = parseInt(hex.substr(1, 2), 16) / 255, g = parseInt(hex.substr(3, 2), 16) / 255, b = parseInt(hex.substr(5, 2), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) {
    if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  return { h, s: mx ? d / mx * 100 : 0, v: mx * 100 };   // без округления: цвет возвращается точно
}
function thColorHex() { return hsvToHex(thH, thS, thV); }
function cpForm() {
  const dots = CP_PRESETS.map(p => `<button class="cp-dot" data-hex="${p.toLowerCase()}" style="background:${p}" onclick="cpSet('${p}')" aria-label="${p}"></button>`).join("");
  return `<div class="cp">
    <div class="cp-prev" id="cpPrev"><span id="cpHexTxt">${thColorHex().toUpperCase()}</span></div>
    <div class="cp-presets">${dots}</div>
    <div class="cp-lbl">Оттенок</div>
    <input type="range" id="cpH" class="cp-range cp-hue" min="0" max="360" value="${Math.round(thH)}" oninput="cpInput('h',this.value)">
    <div class="cp-lbl">Насыщенность</div>
    <input type="range" id="cpS" class="cp-range" min="0" max="100" value="${Math.round(thS)}" oninput="cpInput('s',this.value)">
    <div class="cp-lbl">Яркость</div>
    <input type="range" id="cpV" class="cp-range" min="0" max="100" value="${Math.round(thV)}" oninput="cpInput('v',this.value)">
  </div>`;
}
function cpPaint() {
  const hex = thColorHex();
  const p = document.getElementById("cpPrev"); if (p) p.style.background = hex;
  const t = document.getElementById("cpHexTxt"); if (t) t.textContent = hex.toUpperCase();
  const sl = document.getElementById("cpS"); if (sl) { sl.value = Math.round(thS); sl.style.background = `linear-gradient(90deg, ${hsvToHex(thH, 0, thV)}, ${hsvToHex(thH, 100, thV)})`; }
  const vl = document.getElementById("cpV"); if (vl) { vl.value = Math.round(thV); vl.style.background = `linear-gradient(90deg, #000, ${hsvToHex(thH, thS, 100)})`; }
  const hl = document.getElementById("cpH"); if (hl) hl.value = Math.round(thH);
  document.querySelectorAll(".cp-dot").forEach(d => d.classList.toggle("on", d.dataset.hex === hex));
}
function cpInput(k, v) {
  v = +v; if (k === "h") thH = v; if (k === "s") thS = v; if (k === "v") thV = v;
  cpPaint();
}
function cpSet(hex) { const c = hexToHsv(hex); thH = c.h; thS = c.s; thV = c.v; cpPaint(); }
function openThemes() {
  const cur = getThemeValue();
  const builtin = THEMES.map(t => themeCell(t.id, t.name, t.accent, cur === t.id, false)).join("");
  const mine = themeCustom.map(c => themeCell(c.id, c.name, c.color, cur === c.id, true)).join("");
  const add = `<button class="theme-item" onclick="themeToggleForm()"><span class="theme-sw theme-add">+</span><span class="theme-name">Свой цвет</span></button>`;
  const form = themeFormOpen ? `<div class="th-form">
      ${cpForm()}
      <input type="text" id="thName" class="th-name" maxlength="20" placeholder="Название темы">
      <button class="primary-btn" onclick="addCustomTheme()">${isLoggedIn() ? "Сохранить в аккаунт" : "Применить"}</button>
      <div class="misc-hint" id="thMsg">${isLoggedIn() ? "" : "Войдите, чтобы сохранять свои темы в аккаунт"}</div></div>` : "";
  openMisc(miscHead(ic("gift", 24), "Тема оформления", "Выберите цвет приложения") +
    `<div class="reg-body"><div class="theme-grid">${builtin}${mine}${add}</div>${form}</div>`);
}
async function openThemesSync() { await themeSyncFromServer(); openThemes(); }
function themeToggleForm() {
  themeFormOpen = !themeFormOpen;
  if (themeFormOpen) { const c = hexToHsv(themeResolve(getThemeValue()).accent); thH = c.h; thS = c.s; thV = c.v; }
  openThemes();
  setTimeout(() => {
    const f = document.querySelector(".th-form");
    if (f) f.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 60);
}
function themeMsg(t) { const el = document.getElementById("thMsg"); if (el) el.textContent = t; }
async function addCustomTheme() {
  const name = (document.getElementById("thName").value || "").trim();
  const color = thColorHex();
  if (!name) return themeMsg("Введите название");
  if (!isLoggedIn()) { applyTheme(color); themeFormOpen = false; openThemes(); return; }
  try {
    const d = await api("/api/theme/custom", { method: "POST", body: { name, color } });
    themeCustom = d.custom || [];
    try { localStorage.setItem(THEME_CUSTOM_KEY, JSON.stringify(themeCustom)); } catch (e) {}
    themeFormOpen = false;
    await setThemeValue(themeCustom[themeCustom.length - 1].id);
  } catch (e) { themeMsg(e.message); }
}
async function delCustomTheme(id) {
  if (!confirm("Удалить тему?")) return;
  try {
    const d = await api("/api/theme/custom/delete", { method: "POST", body: { id } });
    themeCustom = d.custom || [];
    try { localStorage.setItem(THEME_CUSTOM_KEY, JSON.stringify(themeCustom)); } catch (e) {}
    applyTheme(d.theme);
  } catch (e) {}
  openThemes();
}
applyTheme(getThemeValue());
setTimeout(themeSyncFromServer, 1500);
