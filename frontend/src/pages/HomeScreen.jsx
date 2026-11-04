import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Mic, Play, Settings, Star, Volume2 } from "lucide-react";
import { useAppState } from "../context/AppState";
import { Character } from "../components/Characters";
import { ToyButton } from "../components/ToyButton";
import { ListenButton } from "../components/SpeechPanel";
import { PressHold } from "../components/PressHold";
import { Modal } from "../components/Modal";
import { SettingsToggles } from "../components/SettingsToggles";
import { GAMES } from "../games/registry";
import { speak } from "../lib/audioManager";

const WELCOME = "Hi friend! I'm Sunny. Hoppy and Froggy want to play. Pick a game and let's hop!";

const MissingPreview = () => (
  <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
    {[1, 2, null, null, 5].map((v, i) => (
      <span key={i} className={`grid h-11 w-11 place-items-center rounded-xl border-[3px] border-hc-navy font-fredoka text-2xl font-bold sm:h-12 sm:w-12 ${v ? "bg-white" : "border-dashed bg-hc-sunlight"}`}>{v ?? "?"}</span>
    ))}
  </div>
);

const LinePreview = () => (
  <svg viewBox="0 0 300 110" className="mx-auto w-full max-w-[280px]" aria-hidden="true">
    <defs><marker id="pv-ah" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#1F2547" /></marker></defs>
    <path d="M125 52 Q150 6 175 52" fill="none" stroke="#2F95E0" strokeWidth="5" strokeLinecap="round" markerEnd="url(#pv-ah)" />
    <path d="M175 52 Q200 6 225 52" fill="none" stroke="#2F95E0" strokeWidth="5" strokeLinecap="round" markerEnd="url(#pv-ah)" />
    {[5, 6, 7, 8, 9, 10].map((n, i) => (
      <g key={n}>
        <rect x={i * 50 + 2} y="56" width="46" height="50" rx="8" fill={n === 7 ? "#FFC93C" : n > 7 && n < 10 ? "#D4EEFF" : "#fff"} stroke="#1F2547" strokeWidth="3" />
        <text x={i * 50 + 25} y="92" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="24" fill="#1F2547">{n}</text>
      </g>
    ))}
  </svg>
);

const GameCard = ({ game, done, delay }) => {
  const navigate = useNavigate();
  return (
    <motion.article initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay, type: "spring", stiffness: 160, damping: 18 }} className="toy-card flex flex-col overflow-hidden" data-testid={`game-card-${game.id}`}>
      <div className={`relative flex items-end gap-4 border-b-[3px] border-hc-navy px-5 pt-5 ${game.tint}`}>
        <Character name={game.character} className="w-24 shrink-0 translate-y-2 sm:w-28" />
        <div className="pb-4">
          <span className="rounded-full border-[3px] border-hc-navy bg-white px-3 py-0.5 font-fredoka text-sm font-bold">Game {game.number}</span>
          <h2 className="mt-2 font-fredoka text-3xl font-bold leading-none sm:text-4xl">{game.title}</h2>
          <p className="mt-1 text-sm font-bold opacity-80">with {game.companion}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <p className="text-lg font-bold">{game.blurb}</p>
        <div className="rounded-2xl border-[3px] border-dashed border-hc-navy/40 bg-hc-cream p-4">{game.id === "missing-numbers" ? <MissingPreview /> : <LinePreview />}</div>
        <div className="flex items-center justify-between gap-3 text-sm font-bold">
          <span className="rounded-full border-[3px] border-hc-navy bg-hc-sunlight px-3 py-1 font-fredoka text-base" data-testid={`puzzle-count-${game.id}`}>{game.total} puzzles</span>
          <span data-testid={`game-progress-${game.id}`}>{done} of {game.total} done</span>
        </div>
        <div className="h-4 overflow-hidden rounded-full border-[3px] border-hc-navy bg-white" aria-hidden="true">
          <div className="h-full bg-hc-mint transition-all duration-700" style={{ width: `${(done / game.total) * 100}%` }} />
        </div>
        <ToyButton color={game.id === "missing-numbers" ? "lav" : "mint"} className="mt-auto min-h-[68px] text-2xl" onClick={() => navigate(game.path)} data-testid={`play-${game.id}-button`}>
          <Play className="h-7 w-7 fill-hc-navy" strokeWidth={2.5} /> PLAY
        </ToyButton>
      </div>
    </motion.article>
  );
};

export default function HomeScreen() {
  const navigate = useNavigate();
  const { state } = useAppState();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const doneCount = (id) => Object.values(state.games[id]?.puzzles || {}).filter((p) => p.completed > 0).length;
  const totalDone = GAMES.reduce((a, g) => a + doneCount(g.id), 0);
  const totalPuzzles = GAMES.reduce((a, g) => a + g.total, 0);

  const openGrownUps = () => { sessionStorage.setItem("hc_grownup", "1"); navigate("/grown-ups"); };

  return (
    <main className="hc-bg relative min-h-screen overflow-hidden px-4 pb-16 pt-4 sm:px-8" data-testid="home-screen">
      <Star className="hc-float pointer-events-none absolute left-[6%] top-40 h-10 w-10 fill-hc-sun opacity-70" strokeWidth={2} />
      <Star className="hc-float pointer-events-none absolute right-[8%] top-28 h-7 w-7 fill-hc-coral opacity-60" strokeWidth={2} style={{ animationDelay: "1.5s" }} />
      <div className="pointer-events-none absolute -right-24 top-[38%] h-72 w-72 rounded-full bg-hc-lav/30 blur-2xl" />
      <div className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-hc-mint/25 blur-2xl" />

      <div className="relative mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-14 items-center gap-2 rounded-2xl border-[3px] border-hc-navy bg-hc-sunlight px-4 font-fredoka text-xl font-bold" data-testid="star-count" aria-label={`${state.totalStars} stars collected`}>
              <Star className="h-6 w-6 fill-hc-sun" strokeWidth={2.5} /> {state.totalStars}
            </div>
            <div className="hidden h-14 items-center rounded-2xl border-[3px] border-hc-navy bg-white px-4 font-fredoka text-base font-semibold sm:flex" data-testid="overall-progress">
              {totalDone} / {totalPuzzles} puzzles done
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ToyButton color="white" onClick={() => setSettingsOpen(true)} data-testid="settings-button" aria-label="Sound settings" className="px-3 sm:px-4">
              <Settings className="h-6 w-6" strokeWidth={2.75} /> <span className="hidden sm:inline">Sound</span>
            </ToyButton>
            <PressHold onComplete={openGrownUps} testId="parent-gate-btn" />
          </div>
        </header>

        <section className="mt-8 grid items-center gap-8 lg:mt-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="inline-block rounded-full border-[3px] border-hc-navy bg-white px-4 py-1.5 font-fredoka text-sm font-semibold sm:text-base" data-testid="grade-tag">Kindergarten – Grade 1 | Numbers 1–10</span>
            <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-4 font-fredoka text-6xl font-bold leading-[0.95] tracking-wide sm:text-7xl lg:text-8xl" data-testid="app-title">
              <span className="text-hc-navy">HOP</span> <span className="text-hc-coral" style={{ WebkitTextStroke: "3px #1F2547" }}>&amp;</span>
              <br />
              <span style={{ textShadow: "4px 5px 0 #FFC93C" }}>COUNT</span>
            </motion.h1>
            <p className="mt-4 font-fredoka text-2xl font-semibold sm:text-3xl" data-testid="app-tagline">Little Hops. Big Maths Adventures!</p>
            <a href="#games" className="toy-btn mt-6 inline-flex items-center gap-2 bg-hc-sun px-6 text-xl" data-testid="lets-play-link">
              Let's play <ArrowRight className="h-6 w-6" strokeWidth={3} />
            </a>
          </div>

          <div className="relative">
            <div className="toy-card relative ml-auto max-w-md p-5" data-testid="welcome-bubble">
              <span className="speech-tail -bottom-[13px] left-1/2 -translate-x-1/2 -rotate-45" />
              <p className="font-fredoka text-xl font-semibold leading-snug sm:text-2xl">Hi friend! Pick a game and let's hop!</p>
              <div className="mt-3"><ListenButton onClick={() => speak(WELCOME)} /></div>
            </div>
            <div className="mt-6 flex items-end justify-center gap-2 sm:gap-6">
              <button type="button" className="toy-focus w-28 rounded-3xl sm:w-36" onClick={() => speak("Hi! I'm Hoppy the bunny. I love finding missing numbers!")} aria-label="Hoppy the Bunny says hello" data-testid="home-hoppy">
                <Character name="hoppy" />
              </button>
              <button type="button" className="toy-focus w-32 rounded-3xl sm:w-44" onClick={() => speak(WELCOME)} aria-label="Sunny the Chick says hello" data-testid="home-sunny">
                <Character name="sunny" mood="talking" />
              </button>
              <button type="button" className="toy-focus w-32 rounded-3xl sm:w-40" onClick={() => speak("Ribbit! I'm Froggy. Let's hop forward and backward!")} aria-label="Froggy the Frog says hello" data-testid="home-froggy">
                <Character name="froggy" />
              </button>
            </div>
          </div>
        </section>

        <section id="games" className="mt-14 scroll-mt-6">
          <h2 className="font-fredoka text-3xl font-bold sm:text-4xl">Choose a game</h2>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            {GAMES.map((g, i) => <GameCard key={g.id} game={g} done={doneCount(g.id)} delay={0.15 + i * 0.12} />)}
          </div>
        </section>
      </div>

      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} testId="settings-dialog">
        <h2 className="flex items-center gap-2 font-fredoka text-3xl font-bold"><Volume2 className="h-7 w-7" strokeWidth={3} /> Sound</h2>
        <div className="mt-5"><SettingsToggles /></div>
        <p className="mt-4 flex items-start gap-2 text-sm font-bold opacity-75"><Mic className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} /> Voice listening opens for about 6 seconds after Froggy or Hoppy talk. Nothing is recorded or saved.</p>
        <ToyButton color="mint" className="mt-6 w-full text-xl" onClick={() => setSettingsOpen(false)} data-testid="settings-done-button">Done</ToyButton>
      </Modal>
    </main>
  );
}
