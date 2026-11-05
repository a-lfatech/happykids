import { useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Minus, Shuffle } from "lucide-react";
import { CHARACTERS } from "./Characters";
import { Modal } from "./Modal";
import { ACTIVITIES, activityById } from "../data/worlds";
import { sfx, speak, unlockAudio } from "../lib/audioManager";

const POSTER_RATIO = 1264 / 848;

const FRIENDS = [
  { id: "ellie", x: 12, y: 46, w: 25, h: 42, line: "I'm Ellie the Elephant. Let's draw and create together!" },
  { id: "hoppy", x: 41, y: 33, w: 19, h: 43 },
  { id: "finn", x: 61, y: 44, w: 13, h: 36, line: "I'm Finn the Fox. Puzzles and typing are my favourite!" },
  { id: "froggy", x: 69.5, y: 65, w: 11, h: 24, line: "Ribbit! I'm Froggy. Let's discover science!" },
  { id: "sunny", x: 80, y: 64, w: 13, h: 26, line: "Cheep cheep! I'm Sunny. Let's read a story!" },
];

const DISCOVER_GAMES = ["word-slider", "missing-numbers", "trace-and-write", "memory-cards", "letter-sounds", "more-or-less"];
const TILE_COLORS = ["bg-hc-skylight", "bg-hc-mintlight", "bg-hc-sunlight", "bg-hc-tanglight", "bg-hc-corallight", "bg-hc-lavlight"];

const Waves = () => (
  <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full sm:h-24" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0,56 C240,116 480,4 720,44 C960,84 1200,16 1440,52 L1440,120 L0,120 Z" fill="#FFC93C" fillOpacity="0.75" />
    <path d="M0,84 C300,36 540,118 820,80 C1080,46 1260,94 1440,74 L1440,120 L0,120 Z" fill="#3DD6A3" fillOpacity="0.85" />
    <path d="M0,102 C360,70 620,122 940,98 C1160,82 1320,106 1440,94 L1440,120 L0,120 Z" fill="#FFF6E3" />
  </svg>
);

const Sticker = ({ label, color, rotate, delay, onClick, className, testId }) => (
  <div className={`pointer-events-none absolute ${className}`}>
  <motion.button
    type="button"
    onClick={() => { unlockAudio(); sfx.hop(); onClick(); }}
    animate={{ y: [0, -8, 0] }}
    transition={{ repeat: Infinity, duration: 2.6, delay, ease: "easeInOut" }}
    whileHover={{ scale: 1.1, rotate: 0 }}
    whileTap={{ scale: 0.9 }}
    className={`toy-focus pointer-events-auto rounded-full border-[3px] border-hc-navy px-5 py-2 font-fredoka text-xl font-bold sm:px-7 sm:text-3xl ${color}`}
    style={{ boxShadow: "0 5px 0 #1F2547", rotate }}
    data-testid={testId}
  >
    {label}
  </motion.button>
  </div>
);

const DiscoverMenu = ({ open, onClose, next, onLesson }) => {
  const navigate = useNavigate();
  const go = (path) => { onClose(); navigate(path); };
  const surprise = () => {
    const pick = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
    speak(`Surprise! Let's play ${pick.title}!`);
    go(`/play/${pick.id}`);
  };
  const tiles = DISCOVER_GAMES.map(activityById).filter(Boolean);
  return (
    <Modal open={open} onClose={onClose} testId="discover-menu">
      <h2 className="text-center font-fredoka text-3xl font-bold">Discover!</h2>
      <p className="mt-1 text-center font-bold">Pick something exciting to play.</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button type="button" onClick={surprise} className="toy-focus col-span-2 flex items-center justify-center gap-2 rounded-[1.5rem] border-[3px] border-hc-navy bg-hc-sun p-3 font-fredoka text-2xl font-bold" style={{ boxShadow: "0 4px 0 #1F2547" }} data-testid="discover-surprise">
          <Shuffle className="h-7 w-7" strokeWidth={2.5} /> Surprise me!
        </button>
        {next && (
          <button type="button" onClick={() => { onClose(); onLesson(next); }} className="toy-focus col-span-2 rounded-[1.5rem] border-[3px] border-hc-navy bg-hc-coral p-3 font-fredoka text-xl font-bold" style={{ boxShadow: "0 4px 0 #1F2547" }}>
            {next.emoji} My next lesson: {next.title}
          </button>
        )}
        <button type="button" onClick={() => go("/typing/rain")} className="toy-focus rounded-[1.5rem] border-[3px] border-hc-navy bg-hc-sky p-3 text-left" style={{ boxShadow: "0 4px 0 #1F2547" }}>
          <span className="block font-fredoka text-lg font-bold leading-tight">Word Rain</span>
          <span className="text-xs font-bold">Typing game</span>
        </button>
        {tiles.map((a, i) => (
          <button key={a.id} type="button" onClick={() => go(`/play/${a.id}`)} className={`toy-focus rounded-[1.5rem] border-[3px] border-hc-navy p-3 text-left ${TILE_COLORS[i % TILE_COLORS.length]}`} style={{ boxShadow: "0 4px 0 #1F2547" }}>
            <span className="block font-fredoka text-lg font-bold leading-tight">{a.title}</span>
            <span className="text-xs font-bold">{a.skill}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
};

const usePosterBox = () => {
  const ref = useRef(null);
  const read = () => ({ vw: window.innerWidth, vh: window.innerHeight, w: ref.current?.clientWidth || window.innerWidth, h: ref.current?.clientHeight || window.innerHeight });
  const [box, setBox] = useState(read);
  useLayoutEffect(() => {
    const update = () => setBox(read());
    update();
    window.addEventListener("resize", update);
    const ro = typeof ResizeObserver !== "undefined" && ref.current ? new ResizeObserver(update) : null;
    if (ro) ro.observe(ref.current);
    return () => { window.removeEventListener("resize", update); ro?.disconnect(); };
  }, []);
  return [ref, box];
};

export const Poster = ({ name, children, hoppyLine, onPlay, onLearn, next, onLesson }) => {
  const [active, setActive] = useState(null);
  const [discover, setDiscover] = useState(false);
  const [tucked, setTucked] = useState(true);
  const [heroRef, box] = usePosterBox();
  const frameW = Math.max(box.w, box.h * POSTER_RATIO);
  const frameH = frameW / POSTER_RATIO;
  const frame = { width: frameW, height: frameH };
  const chipTop = Math.max(frameH * 0.25, frameH - box.h + 96);

  const openBubble = () => {
    unlockAudio();
    sfx.tap();
    setTucked(false);
  };

  const hello = (f) => {
    unlockAudio();
    if (f.id === "hoppy") setTucked(false);
    setActive(f.id);
    speak(f.id === "hoppy" ? hoppyLine : `Hi${name ? ` ${name}` : ""}! ${f.line}`);
    setTimeout(() => setActive((a) => (a === f.id ? null : a)), 2600);
  };

  return (
    <section ref={heroRef} className="relative -mx-4 flex flex-col overflow-hidden sm:-mx-8" style={{ minHeight: Math.max(box.vh, box.vw / POSTER_RATIO) }} data-testid="landing-hero">
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={frame}>
          <img src="/hk/playground_hero.jpg" alt="Ellie, Hoppy, Finn, Froggy and Sunny playing in a sunny park with floating letters and numbers" className="absolute inset-0 h-full w-full select-none" draggable="false" />
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
              <AnimatePresence>
                {active === f.id && f.id !== "hoppy" && (
                  <motion.span initial={{ scale: 0.5, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.6, opacity: 0 }} className="pointer-events-none absolute left-1/2 top-0 w-max -translate-x-1/2 -translate-y-full rounded-2xl border-[3px] border-hc-navy bg-white px-3 py-1.5 font-fredoka text-base font-bold sm:text-lg" style={{ boxShadow: "0 3px 0 #1F2547" }}>
                    Hi! I'm {CHARACTERS[f.id].name.split(" ")[0]}!
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>
      </div>

      <Waves />

      <div className="pointer-events-none relative flex-1">
        <Sticker label="Play!" color="bg-hc-mint" rotate={-8} delay={0} onClick={onPlay} className="bottom-[22%] left-1 sm:left-6" testId="sticker-play" />
        <Sticker label="Learn!" color="bg-hc-sky" rotate={8} delay={0.4} onClick={onLearn} className="bottom-[22%] right-1 sm:right-6" testId="sticker-learn" />
        {tucked && <Sticker label="Discover!" color="bg-hc-sun" rotate={0} delay={0.8} onClick={() => { speak("Let's discover something exciting!"); setDiscover(true); }} className="inset-x-0 bottom-12 flex justify-center sm:bottom-16" testId="sticker-discover" />}
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={frame}>
          <AnimatePresence>
            {tucked ? (
              <div key="chip" className="absolute left-1/2 -translate-x-1/2" style={{ top: chipTop }}>
                <motion.button
                  type="button"
                  initial={{ scale: 0.5, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: [0, -5, 0] }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ y: { repeat: Infinity, duration: 2.4, ease: "easeInOut" } }}
                  onClick={openBubble}
                  className="toy-focus pointer-events-auto relative flex w-max items-center gap-1.5 rounded-full border-[3px] border-hc-navy bg-white/80 px-3 py-1.5 font-fredoka text-base font-bold backdrop-blur-md sm:text-lg"
                  style={{ boxShadow: "0 4px 0 #1F2547" }}
                  aria-label="Open Hoppy's speech bubble"
                  data-testid="hoppy-bubble-open"
                >
                  <MessageCircle className="h-5 w-5 text-hc-coral" strokeWidth={2.5} /> {name ? "Talk to Hoppy" : "Hi! Tap me"}
                  <span className="absolute -bottom-[9px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b-[3px] border-r-[3px] border-hc-navy bg-white" aria-hidden="true" />
                </motion.button>
              </div>
            ) : (
              <div key="bubble" className="absolute left-[50.2%] top-[63%] w-[min(92vw,34rem)] -translate-x-1/2">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0, y: -20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.6, opacity: 0, y: -20 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  style={{ originY: 0 }}
                  className="pointer-events-auto relative rounded-[1.75rem] border-[3px] border-hc-navy bg-white/75 px-4 pb-3 pt-4 shadow-[0_5px_0_#1F2547] backdrop-blur-md sm:px-6"
                  data-testid="hoppy-bubble"
                >
                  <span className="absolute -top-[12px] left-1/2 h-5 w-5 -translate-x-1/2 rotate-45 border-l-[3px] border-t-[3px] border-hc-navy bg-white" aria-hidden="true" />
                  <button type="button" onClick={() => setTucked(true)} className="toy-focus absolute right-2 top-2 rounded-full p-1 opacity-70 transition hover:bg-white hover:opacity-100" aria-label="Tuck the speech bubble away" data-testid="hoppy-bubble-tuck">
                    <Minus className="h-5 w-5" strokeWidth={3} />
                  </button>
                  {children}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <DiscoverMenu open={discover} onClose={() => setDiscover(false)} next={next} onLesson={onLesson} />
    </section>
  );
};
