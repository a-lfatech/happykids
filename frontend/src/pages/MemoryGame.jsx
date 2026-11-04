import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import useGameSession from "../hooks/useGameSession";
import useVoice from "../hooks/useVoice";
import { sfx } from "../lib/audioManager";
import { GameTopBar } from "../components/GameTopBar";
import { SpeechPanel } from "../components/SpeechPanel";
import { NextButton } from "../components/NextButton";

const FACES = [
  { id: "hoppy", img: "/hk/hoppy.png" }, { id: "froggy", img: "/hk/froggy.png" }, { id: "sunny", img: "/hk/sunny.png" },
  { id: "ellie", img: "/hk/ellie.png" }, { id: "finn", img: "/hk/finn.png" }, { id: "maths", img: "/hk/icon_math.png" },
];
const INTRO = "Flip two cards. Can you find the matching pairs?";

export default function MemoryGame({ activity }) {
  const s = useGameSession(activity.id, 1);
  const deck = useMemo(() => [...FACES, ...FACES].map((f, i) => ({ ...f, key: i })).sort(() => Math.random() - 0.5), []);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [misses, setMisses] = useState(0);
  const [mood, setMood] = useState("happy");
  const [text, setText] = useState(INTRO);
  const lock = useRef(false);
  const voice = useVoice((cmd) => { if (cmd === "next" && s.solved) s.next(); else if (cmd === "thanks") voice.say("You're welcome!"); else voice.say(INTRO); });

  useEffect(() => { const t = setTimeout(() => voice.say(INTRO), 450); return () => clearTimeout(t); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const flip = (c) => {
    if (lock.current || s.solved || flipped.includes(c.key) || matched.includes(c.id)) return;
    s.markAttempt();
    sfx.tap();
    const now = [...flipped, c.key];
    setFlipped(now);
    if (now.length < 2) return;
    const [a, b] = now.map((k) => deck.find((d) => d.key === k));
    if (a.id === b.id) {
      const m = [...matched, a.id];
      setMatched(m); setFlipped([]); sfx.place(); setMood("happy");
      if (m.length === FACES.length) {
        const star = misses <= 8;
        s.registerCorrect(star);
        const msg = `Congratulations! You found all the pairs! ${star ? "What a super memory!" : "Great effort! Practice makes your memory stronger."}`;
        setMood("celebrate"); setText(msg); sfx.correct(); voice.say(msg, { listenAfter: true });
      } else { setText("A match! Keep going!"); voice.say("A match!"); }
    } else {
      lock.current = true;
      setMisses(misses + 1); setMood("thinking"); setText("Not a match. Try to remember where they are!");
      setTimeout(() => { setFlipped([]); lock.current = false; }, 900);
    }
  };

  return (
    <main className="hc-bg min-h-screen px-4 pb-10 pt-4 sm:px-8" data-testid="memory-game">
      <div className="mx-auto max-w-4xl">
        <GameTopBar statuses={s.statuses} stars={s.sessionStars} character={activity.character} backTo={`/world/${activity.world}`} onMicOn={() => voice.listen(true)} onMicOff={voice.stop} />
        <section className="mt-6"><SpeechPanel character={activity.character} mood={mood} title="Find the pairs!" text={`${text} Pairs found: ${matched.length} of ${FACES.length}.`} onListen={() => voice.say(INTRO)} listening={voice.listening} onStopListening={voice.stop} /></section>
        <section className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4" data-testid="memory-grid">
          {deck.map((c) => {
            const up = flipped.includes(c.key) || matched.includes(c.id);
            return (
              <motion.button type="button" key={c.key} onClick={() => flip(c)} data-testid={`memory-card-${c.key}`} data-face={c.id} data-up={up} aria-label={up ? c.id : "Hidden card"} animate={{ rotateY: up ? 0 : 180 }} transition={{ duration: 0.3 }}
                className={`toy-btn aspect-square h-auto w-full p-2 ${matched.includes(c.id) ? "bg-hc-mintlight" : up ? "bg-white" : "bg-hc-lav"}`}>
                {up ? <img src={c.img} alt="" className="h-full w-full object-contain" /> : <HelpCircle className="mx-auto h-10 w-10" strokeWidth={2.5} />}
              </motion.button>
            );
          })}
        </section>
        <div className="mt-8"><NextButton show={s.solved} isLast onClick={s.next} /></div>
      </div>
    </main>
  );
}
