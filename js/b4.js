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
  if (now - aud.lastT < 0.045) return;
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

