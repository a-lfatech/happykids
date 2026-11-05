import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Keyboard } from "lucide-react";
import { OnScreenKeyboard } from "./OnScreenKeyboard";
import { sfx } from "../../lib/audioManager";

const wpmOf = (correct, ms) => (ms > 0 ? Math.round((correct / 5) / (ms / 60000)) : 0);

export const Stat = ({ label, value, color }) => (
  <div className={`flex min-w-[84px] flex-col items-center rounded-2xl border-[3px] border-hc-navy px-3 py-1 ${color}`} style={{ boxShadow: "0 3px 0 #1F2547" }}>
    <span className="font-fredoka text-2xl font-bold leading-tight sm:text-3xl">{value}</span>
    <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
  </div>
);

export const TypeBox = ({ text, focusKeys, onFinish, showKeyboard = true }) => {
  const [typed, setTyped] = useState("");
  const [keystrokes, setKeystrokes] = useState({ ok: 0, all: 0 });
  const [startedAt, setStartedAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [focused, setFocused] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);
  const done = typed.length >= text.length;

  useEffect(() => { setTyped(""); setKeystrokes({ ok: 0, all: 0 }); setStartedAt(null); inputRef.current?.focus(); }, [text]);

  useEffect(() => {
    if (!startedAt || done) return undefined;
    const t = setInterval(() => setNow(Date.now()), 400);
    return () => clearInterval(t);
  }, [startedAt, done]);

  const correctChars = [...typed].filter((c, i) => c === text[i]).length;
  const elapsed = startedAt ? (done ? now : Date.now()) - startedAt : 0;
  const wpm = wpmOf(correctChars, elapsed);
  const acc = keystrokes.all ? Math.round((keystrokes.ok / keystrokes.all) * 100) : 100;

  const press = useCallback((ch) => {
    if (done) return;
    const t = Date.now();
    if (!startedAt) setStartedAt(t);
    const right = ch === text[typed.length];
    if (right) sfx.tap(); else { sfx.wrong(); setShake(true); setTimeout(() => setShake(false), 300); }
    const nextTyped = typed + ch;
    const nextStrokes = { ok: keystrokes.ok + (right ? 1 : 0), all: keystrokes.all + 1 };
    setTyped(nextTyped);
    setKeystrokes(nextStrokes);
    if (nextTyped.length >= text.length) {
      setNow(t);
      const ok = [...nextTyped].filter((c, i) => c === text[i]).length;
      onFinish?.({ wpm: wpmOf(ok, t - (startedAt || t)), acc: Math.round((nextStrokes.ok / nextStrokes.all) * 100) });
    }
  }, [done, startedAt, text, typed, keystrokes, onFinish]);

  const onKeyDown = (e) => {
    if (e.key === "Backspace") { e.preventDefault(); setTyped((s) => s.slice(0, -1)); return; }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) { e.preventDefault(); press(e.key); }
  };

  const onChange = (e) => {
    const v = e.target.value;
    if (v) press(v[v.length - 1]);
    e.target.value = "";
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        <Stat label="Words / min" value={wpm} color="bg-hc-skylight" />
        <Stat label="Accuracy" value={`${acc}%`} color="bg-hc-mintlight" />
        <Stat label="Letters" value={`${Math.min(typed.length, text.length)}/${text.length}`} color="bg-hc-sunlight" />
      </div>

      <div
        role="textbox"
        tabIndex={-1}
        onClick={() => inputRef.current?.focus()}
        className={`relative cursor-text rounded-[1.75rem] border-[3px] border-hc-navy bg-white px-4 py-5 text-left font-mono text-2xl leading-relaxed tracking-wide sm:px-8 sm:text-3xl ${shake ? "hc-shake" : ""}`}
        style={{ boxShadow: "0 5px 0 #1F2547" }}
        aria-label="Typing area"
        data-testid="typing-area"
      >
        {[...text].map((c, i) => {
          const t = typed[i];
          const cls = t === undefined ? "text-hc-navy/40" : t === c ? "text-hc-navy" : "rounded bg-hc-corallight text-red-700";
          return (
            <span key={i} className={`relative ${cls}`}>
              {i === typed.length && <motion.span layoutId="caret" className="absolute -left-[2px] top-[10%] h-[80%] w-[3px] rounded bg-hc-tang" animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} />}
              {c === " " && t !== undefined && t !== c ? "_" : c}
            </span>
          );
        })}
        {!focused && !done && (
          <span className="absolute inset-0 flex items-center justify-center gap-2 rounded-[1.6rem] bg-white/85 font-fredoka text-xl font-bold">
            <Keyboard className="h-6 w-6" /> Tap here, then start typing!
          </span>
        )}
        <input
          ref={inputRef}
          onKeyDown={onKeyDown}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck="false"
          aria-label="Type here"
          className="absolute h-px w-px opacity-0"
          data-testid="typing-input"
        />
      </div>

      {showKeyboard && <OnScreenKeyboard next={done ? null : text[typed.length]} focusKeys={focusKeys} />}
    </div>
  );
};
