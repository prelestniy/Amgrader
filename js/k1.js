/* ===== Обои: фон приложения на этом устройстве. Готовые — градиенты, своё фото сжимается до 1080 px ===== */
const WP_PRESETS = [
  { id: "none",   name: "Без обоев", css: "" },
  { id: "aurora", name: "Аврора",    css: "radial-gradient(120% 80% at 10% 0%, #5B2A86 0%, transparent 60%), radial-gradient(100% 70% at 100% 100%, #1B6E8C 0%, transparent 60%), #0B0714" },
  { id: "ember",  name: "Угли",      css: "radial-gradient(90% 60% at 50% 110%, #FF6A2B 0%, transparent 60%), radial-gradient(70% 50% at 0% 0%, #5A0F0F 0%, transparent 70%), #0E0606" },
  { id: "forest", name: "Лес",       css: "radial-gradient(100% 70% at 80% 0%, #2F7D4A 0%, transparent 60%), radial-gradient(90% 60% at 0% 100%, #0F3B24 0%, transparent 65%), #06100A" },
  { id: "ocean",  name: "Океан",     css: "radial-gradient(100% 70% at 50% 0%, #2E7BD6 0%, transparent 60%), linear-gradient(180deg, #071A2E, #03070F)" },
  { id: "gold",   name: "Золото",    css: "radial-gradient(100% 80% at 50% 0%, #B8860B 0%, transparent 65%), #0E0A03" },
  { id: "dots",   name: "Точки",     css: "radial-gradient(rgba(255,255,255,.12) 1px, transparent 1.2px) 0 0 / 14px 14px, #0A0A0C" },
  { id: "lines",  name: "Полосы",    css: "repeating-linear-gradient(135deg, rgba(255,255,255,.05) 0 2px, transparent 2px 18px), #0A0A0C" },
];
const WP_KEY = "amg_wp", WP_IMG_KEY = "amg_wp_img";

function wpCurrent() { try { return localStorage.getItem(WP_KEY) || "none"; } catch (e) { return "none"; } }
function wpCustomImg() { try { return localStorage.getItem(WP_IMG_KEY) || ""; } catch (e) { return ""; } }
function wpApply(id) {
  const layer = document.getElementById("wpLayer");
  let bg = "";
  if (id === "custom") {
    const img = wpCustomImg();
    if (img) bg = `linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.55)), url("${img}") center / cover no-repeat`;
    else id = "none";
  } else {
    const p = WP_PRESETS.find(x => x.id === id);
    if (p && p.css) bg = p.css; else id = "none";
  }
  if (layer) { layer.style.background = bg; layer.hidden = id === "none"; }
  try { localStorage.setItem(WP_KEY, id); } catch (e) {}
  return id;
}
function wpMsg(t) { const el = document.getElementById("wpMsg"); if (el) el.textContent = t; }
function wpSet(id) { wpApply(id); openWallpapers(); }

function wpPickPhoto() {
  const inp = document.createElement("input");
  inp.type = "file"; inp.accept = "image/*";
  inp.onchange = () => {
    const f = inp.files && inp.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, 1080 / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        let data = "";
        try { data = c.toDataURL("image/jpeg", 0.8); } catch (e) {}
        if (!data) return wpMsg("Не удалось открыть это фото");
        try { localStorage.setItem(WP_IMG_KEY, data); } catch (e) { return wpMsg("Фото слишком большое для хранения на устройстве"); }
        wpApply("custom");
        openWallpapers();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(f);
  };
  inp.click();
}
function openWallpapers() {
  const cur = wpCurrent();
  const cards = WP_PRESETS.map(p => `<button class="wp-card${cur === p.id ? " on" : ""}" onclick="wpSet('${p.id}')">` +
    `<span class="wp-prev" style="${p.css ? "background:" + p.css : "background:var(--surface-2)"}"></span><span class="wp-name">${p.name}</span></button>`).join("");
  const img = wpCustomImg();
  const photo = `<button class="wp-card${cur === "custom" ? " on" : ""}" onclick="wpPickPhoto()">` +
    `<span class="wp-prev wp-photo" style="${img ? `background-image:url('${img}')` : ""}">${img ? "" : "+"}</span><span class="wp-name">Своё фото</span></button>`;
  openMisc(miscHead(ic("gift", 24), "Обои", "Фон приложения на этом устройстве") +
    `<div class="reg-body"><div class="wp-grid">${cards}${photo}</div><div class="misc-hint" id="wpMsg"></div></div>`);
}
wpApply(wpCurrent());
