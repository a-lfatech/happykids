import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Flower2, Heart, Puzzle, ShieldCheck, Sparkles, Star } from "lucide-react";
import { PageShell } from "../components/SiteNav";
import { ToyButton } from "../components/ToyButton";
import { WORLDS } from "../data/worlds";

const FLOATERS = [
  { t: "A", c: "text-hc-coral", x: "8%", y: "22%", d: 0 }, { t: "3", c: "text-[#2F95E0]", x: "88%", y: "30%", d: 1 },
  { t: "b", c: "text-hc-mint", x: "16%", y: "62%", d: 2 }, { t: "7", c: "text-hc-tang", x: "80%", y: "64%", d: 0.5 },
  { t: "C", c: "text-[#8B6CF0]", x: "92%", y: "12%", d: 1.5 }, { t: "+", c: "text-hc-sun", x: "4%", y: "44%", d: 2.5 },
];

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="hk-sky relative -mx-4 -mt-8 overflow-hidden px-4 pb-10 pt-10 sm:-mx-8 sm:px-8" data-testid="landing-hero">
      <svg viewBox="0 0 800 400" className="pointer-events-none absolute left-1/2 top-4 w-[900px] max-w-none -translate-x-1/2 opacity-70" style={{ WebkitMaskImage: "linear-gradient(to bottom, black 55%, transparent 95%)", maskImage: "linear-gradient(to bottom, black 55%, transparent 95%)" }} aria-hidden="true">
        {["#FF7F91", "#FF9A52", "#FFC93C", "#3DD6A3", "#63BCF7", "#C9B6FF"].map((c, i) => (
          <path key={c} d={`M${80 + i * 22} 400 A${320 - i * 22} ${320 - i * 22} 0 0 1 ${720 - i * 22} 400`} fill="none" stroke={c} strokeWidth="22" />
        ))}
      </svg>
      <div className="pointer-events-none absolute right-[6%] top-10 h-24 w-24 rounded-full bg-hc-sun shadow-[0_0_60px_20px_rgba(255,201,60,0.55)]" aria-hidden="true" />
      {[{ top: "12%", s: "w-40", delay: "0s" }, { top: "30%", s: "w-28", delay: "-25s" }, { top: "6%", s: "w-32", delay: "-45s" }].map((c, i) => (
        <div key={i} className={`hk-cloud pointer-events-none absolute left-0 h-12 ${c.s} rounded-full bg-white/90`} style={{ top: c.top, animationDelay: c.delay }} aria-hidden="true">
          <span className="absolute -top-6 left-6 h-14 w-14 rounded-full bg-white/90" />
          <span className="absolute -top-3 left-16 h-10 w-10 rounded-full bg-white/90" />
        </div>
      ))}
      {FLOATERS.map((f) => (
        <span key={f.t + f.x} className={`hc-float pointer-events-none absolute font-fredoka text-4xl font-bold sm:text-5xl ${f.c}`} style={{ left: f.x, top: f.y, animationDelay: `${f.d}s`, WebkitTextStroke: "2px #1F2547" }} aria-hidden="true">{f.t}</span>
      ))}

      <div className="relative mx-auto max-w-6xl text-center">
        <motion.img initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 180, damping: 14 }} src="/hk/logo.png" alt="HappyKids" className="mx-auto w-64 sm:w-96" data-testid="hero-logo" />
        <h1 className="mt-2 font-fredoka text-4xl font-bold sm:text-5xl lg:text-6xl" data-testid="hero-heading">Welcome to HappyKids!</h1>
        <p className="mx-auto mt-3 inline-block -rotate-1 rounded-full border-[3px] border-hc-navy bg-hc-sun px-5 py-2 font-fredoka text-lg font-semibold sm:text-2xl" data-testid="hero-subheading">Jump into reading, numbers and discovery!</p>
        <p className="mx-auto mt-4 max-w-xl text-base font-bold sm:text-lg">Explore a wonderful world of learning where little minds grow through play, imagination and discovery.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <ToyButton color="coral" className="min-h-[64px] px-8 text-xl" onClick={() => navigate("/learn")} data-testid="hero-start-learning">START LEARNING <ArrowRight className="h-6 w-6" strokeWidth={3} /></ToyButton>
          <ToyButton color="white" className="min-h-[64px] px-8 text-xl" onClick={() => document.getElementById("worlds")?.scrollIntoView({ behavior: "smooth" })} data-testid="hero-explore-worlds">EXPLORE OUR WORLDS</ToyButton>
        </div>

        <div className="relative mx-auto mt-10 h-[240px] max-w-3xl sm:h-[360px]" aria-label="Hoppy, Froggy, Sunny, Ellie and Finn around a storybook">
          <img src="/hk/storybook.png" alt="" className="absolute bottom-0 left-1/2 z-20 w-[60%] -translate-x-1/2" />
          <img src="/hk/hoppy.png" alt="Hoppy" className="hc-float absolute bottom-[16%] left-1/2 z-10 w-[22%] -translate-x-1/2" />
          <img src="/hk/ellie.png" alt="Ellie" className="absolute bottom-[10%] left-[4%] z-0 w-[24%]" />
          <img src="/hk/finn.png" alt="Finn" className="absolute bottom-0 left-[0%] z-30 w-[19%]" />
          <img src="/hk/froggy.png" alt="Froggy" className="absolute bottom-[4%] right-[14%] z-30 w-[20%]" />
          <img src="/hk/sunny.png" alt="Sunny" className="hc-float absolute bottom-[8%] right-0 z-30 w-[18%]" style={{ animationDelay: "1s" }} />
        </div>
      </div>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-20 w-full" aria-hidden="true">
        <path d="M0 70 Q240 10 520 60 T1040 50 T1440 60 V120 H0 Z" fill="#9BE28F" />
        <path d="M0 95 Q360 55 760 90 T1440 85 V120 H0 Z" fill="#FFF6E3" />
      </svg>
      {["left-[10%]", "left-[30%]", "right-[22%]", "right-[6%]"].map((p, i) => (
        <Flower2 key={p} className={`absolute bottom-6 ${p} h-8 w-8 ${i % 2 ? "fill-hc-coral" : "fill-hc-sun"}`} strokeWidth={2} aria-hidden="true" />
      ))}
    </section>
  );
};

const WhyBlock = ({ icon: Icon, title, text, bg }) => (
  <div className={`rounded-[1.75rem] border-[3px] border-hc-navy p-5 ${bg}`} style={{ boxShadow: "0 5px 0 #1F2547" }}>
    <span className="grid h-14 w-14 place-items-center rounded-2xl border-[3px] border-hc-navy bg-white"><Icon className="h-7 w-7" strokeWidth={2.5} /></span>
    <h3 className="mt-3 font-fredoka text-2xl font-bold">{title}</h3>
    <p className="mt-1 font-semibold">{text}</p>
  </div>
);

export const WorldCard = ({ w, i, onClick }) => (
  <motion.button
    type="button"
    initial={{ y: 30, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ delay: i * 0.08 }}
    whileHover={{ y: -6, rotate: i % 2 ? 1 : -1 }}
    onClick={onClick}
    data-testid={`world-card-${w.id}`}
    className={`toy-focus flex flex-col items-center rounded-[1.75rem] border-[3px] border-hc-navy p-5 text-center ${w.card}`}
    style={{ boxShadow: "0 6px 0 #1F2547" }}
  >
    <span className="self-start rounded-full border-[3px] border-hc-navy bg-white px-2.5 font-fredoka text-sm font-bold">{w.num}</span>
    <img src={w.icon} alt="" className="h-24 w-24 object-contain sm:h-28 sm:w-28" draggable="false" />
    <h3 className="mt-2 font-fredoka text-2xl font-bold leading-tight">{w.title}</h3>
    <p className="font-fredoka text-base font-semibold opacity-80">{w.subject}</p>
    <p className="mt-2 flex-1 text-sm font-bold">{w.blurb}</p>
    <span className={`toy-btn mt-4 inline-flex w-full items-center justify-center gap-2 ${w.strong}`}>Explore <ArrowRight className="h-5 w-5" strokeWidth={3} /></span>
  </motion.button>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const { hash } = useLocation();
  useEffect(() => { if (hash === "#worlds") setTimeout(() => document.getElementById("worlds")?.scrollIntoView({ behavior: "smooth" }), 300); }, [hash]);

  return (
    <PageShell testId="landing-page">
      <Hero />
      <div className="mx-auto max-w-6xl">
        <section id="worlds" className="scroll-mt-28 pt-14" data-testid="worlds-section">
          <h2 className="text-center font-fredoka text-4xl font-bold sm:text-5xl">Our Learning Worlds</h2>
          <p className="mt-2 text-center text-lg font-bold">Five colourful worlds. Tap one to explore!</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {WORLDS.map((w, i) => <WorldCard key={w.id} w={w} i={i} onClick={() => navigate(`/world/${w.id}`)} />)}
          </div>
        </section>

        <section className="pt-20" data-testid="why-section">
          <h2 className="font-fredoka text-4xl font-bold sm:text-5xl">Why HappyKids?</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <WhyBlock icon={Puzzle} title="Learn Through Play" text="Games, stories and songs turn practice into play." bg="bg-hc-skylight" />
            <WhyBlock icon={Star} title="Build Confidence" text="Gentle hints and stars celebrate every effort." bg="bg-hc-sunlight" />
            <WhyBlock icon={Sparkles} title="Discover New Skills" text="Numbers, letters, logic, art and science in one place." bg="bg-hc-mintlight" />
            <WhyBlock icon={ShieldCheck} title="Safe for Little Learners" text="No ads, no chat and no public profiles. Ever." bg="bg-hc-lavlight" />
          </div>
        </section>

        <section className="toy-card mt-20 grid items-center gap-6 overflow-hidden p-6 sm:p-10 md:grid-cols-[1.4fr_1fr]" data-testid="story-section">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border-[3px] border-hc-navy bg-hc-corallight px-3 py-1 font-fredoka font-semibold"><Heart className="h-4 w-4 fill-hc-coral" /> Our story</span>
            <h2 className="mt-3 font-fredoka text-4xl font-bold">Inspired by a Father's Love</h2>
            <div className="mt-4 space-y-3 text-lg font-semibold">
              <p>HappyKids began with a father's dream to make learning joyful, accessible and exciting for every child.</p>
              <p>We believe every child has a wonderful mind waiting to discover the world.</p>
              <p>Through playful experiences, friendly characters and interactive adventures, we help children develop confidence, creativity and a lifelong love of learning.</p>
            </div>
          </div>
          <div className="flex items-end justify-center gap-2">
            <img src="/hk/ellie.png" alt="Ellie the Elephant" className="w-1/2" />
            <img src="/hk/hoppy.png" alt="Hoppy the Bunny" className="hc-float w-1/2" />
          </div>
        </section>

        <section className="mt-20 rounded-[2rem] border-[3px] border-hc-navy bg-hc-sun p-8 text-center sm:p-12" style={{ boxShadow: "0 6px 0 #1F2547" }} data-testid="final-cta">
          <BookOpen className="mx-auto h-10 w-10" strokeWidth={2.5} />
          <h2 className="mt-3 font-fredoka text-3xl font-bold sm:text-5xl">Every little discovery is a big achievement!</h2>
          <ToyButton color="white" className="mt-6 min-h-[64px] px-8 text-xl" onClick={() => navigate("/learn")} data-testid="final-cta-button">LET'S START LEARNING!</ToyButton>
        </section>
      </div>
    </PageShell>
  );
}
