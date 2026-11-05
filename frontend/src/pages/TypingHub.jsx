import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CloudRain, Gauge, Star } from "lucide-react";
import { Character } from "../components/Characters";
import { ToyButton } from "../components/ToyButton";
import { TYPING_LESSONS, loadTyping } from "../data/typing";
import { speak, unlockAudio } from "../lib/audioManager";

export const TypingHeader = ({ title, backTo = "/typing", right }) => {
  const navigate = useNavigate();
  return (
    <header className="flex items-center justify-between gap-3">
      <ToyButton color="white" className="px-3 sm:px-4" onClick={() => navigate(backTo)} aria-label="Back" data-testid="typing-back"><ArrowLeft className="h-6 w-6" strokeWidth={3} /> <span className="hidden sm:inline">Back</span></ToyButton>
      <h1 className="truncate font-fredoka text-2xl font-bold sm:text-3xl">{title}</h1>
      <div className="min-w-[48px]">{right}</div>
    </header>
  );
};

const Stars = ({ n }) => (
  <span className="flex gap-0.5" aria-label={`${n} of 3 stars`}>
    {[0, 1, 2].map((i) => <Star key={i} className={`h-5 w-5 ${i < n ? "fill-hc-sun text-hc-navy" : "text-hc-navy/30"}`} strokeWidth={2.5} />)}
  </span>
);

export default function TypingHub() {
  const navigate = useNavigate();
  const data = loadTyping();
  const nextLesson = TYPING_LESSONS.find((l) => !data.lessons[l.id]?.stars) || TYPING_LESSONS[0];

  const hello = () => { unlockAudio(); speak("Welcome to Key Quest! I'm Finn. Start with the home row lessons, then try the speed test or the Word Rain game!"); };

  return (
    <main className="hc-bg min-h-[100dvh] px-4 pb-12 pt-4 sm:px-8" data-testid="typing-hub">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <TypingHeader title="Key Quest" backTo="/" />

        <section className="flex flex-col items-center gap-4 rounded-[2rem] border-[3px] border-hc-navy bg-hc-mintlight p-5 sm:flex-row sm:p-8" style={{ boxShadow: "0 6px 0 #1F2547" }}>
          <button type="button" onClick={hello} className="toy-focus shrink-0 rounded-full" aria-label="Hear Finn">
            <Character name="finn" mood="wave" className="w-28 sm:w-36" />
          </button>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="font-fredoka text-3xl font-bold leading-tight sm:text-4xl">Learn to type like a superstar!</h2>
            <p className="mt-2 text-lg font-semibold leading-normal">Put your fingers on the home row, follow the glowing keys, and watch your speed grow.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
              <ToyButton color="sun" className="min-h-[60px] text-xl" onClick={() => navigate(`/typing/lesson/${nextLesson.id}`)} data-testid="typing-continue">{nextLesson.emoji} Next lesson: {nextLesson.title}</ToyButton>
            </div>
          </div>
          <div className="flex gap-3 sm:flex-col">
            <div className="rounded-2xl border-[3px] border-hc-navy bg-white px-4 py-2 text-center"><p className="font-fredoka text-3xl font-bold">{data.best}</p><p className="text-xs font-bold uppercase">Best words/min</p></div>
            <div className="rounded-2xl border-[3px] border-hc-navy bg-white px-4 py-2 text-center"><p className="font-fredoka text-3xl font-bold">{data.rainBest}</p><p className="text-xs font-bold uppercase">Word Rain best</p></div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <motion.button type="button" whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/typing/rain")} className="toy-focus flex items-center gap-4 rounded-[2rem] border-[3px] border-hc-navy bg-hc-skylight p-5 text-left" style={{ boxShadow: "0 6px 0 #1F2547" }} data-testid="typing-rain-card">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border-[3px] border-hc-navy bg-hc-sky"><CloudRain className="h-9 w-9" strokeWidth={2.5} /></span>
            <span><span className="block font-fredoka text-2xl font-bold">Word Rain</span><span className="font-semibold">Type the falling words before they splash!</span></span>
          </motion.button>
          <motion.button type="button" whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/typing/test")} className="toy-focus flex items-center gap-4 rounded-[2rem] border-[3px] border-hc-navy bg-hc-tanglight p-5 text-left" style={{ boxShadow: "0 6px 0 #1F2547" }} data-testid="typing-test-card">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border-[3px] border-hc-navy bg-hc-tang"><Gauge className="h-9 w-9" strokeWidth={2.5} /></span>
            <span><span className="block font-fredoka text-2xl font-bold">Speed Test</span><span className="font-semibold">Type a short story and see your words per minute.</span></span>
          </motion.button>
        </section>

        <section>
          <h2 className="mb-3 font-fredoka text-2xl font-bold sm:text-3xl">Lessons</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TYPING_LESSONS.map((l, i) => {
              const r = data.lessons[l.id];
              return (
                <motion.button key={l.id} type="button" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} whileHover={{ y: -3 }} onClick={() => navigate(`/typing/lesson/${l.id}`)} className={`toy-focus flex items-center gap-3 rounded-[1.5rem] border-[3px] border-hc-navy p-4 text-left ${l.id === nextLesson.id ? "bg-hc-sunlight" : "bg-white"}`} style={{ boxShadow: "0 4px 0 #1F2547" }} data-testid={`typing-lesson-${l.id}`}>
                  <span className="text-4xl" aria-hidden="true">{l.emoji}</span>
                  <span className="flex-1">
                    <span className="block font-fredoka text-lg font-bold leading-tight">{i + 1}. {l.title}</span>
                    <span className="text-sm font-semibold opacity-80">{r ? `${r.wpm} wpm, ${r.acc}% accurate` : "Not tried yet"}</span>
                  </span>
                  <Stars n={r?.stars || 0} />
                </motion.button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
