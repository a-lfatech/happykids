const SR = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
let rec = null;
let timer = null;

export const recognitionSupported = () => !!SR;

export const parseCommand = (raw) => {
  const t = raw.toLowerCase();
  if (/thank/.test(t)) return "thanks";
  if (/listen|repeat|say (it )?again/.test(t)) return "listen";
  if (/try again|again/.test(t)) return "try";
  if (/next|continue|finish/.test(t)) return "next";
  return null;
};

export const stopListening = () => {
  clearTimeout(timer);
  if (rec) { try { rec.abort(); } catch (e) { /* already stopped */ } }
};

export const extractName = (raw) => {
  const t = raw.trim().replace(/[.,!?]/g, "")
    .replace(/^(hi|hello|hey)\s+/i, "")
    .replace(/^(my name is|my name's|i am|i'm|it's|it is|call me|this is)\s+/i, "");
  return t.split(/\s+/).slice(0, 2).join(" ").replace(/[^\p{L}\s'-]/gu, "").slice(0, 16);
};

const NUMBER_WORDS = { one: 1, first: 1, two: 2, second: 2, three: 3, third: 3, four: 4, fourth: 4, five: 5, fifth: 5, six: 6, sixth: 6, seven: 7, seventh: 7, eight: 8, eighth: 8 };

// Returns 0 for Pre-K/Kindergarten, 1-8 for a grade, or null if no grade was heard.
export const extractGrade = (raw) => {
  const t = raw.toLowerCase();
  if (/kinder|pre-?k|pre ?school|nursery|reception/.test(t)) return 0;
  const digit = t.match(/\b([1-8])(st|nd|rd|th)?\b/);
  if (digit) return Number(digit[1]);
  const word = Object.keys(NUMBER_WORDS).find((w) => new RegExp(`\\b${w}\\b`).test(t));
  return word ? NUMBER_WORDS[word] : null;
};

// Hears one short phrase and returns its words. Audio is never recorded or stored.
export const listenForText = ({ onText, onEnd, onDenied, duration = 7000 }) => {
  if (!SR) { onEnd?.(); return; }
  stopListening();
  const r = new SR();
  rec = r;
  r.lang = "en-US";
  r.interimResults = false;
  r.continuous = false;
  r.maxAlternatives = 1;
  r.onresult = (e) => {
    const text = e.results[0]?.[0]?.transcript || "";
    if (text) onText?.(text);
  };
  r.onerror = (e) => { if (e.error === "not-allowed" || e.error === "service-not-allowed") onDenied?.(); };
  r.onend = () => { if (rec === r) { rec = null; clearTimeout(timer); } onEnd?.(); };
  try { r.start(); } catch (e) { onEnd?.(); return; }
  timer = setTimeout(stopListening, duration);
};

// Short, on-demand listening window. Nothing is recorded or stored.
export const startListening = ({ onCommand, onEnd, onDenied, duration = 6000 }) => {
  if (!SR) { onEnd?.(); return; }
  stopListening();
  const r = new SR();
  rec = r;
  r.lang = "en-US";
  r.interimResults = true;
  r.continuous = false;
  r.maxAlternatives = 3;
  let done = false;
  r.onresult = (e) => {
    for (let i = e.resultIndex; i < e.results.length; i++) {
      for (let j = 0; j < e.results[i].length; j++) {
        const cmd = parseCommand(e.results[i][j].transcript);
        if (cmd && !done) { done = true; stopListening(); onCommand?.(cmd); return; }
      }
    }
  };
  r.onerror = (e) => { if (e.error === "not-allowed" || e.error === "service-not-allowed") onDenied?.(); };
  r.onend = () => { if (rec === r) { rec = null; clearTimeout(timer); } onEnd?.(); };
  try { r.start(); } catch (e) { onEnd?.(); return; }
  timer = setTimeout(stopListening, duration);
};
