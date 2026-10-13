/* ===== Режим для слабых телефонов + политика конфиденциальности при первом входе ===== */
(function () {
  // 1) Слабый телефон или режим «уменьшить движение» — отключаем тяжёлые эффекты (блюр, тени, бесконечные анимации)
  let saved = null;
  try { saved = localStorage.getItem("amg_lite"); } catch (e) {}
  const reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const weak = (navigator.deviceMemory && navigator.deviceMemory <= 3) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  const on = saved === "1" || (saved === null && (weak || reduce));
  if (on) document.documentElement.classList.add("lite");
})();

/* Переключить «лёгкий режим» вручную: setLiteMode(true/false) */
function setLiteMode(v) {
  try { localStorage.setItem("amg_lite", v ? "1" : "0"); } catch (e) {}
  document.documentElement.classList.toggle("lite", !!v);
}

const PRIVACY_VERSION = "1";
const PRIVACY_TEXT = `
<h3>Политика конфиденциальности Amgrader</h3>
<p><i>Дата вступления в силу: 13.10.2026</i></p>

<p><b>1. Что такое Amgrader.</b> Amgrader — это онлайн-игра с виртуальными предметами и внутренней валютой G.</p>
<p><b>2. Мы не казино.</b> Amgrader не является азартной игрой, лотереей или казино и не предназначен для ставок на деньги. Внутренняя валюта G и виртуальные предметы не имеют денежной стоимости: их нельзя вывести, продать или обменять на деньги, криптовалюту или реальные товары. Вы не вносите и не выводите реальные деньги.</p>
<p><b>3. Какие данные мы храним.</b> Логин или ID Telegram, ник, игровой прогресс (баланс G, инвентарь, история открытий и апгрейдов, выполненные квесты), реферальные связи, технические данные (IP-адрес, тип устройства, журналы работы сервера).</p>
<p><b>4. Зачем.</b> Чтобы работал ваш аккаунт и сохранялся прогресс, чтобы работали вход, трейды, колесо и квесты, чтобы защищать игру от мошенничества и злоупотреблений, и чтобы отвечать на обращения.</p>
<p><b>5. Где хранятся данные.</b> На серверах хостинга (Railway). Данные хранятся, пока существует аккаунт. Вы можете удалить профиль в разделе «Профиль» — тогда аккаунт и связанные с ним данные удаляются.</p>
<p><b>6. С кем мы делимся.</b> С хостинг-провайдером, который обеспечивает работу сервера, и с Telegram — только для входа через бота. Данные не продаём и не передаём рекламным сетям. Реклама в приложении не показывается.</p>
<p><b>7. Ваши права.</b> Вы можете запросить доступ к своим данным, их исправление или удаление. Для этого напишите нам (контакт ниже).</p>
<p><b>8. Возраст.</b> Игра предназначена для совершеннолетних. Если вам меньше 18 лет, используйте приложение только с согласия родителей или законных представителей.</p>
<p><b>9. Изменения.</b> Если политика изменится, мы сообщим об этом в приложении, и её нужно будет принять заново.</p>
<p><b>10. Контакт.</b> [укажите почту или ссылку на поддержку]</p>
`;

function privacyAccepted() {
  try { return localStorage.getItem("amg_privacy") === PRIVACY_VERSION; } catch (e) { return true; }
}
function showPrivacyIfNeeded() {
  if (privacyAccepted()) return;
  const wrap = document.createElement("div");
  wrap.id = "privacyOv";
  wrap.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;padding:16px;";
  wrap.innerHTML = `<div style="background:var(--surface-1);color:var(--text);max-width:520px;width:100%;max-height:88vh;border-radius:22px;display:flex;flex-direction:column;overflow:hidden;">
    <div style="padding:18px 20px;overflow:auto;font-size:14px;line-height:1.5;color:var(--text-dim);">${PRIVACY_TEXT}</div>
    <div style="padding:12px 16px;border-top:1px solid var(--border-hi);">
      <button id="privacyOk" class="primary-btn" style="width:100%">Принимаю</button></div></div>`;
  document.body.appendChild(wrap);
  document.getElementById("privacyOk").onclick = () => {
    try { localStorage.setItem("amg_privacy", PRIVACY_VERSION); } catch (e) {}
    wrap.remove();
  };
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", showPrivacyIfNeeded);
else showPrivacyIfNeeded();
