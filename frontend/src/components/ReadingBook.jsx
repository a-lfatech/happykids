import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Lock, Star, Volume2 } from "lucide-react";
import { sfx } from "../lib/audioManager";

const PAGE_COLORS = ["bg-hc-skylight", "bg-hc-sunlight", "bg-hc-corallight", "bg-hc-tanglight", "bg-hc-mintlight"];

export function ReadingBook({ word, index, rime, endingSound, flip, hear, highlight }) {
  const reduced = useReducedMotion();
  const [turn, setTurn] = useState(null);
  const turnPage = (dir) => {
    if (turn) return;
    sfx.flip();
    if (!reduced) setTurn({ word, index, dir });
    flip(dir);
  };
  return <div className="reading-book">
    <div className="reading-book-cover">
      <div className="reading-rings" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <span key={i} />)}</div>
      <div className="reading-pages">
        <motion.button type="button" drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.15}
          onDragEnd={(_, info) => { if (info.offset.y < -30) turnPage(1); else if (info.offset.y > 30) turnPage(-1); }}
          onTap={() => hear(word.sound)}
          className={`toy-focus reading-page touch-none ${PAGE_COLORS[index % PAGE_COLORS.length]} ${highlight === 1 ? "ring-4 ring-hc-sun" : ""}`}
          aria-label={`Beginning sound ${word.onset}. Swipe up to flip.`}>
          <small>beginning</small><span>{word.onset}</span>
          {turn && <motion.div className="reading-turn"
            initial={{ rotateX: 0 }} animate={{ rotateX: turn.dir > 0 ? -180 : 180 }}
            transition={{ duration: 0.85, ease: [0.45, 0, 0.2, 1] }} onAnimationComplete={() => setTurn(null)}
            style={{ transformOrigin: "top center", transformStyle: "preserve-3d" }} aria-hidden="true">
            <div className={`reading-turn-front ${PAGE_COLORS[turn.index % PAGE_COLORS.length]}`}>{turn.word.onset}</div>
            <div className="reading-turn-back"><span>↻</span></div>
          </motion.div>}
        </motion.button>
        <button type="button" onClick={() => hear(endingSound || rime)} className={`toy-focus reading-page bg-hc-mintlight ${highlight === 2 ? "ring-4 ring-hc-sun" : ""}`} aria-label={`Ending sound ${rime}`}>
          <small>ending</small><span>{rime}</span>
        </button>
      </div>
    </div>
    <div className="reading-flip-controls">
      <button type="button" onClick={() => turnPage(-1)} className="toy-focus reading-flip-button bg-white" aria-label="Flip back"><ChevronLeft /><span>Back</span></button>
      <button type="button" onClick={() => hear(word.word)} className="toy-focus reading-whole-word" aria-label={`Say ${word.word}`}>
        <span role="img" aria-hidden="true">{word.picture}</span><strong>{word.word}</strong><Volume2 className="reading-word-sound" />
      </button>
      <button type="button" onClick={() => turnPage(1)} className="toy-focus reading-flip-button bg-hc-sun" aria-label="Flip next page"><ChevronRight /><span>Flip!</span></button>
    </div>
  </div>;
}

export function FamilyTabs({ families, active, select }) {
  return <div className="reading-families" aria-label="Word families">{families.map((f, i) => {
    const locked = f.status === "locked";
    return <button key={f.id} type="button" disabled={locked} onClick={() => { sfx.tap(); select(f.id); }} aria-pressed={active === f.id} aria-label={`${f.content.rime} family${locked ? ", locked" : ""}`}
      className={`toy-focus ${active === f.id ? "bg-hc-sun" : PAGE_COLORS[(i + 1) % PAGE_COLORS.length]}`}>
      -{f.content.rime}{locked && <Lock size={14} />}{f.status === "mastered" && <Star size={14} />}
    </button>;
  })}</div>;
}

export function PictureChoices({ words, choose, disabled, limit }) {
  return <div className="reading-picture-choices">{words.filter(w => !limit || limit.includes(w.word)).map((w, i) => (
    <motion.button key={w.word} type="button" whileTap={{ scale: 0.9 }} disabled={disabled} onClick={() => choose(w.word)} className={`toy-focus ${PAGE_COLORS[i % PAGE_COLORS.length]}`} aria-label={w.meaning || w.word}>
      <span role="img" aria-hidden="true">{w.picture}</span>
      {w.word.length === 2 && <small>{w.meaning}</small>}
    </motion.button>
  ))}</div>;
}
