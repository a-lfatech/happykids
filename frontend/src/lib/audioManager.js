let ctx = null;
let cfg = { sound: true, speech: true, volume: 0.8 };
let failCb = null;
let speakId = 0;
let failTimer = null;
let voices = [];

const synth = () => (typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null);
const loadVoices = () => { voices = synth()?.getVoices() || []; };
if (synth()) {
  loadVoices();
  synth().onvoiceschanged = loadVoices;
}

export const configure = (c) => { cfg = { ...cfg, ...c }; };
export const onSpeechFail = (cb) => { failCb = cb; };
export const speechSupported = () => !!synth();

const getCtx = () => {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

export const unlockAudio = () => {
  getCtx();
  if (synth()) {
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    synth().speak(u);
  }
};

const tone = (freq, start, dur, { type = "sine", gain = 0.22, to } = {}) => {
  if (!cfg.sound) return;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(gain * cfg.volume, 0.0002), t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
};

export const sfx = {
  tap: () => tone(660, 0, 0.08, { type: "triangle", gain: 0.12 }),
  place: () => { tone(784, 0, 0.12, { type: "triangle" }); tone(1046, 0.08, 0.16, { type: "triangle" }); },
  hop: () => tone(320, 0, 0.2, { type: "sine", gain: 0.2, to: 760 }),
  wrong: () => { tone(392, 0, 0.18, { type: "triangle", gain: 0.14 }); tone(330, 0.16, 0.26, { type: "triangle", gain: 0.14 }); },
  correct: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.32, { type: "triangle", gain: 0.2 })),
  fanfare: () => [523, 659, 784, 659, 784, 1046, 1318].forEach((f, i) => tone(f, i * 0.14, i === 6 ? 0.7 : 0.25, { type: "triangle", gain: 0.2 })),
};

const PREFERRED = ["samantha", "karen", "moira", "tessa", "serena", "victoria", "google uk english female", "google us english", "aria", "jenny", "zira", "libby", "sonia", "natasha", "female"];
const pickVoice = () => {
  const en = voices.filter((v) => /^en/i.test(v.lang));
  for (const p of PREFERRED) {
    const v = en.find((x) => x.name.toLowerCase().includes(p));
    if (v) return v;
  }
  return en[0] || null;
};

export const stopSpeaking = () => {
  speakId++;
  clearTimeout(failTimer);
  synth()?.cancel();
};

export const speak = (text, { onEnd } = {}) => {
  const s = synth();
  if (!cfg.speech || !s) { onEnd?.(); return; }
  const id = ++speakId;
  clearTimeout(failTimer);
  s.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice();
  if (v) u.voice = v;
  u.lang = v?.lang || "en-US";
  u.rate = 0.88;
  u.pitch = 1.35;
  u.volume = cfg.volume;
  let started = false;
  failTimer = setTimeout(() => { if (!started && id === speakId) failCb?.(); }, 3000);
  u.onstart = () => { started = true; clearTimeout(failTimer); };
  u.onend = () => { if (id === speakId) { clearTimeout(failTimer); onEnd?.(); } };
  u.onerror = (e) => {
    if (id !== speakId || e.error === "interrupted" || e.error === "canceled") return;
    failCb?.();
    onEnd?.();
  };
  setTimeout(() => { if (id === speakId) s.speak(u); }, 60);
};
