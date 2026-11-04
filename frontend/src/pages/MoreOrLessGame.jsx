import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import useGameSession from "../hooks/useGameSession";
import useVoice from "../hooks/useVoice";
import { sfx } from "../lib/audioManager";
import { GameTopBar } from "../components/GameTopBar";
import { SpeechPanel } from "../components/SpeechPanel";
import { NextButton } from "../components/NextButton";
import { NumberLine } from "../components/NumberLine";
import { ToyButton } from "../components/ToyButton";
import { MORE_LESS_PUZZLES, answerChoices, answerOf, moreLessHint, numberWindow, randomCheer, relationPhrase } from "../games/logic";

const GAME = "more-or-less";
const INSTRUCTION = "Tap the answer on the number line or below. You can hop Froggy to find it!";

export default function MoreOrLessGame() {
  const s = useGameSession(GAME, MORE_LESS_PUZZLES.length);
  const p = MORE_LESS_PUZZLES[s.index];
  const ans = answerOf(p);
  const nums = numberWindow(p);
  const choices = answerChoices(p);
  const more = p.delta > 0;
  const [frogAt, setFrogAt] = useState(p.start);
  const [hops, setHops] = useState([]);
  const [mood, setMood] = useState("happy");
  const [text, setText] = useState(INSTRUCTION);
  const [phase, setPhase] = useState("question");
  const [shake, setShake] = useState({ n: null, k: 0 });
  const [busy, setBusy] = useState(false);
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const phrase = relationPhrase(p);
  const title = `${phrase} is ___.`;
  const question = `What is ${phrase.toLowerCase()}? Find ${p.start} and hop ${more ? "forward" : "backward"}.`;

  const onCommand = (cmd) => {
    if (cmd === "thanks") {
      const reply = phase === "correct" ? "You're welcome! Tap Next to continue." : phase === "wrong" ? "You're welcome! Let's try again." : "You're welcome!";
      setText(reply); voice.say(reply);
    } else if (cmd === "next" && s.solved) s.next();
    else if (cmd === "listen") voice.say(question);
    else if (cmd === "try" && !s.solved) { resetHops(); voice.say(question); }
  };
  const voice = useVoice(onCommand);

  useEffect(() => {
    clearTimers();
    setFrogAt(p.start); setHops([]); setMood("happy"); setText(INSTRUCTION); setPhase("question"); setShake({ n: null, k: 0 }); setBusy(false);
    const t = setTimeout(() => voice.say(question), 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.index]);
  useEffect(() => () => clearTimers(), []);

  const animateHops = (onDone) => {
    const sign = Math.sign(p.delta);
    setBusy(true); setHops([]); setFrogAt(p.start);
    for (let k = 1; k <= Math.abs(p.delta); k++) {
      later(() => {
        setHops((h) => [...h, { from: p.start + sign * (k - 1), to: p.start + sign * k }]);
        setFrogAt(p.start + sign * k);
        sfx.hop();
      }, 550 * k);
    }
    later(() => { setBusy(false); onDone?.(); }, 550 * Math.abs(p.delta) + 350);
  };

  const answer = (n) => {
    if (s.solved || busy) return;
    if (n === ans) {
      s.registerCorrect();
      const msg = `Congratulations! ${phrase} is ${ans}! ${randomCheer()}`;
      setMood("celebrate"); setPhase("correct"); setText(msg); sfx.correct();
      animateHops();
      later(() => voice.say(msg, { listenAfter: true }), 400);
      return;
    }
    const level = s.registerWrong();
    sfx.wrong(); setMood("sad"); setPhase("wrong"); setShake({ n, k: Date.now() });
    const msg = moreLessHint(p, n, level);
    setText(msg);
    voice.say(msg, { listenAfter: true });
    later(() => setMood("thinking"), 1800);
    if (level >= 3) later(() => animateHops(), 900);
  };

  // Hops always show the path from START: hopping back removes the last arrow instead of adding one.
  const hop = (dir) => {
    if (s.solved || busy) return;
    s.markAttempt();
    const need = Math.abs(p.delta);
    const hopWord = (n) => (n === 1 ? "hop" : "hops");
    const to = frogAt + dir;
    const last = hops[hops.length - 1];
    const goingBack = last && Math.sign(last.to - last.from) !== dir;
    if (!nums.includes(to)) { const m = "Froggy can't hop any further that way! Try the other way."; setText(m); voice.say(m); return; }
    if (!goingBack && hops.length >= need) {
      const m = `Whoa, Froggy! The question says ${need} ${hopWord(need)}, and Froggy has already hopped ${need}. Hop back, or tap the box Froggy is on.`;
      setText(m); voice.say(m); return;
    }
    setHops(goingBack ? hops.slice(0, -1) : [...hops, { from: frogAt, to }]);
    setFrogAt(to);
    sfx.hop();
    const net = to - p.start;
    const k = Math.abs(net);
    let m;
    if (k === 0) m = `Froggy is back at ${p.start}, the start. Remember, the question says ${need} ${hopWord(need)} ${more ? "forward" : "backward"}.`;
    else if (Math.sign(net) !== Math.sign(p.delta)) m = `Oops, that hop went ${dir > 0 ? "forward to the right" : "backward to the left"}. ${more ? "More means hopping forward to the right" : "Less means hopping backward to the left"}. Hop back to ${p.start} and try the other way.`;
    else if (k < need) m = `${k} ${hopWord(k)}! ${need - k} more ${hopWord(need - k)} to reach your goal. Remember, the question says ${need} ${hopWord(need)}.`;
    else m = `${need} ${hopWord(need)}! Froggy landed on ${to}. Tap that box to check your answer!`;
    setText(m);
    voice.say(m);
  };

  const resetHops = () => { if (busy) return; setHops([]); setFrogAt(p.start); };

  return (
    <main className="hc-bg min-h-screen px-4 pb-10 pt-4 sm:px-8" data-testid="more-or-less-game">
      <div className="mx-auto max-w-5xl">
        <GameTopBar statuses={s.statuses} stars={s.sessionStars} character="froggy" backTo="/world/hop-and-count" onMicOn={() => voice.listen(true)} onMicOff={voice.stop} />
        {voice.micDenied && <p className="mt-3 rounded-xl bg-white p-2 text-center text-sm font-bold" data-testid="mic-denied-note">Microphone is off. You can keep playing by tapping!</p>}
        <section className="mt-6 sm:mt-8">
          <SpeechPanel character="froggy" mood={mood} title={title} text={text} tone={phase === "correct" ? "correct" : phase === "wrong" ? "wrong" : "neutral"} onListen={() => voice.say(phase === "question" ? question : `${question} ${text}`, { listenAfter: phase !== "question" })} listening={voice.listening} onStopListening={voice.stop} />
        </section>

        <section className="toy-card mt-8 p-4 sm:p-8" data-testid="puzzle-area">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <span data-testid="direction-badge" data-direction={more ? "more" : "less"} className={`inline-flex items-center gap-2 rounded-full border-[3px] border-hc-navy px-4 py-2 font-fredoka text-lg font-bold ${more ? "bg-hc-sky" : "bg-hc-tang"}`}>
              {more ? (<>{Math.abs(p.delta)} MORE <ArrowRight className="h-5 w-5" strokeWidth={3} /></>) : (<><ArrowLeft className="h-5 w-5" strokeWidth={3} /> {Math.abs(p.delta)} LESS</>)}
            </span>
            <span className="font-fredoka text-lg font-semibold opacity-70" data-testid="puzzle-counter">Puzzle {s.index + 1} of {s.total}</span>
          </div>

          <NumberLine numbers={nums} start={p.start} frogAt={frogAt} hops={hops} onTap={answer} shake={shake} answer={ans} solved={s.solved} pulseStart={s.wrongs >= 2 && !s.solved} disabled={s.solved || busy} />

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <ToyButton color="tang" onClick={() => hop(-1)} disabled={s.solved || busy} data-testid="hop-back-button" className={`text-lg ${s.wrongs >= 2 && !more && !s.solved ? "hc-pulse" : ""}`}>
              <ArrowLeft className="h-6 w-6" strokeWidth={3} /> Hop back
            </ToyButton>
            <ToyButton color="white" onClick={resetHops} disabled={s.solved || busy} data-testid="hop-reset-button" aria-label="Start hopping again" className="px-4">
              <RotateCcw className="h-5 w-5" strokeWidth={3} />
            </ToyButton>
            <ToyButton color="sky" onClick={() => hop(1)} disabled={s.solved || busy} data-testid="hop-forward-button" className={`text-lg ${s.wrongs >= 2 && more && !s.solved ? "hc-pulse" : ""}`}>
              Hop forward <ArrowRight className="h-6 w-6" strokeWidth={3} />
            </ToyButton>
          </div>

          <div className="mt-8 border-t-[3px] border-dashed border-hc-navy/30 pt-6">
            <p className="mb-3 text-center font-fredoka text-lg font-semibold">Or pick an answer:</p>
            <div className="grid grid-cols-3 gap-3 sm:gap-5" data-testid="answer-choices">
              {choices.map((n) => (
                <button
                  type="button"
                  key={`${s.index}-${n}-${shake.n === n ? shake.k : 0}`}
                  data-testid={`choice-btn-${n}`}
                  onClick={() => answer(n)}
                  disabled={s.solved || busy}
                  className={`toy-btn h-20 text-4xl sm:h-24 sm:text-5xl ${s.solved && n === ans ? "bg-hc-mint disabled:opacity-100" : shake.n === n ? "hc-shake bg-hc-corallight" : "bg-hc-sunlight"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-8">
          <NextButton show={s.solved && !busy} isLast={s.isLast} onClick={s.next} />
        </div>
      </div>
    </main>
  );
}
