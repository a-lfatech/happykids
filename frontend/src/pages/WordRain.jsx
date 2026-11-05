import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Play, RefreshCw } from "lucide-react";
import { Character } from "../components/Characters";
import { Confetti } from "../components/Confetti";
import { Modal } from "../components/Modal";
import { ToyButton } from "../components/ToyButton";
import { OnScreenKeyboard } from "../components/typing/OnScreenKeyboard";
import { RAIN_WORDS, loadTyping, saveRainResult } from "../data/typing";
import { TypingHeader } from "./TypingHub";
import { sfx, speak, unlockAudio } from "../lib/audioManager";

const LEVELS = [
  { id: 1, label: "Letters", hint: "Single keys", color: "bg-hc-mintlight" },
  { id: 2, label: "Short words", hint: "3 letters", color: "bg-hc-skylight" },
  { id: 3, label: "Words", hint: "4 letters", color: "bg-hc-sunlight" },
  { id: 4, label: "Big words", hint: "5 letters", color: "bg-hc-tanglight" },
];
const DROP_COLORS = ["bg-hc-sky", "bg-hc-mint", "bg-hc-sun", "bg-hc-tang", "bg-hc-coral", "bg-hc-lav"];
const LIVES = 3;

export default function WordRain() {
  const [level, setLevel] = useState(null);
  const [drops, setDrops] = useState([]);
  const [buffer, setBuffer] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [pops, setPops] = useState([]);
  const [over, setOver] = useState(null);
  const dropsRef = useRef([]);
  const scoreRef = useRef(0);
  const livesRef = useRef(LIVES);
  const inputRef = useRef(null);
  const uidRef = useRef(0);

  const start = (lv) => {
    unlockAudio();
    uidRef.current = 0;
    dropsRef.current = [];
    scoreRef.current = 0;
    livesRef.current = LIVES;
    setDrops([]); setScore(0); setLives(LIVES); setBuffer(""); setOver(null); setLevel(lv);
    speak("Type the words before they reach the puddle!");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    if (!level || over) return undefined;
    const words = RAIN_WORDS[level];
    let raf;
    let last = performance.now();
    let spawnIn = 0;
    const loop = (t) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const speed = 9 + Math.min(14, scoreRef.current / 4);
      spawnIn -= dt;
      let list = dropsRef.current.map((d) => ({ ...d, y: d.y + speed * dt }));
      if (spawnIn <= 0 && list.length < 5) {
        const used = new Set(list.map((d) => d.word));
        const pool = words.filter((w) => !used.has(w));
        const word = pool[Math.floor(Math.random() * pool.length)];
        if (word) { const id = ++uidRef.current; list.push({ id, word, x: 6 + Math.random() * 74, y: -8, color: DROP_COLORS[id % DROP_COLORS.length] }); }
        spawnIn = Math.max(1.1, 2.6 - scoreRef.current / 40);
      }
      const landed = list.filter((d) => d.y >= 88);
      if (landed.length) {
        sfx.wrong();
        livesRef.current -= landed.length;
        setLives(Math.max(0, livesRef.current));
        list = list.filter((d) => d.y < 88);
        setBuffer("");
      }
      dropsRef.current = list;
      setDrops(list);
      if (livesRef.current <= 0) {
        const best = saveRainResult(scoreRef.current);
        setOver({ score: scoreRef.current, best });
        speak(`Splash! You scored ${scoreRef.current} points.`);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [level, over]);

  const press = useCallback((ch) => {
    const next = (buffer + ch).toLowerCase();
    const list = dropsRef.current;
    const hit = list.find((d) => d.word === next);
    if (hit) {
      sfx.place();
      dropsRef.current = list.filter((d) => d.id !== hit.id);
      setDrops(dropsRef.current);
      scoreRef.current += hit.word.length;
      setScore(scoreRef.current);
      setPops((p) => [...p, { id: hit.id, x: hit.x, y: hit.y, word: hit.word }]);
      setTimeout(() => setPops((p) => p.filter((x) => x.id !== hit.id)), 700);
      setBuffer("");
      return;
    }
    if (list.some((d) => d.word.startsWith(next))) { sfx.tap(); setBuffer(next); }
    else { sfx.wrong(); setBuffer(""); }
  }, [buffer]);

  const onKeyDown = (e) => {
    if (e.key === "Backspace") { e.preventDefault(); setBuffer((b) => b.slice(0, -1)); return; }
    if (/^[a-zA-Z]$/.test(e.key)) { e.preventDefault(); press(e.key); }
  };
  const onChange = (e) => { const v = e.target.value; if (v && /[a-zA-Z]/.test(v.slice(-1))) press(v.slice(-1)); e.target.value = ""; };

  const target = drops.filter((d) => buffer && d.word.startsWith(buffer)).sort((a, b) => b.y - a.y)[0] || [...drops].sort((a, b) => b.y - a.y)[0];
  const nextKey = target ? target.word[buffer && target.word.startsWith(buffer) ? buffer.length : 0] : null;

  if (!level) {
    const best = loadTyping().rainBest;
    return (
      <main className="hc-bg min-h-[100dvh] px-4 pb-10 pt-4 sm:px-8" data-testid="word-rain-menu">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <TypingHeader title="Word Rain" />
          <div className="flex flex-col items-center gap-3 text-center">
            <Character name="sunny" mood="happy" className="w-28" />
            <p className="font-fredoka text-2xl font-bold leading-snug sm:text-3xl">Words are raining down! Type each one to pop it before it splashes.</p>
            <p className="font-bold">Best score: {best}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {LEVELS.map((lv) => (
              <motion.button key={lv.id} type="button" whileHover={{ y: -4 }} whileTap={{ scale: 0.96 }} onClick={() => start(lv.id)} className={`toy-focus flex items-center gap-3 rounded-[1.75rem] border-[3px] border-hc-navy p-5 text-left ${lv.color}`} style={{ boxShadow: "0 5px 0 #1F2547" }} data-testid={`rain-level-${lv.id}`}>
                <Play className="h-8 w-8 shrink-0" strokeWidth={2.5} />
                <span><span className="block font-fredoka text-2xl font-bold">{lv.label}</span><span className="font-semibold">{lv.hint}</span></span>
              </motion.button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="hc-bg flex h-[100dvh] flex-col gap-3 overflow-hidden px-3 pb-3 pt-3 sm:px-8" data-testid="word-rain">
      <div className="mx-auto w-full max-w-4xl"><TypingHeader title="Word Rain" right={<span className="font-fredoka text-2xl font-bold" data-testid="rain-score">{score}</span>} /></div>
      <div
        onClick={() => inputRef.current?.focus()}
        className="relative mx-auto w-full max-w-4xl flex-1 overflow-hidden rounded-[2rem] border-[3px] border-hc-navy bg-gradient-to-b from-hc-skylight to-white"
        style={{ boxShadow: "0 6px 0 #1F2547" }}
        role="application"
        aria-label="Word rain game area"
      >
        <div className="absolute left-3 top-3 flex gap-1" aria-label={`${lives} lives left`}>
          {Array.from({ length: LIVES }, (_, i) => <Heart key={i} className={`h-7 w-7 ${i < lives ? "fill-hc-coral" : "text-hc-navy/30"}`} strokeWidth={2.5} />)}
        </div>
        {drops.map((d) => {
          const typed = buffer && d.word.startsWith(buffer) ? buffer.length : 0;
          return (
            <div key={d.id} className={`absolute -translate-x-1/2 rounded-full border-[3px] border-hc-navy px-4 py-1.5 font-mono text-2xl font-bold sm:text-3xl ${d.color} ${typed ? "scale-110" : ""}`} style={{ left: `${d.x + 8}%`, top: `${d.y}%`, boxShadow: "0 4px 0 #1F2547" }}>
              <span className="text-white [text-shadow:0_2px_0_#1F2547]">{d.word.slice(0, typed)}</span>{d.word.slice(typed)}
            </div>
          );
        })}
        <AnimatePresence>
          {pops.map((p) => (
            <motion.span key={p.id} initial={{ scale: 1, opacity: 1 }} animate={{ scale: 1.8, opacity: 0, y: -30 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute -translate-x-1/2 font-fredoka text-2xl font-bold text-hc-navy" style={{ left: `${p.x + 8}%`, top: `${p.y}%` }}>
              +{p.word.length}
            </motion.span>
          ))}
        </AnimatePresence>
        <div className="absolute bottom-0 left-0 right-0 h-[10%] rounded-t-[50%] bg-hc-sky/60" aria-hidden="true" />
        <input ref={inputRef} onKeyDown={onKeyDown} onChange={onChange} autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck="false" aria-label="Type the falling words" className="absolute h-px w-px opacity-0" data-testid="rain-input" />
      </div>
      <div className="mx-auto hidden w-full max-w-2xl sm:block"><OnScreenKeyboard next={nextKey} /></div>

      <Modal open={!!over} onClose={() => setLevel(null)} testId="rain-over">
        {over && (
          <div className="flex flex-col items-center gap-3 text-center">
            {over.score >= over.best && over.score > 0 && <Confetti />}
            <Character name="sunny" mood={over.score > 0 ? "celebrate" : "happy"} className="w-24" />
            <h2 className="font-fredoka text-3xl font-bold">Splash!</h2>
            <p className="text-xl font-bold">You scored {over.score} points</p>
            <p className="font-semibold opacity-80">Best: {over.best}</p>
            <div className="flex gap-3">
              <ToyButton color="white" onClick={() => setLevel(null)}>Levels</ToyButton>
              <ToyButton color="mint" onClick={() => start(level)} data-testid="rain-again"><RefreshCw className="h-5 w-5" /> Play again</ToyButton>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
