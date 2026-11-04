import { useEffect, useRef, useState } from "react";
import { RotateCcw, Undo2 } from "lucide-react";
import useGameSession from "../hooks/useGameSession";
import useVoice from "../hooks/useVoice";
import { sfx } from "../lib/audioManager";
import { GameTopBar } from "../components/GameTopBar";
import { SpeechPanel } from "../components/SpeechPanel";
import { NextButton } from "../components/NextButton";
import { ToyButton } from "../components/ToyButton";
import { PALETTE, Swatches } from "./DrawGame";
import { thanksReply } from "./QuizCore";

const TASKS = [
  { region: "sun", colour: "yellow", label: "sun" }, { region: "grass", colour: "green", label: "grass" },
  { region: "roof", colour: "red", label: "roof" }, { region: "sky", colour: "blue", label: "sky" },
];
const NAMES = { sky: "sky", sun: "sun", grass: "grass", house: "house", roof: "roof", door: "door", window: "window", trunk: "tree trunk", leaves: "tree leaves", flower: "flower" };
const hex = (name) => PALETTE.find((p) => p.name === name)?.hex;

const Region = ({ id, fills, onTap, children }) => (
  <g onClick={() => onTap(id)} data-testid={`region-${id}`} data-fill={fills[id] || "none"} style={{ cursor: "pointer" }} fill={hex(fills[id]) || "#fff"} stroke="#1F2547" strokeWidth="3" strokeLinejoin="round">{children}</g>
);

export default function ColourGame({ activity }) {
  const s = useGameSession(activity.id, TASKS.length);
  const t = TASKS[s.index];
  const [fills, setFills] = useState({});
  const history = useRef([]);
  const [colour, setColour] = useState(null);
  const [mood, setMood] = useState("happy");
  const [phase, setPhase] = useState("question");
  const say = `Colour the ${t.label} ${t.colour}! Pick the ${t.colour} crayon, then tap the ${t.label}.`;
  const [text, setText] = useState(say);
  const voice = useVoice((cmd) => { if (cmd === "thanks") { const r = thanksReply(phase); setText(r); voice.say(r); } else if (cmd === "next" && s.solved) s.next(); else voice.say(say); });

  useEffect(() => { setMood("happy"); setPhase("question"); setText(say); const tm = setTimeout(() => voice.say(say), 450); return () => clearTimeout(tm); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [s.index]);

  const tap = (id) => {
    if (!colour) { setText("First pick a crayon colour below!"); voice.say("First pick a crayon colour!"); return; }
    s.markAttempt();
    history.current.push(fills);
    setFills({ ...fills, [id]: colour.name });
    sfx.tap();
    if (s.solved || id !== t.region) { if (!s.solved) setText(`That's the ${NAMES[id]}! Lovely. Now find the ${t.label} and make it ${t.colour}.`); return; }
    if (colour.name === t.colour) {
      s.registerCorrect();
      const msg = `Congratulations! The ${t.label} is ${t.colour}! You know your colours!`;
      setMood("celebrate"); setPhase("correct"); setText(msg); sfx.correct(); voice.say(msg, { listenAfter: true });
    } else {
      s.registerWrong();
      const msg = `Oops! You picked ${colour.name}. We need ${t.colour} for the ${t.label}. Find the ${t.colour} crayon and try again!`;
      setMood("sad"); setPhase("wrong"); setText(msg); sfx.wrong(); voice.say(msg, { listenAfter: true });
    }
  };
  const undo = () => { const prev = history.current.pop(); if (prev) setFills(prev); };

  return (
    <main className="hc-bg min-h-screen px-4 pb-10 pt-4 sm:px-8" data-testid="colour-game">
      <div className="mx-auto max-w-5xl">
        <GameTopBar statuses={s.statuses} stars={s.sessionStars} character={activity.character} backTo={`/world/${activity.world}`} onMicOn={() => voice.listen(true)} onMicOff={voice.stop} />
        <section className="mt-6"><SpeechPanel character={activity.character} mood={mood} title={`Colour the ${t.label} ${t.colour}!`} text={text} tone={phase === "correct" ? "correct" : phase === "wrong" ? "wrong" : "neutral"} onListen={() => voice.say(say)} listening={voice.listening} onStopListening={voice.stop} /></section>
        <section className="toy-card mt-6 p-3 sm:p-5">
          <svg viewBox="0 0 400 300" className="w-full rounded-2xl border-[3px] border-hc-navy" data-testid="colour-scene" role="img" aria-label="Picture to colour">
            <Region id="sky" fills={fills} onTap={tap}><rect x="0" y="0" width="400" height="210" /></Region>
            <Region id="sun" fills={fills} onTap={tap}><circle cx="330" cy="60" r="32" /></Region>
            <Region id="grass" fills={fills} onTap={tap}><path d="M0 200 Q100 170 200 195 T400 190 V300 H0 Z" /></Region>
            <Region id="leaves" fills={fills} onTap={tap}><circle cx="290" cy="150" r="40" /></Region>
            <Region id="trunk" fills={fills} onTap={tap}><rect x="281" y="185" width="18" height="55" /></Region>
            <Region id="house" fills={fills} onTap={tap}><rect x="70" y="140" width="120" height="100" /></Region>
            <Region id="roof" fills={fills} onTap={tap}><path d="M58 145 L130 85 L202 145 Z" /></Region>
            <Region id="door" fills={fills} onTap={tap}><rect x="115" y="185" width="30" height="55" rx="4" /></Region>
            <Region id="window" fills={fills} onTap={tap}><rect x="155" y="160" width="24" height="24" /></Region>
            <line x1="40" y1="262" x2="40" y2="290" stroke="#1F2547" strokeWidth="3" />
            <Region id="flower" fills={fills} onTap={tap}><circle cx="40" cy="252" r="13" /></Region>
          </svg>
          <div className="mt-4"><Swatches value={colour?.name} onPick={setColour} /></div>
          <div className="mt-4 flex justify-center gap-2">
            <ToyButton color="white" onClick={undo} data-testid="colour-undo-button"><Undo2 className="h-5 w-5" /> Undo</ToyButton>
            <ToyButton color="white" onClick={() => { history.current.push(fills); setFills({}); }} data-testid="colour-clear-button"><RotateCcw className="h-5 w-5" /> Start again</ToyButton>
          </div>
        </section>
        <div className="mt-8"><NextButton show={s.solved} isLast={s.isLast} onClick={s.next} /></div>
      </div>
    </main>
  );
}
