import { Navigate, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Play, Star } from "lucide-react";
import { useAppState } from "../context/AppState";
import { PageShell } from "../components/SiteNav";
import { CHARACTERS, Character } from "../components/Characters";
import { ListenButton } from "../components/SpeechPanel";
import { ToyButton } from "../components/ToyButton";
import { activitiesOf, isFinished, solvedCount, worldById } from "../data/worlds";
import { speak } from "../lib/audioManager";

export default function WorldPage() {
  const { worldId } = useParams();
  const navigate = useNavigate();
  const { pdata } = useAppState();
  const w = worldById(worldId);
  if (!w) return <Navigate to="/learn" replace />;
  const acts = activitiesOf(w.id);
  const greeting = `Welcome to ${w.title}! ${w.blurb} Pick a game to play.`;

  return (
    <PageShell testId={`world-page-${w.id}`} bare>
      <div className="mx-auto max-w-6xl pb-16">
        <ToyButton color="white" onClick={() => navigate("/learn")} data-testid="world-back-button"><ArrowLeft className="h-5 w-5" strokeWidth={3} /> All worlds</ToyButton>
        <header className={`mt-5 flex flex-wrap items-center gap-5 rounded-[2rem] border-[3px] border-hc-navy p-6 ${w.card}`} style={{ boxShadow: "0 6px 0 #1F2547" }}>
          <img src={w.icon} alt="" className="h-24 w-24 object-contain sm:h-32 sm:w-32" />
          <div className="flex-1">
            <p className="font-fredoka font-semibold">World {w.num} · {w.subject}</p>
            <h1 className="font-fredoka text-4xl font-bold sm:text-6xl" data-testid="world-title">{w.title}</h1>
            <p className="mt-1 text-lg font-bold">{w.blurb}</p>
            <div className="mt-3"><ListenButton onClick={() => speak(greeting)} /></div>
          </div>
          <Character name={w.character} mood="wave" className="hidden w-32 sm:block lg:w-40" />
        </header>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {acts.map((a, i) => {
            const done = solvedCount(pdata, a.id);
            const stars = Object.values(pdata.games[a.id]?.puzzles || {}).filter((p) => p.firstTry > 0).length;
            return (
              <motion.article key={a.id} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.07 }} className="toy-card flex flex-col p-5" data-testid={`activity-card-${a.id}`}>
                <div className="flex items-start justify-between">
                  <img src={CHARACTERS[a.character].img} alt={CHARACTERS[a.character].name} className="h-24 w-24 object-contain" />
                  {isFinished(pdata, a.id) && <span className="flex items-center gap-1 rounded-full border-[3px] border-hc-navy bg-hc-mint px-2 py-0.5 text-sm font-bold"><Check className="h-4 w-4" strokeWidth={4} /> Done</span>}
                </div>
                <h2 className="mt-2 font-fredoka text-2xl font-bold">{a.title}</h2>
                <p className="flex-1 font-bold">{a.blurb}</p>
                <div className="mt-3 flex items-center justify-between text-sm font-bold">
                  <span className="rounded-full border-[3px] border-hc-navy bg-hc-sunlight px-2.5 py-0.5 font-fredoka" data-testid={`activity-count-${a.id}`}>{a.total} {a.total === 1 ? "game" : "puzzles"}</span>
                  <span className="flex items-center gap-1" data-testid={`activity-progress-${a.id}`}>{done}/{a.total} <Star className="ml-2 h-4 w-4 fill-hc-sun" /> {stars}</span>
                </div>
                <ToyButton color="sun" className="mt-4 min-h-[64px] text-2xl" onClick={() => navigate(`/play/${a.id}`)} data-testid={`play-${a.id}-button`}><Play className="h-6 w-6 fill-hc-navy" /> PLAY</ToyButton>
              </motion.article>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
