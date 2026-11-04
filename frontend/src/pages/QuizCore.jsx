import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import useGameSession from "../hooks/useGameSession";
import useVoice from "../hooks/useVoice";
import { useAppState } from "../context/AppState";
import { sfx } from "../lib/audioManager";
import { GameTopBar } from "../components/GameTopBar";
import { SpeechPanel } from "../components/SpeechPanel";
import { NextButton } from "../components/NextButton";
import { Item } from "../components/Pic";

const shuffle = (list, seed) => [...list].sort((a, b) => ((a.key + 1) * seed * 9301 + 49297) % 233 - ((b.key + 1) * seed * 9301 + 49297) % 233);
const nameOf = (o) => o.label ?? o.text;

export const thanksReply = (phase) => (phase === "correct" ? "You're welcome! Tap Next to continue." : phase === "wrong" ? "You're welcome! Let's try again." : "You're welcome!");

// Generic multiple-choice engine used by reading, thinking and science activities.
export default function QuizCore({ activity, rounds }) {
  const s = useGameSession(activity.id, rounds.length);
  const { profile } = useAppState();
  const r = rounds[s.index];
  const options = useMemo(() => {
    let list = r.choices.map((c, i) => ({ ...c, ok: i === 0, key: i }));
    if (profile.level === "K" && !r.fixed && list.length > 3) list = list.slice(0, 3);
    return shuffle(list, s.index + 3 + activity.id.length);
  }, [r, profile.level, s.index, activity.id]);
  const [mood, setMood] = useState("happy");
  const [text, setText] = useState("Tap the right answer.");
  const [phase, setPhase] = useState("question");
  const [shake, setShake] = useState({ key: null, k: 0 });
  const timers = useRef([]);

  const voice = useVoice((cmd) => {
    if (cmd === "thanks") { const t = thanksReply(phase); setText(t); voice.say(t); }
    else if (cmd === "next" && s.solved) s.next();
    else voice.say(r.say);
  });

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    setMood("happy"); setText("Tap the right answer."); setPhase("question"); setShake({ key: null, k: 0 });
    const t = setTimeout(() => voice.say(r.say), 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.index]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const choose = (o) => {
    if (s.solved) return;
    if (o.ok) {
      s.registerCorrect();
      const msg = `Congratulations! ${r.explain}`;
      setMood("celebrate"); setPhase("correct"); setText(msg); sfx.correct();
      timers.current.push(setTimeout(() => voice.say(msg, { listenAfter: true }), 350));
      return;
    }
    const level = s.registerWrong();
    const msg = `${level > 1 ? "Good try!" : "Not quite!"} You picked ${nameOf(o)}. ${r.hint} ${level > 2 ? "Take your time and look carefully at each one." : "Try again!"}`;
    sfx.wrong(); setMood("sad"); setPhase("wrong"); setText(msg); setShake({ key: o.key, k: Date.now() });
    voice.say(msg, { listenAfter: true });
    timers.current.push(setTimeout(() => setMood("thinking"), 1800));
  };

  const cols = options.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3";

  return (
    <main className="hc-bg min-h-screen px-4 pb-10 pt-4 sm:px-8" data-testid={`quiz-${activity.id}`}>
      <div className="mx-auto max-w-5xl">
        <GameTopBar statuses={s.statuses} stars={s.sessionStars} character={activity.character} backTo={`/world/${activity.world}`} onMicOn={() => voice.listen(true)} onMicOff={voice.stop} />
        <section className="mt-6 sm:mt-8">
          <SpeechPanel character={activity.character} mood={mood} title={r.title} text={text} tone={phase === "correct" ? "correct" : phase === "wrong" ? "wrong" : "neutral"} onListen={() => voice.say(phase === "question" ? r.say : `${r.say} ${text}`, { listenAfter: phase !== "question" })} listening={voice.listening} onStopListening={voice.stop} />
        </section>
        <section className="toy-card mt-8 p-4 sm:p-8" data-testid="puzzle-area">
          <p className="text-right font-fredoka text-lg font-semibold opacity-70" data-testid="puzzle-counter">{s.index + 1} of {s.total}</p>
          {r.show && (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 rounded-3xl border-[3px] border-dashed border-hc-navy/40 bg-hc-cream p-4 sm:gap-4" data-testid="quiz-prompt">
              {r.show.map((it, i) => (
                <motion.div key={`${s.index}-${i}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.08 }} className="grid min-h-[88px] min-w-[88px] place-items-center rounded-2xl border-[3px] border-hc-navy bg-white p-2">
                  <Item item={it} big />
                </motion.div>
              ))}
              {r.blank && (
                <div className={`grid min-h-[88px] min-w-[88px] place-items-center rounded-2xl border-[3px] border-dashed border-hc-navy p-2 ${s.solved ? "bg-hc-mint" : "hc-pulse bg-hc-sunlight"}`} data-testid="quiz-blank">
                  {s.solved ? <Item item={options.find((o) => o.ok)} big /> : <span className="font-fredoka text-5xl font-bold opacity-50">?</span>}
                </div>
              )}
            </div>
          )}
          <div className={`mt-6 grid gap-3 sm:gap-5 ${cols}`} data-testid="quiz-choices">
            {options.map((o) => (
              <button
                type="button"
                key={`${s.index}-${o.key}-${shake.key === o.key ? shake.k : 0}`}
                onClick={() => choose(o)}
                disabled={s.solved}
                data-testid={`quiz-choice-${nameOf(o)}`}
                data-correct={o.ok}
                aria-label={nameOf(o)}
                className={`toy-btn flex h-auto min-h-[130px] flex-col items-center justify-center gap-2 p-3 ${s.solved && o.ok ? "bg-hc-mint disabled:opacity-100" : shake.key === o.key ? "hc-shake bg-hc-corallight" : "bg-white"}`}
              >
                <Item item={o} />
                {o.label && <span className="font-nunito text-base font-extrabold sm:text-lg">{o.label}</span>}
              </button>
            ))}
          </div>
        </section>
        <div className="mt-8"><NextButton show={s.solved} isLast={s.isLast} onClick={s.next} /></div>
      </div>
    </main>
  );
}
