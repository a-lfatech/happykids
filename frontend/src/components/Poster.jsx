import { useState } from "react";
import { motion } from "framer-motion";
import { CHARACTERS } from "./Characters";
import { speak, unlockAudio } from "../lib/audioManager";

const FRIENDS = [
  { id: "ellie", x: 13, y: 46, w: 24, h: 39, line: "I'm Ellie the Elephant. Let's draw and create together!" },
  { id: "hoppy", x: 41.5, y: 34, w: 18, h: 40, line: "I'm Hoppy the Bunny. I love counting and numbers!" },
  { id: "finn", x: 61, y: 44, w: 12.5, h: 33, line: "I'm Finn the Fox. Puzzles are my favourite!" },
  { id: "froggy", x: 68.5, y: 64, w: 11, h: 21, line: "Ribbit! I'm Froggy. Let's discover science!" },
  { id: "sunny", x: 80.5, y: 64, w: 11.5, h: 23, line: "Cheep cheep! I'm Sunny. Let's read a story!" },
];

export const Poster = ({ name }) => {
  const [active, setActive] = useState(null);
  const hello = (f) => {
    unlockAudio();
    setActive(f.id);
    speak(`Hi${name ? ` ${name}` : ""}! ${f.line}`);
    setTimeout(() => setActive((a) => (a === f.id ? null : a)), 2600);
  };
  return (
    <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 120, damping: 16 }} className="relative mx-auto mt-8 w-full max-w-5xl" data-testid="poster">
      <img src="/hk/large_poster.png" alt="Ellie, Hoppy, Finn, Froggy and Sunny playing in a sunny park with floating letters and numbers" className="block h-auto w-full select-none" draggable="false" />
      {FRIENDS.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => hello(f)}
          aria-label={`Say hello to ${CHARACTERS[f.id].name}`}
          data-testid={`poster-friend-${f.id}`}
          className="toy-focus absolute rounded-full"
          style={{ left: `${f.x}%`, top: `${f.y}%`, width: `${f.w}%`, height: `${f.h}%` }}
        >
          {active === f.id && (
            <motion.span initial={{ scale: 0.5, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="pointer-events-none absolute -top-2 left-1/2 w-max -translate-x-1/2 -translate-y-full rounded-2xl border-[3px] border-hc-navy bg-white px-3 py-1.5 font-fredoka text-sm font-bold sm:text-lg" style={{ boxShadow: "0 3px 0 #1F2547" }}>
              Hi! I'm {CHARACTERS[f.id].name.split(" ")[0]}!
            </motion.span>
          )}
        </button>
      ))}
    </motion.div>
  );
};
