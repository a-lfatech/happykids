import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Hand } from "lucide-react";
import { sfx, speak } from "../lib/audioManager";

// Hotspots and swing pivots are in the picture's own pixels (1264 x 848).
const FRIENDS = [
  { id: "ellie", name: "Ellie", x: 150, y: 385, w: 310, h: 360, shift: "-25%", hello: "Hello! I'm Ellie the Elephant. I love drawing and colouring!" },
  { id: "hoppy", name: "Hoppy", x: 520, y: 285, w: 240, h: 375, shift: "-50%", hello: "Hi there! I'm Hoppy the Bunny. Let's find missing numbers and read stories!" },
  { id: "finn", name: "Finn", x: 780, y: 375, w: 160, h: 265, shift: "-55%", hello: "Hey! I'm Finn the Fox. I love letter sounds and animal facts!" },
  { id: "froggy", name: "Froggy", x: 880, y: 555, w: 140, h: 195, shift: "-60%", hello: "Ribbit! I'm Froggy. Let's hop forward and backward on the number line!" },
  { id: "sunny", name: "Sunny", x: 1005, y: 545, w: 175, h: 215, shift: "-80%", hello: "Cheep cheep! I'm Sunny the Chick. Let's play and learn together!" },
];
const SWINGS = [
  { id: "blue", px: 1048.5, l: 1028, r: 1069, seat: "#3A9BEA", light: "#8FD0FF", delay: "0s" },
  { id: "red", px: 1127.5, l: 1106, r: 1149, seat: "#F26B5B", light: "#FFB0A5", delay: "-1.4s" },
];
const pct = (v, total) => `${(v / total) * 100}%`;

const Swing = ({ s }) => (
  <g className="hk-swing" style={{ transformOrigin: `${s.px}px 293px`, animationDelay: s.delay }} data-testid={`swing-${s.id}`}>
    {[s.l, s.r].map((x) => (
      <g key={x}>
        <line x1={x} y1="296" x2={x} y2="420" stroke="#9E8E72" strokeWidth="5" strokeLinecap="round" />
        <line x1={x} y1="296" x2={x} y2="420" stroke="#F1E8D6" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    ))}
    <rect x={s.l - 10} y="417" width={s.r - s.l + 20} height="14" rx="6" fill={s.seat} stroke="#1F2547" strokeOpacity="0.35" strokeWidth="1.5" />
    <rect x={s.l - 6} y="418.5" width={s.r - s.l + 12} height="4" rx="2" fill={s.light} opacity="0.8" />
  </g>
);

export const PlaygroundScene = () => {
  const [active, setActive] = useState(null);
  const timer = useRef(null);
  const hello = (f) => {
    sfx.tap();
    speak(f.hello);
    setActive({ ...f, k: Date.now() });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setActive(null), 4000);
  };

  return (
    <div className="relative aspect-[3/2] w-full" data-testid="playground-scene">
      <img src="/hk/playground_base.jpg" alt="Hoppy, Ellie, Finn, Froggy and Sunny around a magical storybook in a sunny playground" className="absolute inset-0 h-full w-full object-cover" data-testid="hero-playground" draggable="false" />
      <svg viewBox="0 0 1264 848" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        {SWINGS.map((s) => <Swing key={s.id} s={s} />)}
      </svg>
      {FRIENDS.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => hello(f)}
          aria-label={`Say hello to ${f.name}`}
          data-testid={`scene-friend-${f.id}`}
          className="toy-focus group absolute rounded-[40%] transition-colors duration-200 hover:bg-white/15"
          style={{ left: pct(f.x, 1264), top: pct(f.y, 848), width: pct(f.w, 1264), height: pct(f.h, 848), cursor: "pointer" }}
        >
          {active?.id === f.id && (
            <motion.span key={active.k} initial={{ scale: 0.6, opacity: 0.9 }} animate={{ scale: 1.25, opacity: 0 }} transition={{ duration: 0.9 }} className="pointer-events-none absolute inset-0 rounded-[40%] border-4 border-white" />
          )}
        </button>
      ))}
      <AnimatePresence>
        {active && (
          <motion.div
            key={active.k}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="pointer-events-none absolute z-10 w-44 rounded-2xl border-[3px] border-hc-navy bg-white p-2 text-left sm:w-64 sm:p-3"
            style={{ left: pct(active.x + active.w / 2, 1264), bottom: `calc(${pct(848 - active.y, 848)} + 8px)`, x: active.shift, boxShadow: "0 4px 0 #1F2547" }}
            data-testid="scene-hello-bubble"
          >
            <p className="font-fredoka text-sm font-bold sm:text-lg">{active.name}</p>
            <p className="text-xs font-bold leading-snug sm:text-sm">{active.hello}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <span className="pointer-events-none absolute bottom-3 right-3 hidden items-center gap-1.5 rounded-full border-[3px] border-hc-navy bg-white/90 px-3 py-1 font-fredoka text-sm font-semibold sm:flex" aria-hidden="true">
        <Hand className="h-4 w-4" strokeWidth={2.5} /> Tap a friend to say hello!
      </span>
    </div>
  );
};
