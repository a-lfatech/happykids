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
