import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import useGameSession from "../hooks/useGameSession";
import useVoice from "../hooks/useVoice";
import { sfx } from "../lib/audioManager";
import { GameTopBar } from "../components/GameTopBar";
import { SpeechPanel } from "../components/SpeechPanel";
import { NextButton } from "../components/NextButton";
import { MISSING_PUZZLES, fitBlank, isComplete, mergeValues, missingHint, randomCheer, sequenceStep, spokenSequence } from "../games/logic";

const GAME = "missing-numbers";
const INSTRUCTION = "Tap a number to fill each empty space.";

const DirectionBadge = ({ forward }) => (
  <span data-testid="direction-badge" data-direction={forward ? "forward" : "backward"} className={`inline-flex items-center gap-2 rounded-full border-[3px] border-hc-navy px-4 py-2 font-fredoka text-lg font-bold sm:text-xl ${forward ? "bg-hc-sky" : "bg-hc-tang"}`}>
    {forward ? (<>COUNT FORWARD <ArrowRight className="h-6 w-6" strokeWidth={3} /></>) : (<><ArrowLeft className="h-6 w-6" strokeWidth={3} /> COUNT BACKWARD</>)}
  </span>
);

export default function MissingNumbersGame() {
  const s = useGameSession(GAME, MISSING_PUZZLES.length);
  const p = MISSING_PUZZLES[s.index];
  const forward = sequenceStep(p.seq) > 0;
  const firstBlank = p.seq.findIndex((v) => v == null);
  const [filled, setFilled] = useState({});
  const [selected, setSelected] = useState(firstBlank);
  const [wrongShow, setWrongShow] = useState(null);
  const [mood, setMood] = useState("happy");
  const [text, setText] = useState(INSTRUCTION);
  const [phase, setPhase] = useState("question");
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const values = mergeValues(p.seq, filled);
  const title = "Which numbers are missing?";
  const intro = `Let's count ${forward ? "forward" : "backward"}! ${spokenSequence(values)}. Which numbers are missing?`;

  const onCommand = (cmd) => {
    if (cmd === "thanks") {
      const reply = phase === "correct" ? "You're welcome! Tap Next to continue." : phase === "wrong" ? "You're welcome! Let's try again." : "You're welcome!";
      setText(reply); voice.say(reply);
    } else if (cmd === "next" && s.solved) s.next();
    else if (cmd === "listen" || cmd === "try") voice.say(intro);
  };
  const voice = useVoice(onCommand);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    setFilled({}); setSelected(firstBlank); setWrongShow(null); setMood("happy"); setText(INSTRUCTION); setPhase("question");
    const t = setTimeout(() => voice.say(`Let's count ${forward ? "forward" : "backward"}! ${spokenSequence(p.seq)}. Which numbers are missing?`), 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.index]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const pick = (n) => {
    if (s.solved) return;
    s.markAttempt();
    const i = fitBlank(p.seq, filled, n);
    if (i >= 0) {
      const nf = { ...filled, [i]: n };
      setFilled(nf);
      if (isComplete(p.seq, nf)) {
        const star = s.registerCorrect();
        const cheer = randomCheer();
        setMood("celebrate"); setPhase("correct"); sfx.correct();
        setText(`Congratulations! You did it! ${cheer}`);
        later(() => voice.say(`Congratulations! You did it! ${mergeValues(p.seq, nf).join(", ")}. ${cheer}`, { listenAfter: true }), 500);
        return star;
      }
      sfx.place();
      setMood("happy");
      setSelected(p.seq.findIndex((v, k) => v == null && nf[k] == null));
      setText(`Yes! ${n} fits. Keep going!`);
      voice.say(`${n}! Yes!`);
      return;
    }
    const target = selected >= 0 && filled[selected] == null ? selected : p.seq.findIndex((v, k) => v == null && filled[k] == null);
    setWrongShow({ i: target, n, k: Date.now() });
    later(() => setWrongShow(null), 1100);
    const level = s.registerWrong();
    sfx.wrong(); setMood("sad"); setPhase("wrong");
    const msg = missingHint(p, filled, n, level);
    setText(msg);
    voice.say(msg, { listenAfter: true });
    later(() => setMood("thinking"), 1800);
  };

  const tapTile = (i) => {
    if (s.solved || p.seq[i] != null) return;
    if (filled[i] != null) {
      const nf = { ...filled };
      delete nf[i];
      setFilled(nf);
    }
    setSelected(i);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.("[role=dialog]")) return;
      if (/^[0-9]$/.test(e.key)) pick(e.key === "0" ? 10 : Number(e.key));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const Arrow = forward ? ChevronRight : ChevronLeft;

  return (
    <main className="hc-bg min-h-screen px-4 pb-10 pt-4 sm:px-8" data-testid="missing-numbers-game">
      <div className="mx-auto max-w-5xl">
        <GameTopBar statuses={s.statuses} stars={s.sessionStars} character="hoppy" onMicOn={() => voice.listen(true)} onMicOff={voice.stop} />
        {voice.micDenied && <p className="mt-3 rounded-xl bg-white p-2 text-center text-sm font-bold" data-testid="mic-denied-note">Microphone is off. You can keep playing by tapping!</p>}
        <section className="mt-6 sm:mt-8">
          <SpeechPanel character="hoppy" mood={mood} title={title} text={text} tone={phase === "correct" ? "correct" : phase === "wrong" ? "wrong" : "neutral"} onListen={() => voice.say(phase === "question" ? intro : `${intro} ${text}`, { listenAfter: phase !== "question" })} listening={voice.listening} onStopListening={voice.stop} />
        </section>

        <section className="toy-card mt-8 p-4 sm:p-8" data-testid="puzzle-area">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <DirectionBadge forward={forward} />
            <span className="font-fredoka text-lg font-semibold opacity-70" data-testid="puzzle-counter">Puzzle {s.index + 1} of {s.total}</span>
          </div>
          <div className="mt-6 grid grid-cols-5 gap-4 sm:gap-7" data-testid="sequence-row">
            {p.seq.map((given, i) => {
              const blank = given == null;
              const val = values[i];
              const wrong = wrongShow?.i === i;
              const isSel = blank && selected === i && val == null && !s.solved;
              return (
                <div key={`${s.index}-${i}`} className="relative">
                  <motion.button
                    type="button"
                    key={wrong ? wrongShow.k : "t"}
                    data-testid={`sequence-tile-${i}`}
                    data-state={!blank ? "given" : val != null ? "filled" : "empty"}
                    aria-label={blank ? (val != null ? `Filled with ${val}. Tap to change` : "Empty space. Tap to choose") : `Number ${given}`}
                    onClick={() => tapTile(i)}
                    disabled={!blank}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.07, type: "spring", stiffness: 300, damping: 18 }}
                    className={`toy-focus grid aspect-square w-full place-items-center rounded-2xl border-[3px] border-hc-navy font-fredoka text-3xl font-bold sm:text-6xl ${
                      wrong ? "hc-shake bg-hc-corallight" : !blank ? "bg-white" : val != null ? "bg-hc-mint" : isSel ? "border-dashed bg-hc-sunlight hc-pulse" : "border-dashed bg-hc-vanilla"
                    }`}
                    style={{ boxShadow: "0 5px 0 #1F2547" }}
                  >
                    {wrong ? wrongShow.n : val != null ? <motion.span key={val} initial={{ scale: 0 }} animate={{ scale: 1 }}>{val}</motion.span> : <span className="opacity-40">?</span>}
                  </motion.button>
                  {i < 4 && <Arrow className={`absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 translate-x-1/2 sm:-right-3.5 sm:h-6 sm:w-6 ${forward ? "text-[#2F95E0]" : "text-[#F07A2A]"}`} strokeWidth={3.5} aria-hidden="true" />}
                </div>
              );
            })}
          </div>

          <div className="mt-8 grid grid-cols-5 gap-2 sm:gap-4" data-testid="number-pad">
            {Array.from({ length: 10 }, (_, k) => k + 1).map((n) => (
              <button
                type="button"
                key={n}
                data-testid={`number-pad-btn-${n}`}
                onClick={() => pick(n)}
                disabled={s.solved}
                aria-label={`Number ${n}`}
                className="toy-btn h-16 bg-hc-lavlight text-3xl sm:h-20 sm:text-4xl"
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        <div className="mt-8">
          <NextButton show={s.solved} isLast={s.isLast} onClick={s.next} />
        </div>
      </div>
    </main>
  );
}
