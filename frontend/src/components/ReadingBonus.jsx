import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ToyButton } from "./ToyButton";
import { sfx } from "../lib/audioManager";

const BALLOONS = ["#FF7F91", "#63BCF7", "#3DD6A3", "#FFC93C", "#FF9A52"];
const STICKERS = ["🌟", "🦄", "🚀", "🌈", "🐳", "🍦", "🦖", "🎈", "🦋", "🍩", "🐙", "🏆"];
const STICKER_KEY = "hk_reading_stickers";

export const getStickers = () => {
  try { const s = JSON.parse(localStorage.getItem(STICKER_KEY)); return Array.isArray(s) ? s : []; } catch { return []; }
};

function BalloonPop({ words, say, onDone }) {
  const order = useMemo(() => [...words].sort(() => Math.random() - 0.5), [words]);
  const [popped, setPopped] = useState([]);
  const [wiggle, setWiggle] = useState(null);
  const target = order.find(w => !popped.includes(w.word));
  useEffect(() => { if (target) say(`Pop ${target.word}!`); }, [target?.word]); // eslint-disable-line react-hooks/exhaustive-deps
  const tap = (w) => {
    if (!target) return;
    if (w.word === target.word) {
      sfx.pop();
      const next = [...popped, w.word];
      setPopped(next);
      if (next.length === order.length) { sfx.fanfare(); say("Pop pop hooray! You popped every word!"); setTimeout(onDone, 1800); }
    } else { sfx.tap(); setWiggle(w.word); say(w.word); setTimeout(() => setWiggle(null), 500); }
  };
  return <div className="flex h-full w-full flex-col items-center justify-center gap-4">
    <h2 className="text-center font-fredoka text-3xl font-bold sm:text-4xl">Balloon Pop!</h2>
    <p className="text-center text-lg font-bold">{target ? <>Pop the balloon that says <span className="rounded-lg bg-white px-2 font-fredoka text-2xl">{target.word}</span></> : "Hooray!"}</p>
    <div className="flex flex-1 items-center justify-center gap-3 sm:gap-6">
      {words.map((w, i) => <motion.button key={w.word} type="button" onClick={() => tap(w)} disabled={popped.includes(w.word)} aria-label={`Balloon ${w.word}`}
        animate={popped.includes(w.word) ? { scale: [1, 1.4, 0], opacity: [1, 1, 0] } : wiggle === w.word ? { rotate: [0, -12, 12, 0] } : { y: [0, -14, 0] }}
        transition={popped.includes(w.word) ? { duration: 0.35 } : wiggle === w.word ? { duration: 0.4 } : { duration: 2.4 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
        className="toy-focus flex flex-col items-center">
        <span className="flex items-center justify-center rounded-[50%] border-[3px] border-hc-navy font-fredoka font-bold text-hc-navy" style={{ background: BALLOONS[i % BALLOONS.length], width: "clamp(4.5rem, 20vmin, 9rem)", height: "clamp(5.5rem, 24vmin, 11rem)", fontSize: "clamp(1.6rem, 7vmin, 3rem)" }}>{w.word}</span>
        <span className="h-10 w-0.5 bg-hc-navy" aria-hidden="true" />
      </motion.button>)}
    </div>
  </div>;
}

function TreasureChest({ say, onDone }) {
  const [taps, setTaps] = useState(0);
  const sticker = useMemo(() => STICKERS[Math.floor(Math.random() * STICKERS.length)], []);
  const open = taps >= 3;
  useEffect(() => { say("You earned a surprise! Tap the present three times to open it."); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const tap = () => {
    if (open) return;
    const n = taps + 1; setTaps(n);
    if (n < 3) sfx.tap();
    else {
      sfx.fanfare(); sfx.sparkle();
      localStorage.setItem(STICKER_KEY, JSON.stringify([...getStickers(), sticker]));
      say("A new sticker for your collection! Super reading!");
    }
  };
  return <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
    <h2 className="font-fredoka text-3xl font-bold sm:text-4xl">{open ? "A new sticker!" : "Surprise present!"}</h2>
    <motion.button type="button" onClick={tap} aria-label={open ? `Sticker ${sticker}` : "Tap the present"} className="toy-focus"
      animate={open ? { scale: [0.4, 1.25, 1], rotate: [0, 12, 0] } : { rotate: taps ? [0, -10, 10, -6, 0] : 0 }} key={taps} transition={{ duration: 0.5 }}
      style={{ fontSize: "clamp(6rem, 30vmin, 13rem)", lineHeight: 1 }}>
      {open ? sticker : "🎁"}
    </motion.button>
    {!open && <p className="text-lg font-bold">Tap {3 - taps} more {3 - taps === 1 ? "time" : "times"}!</p>}
    {open && <ToyButton color="mint" className="text-xl" onClick={onDone}>Keep reading</ToyButton>}
  </div>;
}

export function ReadingBonus({ kind, words, say, onDone }) {
  return kind === "balloons" ? <BalloonPop words={words} say={say} onDone={onDone} /> : <TreasureChest say={say} onDone={onDone} />;
}
