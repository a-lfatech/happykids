import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Star } from "lucide-react";
import { speak } from "../lib/audioManager";

const GRADE_COLORS = { K: "bg-hc-sun", G1: "bg-hc-mint", G6: "bg-hc-sky" };

export const StarRow = ({ best, target, size = "h-4 w-4" }) => (
  <span className="flex justify-center gap-0.5" aria-label={`${best} of ${target} stars`}>
    {Array.from({ length: target }, (_, i) => (
      <Star key={i} className={`${size} ${i < best ? "fill-hc-sun text-hc-navy" : "text-hc-navy/30"}`} strokeWidth={2.5} />
    ))}
  </span>
);

const UnitNode = ({ unit, index, color, prevTitle, onPlay }) => {
  const [wiggle, setWiggle] = useState(0);
  const locked = unit.status === "locked";
  const mastered = unit.status === "mastered";
  const tap = () => {
    if (!locked) return onPlay(unit);
    setWiggle((w) => w + 1);
    speak(prevTitle ? `This one opens after ${prevTitle}. You can do it!` : "This adventure opens soon!");
  };
  return (
    <motion.li initial={{ scale: 0.6, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.06, type: "spring", stiffness: 220, damping: 16 }} className={`flex flex-col items-center ${index % 2 ? "sm:translate-y-10" : ""}`}>
      <motion.button
        key={wiggle}
        type="button"
        onClick={tap}
        animate={wiggle ? { x: [0, -8, 8, -5, 5, 0] } : {}}
        whileHover={locked ? {} : { scale: 1.08, y: -4 }}
        whileTap={locked ? {} : { scale: 0.94 }}
        aria-label={`${unit.title}, ${locked ? "locked" : mastered ? "mastered" : "ready to play"}`}
        data-testid={`unit-node-${unit.id}`}
        className={`toy-focus relative grid h-20 w-20 place-items-center rounded-full border-[4px] border-hc-navy text-4xl sm:h-24 sm:w-24 sm:text-5xl ${locked ? "bg-[#E6E2D8] grayscale" : mastered ? "bg-hc-sun" : color}`}
        style={{ boxShadow: locked ? "0 4px 0 #8C8778" : "0 6px 0 #1F2547" }}
      >
        {!locked && !mastered && <span className="absolute inset-0 animate-ping rounded-full border-4 border-white/70" aria-hidden="true" />}
        <span className={locked ? "opacity-40" : ""} aria-hidden="true">{unit.emoji}</span>
        {locked && <span className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full border-[3px] border-hc-navy bg-white"><Lock className="h-4 w-4" strokeWidth={3} /></span>}
        {mastered && <span className="absolute -right-1 -top-1 grid h-9 w-9 place-items-center rounded-full border-[3px] border-hc-navy bg-white"><Star className="h-5 w-5 fill-hc-sun" strokeWidth={2.5} /></span>}
      </motion.button>
      <span className={`mt-2 max-w-[8.5rem] text-center font-fredoka text-base font-bold leading-tight sm:text-lg ${locked ? "opacity-60" : ""}`}>{unit.title}</span>
      {!locked && <StarRow best={unit.best} target={unit.target} />}
    </motion.li>
  );
};

export default function GradeMap({ map, onPlay }) {
  const open = map.grades.filter((g) => g.available);
  const soon = map.grades.filter((g) => !g.available);
  return (
    <div className="space-y-8" data-testid="grade-map">
      {open.map((g) => {
        const done = g.units.filter((u) => u.status === "mastered").length;
        return (
          <section key={g.id} className="relative" data-testid={`grade-${g.id}`}>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <h3 className={`rounded-full border-[3px] border-hc-navy px-5 py-1.5 font-fredoka text-2xl font-bold ${GRADE_COLORS[g.id] || "bg-white"}`} style={{ boxShadow: "0 4px 0 #1F2547" }}>{g.title}</h3>
              <span className="rounded-full border-2 border-hc-navy bg-white px-3 py-1 text-sm font-bold">{done} of {g.units.length} mastered</span>
            </div>
            <ol className="relative mt-6 grid grid-cols-2 gap-x-4 gap-y-6 pb-10 sm:grid-cols-3 lg:grid-cols-6">
              <span className="pointer-events-none absolute left-[8%] right-[8%] top-10 hidden border-t-[4px] border-dashed border-hc-navy/25 lg:block" aria-hidden="true" />
              {g.units.map((u, i) => (
                <UnitNode key={u.id} unit={u} index={i} color={GRADE_COLORS[g.id] || "bg-white"} prevTitle={i > 0 ? g.units[i - 1].title : null} onPlay={onPlay} />
              ))}
            </ol>
          </section>
        );
      })}
      {soon.length > 0 && (
        <div className="rounded-[1.75rem] border-[3px] border-dashed border-hc-navy/40 bg-white/60 p-4 text-center" data-testid="grades-coming-soon">
          <p className="font-fredoka text-lg font-bold">More grades are being built</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {soon.map((g) => (
              <span key={g.id} className="inline-flex items-center gap-1 rounded-full border-2 border-hc-navy/50 bg-[#EEEAE0] px-3 py-1 text-sm font-bold opacity-70"><Lock className="h-3.5 w-3.5" /> {g.title}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
