/* ===== Вход через Telegram из приложения (APK / браузер): открывается отдельный бот, сайт ждёт подтверждения ===== */
function webTgUpdate() {
  const btn = document.getElementById("webTgBtn");
  if (btn) btn.style.display = tgApp() ? "none" : "";
}
let webLoginTimer = null;
async function webLoginStart() {
  const btn = document.getElementById("webTgBtn");
  try {
    const r = await api("/api/web-login/start", { method: "POST", body: { ref: getRefFromUrl() || "" } });
    window.open(r.link, "_blank");
    clearInterval(webLoginTimer);
    const end = Date.now() + 5 * 60 * 1000;
    webLoginTimer = setInterval(async () => {
      if (Date.now() > end) return clearInterval(webLoginTimer);
      try {
        const s = await api("/api/web-login/" + r.token);
        if (s.status === "ok") {
          clearInterval(webLoginTimer);
          setToken(s.user.token); applyServerUser(s.user);
          closeAuth(); renderAll(); renderProfile(); pulseBalance();
          notify("win", "Вход выполнен", state.profile.nickname, "", OK_ITEM);
        } else if (s.status === "expired") {
          clearInterval(webLoginTimer);
        }
      } catch (e) {}
    }, 2000);
  } catch (e) {
    if (btn) btn.dataset.err = e.message;
    showAuthError(e.message);
  }
}
