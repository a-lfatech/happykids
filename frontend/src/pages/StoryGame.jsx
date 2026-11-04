import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, HelpCircle } from "lucide-react";
import { speak, stopSpeaking } from "../lib/audioManager";
import { STORIES } from "../data/stories";
import { ToyButton } from "../components/ToyButton";
import { ListenButton } from "../components/SpeechPanel";
import { ProgressDots } from "../components/ProgressDots";
import { ICONS } from "../components/Pic";
import QuizCore from "./QuizCore";

const StoryReader = ({ story, onDone, backTo }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [word, setWord] = useState(-1);
  const timer = useRef(null);
  const p = story.pages[page];
  const words = p.text.split(" ");
  const starts = words.reduce((acc, w, i) => [...acc, i === 0 ? 0 : acc[i - 1] + words[i - 1].length + 1], []);
  const Icon = ICONS[p.icon];

  const read = () => {
    clearInterval(timer.current);
    let i = 0;
    let usingBoundary = false;
    setWord(0);
    timer.current = setInterval(() => { if (usingBoundary) return; i++; if (i >= words.length) { clearInterval(timer.current); } else setWord(i); }, 430);
    speak(p.text, {
      onBoundary: (ci) => { usingBoundary = true; let k = 0; starts.forEach((st, j) => { if (st <= ci) k = j; }); setWord(k); },
      onEnd: () => { clearInterval(timer.current); setWord(-1); },
    });
  };

  useEffect(() => { const t = setTimeout(read, 400); return () => { clearTimeout(t); clearInterval(timer.current); }; /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page]);
  useEffect(() => () => stopSpeaking(), []);

  const statuses = story.pages.map((_, i) => (i < page ? "done" : i === page ? "current" : "todo"));
  return (
    <main className="hc-bg min-h-screen px-4 pb-10 pt-4 sm:px-8" data-testid="story-reader">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <ToyButton color="white" onClick={() => navigate(backTo)} data-testid="story-back-button"><ArrowLeft className="h-6 w-6" strokeWidth={3} /> Back</ToyButton>
          <ProgressDots statuses={statuses} />
          <span className="flex items-center gap-2 font-fredoka text-lg font-bold"><BookOpen className="h-6 w-6" /> {story.title}</span>
        </header>
        <motion.section key={page} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={`toy-card mt-8 grid items-center gap-6 overflow-hidden p-6 sm:p-10 md:grid-cols-[1fr_1.3fr] ${p.bg}`} data-testid={`story-page-${page}`}>
          <div className="relative mx-auto w-48 sm:w-64">
            <img src={p.img} alt="" className="w-full" />
            {Icon && <span className="absolute -right-2 bottom-2 grid h-16 w-16 place-items-center rounded-2xl border-[3px] border-hc-navy bg-white"><Icon className="h-9 w-9" strokeWidth={2.25} /></span>}
          </div>
          <div>
            <p className="font-fredoka text-3xl font-semibold leading-snug sm:text-5xl" data-testid="story-text">
              {words.map((w, i) => (
                <button type="button" key={i} onClick={() => speak(w.replace(/[^\w']/g, ""))} data-testid={`story-word-${i}`} className={`toy-focus mr-2 inline-block rounded-xl px-1 transition-colors duration-150 ${i === word ? "bg-hc-sun" : "hover:bg-white/70"}`}>{w}</button>
              ))}
            </p>
            <p className="mt-3 text-sm font-bold opacity-70">Tap any word to hear it.</p>
            <div className="mt-5"><ListenButton onClick={read} /></div>
          </div>
        </motion.section>
        <div className="mt-8 flex items-center justify-between gap-3">
          <ToyButton color="white" className="text-xl" disabled={page === 0} onClick={() => setPage(page - 1)} data-testid="story-prev-button"><ArrowLeft className="h-6 w-6" strokeWidth={3} /> Back page</ToyButton>
          {page < story.pages.length - 1 ? (
            <ToyButton color="mint" className="min-h-[68px] px-8 text-2xl" onClick={() => setPage(page + 1)} data-testid="story-next-button">Next page <ArrowRight className="h-6 w-6" strokeWidth={3} /></ToyButton>
          ) : (
            <ToyButton color="sun" className="min-h-[68px] px-8 text-2xl" onClick={onDone} data-testid="story-questions-button"><HelpCircle className="h-6 w-6" strokeWidth={3} /> Questions</ToyButton>
          )}
        </div>
      </div>
    </main>
  );
};

export default function StoryGame({ activity }) {
  const [quiz, setQuiz] = useState(false);
  const story = STORIES[activity.id];
  if (quiz) return <QuizCore activity={activity} rounds={story.questions} />;
  return <StoryReader story={story} onDone={() => { stopSpeaking(); setQuiz(true); }} backTo={`/world/${activity.world}`} />;
}
