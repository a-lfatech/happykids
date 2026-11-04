import { useEffect } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Award, Gamepad2, Home, RotateCcw, Star } from "lucide-react";
import { Character } from "../components/Characters";
import { Confetti } from "../components/Confetti";
import { ToyButton } from "../components/ToyButton";
import { activityById, worldById } from "../data/worlds";
import { sfx, speak } from "../lib/audioManager";

export default function AchievementScreen() {
  const { gameId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const game = activityById(gameId);
  const world = game && worldById(game.world);
  const results = state?.results;
  const stars = results ? results.filter((r) => r?.star).length : 0;

  useEffect(() => {
    if (!results) return;
    sfx.fanfare();
    const t = setTimeout(() => speak(`All done! You did an amazing job! ${stars} of ${results.length} correct on your first try! Keep practising. Every little hop makes you smarter!`), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!game || !results) return <Navigate to="/" replace />;

  return (
    <main className="hc-bg relative min-h-screen overflow-hidden px-4 py-10 sm:px-8" data-testid="achievement-screen">
      <Confetti />
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <motion.h1 initial={{ scale: 0.3, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 220, damping: 12 }} className="font-fredoka text-6xl font-bold tracking-wide sm:text-7xl lg:text-8xl" style={{ textShadow: "4px 5px 0 #FFC93C" }} data-testid="all-done-heading">
          ALL DONE!
        </motion.h1>
        <p className="mt-2 font-fredoka text-2xl font-semibold sm:text-3xl">You did an amazing job!</p>

        <div className="mt-6 flex items-end justify-center gap-2 sm:gap-6">
          <Character name="hoppy" mood="celebrate" className="w-24 sm:w-36" testId="celebrate-hoppy" />
          <Character name="sunny" mood="celebrate" className="w-28 sm:w-44" testId="celebrate-sunny" />
          <Character name="froggy" mood="celebrate" className="w-28 sm:w-40" testId="celebrate-froggy" />
        </div>

        <div className="toy-card mt-8 w-full p-6 sm:p-8">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3" data-testid="result-stars">
            {results.map((r, i) => (
              <motion.span key={i} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.5 + i * 0.15, type: "spring", stiffness: 260, damping: 12 }} data-testid={`result-star-${i}`} data-filled={!!r?.star}>
                <Star className={`h-11 w-11 sm:h-14 sm:w-14 ${r?.star ? "fill-hc-sun" : "fill-white opacity-60"}`} strokeWidth={2.5} aria-label={r?.star ? `Puzzle ${i + 1}: star` : `Puzzle ${i + 1}: completed`} />
              </motion.span>
            ))}
          </div>
          <p className="mt-5 font-fredoka text-2xl font-bold sm:text-3xl" data-testid="first-try-summary">
            {stars} of {results.length} correct on your first try!
          </p>
          <p className="mt-2 text-lg font-bold">Keep practising. Every little hop makes you smarter!</p>
        </div>

        <div className="mt-8 grid w-full gap-4 sm:grid-cols-3">
          <ToyButton color="mint" className="min-h-[68px] text-xl" onClick={() => navigate(`/play/${game.id}`)} data-testid="play-again-button">
            <RotateCcw className="h-6 w-6" strokeWidth={3} /> PLAY AGAIN
          </ToyButton>
          <ToyButton color="sky" className="min-h-[68px] text-xl" onClick={() => navigate(`/world/${game.world}`)} data-testid="more-games-button">
            <Gamepad2 className="h-6 w-6" strokeWidth={3} /> MORE GAMES
          </ToyButton>
          <ToyButton color="sun" className="min-h-[68px] text-xl" onClick={() => navigate("/learn")} data-testid="back-home-button">
            <Home className="h-6 w-6" strokeWidth={3} /> BACK HOME
          </ToyButton>
        </div>
        <div className="mt-6 inline-flex items-center gap-3 rounded-full border-[3px] border-hc-navy bg-hc-sunlight px-5 py-2 font-fredoka text-lg font-bold" data-testid="badge-earned">
          <Award className="h-6 w-6" strokeWidth={2.5} /> {world.badge.name} badge earned!
        </div>
      </div>
    </main>
  );
}
