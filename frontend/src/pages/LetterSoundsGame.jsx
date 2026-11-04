import { useEffect, useState } from "react";
import { Ear, Gamepad2, Volume2 } from "lucide-react";
import useGameSession from "../hooks/useGameSession";
import useVoice from "../hooks/useVoice";
import { sfx, speak } from "../lib/audioManager";
import { GameTopBar } from "../components/GameTopBar";
import { SpeechPanel } from "../components/SpeechPanel";
import { NextButton } from "../components/NextButton";
import { FIND_ROUNDS, LETTERS, letterOf } from "../data/phonics";
import { thanksReply } from "./QuizCore";

export default function LetterSoundsGame({ activity }) {
  const s = useGameSession(activity.id, FIND_ROUNDS.length);
  const target = letterOf(FIND_ROUNDS[s.index]);
  const [explore, setExplore] = useState(false);
  const [mode, setMode] = useState("sound");
  const [mood, setMood] = useState("happy");
  const [phase, setPhase] = useState("question");
  const [shake, setShake] = useState({ L: null, k: 0 });
  const ask = `Find the letter that says ${target.sound}, like ${target.word}!`;
  const [text, setText] = useState(ask);
  const voice = useVoice((cmd) => { if (cmd === "thanks") { const r = thanksReply(phase); setText(r); voice.say(r); } else if (cmd === "next" && s.solved) s.next(); else voice.say(ask); });

  useEffect(() => { setMood("happy"); setPhase("question"); setText(ask); const t = setTimeout(() => voice.say(ask), 450); return () => clearTimeout(t); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [s.index]);

  const tap = (x) => {
    if (explore) { sfx.tap(); speak(mode === "name" ? `${x.L}. ${x.L} is for ${x.word}.` : `${x.sound}. ${x.sound}, ${x.word}.`); return; }
    if (s.solved) return;
    if (x.L === target.L) {
      s.registerCorrect();
      const m = `Congratulations! ${x.L} says ${x.sound}, like ${x.word}!`;
      setMood("celebrate"); setPhase("correct"); setText(m); sfx.correct(); voice.say(m, { listenAfter: true });
    } else {
      const level = s.registerWrong();
      const m = `Oops! You picked ${x.L}. ${x.L} says ${x.sound}. We need the letter that says ${target.sound}, like ${target.word}.${level > 1 ? ` Listen to the start of ${target.word}: ${target.sound}...` : ""} Try again!`;
      setMood("sad"); setPhase("wrong"); setText(m); sfx.wrong(); setShake({ L: x.L, k: Date.now() }); voice.say(m, { listenAfter: true });
      setTimeout(() => setMood("thinking"), 1800);
    }
  };

  const Tab = ({ on, onClick, icon: Icon, label, id }) => (
    <button type="button" onClick={onClick} aria-pressed={on} data-testid={id} className={`toy-btn px-4 text-base ${on ? "bg-hc-sun" : "bg-white"}`}><Icon className="h-5 w-5" /> {label}</button>
  );

  return (
    <main className="hc-bg min-h-screen px-4 pb-10 pt-4 sm:px-8" data-testid="letter-sounds-game">
      <div className="mx-auto max-w-5xl">
        <GameTopBar statuses={s.statuses} stars={s.sessionStars} character={activity.character} backTo={`/world/${activity.world}`} onMicOn={() => voice.listen(true)} onMicOff={voice.stop} />
        <section className="mt-6"><SpeechPanel character={activity.character} mood={explore ? "talking" : mood} title={explore ? "Tap any letter to hear it!" : `Which letter says "${target.sound}"?`} text={explore ? `Now playing: letter ${mode === "name" ? "names" : "sounds"}. Switch back to Play to keep earning stars.` : text} tone={phase === "correct" ? "correct" : phase === "wrong" ? "wrong" : "neutral"} onListen={() => voice.say(ask)} listening={voice.listening} onStopListening={voice.stop} /></section>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Tab on={!explore} onClick={() => setExplore(false)} icon={Gamepad2} label="Play" id="letters-play-tab" />
          <Tab on={explore && mode === "sound"} onClick={() => { setExplore(true); setMode("sound"); }} icon={Ear} label="Explore sounds" id="letters-explore-sounds" />
          <Tab on={explore && mode === "name"} onClick={() => { setExplore(true); setMode("name"); }} icon={Volume2} label="Explore names" id="letters-explore-names" />
        </div>
        <section className="toy-card mt-6 grid grid-cols-4 gap-2 p-3 sm:grid-cols-7 sm:gap-3 sm:p-6" data-testid="letter-grid">
          {LETTERS.map((x, i) => (
            <button type="button" key={`${x.L}-${shake.L === x.L ? shake.k : 0}`} onClick={() => tap(x)} data-testid={`letter-${x.L}`} aria-label={`Letter ${x.L}`}
              className={`toy-btn h-20 flex-col gap-0 text-3xl sm:h-24 sm:text-4xl ${s.solved && !explore && x.L === target.L ? "bg-hc-mint" : shake.L === x.L ? "hc-shake bg-hc-corallight" : ["bg-hc-skylight", "bg-hc-sunlight", "bg-hc-mintlight", "bg-hc-corallight", "bg-hc-lavlight", "bg-hc-tanglight"][i % 6]}`}>
              {x.L}<span className="text-lg leading-none">{x.L.toLowerCase()}</span>
            </button>
          ))}
        </section>
        <div className="mt-8"><NextButton show={s.solved && !explore} isLast={s.isLast} onClick={s.next} /></div>
      </div>
    </main>
  );
}
