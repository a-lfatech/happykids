import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Target, Trash2, Trophy } from "lucide-react";
import { useAppState } from "../context/AppState";
import { GAMES } from "../games/registry";
import { skillOf } from "../games/logic";
import { ToyButton } from "../components/ToyButton";
import { Modal } from "../components/Modal";
import { SettingsToggles } from "../components/SettingsToggles";

const Stat = ({ label, value, testId, bg }) => (
  <div className={`rounded-2xl border-[3px] border-hc-navy p-4 ${bg}`} data-testid={testId}>
    <p className="font-fredoka text-3xl font-bold sm:text-4xl">{value}</p>
    <p className="text-sm font-bold">{label}</p>
  </div>
);

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { state, resetProgress } = useAppState();
  const [confirm, setConfirm] = useState(false);
  if (sessionStorage.getItem("hc_grownup") !== "1") return <Navigate to="/" replace />;

  const rows = GAMES.map((g) => {
    const pz = Object.values(state.games[g.id]?.puzzles || {});
    const completed = pz.reduce((a, p) => a + p.completed, 0);
    const firstTry = pz.reduce((a, p) => a + p.firstTry, 0);
    return { g, completed, firstTry, attempted: pz.reduce((a, p) => a + p.attempts, 0), plays: state.games[g.id]?.plays || 0, distinct: pz.filter((p) => p.completed > 0).length };
  });
  const allCompleted = rows.reduce((a, r) => a + r.completed, 0);
  const allFirst = rows.reduce((a, r) => a + r.firstTry, 0);
  const accuracy = allCompleted ? Math.round((allFirst / allCompleted) * 100) : 0;

  const skills = {};
  GAMES.forEach((g) => Object.entries(state.games[g.id]?.puzzles || {}).forEach(([idx, p]) => {
    const k = skillOf(g.id, Number(idx));
    skills[k] = skills[k] || { wrongs: 0, completed: 0 };
    skills[k].wrongs += p.wrongs;
    skills[k].completed += p.completed;
  }));
  const practice = Object.entries(skills).filter(([, v]) => v.wrongs > 0).sort((a, b) => b[1].wrongs / Math.max(b[1].completed, 1) - a[1].wrongs / Math.max(a[1].completed, 1)).slice(0, 3);

  const leave = () => { sessionStorage.removeItem("hc_grownup"); navigate("/"); };

  return (
    <main className="hc-bg min-h-screen px-4 pb-16 pt-4 sm:px-8" data-testid="parent-dashboard">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-3">
          <ToyButton color="white" onClick={leave} data-testid="parent-back-button"><ArrowLeft className="h-6 w-6" strokeWidth={3} /> Back</ToyButton>
          <span className="rounded-full border-[3px] border-hc-navy bg-hc-lavlight px-4 py-1.5 font-fredoka font-semibold">Grown-up corner</span>
        </div>
        <h1 className="mt-6 font-fredoka text-4xl font-bold sm:text-5xl">Progress at a glance</h1>
        <p className="mt-2 text-base font-semibold opacity-80">Saved on this device only. No sign-up and no personal details collected.</p>

        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Stars collected" value={state.totalStars} testId="parent-stat-stars" bg="bg-hc-sunlight" />
          <Stat label="Puzzles completed" value={allCompleted} testId="parent-stat-completed" bg="bg-hc-mintlight" />
          <Stat label="First-try accuracy" value={`${accuracy}%`} testId="parent-stat-accuracy" bg="bg-hc-skylight" />
          <Stat label="Games finished" value={rows.reduce((a, r) => a + r.plays, 0)} testId="parent-stat-games" bg="bg-hc-lavlight" />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="toy-card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-fredoka text-2xl font-bold"><Trophy className="h-6 w-6" strokeWidth={3} /> By game</h2>
            <div className="mt-4 space-y-3">
              {rows.map((r) => (
                <div key={r.g.id} className="rounded-2xl border-[3px] border-hc-navy bg-hc-cream p-4" data-testid={`parent-game-${r.g.id}`}>
                  <p className="font-fredoka text-xl font-semibold">{r.g.title}</p>
                  <p className="mt-1 text-sm font-bold">{r.distinct} of {r.g.total} puzzles solved · {r.attempted} attempted · {r.firstTry} first-try · finished {r.plays}×</p>
                </div>
              ))}
            </div>
          </div>
          <div className="toy-card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-fredoka text-2xl font-bold"><Target className="h-6 w-6" strokeWidth={3} /> Needs more practice</h2>
            <ul className="mt-4 space-y-2" data-testid="practice-areas">
              {practice.length === 0 && <li className="rounded-2xl bg-hc-mintlight p-3 font-bold">Nothing flagged yet. Keep playing to see tips here!</li>}
              {practice.map(([k, v]) => (
                <li key={k} className="flex items-center justify-between rounded-2xl border-[3px] border-hc-navy bg-hc-corallight p-3 font-bold">
                  <span>{k}</span><span className="text-sm">{v.wrongs} extra {v.wrongs === 1 ? "try" : "tries"}</span>
                </li>
              ))}
            </ul>
            <h3 className="mt-6 flex items-center gap-2 font-fredoka text-xl font-bold"><BookOpen className="h-5 w-5" strokeWidth={3} /> Learning objectives</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-semibold" data-testid="learning-objectives">
              <li>Counting forward and backward from 1 to 10</li>
              <li>Finding missing numbers in a sequence</li>
              <li>Understanding more than and less than</li>
              <li>One more, one less, two more and two less</li>
              <li>Seeing number patterns on a number line</li>
            </ul>
          </div>
        </section>

        <section className="toy-card mt-6 p-5 sm:p-6">
          <h2 className="font-fredoka text-2xl font-bold">Sound & voice</h2>
          <div className="mt-4"><SettingsToggles /></div>
        </section>

        <div className="mt-8 flex justify-center">
          <ToyButton color="coral" onClick={() => setConfirm(true)} data-testid="reset-progress-button" className="text-lg"><Trash2 className="h-5 w-5" strokeWidth={3} /> Reset progress</ToyButton>
        </div>
      </div>
      <Modal open={confirm} onClose={() => setConfirm(false)} testId="reset-confirm-dialog">
        <h2 className="font-fredoka text-3xl font-bold">Reset all progress?</h2>
        <p className="mt-2 font-bold">Stars and puzzle history on this device will be cleared. Settings stay the same.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ToyButton color="white" className="flex-1" onClick={() => setConfirm(false)} data-testid="reset-cancel-button">Cancel</ToyButton>
          <ToyButton color="coral" className="flex-1" onClick={() => { resetProgress(); setConfirm(false); }} data-testid="reset-confirm-button">Yes, reset</ToyButton>
        </div>
      </Modal>
    </main>
  );
}
