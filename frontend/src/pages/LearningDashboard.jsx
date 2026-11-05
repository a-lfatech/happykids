import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarHeart, Clock, Play, Star, Users } from "lucide-react";
import { useAppState } from "../context/AppState";
import { PageShell } from "../components/SiteNav";
import { CHARACTERS, Character } from "../components/Characters";
import { ListenButton } from "../components/SpeechPanel";
import { ToyButton } from "../components/ToyButton";
import { Modal } from "../components/Modal";
import { WorldCard } from "./LandingPage";
import { ACTIVITIES, WORLDS, activityById, dailyAdventure, solvedCount, worldById } from "../data/worlds";
import { speak } from "../lib/audioManager";

export default function LearningDashboard() {
  const navigate = useNavigate();
  const { state, profile, pdata, setActive } = useAppState();
  const [switching, setSwitching] = useState(false);
  const daily = dailyAdventure(pdata, profile.level);
  const solved = ACTIVITIES.reduce((a, x) => a + solvedCount(pdata, x.id), 0);
  const total = ACTIVITIES.reduce((a, x) => a + x.total, 0);
  const recent = (pdata.recent || []).map((r) => activityById(r.id)).filter(Boolean).slice(0, 4);
  const greet = `Hello, ${profile.name}! Where shall we go today?`;

  return (
    <PageShell testId="learning-dashboard" bare>
      <div className="mx-auto max-w-6xl pb-16">
        <section className="grid items-center gap-6 md:grid-cols-[auto_1fr_auto]">
          <button type="button" onClick={() => state.profiles.length > 1 && setSwitching(true)} className="toy-focus flex items-center gap-3 rounded-3xl" data-testid="profile-avatar-button" aria-label={state.profiles.length > 1 ? "Switch explorer" : profile.name}>
            <span className="grid h-24 w-24 place-items-center overflow-hidden rounded-full border-[3px] border-hc-navy bg-hc-sunlight" style={{ boxShadow: "0 5px 0 #1F2547" }}>
              <img src={CHARACTERS[profile.avatar].img} alt="" className="h-20 w-20 object-contain" />
            </span>
            {state.profiles.length > 1 && <span className="flex items-center gap-1 rounded-full border-[3px] border-hc-navy bg-white px-2 py-1 text-xs font-bold"><Users className="h-3.5 w-3.5" /> Switch</span>}
          </button>
          <div>
            <h1 className="font-fredoka text-4xl font-bold sm:text-5xl" data-testid="dashboard-hello">Hello, {profile.name}!</h1>
            <p className="mt-1 font-fredoka text-xl font-semibold sm:text-2xl">Where shall we go today?</p>
            <div className="mt-3"><ListenButton onClick={() => speak(greet)} /></div>
          </div>
          <div className="flex gap-3">
            <div className="rounded-3xl border-[3px] border-hc-navy bg-hc-sunlight p-4 text-center" data-testid="dashboard-stars">
              <Star className="mx-auto h-8 w-8 fill-hc-sun" strokeWidth={2.5} />
              <p className="font-fredoka text-3xl font-bold">{pdata.totalStars}</p>
              <p className="text-xs font-bold">stars</p>
            </div>
            <div className="w-36 rounded-3xl border-[3px] border-hc-navy bg-white p-4" data-testid="dashboard-progress">
              <p className="font-fredoka text-3xl font-bold">{solved}<span className="text-lg">/{total}</span></p>
              <p className="text-xs font-bold">puzzles solved</p>
              <div className="mt-2 h-3 overflow-hidden rounded-full border-2 border-hc-navy"><div className="h-full bg-hc-mint" style={{ width: `${(solved / total) * 100}%` }} /></div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="toy-card flex items-center gap-4 overflow-hidden bg-hc-corallight p-5" data-testid="daily-adventure">
            <Character name={daily.character} mood="wave" className="w-24 shrink-0 sm:w-32" />
            <div className="flex-1">
              <p className="flex items-center gap-2 font-fredoka font-semibold"><CalendarHeart className="h-5 w-5" /> Today's adventure</p>
              <h2 className="font-fredoka text-3xl font-bold">{daily.title}</h2>
              <p className="font-bold">{worldById(daily.world).title} · {daily.blurb}</p>
              <ToyButton color="sun" className="mt-3 text-xl" onClick={() => navigate(`/play/${daily.id}`)} data-testid="daily-adventure-play"><Play className="h-6 w-6 fill-hc-navy" /> PLAY</ToyButton>
            </div>
          </motion.div>
          <div className="toy-card p-5" data-testid="recently-played">
            <p className="flex items-center gap-2 font-fredoka text-xl font-bold"><Clock className="h-5 w-5" /> Recently played</p>
            {recent.length === 0 && <p className="mt-3 font-bold opacity-70">Nothing yet. Pick a world below to start!</p>}
            <div className="mt-3 grid grid-cols-2 gap-3">
              {recent.map((a) => (
                <button key={a.id} type="button" onClick={() => navigate(`/play/${a.id}`)} className="toy-btn flex h-auto flex-col items-center gap-1 bg-hc-cream p-2 text-sm" data-testid={`recent-${a.id}`}>
                  <img src={CHARACTERS[a.character].img} alt="" className="h-12 w-12 object-contain" />{a.title}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-fredoka text-3xl font-bold">Learning worlds</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WORLDS.map((w, i) => <WorldCard key={w.id} w={w} i={i} onClick={() => navigate(`/world/${w.id}`)} />)}
          </div>
        </section>
      </div>
      <Modal open={switching} onClose={() => setSwitching(false)} testId="switch-profile-dialog">
        <h2 className="font-fredoka text-3xl font-bold">Who is playing?</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {state.profiles.map((p) => (
            <button key={p.id} type="button" onClick={() => { setActive(p.id); setSwitching(false); }} className={`toy-btn flex h-auto flex-col items-center p-3 ${p.id === profile.id ? "bg-hc-sun" : "bg-white"}`} data-testid={`switch-to-${p.id}`}>
              <img src={CHARACTERS[p.avatar].img} alt="" className="h-16 w-16 object-contain" />{p.name}
            </button>
          ))}
        </div>
      </Modal>
    </PageShell>
  );
}
