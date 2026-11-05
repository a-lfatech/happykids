import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Brain, BookOpen, Code, Coins, Gamepad2, Globe, Heart, Keyboard, Lightbulb, Loader2, Map as MapIcon, Music, RefreshCw, ShieldCheck, Sparkles, Star } from "lucide-react";
import { PageShell } from "../components/SiteNav";
import { ToyButton } from "../components/ToyButton";
import { WorldCard } from "../components/WorldCard";
import { CHARACTERS } from "../components/Characters";
import Onboarding from "../components/Onboarding";
import GradeMap from "../components/GradeMap";
import { Poster } from "../components/Poster";
import { WORLDS, FUTURE_WORLDS } from "../data/worlds";
import { speak, unlockAudio } from "../lib/audioManager";
import { clearLearner, fetchGradeMap, getLearner, nextOpenUnit } from "../lib/mastery";

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

const TYPING_WORLD = { id: "typing", num: "07", title: "Key Quest", subject: "Typing", blurb: "Learn the keyboard with lessons, a speed test and the Word Rain game!", icon: "/hk/icon_reading.png", card: "bg-hc-mintlight", strong: "bg-hc-mint" };

const Welcome = ({ learner, next, onPlay }) => {
  const navigate = useNavigate();
  const hello = next ? `Hi ${learner.name}! Ready for ${next.title}?` : `Hi ${learner.name}! Ready to play?`;
  return (
    <div className="mx-auto flex flex-col items-center gap-4 text-center" data-testid="welcome-back">
      <button type="button" onClick={() => { unlockAudio(); speak(hello); }} className="toy-focus rounded-2xl font-fredoka text-2xl font-bold leading-tight sm:text-4xl" aria-label={`${hello} Tap to hear it.`}>
        {hello}
      </button>
      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        <ToyButton color="coral" className="min-h-[80px] flex-col !gap-0 text-2xl" onClick={() => next && onPlay(next)} disabled={!next} data-testid="hero-continue">
          <span className="text-3xl" aria-hidden="true">{next ? next.emoji : "⭐"}</span>
          <span>{next ? "PLAY" : "ALL DONE!"}</span>
          {next && <span className="text-sm font-bold opacity-90">{next.title}</span>}
        </ToyButton>
        <ToyButton color="sun" className="min-h-[80px] text-2xl" onClick={() => scrollTo("map")} data-testid="hero-map"><MapIcon className="h-8 w-8" strokeWidth={2.5} /> MY MAP</ToyButton>
        <ToyButton color="sky" className="min-h-[80px] text-2xl" onClick={() => navigate("/learn")} data-testid="hero-games"><Gamepad2 className="h-8 w-8" strokeWidth={2.5} /> GAMES</ToyButton>
        <ToyButton color="mint" className="min-h-[80px] text-2xl" onClick={() => navigate("/typing")} data-testid="hero-typing"><Keyboard className="h-8 w-8" strokeWidth={2.5} /> TYPING</ToyButton>
      </div>
    </div>
  );
};

const MapSection = ({ learner, map, status, onRetry, onPlay, onRestart }) => (
  <section id="map" className="scroll-mt-28 pt-12" data-testid="map-section">
    <h2 className="text-center font-fredoka text-4xl font-bold sm:text-5xl">{learner.name}'s Learning Map</h2>
    <p className="mx-auto mt-2 max-w-xl text-center text-lg font-bold">Collect 4 stars in a row of 5 to open the next adventure. Take your time, every try helps you learn!</p>
    <div className="mt-8">
      {status === "loading" && <p className="flex items-center justify-center gap-2 font-bold"><Loader2 className="h-6 w-6 animate-spin" /> Loading your map...</p>}
      {status === "error" && (
        <div className="mx-auto max-w-md rounded-[1.75rem] border-[3px] border-hc-navy bg-hc-corallight p-5 text-center" role="alert">
          <p className="font-bold">I couldn't load the map right now.</p>
          <ToyButton color="white" className="mt-3" onClick={onRetry}><RefreshCw className="h-5 w-5" /> Try again</ToyButton>
        </div>
      )}
      {status === "ready" && map && <GradeMap map={map} onPlay={onPlay} />}
    </div>
    <p className="mt-6 text-center text-sm font-bold opacity-70">
      Not {learner.name}? <button type="button" className="toy-focus underline" onClick={onRestart} data-testid="new-learner">Start as a new learner</button>
    </p>
  </section>
);

const Friends = () => (
  <section className="pt-16" data-testid="characters-section">
    <h2 className="text-center font-fredoka text-4xl font-bold sm:text-5xl">Your Learning Friends</h2>
    <ul className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-6">
      {Object.entries(CHARACTERS).map(([id, c], i) => (
        <motion.li key={id} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="flex flex-col items-center text-center" data-testid={`character-card-${id}`}>
          <button type="button" onClick={() => speak(`Hi! I'm ${c.name}. ${c.specialty}!`)} className="toy-focus rounded-full" aria-label={`Say hi to ${c.name}`}>
            <img src={c.img} alt="" className="hc-float h-24 w-24 object-contain drop-shadow-[0_6px_0_rgba(31,37,71,0.18)] sm:h-28 sm:w-28" style={{ animationDelay: `${i * 0.3}s` }} />
          </button>
          <h3 className="mt-1 font-fredoka text-xl font-bold">{c.name}</h3>
          <p className="text-xs font-bold text-hc-coral sm:text-sm">{c.specialty}</p>
        </motion.li>
      ))}
    </ul>
  </section>
);

const WhyBlock = ({ icon: Icon, title, text, bg }) => (
  <div className={`rounded-[1.75rem] border-[3px] border-hc-navy p-5 ${bg}`} style={{ boxShadow: "0 5px 0 #1F2547" }}>
    <span className="grid h-12 w-12 place-items-center rounded-2xl border-[3px] border-hc-navy bg-white"><Icon className="h-6 w-6" strokeWidth={2.5} /></span>
    <h3 className="mt-3 font-fredoka text-xl font-bold">{title}</h3>
    <p className="mt-1 text-sm font-semibold">{text}</p>
  </div>
);

const FUTURE_ICON_MAP = { BookOpen, Globe, Brain, Code, Coins, Lightbulb };

const GrownUps = () => {
  const navigate = useNavigate();
  return (
    <section className="mt-20 border-t-[3px] border-dashed border-hc-navy/30 pt-12" data-testid="grown-ups-section">
      <p className="text-center font-fredoka text-lg font-semibold opacity-70">For grown-ups</p>
      <h2 className="text-center font-fredoka text-3xl font-bold sm:text-4xl">Little minds. Big possibilities.</h2>
      <p className="mx-auto mt-2 max-w-2xl text-center font-bold">HappyKids is a character-driven learning companion from Kindergarten to Grade 8. Lessons open one at a time, only after your child shows they understand the one before.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <WhyBlock icon={Sparkles} title="Mastery, gently" text="4 correct out of the last 5 opens the next lesson. Mistakes never take stars away." bg="bg-hc-skylight" />
        <WhyBlock icon={Star} title="Builds confidence" text="Hints after a wrong answer, celebrations after a right one. No timers." bg="bg-hc-sunlight" />
        <WhyBlock icon={Music} title="Talking friends" text="Questions are read aloud by the device voice, so pre-readers can play too." bg="bg-hc-mintlight" />
        <WhyBlock icon={ShieldCheck} title="Private by design" text="No ads, no chat, no public profiles. Your child's name stays on this device." bg="bg-hc-lavlight" />
      </div>
      <h3 className="mt-14 text-center font-fredoka text-2xl font-bold">Coming in later phases</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FUTURE_WORLDS.map((w) => {
          const Icon = FUTURE_ICON_MAP[w.icon] || Sparkles;
          return (
            <div key={w.title} className="flex gap-3 rounded-[1.5rem] border-[3px] border-dashed border-hc-navy/40 bg-white/60 p-4" data-testid="future-world">
              <Icon className="h-7 w-7 shrink-0" strokeWidth={2.5} />
              <div>
                <p className="font-fredoka text-lg font-bold">{w.title}</p>
                <p className="text-sm font-semibold">{w.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <ToyButton color="white" className="min-h-[56px]" onClick={() => navigate("/parents")} data-testid="grown-ups-parents">Parent area <ArrowRight className="h-5 w-5" /></ToyButton>
        <ToyButton color="white" className="min-h-[56px]" onClick={() => navigate("/about")}><Heart className="h-5 w-5" /> Our story</ToyButton>
      </div>
    </section>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [learner, setLearner] = useState(getLearner);
  const [map, setMap] = useState(null);
  const [status, setStatus] = useState("idle");

  const load = useCallback(async (l) => {
    if (!l) return;
    setStatus("loading");
    try {
      setMap(await fetchGradeMap(l.token));
      setStatus("ready");
    } catch (e) {
      if (e.code === "unknown_learner") { clearLearner(); setLearner(null); setStatus("idle"); return; }
      setStatus("error");
    }
  }, []);

  useEffect(() => { load(learner); }, [learner, load]);
  useEffect(() => { if (hash === "#worlds" || hash === "#map") setTimeout(() => scrollTo(hash.slice(1)), 300); }, [hash]);

  const play = (unit) => navigate(`/practice/${unit.id}`);
  const restart = () => {
    if (!window.confirm("Start again as a new learner? The current learning map will be replaced on this device.")) return;
    clearLearner();
    setMap(null);
    setLearner(null);
  };

  const next = nextOpenUnit(map);
  const hoppyLine = learner
    ? (next ? `Hi ${learner.name}! Ready for ${next.title}? Tap PLAY to start!` : `Hi ${learner.name}! Let's play a game!`)
    : "Hi, welcome! I'm Hoppy the bunny. Tap Say hi, and tell me your name!";

  return (
    <PageShell testId="landing-page">
      <Poster
        name={learner?.name}
        hoppyLine={hoppyLine}
        next={next}
        onLesson={play}
        onPlay={() => scrollTo("worlds")}
        onLearn={() => (learner ? scrollTo("map") : navigate("/learn"))}
      >
        {learner ? <Welcome learner={learner} next={next} onPlay={play} /> : <Onboarding onDone={setLearner} />}
      </Poster>

      <div className="mx-auto max-w-6xl">
        {learner && <MapSection learner={learner} map={map} status={status} onRetry={() => load(learner)} onPlay={play} onRestart={restart} />}

        <section id="worlds" className="scroll-mt-28 pt-16" data-testid="worlds-section">
          <h2 className="text-center font-fredoka text-4xl font-bold sm:text-5xl">Play a Game</h2>
          <p className="mt-2 text-center text-lg font-bold">Pick a world and jump right in. Free play, no locks.</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WORLDS.map((w, i) => <WorldCard key={w.id} w={w} i={i} onClick={() => navigate(`/world/${w.id}`)} />)}
            <WorldCard w={TYPING_WORLD} i={WORLDS.length} onClick={() => navigate("/typing")} />
          </div>
        </section>

        <Friends />
        <GrownUps />
      </div>
    </PageShell>
  );
}
