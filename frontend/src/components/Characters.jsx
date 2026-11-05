import { motion } from "framer-motion";
import { Sparkles, Star } from "lucide-react";

export const CHARACTERS = {
  hoppy: { img: "/hk/hoppy.png", think: "/hk/hoppy_think.png", name: "Hoppy the Bunny", specialty: "Mathematics" },
  froggy: { img: "/hk/froggy.png", think: "/hk/froggy_think.png", name: "Froggy the Frog", specialty: "Science & Discovery" },
  sunny: { img: "/hk/sunny.png", name: "Sunny the Chick", specialty: "Reading & Language" },
  ellie: { img: "/hk/ellie.png", name: "Ellie the Elephant", specialty: "Creativity & Art" },
  finn: { img: "/hk/finn.png", name: "Finn the Fox", specialty: "Logic & Thinking" },
  melody: { img: "/hk/melody.webp", name: "Melody the Music Note", specialty: "Music & Movement" },
};

const MOTION = {
  happy: { animate: { y: [0, -6, 0] }, transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } },
  talking: { animate: { scale: [1, 1.04, 1] }, transition: { duration: 0.7, repeat: Infinity } },
  wave: { animate: { rotate: [0, -6, 6, -6, 0] }, transition: { duration: 1.4, repeat: Infinity, repeatDelay: 1.2 } },
  dance: { animate: { rotate: [0, -8, 8, -8, 0], y: [0, -8, 0, -8, 0] }, transition: { duration: 1.2, repeat: Infinity } },
  celebrate: { animate: { y: [0, -26, 0, -14, 0], rotate: [0, -5, 5, -2, 0] }, transition: { duration: 1.1, repeat: Infinity, repeatDelay: 0.4 } },
  thinking: { animate: { rotate: [0, -5, -5, 0] }, transition: { duration: 2.6, repeat: Infinity } },
  sad: { animate: { x: [0, -5, 5, -3, 0], y: [0, 3, 3, 0] }, transition: { duration: 0.7 } },
};

export const Character = ({ name, mood = "happy", className = "", testId }) => {
  const c = CHARACTERS[name];
  const m = MOTION[mood] || MOTION.happy;
  const src = (mood === "thinking" || mood === "sad") && c.think ? c.think : c.img;
  return (
    <div className={`relative ${className}`} data-testid={testId} data-mood={mood}>
      <motion.img
        key={mood}
        src={src}
        alt={c.name}
        draggable="false"
        animate={m.animate}
        transition={m.transition}
        style={{ transformOrigin: "50% 100%" }}
        className="h-auto w-full select-none object-contain drop-shadow-[0_6px_0_rgba(31,37,71,0.12)]"
      />
      {(mood === "thinking" || mood === "sad") && (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 right-0 grid h-8 w-8 place-items-center rounded-full border-[3px] border-hc-navy bg-white font-fredoka text-lg font-bold">?</motion.span>
      )}
      {mood === "celebrate" && (
        <>
          <Sparkles className="hc-float absolute -left-2 -top-3 h-7 w-7 text-hc-sun" strokeWidth={2.5} />
          <Star className="hc-float absolute -right-2 -top-1 h-6 w-6 fill-hc-sun text-hc-navy" strokeWidth={2} />
        </>
      )}
    </div>
  );
};
