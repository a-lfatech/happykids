import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import useGameSession from "../hooks/useGameSession";
import useVoice from "../hooks/useVoice";
import { sfx, speak } from "../lib/audioManager";
import { GameTopBar } from "../components/GameTopBar";
import { SpeechPanel } from "../components/SpeechPanel";
import { NextButton } from "../components/NextButton";
import { ToyButton } from "../components/ToyButton";
import { Pic } from "../components/Pic";
import { SLIDER_WORDS, letterOf } from "../data/phonics";

const INTRO = "Slide the button slowly under the letters. Say each sound, then put them together!";

export default function WordSliderGame({ activity }) {
  const s = useGameSession(activity.id, SLIDER_WORDS.length);
  const w = SLIDER_WORDS[s.index];
  const letters = w.word.split("");
  const [val, setVal] = useState(0);
  const [lit, setLit] = useState(-1);
  const [mood, setMood] = useState("happy");
  const [text, setText] = useState(INTRO);
  const spoken = useRef(new Set());
  const voice = useVoice((cmd) => { if (cmd === "next" && s.solved) s.next(); else voice.say(INTRO); });

  const reset = () => { setVal(0); setLit(-1); spoken.current = new Set(); };
  useEffect(() => { reset(); setMood("happy"); setText(INTRO); const t = setTimeout(() => voice.say(INTRO), 450); return () => clearTimeout(t); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [s.index]);

  const sounds = letters.map((l) => letterOf(l.toUpperCase()).sound);
  const blend = () => {
    const m = `${sounds.join("... ")}... ${w.word}! Congratulations, you read ${w.word}!`;
    setMood("celebrate"); setText(`Congratulations! ${letters.join(" - ")} makes "${w.word}"!`); sfx.correct();
    voice.say(m, { listenAfter: true });
  };

  const slide = (v) => {
    if (s.solved) return;
    s.markAttempt();
    setVal(v);
    const i = Math.min(letters.length - 1, Math.floor((v / 100) * letters.length));
    if (v < 100 && i !== lit) {
      setLit(i);
      if (!spoken.current.has(i)) { spoken.current.add(i); sfx.tap(); speak(sounds[i]); }
    }
    if (v >= 100 && spoken.current.size >= letters.length) { setLit(letters.length); s.registerCorrect(true); blend(); }
    else if (v >= 100) { setText("Whoa, too fast! Slide slowly so we can hear every sound."); speak("Too fast! Slide slowly."); reset(); }
  };

  return (
    <main className="hc-bg min-h-screen px-4 pb-10 pt-4 sm:px-8" data-testid="word-slider-game">
      <div className="mx-auto max-w-4xl">
        <GameTopBar statuses={s.statuses} stars={s.sessionStars} character={activity.character} backTo={`/world/${activity.world}`} onMicOn={() => voice.listen(true)} onMicOff={voice.stop} />
        <section className="mt-6"><SpeechPanel character={activity.character} mood={mood} title="Slide to read!" text={text} tone={s.solved ? "correct" : "neutral"} onListen={() => voice.say(s.solved ? `${w.word}!` : INTRO)} listening={voice.listening} onStopListening={voice.stop} /></section>
        <section className="toy-card mt-6 p-5 sm:p-10">
          <div className="flex items-center justify-center gap-3 sm:gap-5" data-testid="slider-word">
            {letters.map((l, i) => (
              <motion.button type="button" key={`${s.index}-${i}`} onClick={() => speak(sounds[i])} animate={{ y: lit === i ? -10 : 0, scale: lit === i || lit === letters.length ? 1.08 : 1 }} data-testid={`slider-letter-${i}`} data-lit={lit === i || lit === letters.length}
                className={`toy-btn h-28 w-24 text-7xl sm:h-36 sm:w-32 sm:text-8xl ${lit === letters.length ? "bg-hc-mint" : lit === i ? "bg-hc-sun" : spoken.current.has(i) ? "bg-hc-skylight" : "bg-white"}`}>
                {l}
              </motion.button>
            ))}
            {s.solved && <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} data-testid="slider-picture"><Pic icon={w.icon} color={w.color} className="h-28 w-28 sm:h-36 sm:w-36" /></motion.div>}
          </div>
          <label className="mt-10 block">
            <span className="sr-only">Slide to read the word</span>
            <input type="range" min="0" max="100" step="1" value={val} onChange={(e) => slide(Number(e.target.value))} disabled={s.solved} className="hk-slider w-full" data-testid="word-slider" />
          </label>
          <div className="mt-2 flex justify-between font-fredoka text-lg font-semibold"><span>start</span><span>read it!</span></div>
          <div className="mt-5 flex justify-center gap-3">
            <ToyButton color="white" onClick={() => { reset(); if (!s.solved) setText(INTRO); }} disabled={s.solved} data-testid="slider-reset"><RotateCcw className="h-5 w-5" /> Start again</ToyButton>
            <ToyButton color="sun" onClick={() => speak(`${sounds.join("... ")}... ${w.word}`)} data-testid="slider-hear-word">Hear it</ToyButton>
          </div>
        </section>
        <div className="mt-8"><NextButton show={s.solved} isLast={s.isLast} onClick={s.next} /></div>
      </div>
    </main>
  );
}
