import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Lock, Star } from "lucide-react";
import { sfx } from "../lib/audioManager";

const PAGE_COLORS = ["bg-hc-skylight", "bg-hc-sunlight", "bg-hc-corallight", "bg-hc-tanglight", "bg-hc-mintlight"];
const BIG = { fontSize: "clamp(4rem, 17vmin, 10rem)", lineHeight: 1 };

const Page = ({ word, color, highlight }) => (
  <div className={`absolute inset-0 flex items-center justify-center rounded-2xl border-[3px] border-hc-navy ${color} font-fredoka font-bold ${highlight ? "ring-4 ring-hc-sun" : ""}`} style={{ ...BIG, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
    {word.onset}
  </div>
);

export function ReadingBook({ word, index, rime, flip, hear, highlight }) {
  const reduced = useReducedMotion();
  const [turn, setTurn] = useState(null);
  const color = (i) => PAGE_COLORS[i % PAGE_COLORS.length];
  const turnPage = (dir) => {
    if (turn) return;
    sfx.flip();
    if (!reduced) setTurn({ word, index, dir, id: Date.now() });
    flip(dir);
  };
  const under = turn && turn.dir < 0 ? { word: turn.word, i: turn.index } : { word, i: index };
  return <div className="flex w-full min-h-0 flex-1 flex-col">
    <div className="relative flex min-h-0 flex-1 gap-2 rounded-3xl border-[3px] border-hc-navy bg-hc-tang p-3 pt-7 shadow-[0_6px_0_#1F2547] sm:gap-3 sm:p-4 sm:pt-8">
      <div className="absolute inset-x-6 top-0 z-20 flex -translate-y-1/3 justify-around" aria-hidden="true">{Array.from({ length: 7 }, (_, i) => <span key={i} className="h-7 w-3 rounded-full border-[3px] border-hc-navy bg-white sm:h-8" />)}</div>
      <div className="relative flex-1" style={{ perspective: 1100 }}>
        <div className="absolute inset-x-2 -bottom-2 top-2 rounded-2xl border-[3px] border-hc-navy bg-white" aria-hidden="true" />
        <div className="absolute inset-x-1 -bottom-1 top-1 rounded-2xl border-[3px] border-hc-navy bg-hc-cream" aria-hidden="true" />
        <motion.button
          type="button"
          drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.35}
          onDragEnd={(_, info) => { if (info.offset.y < -30) turnPage(1); else if (info.offset.y > 30) turnPage(-1); }}
          onTap={() => hear(word.sound)}
          className="toy-focus absolute inset-0 touch-none"
          aria-label={`Beginning sound ${word.onset}. Swipe up to flip the page.`}
        >
          <Page word={under.word} color={color(under.i)} highlight={highlight === 1} />
          {turn && <motion.div
            key={turn.id}
            className="pointer-events-none absolute inset-0"
            style={{ transformOrigin: "top center", transformStyle: "preserve-3d" }}
            initial={{ rotateX: turn.dir > 0 ? 0 : -180 }}
            animate={{ rotateX: turn.dir > 0 ? -180 : 0 }}
            transition={{ duration: 0.55, ease: [0.45, 0.05, 0.3, 1] }}
            onAnimationComplete={() => setTurn(null)}
          >
            <Page word={turn.dir > 0 ? turn.word : word} color={color(turn.dir > 0 ? turn.index : index)} />
            <div className="absolute inset-0 rounded-2xl border-[3px] border-hc-navy bg-hc-vanilla" style={{ transform: "rotateX(180deg)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }} />
          </motion.div>}
        </motion.button>
      </div>
      <button type="button" onClick={() => hear(`${rime}`)} className={`toy-focus relative flex flex-1 items-center justify-center rounded-2xl border-[3px] border-hc-navy bg-white font-fredoka font-bold text-hc-navy ${highlight === 2 ? "ring-4 ring-hc-sun" : ""}`} style={BIG} aria-label={`Ending ${rime}`}>{rime}</button>
    </div>
    <div className="mt-3 flex shrink-0 items-center justify-between gap-2">
      <button type="button" onClick={() => turnPage(-1)} className="toy-btn bg-white px-3" aria-label="Flip back"><ChevronLeft className="h-8 w-8" strokeWidth={3} /></button>
      <button type="button" onClick={() => hear(word.word)} className="toy-focus flex min-w-0 items-center gap-3 rounded-2xl border-[3px] border-hc-navy bg-white px-4 py-1" aria-label={`Say ${word.word}`}>
        <span role="img" aria-hidden="true" style={{ fontSize: "clamp(2.5rem, 9vmin, 4.5rem)" }}>{word.picture}</span>
        <span className="font-fredoka font-bold" style={{ fontSize: "clamp(2.5rem, 10vmin, 5rem)", lineHeight: 1 }}><span className="text-hc-sky">{word.onset}</span>{rime}</span>
      </button>
      <button type="button" onClick={() => turnPage(1)} className="toy-btn bg-hc-sun px-3" aria-label="Flip forward"><ChevronRight className="h-8 w-8" strokeWidth={3} /></button>
    </div>
  </div>;
}

export function FamilyTabs({ families, active, select }) {
  return <div className="flex gap-2 overflow-x-auto px-1 py-1" aria-label="Word families">{families.map((f, i) => {
    const locked = f.status === "locked";
    return <button key={f.id} type="button" disabled={locked} onClick={() => { sfx.tap(); select(f.id); }} aria-pressed={active === f.id} aria-label={`${f.content.rime} family${locked ? ", locked" : f.status === "mastered" ? ", learned" : ""}`}
      className={`toy-focus flex shrink-0 items-center gap-1 rounded-full border-[3px] border-hc-navy px-3 py-1 font-fredoka text-lg font-bold sm:text-xl ${active === f.id ? "bg-hc-sun shadow-[0_3px_0_#1F2547]" : PAGE_COLORS[(i + 1) % PAGE_COLORS.length]} disabled:opacity-50`}>
      -{f.content.rime}{locked && <Lock className="h-4 w-4" />}{f.status === "mastered" && <Star className="h-4 w-4 fill-hc-sun" />}
    </button>;
  })}</div>;
}

export function PictureChoices({ words, choose, disabled, limit }) {
  return <div className="grid w-full max-w-2xl grid-cols-4 gap-2 sm:gap-4">{words.filter(w => !limit || limit.includes(w.word)).map((w, i) => (
    <motion.button key={w.word} type="button" whileTap={{ scale: 0.9 }} disabled={disabled} onClick={() => choose(w.word)} className={`toy-focus flex aspect-square flex-col items-center justify-center rounded-2xl border-[3px] border-hc-navy ${PAGE_COLORS[i % PAGE_COLORS.length]} p-1 shadow-[0_4px_0_#1F2547] disabled:opacity-60`} aria-label={w.meaning || w.word}>
      <span role="img" aria-hidden="true" style={{ fontSize: "clamp(2.5rem, 11vmin, 5rem)" }}>{w.picture}</span>
      {w.meaning && <span className="hidden text-xs font-bold sm:block">{w.meaning}</span>}
    </motion.button>
  ))}</div>;
}
