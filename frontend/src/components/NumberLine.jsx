import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Flag } from "lucide-react";

const NAVY = "#1F2547";
const cx = (i) => i * 100 + 50;

const HopArc = ({ x1, x2, n }) => {
  const fwd = x2 > x1;
  const mid = (x1 + x2) / 2;
  return (
    <g data-testid={`hop-arc-${n}`}>
      <motion.path
        d={`M${x1} 118 Q${mid} 0 ${x2} 118`}
        fill="none"
        stroke={fwd ? "#2F95E0" : "#F07A2A"}
        strokeWidth="6"
        strokeLinecap="round"
        markerEnd="url(#hc-arrowhead)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      />
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
        <circle cx={mid} cy="59" r="17" fill="#fff" stroke={NAVY} strokeWidth="3" />
        <text x={mid} y="66" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="20" fill={NAVY}>{n}</text>
      </motion.g>
    </g>
  );
};

export const NumberLine = ({ numbers, start, frogAt, hops, onTap, shake, answer, solved, pulseStart, disabled }) => {
  const pos = (n) => numbers.indexOf(n);
  const visited = new Set(hops.map((h) => h.to));
  const backward = answer < start;

  const boxBg = (n) => {
    if (solved && n === answer) return "bg-hc-mint";
    if (n === start) return "bg-hc-sun";
    if (visited.has(n)) return backward ? "bg-hc-tanglight" : "bg-hc-skylight";
    return "bg-white";
  };

  return (
    <div className="w-full select-none" data-testid="number-line">
      <div className="mb-1 flex justify-between font-fredoka text-base font-semibold sm:text-lg">
        <span className="flex items-center gap-1 rounded-full border-[3px] border-hc-navy bg-hc-tang px-3 py-1" data-testid="label-less">
          <ArrowLeft className="h-5 w-5" strokeWidth={3} /> LESS
        </span>
        <span className="flex items-center gap-1 rounded-full border-[3px] border-hc-navy bg-hc-sky px-3 py-1" data-testid="label-more">
          MORE <ArrowRight className="h-5 w-5" strokeWidth={3} />
        </span>
      </div>
      <svg viewBox="0 0 600 122" className="block w-full overflow-visible" aria-hidden="true">
        <defs>
          <marker id="hc-arrowhead" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill={NAVY} />
          </marker>
        </defs>
        {hops.map((h, k) => <HopArc key={k} x1={cx(pos(h.from))} x2={cx(pos(h.to))} n={k + 1} />)}
      </svg>
      <div className="relative">
        <div className="grid grid-cols-6 overflow-hidden rounded-2xl border-[3px] border-hc-navy bg-white" style={{ boxShadow: "0 5px 0 #1F2547" }}>
          {numbers.map((n, i) => (
            <button
              type="button"
              key={`${n}-${shake.n === n ? shake.k : 0}`}
              data-testid={`numberline-box-${n}`}
              aria-label={`Number ${n}${n === start ? ", start" : ""}`}
              disabled={disabled}
              onClick={() => onTap(n)}
              className={`toy-focus relative flex aspect-[3/4] items-end justify-center pb-[10%] font-fredoka text-3xl font-bold transition-colors duration-300 sm:text-5xl ${i < 5 ? "border-r-[3px] border-hc-navy" : ""} ${boxBg(n)} ${shake.n === n ? "hc-shake bg-hc-corallight" : ""} ${pulseStart && n === start ? "hc-pulse" : ""}`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute top-[5%] w-[10.5%]"
            initial={false}
            animate={{ left: `${((pos(frogAt) + 0.5) / 6) * 100}%` }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            style={{ x: "-50%" }}
            data-testid="froggy-marker"
            data-at={frogAt}
          >
            <motion.div key={hops.length} initial={{ y: 0 }} animate={{ y: [0, -70, 0] }} transition={{ duration: 0.45, ease: "easeOut" }}>
              <img src="/hk/froggy.png" alt="" className="w-full" draggable="false" />
            </motion.div>
          </motion.div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-6">
        {numbers.map((n) => (
          <div key={n} className="flex justify-center">
            {n === start && (
              <span className="flex items-center gap-1 rounded-full border-[3px] border-hc-navy bg-hc-sun px-1.5 py-0.5 font-fredoka text-[10px] font-bold sm:px-2 sm:text-sm" data-testid="start-label">
                <Flag className="hidden h-3.5 w-3.5 sm:block" strokeWidth={3} /> START
              </span>
            )}
            {solved && n === answer && (
              <span className="flex items-center gap-1 rounded-full border-[3px] border-hc-navy bg-hc-mint px-1.5 py-0.5 font-fredoka text-[10px] font-bold sm:px-2 sm:text-sm" data-testid="answer-label">
                <Check className="hidden h-3.5 w-3.5 sm:block" strokeWidth={4} /> YES!
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
