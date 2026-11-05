import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Brain, Code, Coins, Globe, GraduationCap, Heart, Lightbulb, Music, ShieldCheck, Sparkles, Star } from "lucide-react";
import { PageShell } from "../components/SiteNav";
import { ToyButton } from "../components/ToyButton";
import { PlaygroundScene } from "../components/PlaygroundScene";
import { WORLDS, FUTURE_WORLDS } from "../data/worlds";
import { CHARACTERS } from "../components/Characters";

const FLOATERS = [
  { t: "A", c: "text-hc-coral", x: "8%", y: "22%", d: 0 }, { t: "3", c: "text-[#2F95E0]", x: "88%", y: "30%", d: 1 },
  { t: "b", c: "text-hc-mint", x: "16%", y: "62%", d: 2 }, { t: "7", c: "text-hc-tang", x: "80%", y: "64%", d: 0.5 },
  { t: "C", c: "text-[#8B6CF0]", x: "92%", y: "12%", d: 1.5 }, { t: "+", c: "text-hc-sun", x: "4%", y: "44%", d: 2.5 },
  { t: "\u266A", c: "text-hc-coral", x: "70%", y: "18%", d: 0.8 },
];

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="hk-sky relative -mx-4 -mt-8 overflow-hidden px-4 pb-16 pt-10 sm:-mx-8 sm:px-8" data-testid="landing-hero">
      {[{ top: "12%", s: "w-40", delay: "0s" }, { top: "30%", s: "w-28", delay: "-25s" }, { top: "6%", s: "w-32", delay: "-45s" }].map((c, i) => (
        <div key={i} className={`hk-cloud pointer-events-none absolute left-0 h-12 ${c.s} rounded-full bg-white/90`} style={{ top: c.top, animationDelay: c.delay }} aria-hidden="true">
          <span className="absolute -top-6 left-6 h-14 w-14 rounded-full bg-white/90" />
          <span className="absolute -top-3 left-16 h-10 w-10 rounded-full bg-white/90" />
        </div>
      ))}
      {FLOATERS.map((f) => (
        <span key={f.t + f.x} className={`hc-float pointer-events-none absolute hidden font-fredoka text-4xl font-bold sm:block sm:text-5xl ${f.c}`} style={{ left: f.x, top: f.y, animationDelay: `${f.d}s`, WebkitTextStroke: "2px #1F2547" }} aria-hidden="true">{f.t}</span>
      ))}

      <div className="relative mx-auto max-w-6xl text-center">
        <motion.img initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 180, damping: 14 }} src="/hk/logo.png" alt="HappyKids" className="mx-auto w-64 sm:w-96" data-testid="hero-logo" />
        <h1 className="mt-2 font-fredoka text-4xl font-bold sm:text-5xl lg:text-6xl" data-testid="hero-heading">Little minds. Big possibilities.</h1>
        <p className="mx-auto mt-3 inline-block -rotate-1 rounded-full border-[3px] border-hc-navy bg-hc-sun px-5 py-2 font-fredoka text-lg font-semibold sm:text-2xl" data-testid="hero-subheading">A learning companion that grows with your child</p>
        <p className="mx-auto mt-4 max-w-xl text-base font-bold sm:text-lg">From first letters and numbers to algebra, coding and creative projects. HappyKids is a character-driven learning world for children from Kindergarten to Grade 8.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <ToyButton color="coral" className="min-h-[64px] px-8 text-xl" onClick={() => navigate("/learn")} data-testid="hero-start-learning">START LEARNING <ArrowRight className="h-6 w-6" strokeWidth={3} /></ToyButton>
          <ToyButton color="white" className="min-h-[64px] px-8 text-xl" onClick={() => document.getElementById("worlds")?.scrollIntoView({ behavior: "smooth" })} data-testid="hero-explore-worlds">EXPLORE OUR WORLDS</ToyButton>
        </div>

        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 120, damping: 16 }} className="relative mx-auto mt-10 max-w-5xl">
          <div className="overflow-hidden rounded-[2rem] border-[4px] border-hc-navy bg-white sm:rounded-[2.5rem]" style={{ boxShadow: "0 8px 0 #1F2547" }}>
            <PlaygroundScene />
          </div>
          <span className="absolute -left-3 -top-4 rotate-[-8deg] rounded-full border-[3px] border-hc-navy bg-hc-mint px-4 py-1.5 font-fredoka text-base font-bold sm:-left-6 sm:text-xl" aria-hidden="true">Play!</span>
          <span className="absolute -right-3 -top-4 rotate-[8deg] rounded-full border-[3px] border-hc-navy bg-hc-sky px-4 py-1.5 font-fredoka text-base font-bold sm:-right-6 sm:text-xl" aria-hidden="true">Learn!</span>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-full border-[3px] border-hc-navy bg-hc-sun px-5 py-1.5 font-fredoka text-base font-bold sm:text-xl" aria-hidden="true">Discover!</span>
        </motion.div>
      </div>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-16 w-full" aria-hidden="true">
        <path d="M0 70 Q240 10 520 60 T1040 50 T1440 60 V120 H0 Z" fill="#9BE28F" />
        <path d="M0 95 Q360 55 760 90 T1440 85 V120 H0 Z" fill="#FFF6E3" />
      </svg>
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
    <img src={w.icon} alt="" className="h-24 w-24 object-contain sm:h-28 sm:w-28" />
    <h3 className="mt-2 font-fredoka text-2xl font-bold leading-tight">{w.title}</h3>
    <p className="font-fredoka text-base font-semibold opacity-80">{w.subject}</p>
    <p className="mt-2 flex-1 text-sm font-bold">{w.blurb}</p>
    <span className={`toy-btn mt-4 inline-flex w-full items-center justify-center gap-2 ${w.strong}`}>Explore <ArrowRight className="h-5 w-5" strokeWidth={3} /></span>
  </motion.button>
);

const CharacterShowcase = () => {
  const navigate = useNavigate();
  return (
    <section className="pt-20" data-testid="characters-section">
      <h2 className="text-center font-fredoka text-4xl font-bold sm:text-5xl">Meet Your Learning Friends</h2>
      <p className="mt-2 text-center text-lg font-bold">Each character has a special learning superpower. They celebrate with you, guide you and grow alongside you.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(CHARACTERS).map(([id, c], i) => (
          <motion.div
            key={id}
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-4 rounded-[1.75rem] border-[3px] border-hc-navy bg-white p-5"
            style={{ boxShadow: "0 5px 0 #1F2547" }}
            data-testid={`character-card-${id}`}
          >
            <img src={c.img} alt={c.name} className="hc-float h-24 w-24 shrink-0 object-contain" style={{ animationDelay: `${i * 0.3}s` }} />
            <div>
              <h3 className="font-fredoka text-2xl font-bold">{c.name}</h3>
              <p className="font-fredoka text-sm font-semibold text-hc-coral">{c.specialty}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <p className="mt-6 text-center font-bold opacity-70">As children grow, new guides and mentors join the journey for older learners.</p>
    </section>
  );
};

const JOURNEY_STAGES = [
  { grade: "Kindergarten", ages: "Ages 4-5", title: "First Discoveries", desc: "Letters, numbers, colours, shapes, songs and stories. Learning through play, exploration and joy.", color: "bg-hc-sunlight", icon: "Sparkles" },
  { grade: "Grades 1-2", ages: "Ages 6-7", title: "Building Skills", desc: "Reading fluency, addition, subtraction, science basics and writing. Structure meets excitement.", color: "bg-hc-mintlight", icon: "BookOpen" },
  { grade: "Grades 3-4", ages: "Ages 8-9", title: "Exploring the World", desc: "Comprehension, multiplication, fractions, geography, history and interactive experiments.", color: "bg-hc-skylight", icon: "Globe" },
  { grade: "Grades 5-6", ages: "Ages 10-11", title: "Going Deeper", desc: "Coding, financial literacy, advanced math, scientific reasoning and creative projects.", color: "bg-hc-tanglight", icon: "Code" },
  { grade: "Grades 7-8", ages: "Ages 12-14", title: "Future Ready", desc: "Algebra, academic writing, AI literacy, entrepreneurship, media literacy and leadership.", color: "bg-hc-lavlight", icon: "GraduationCap" },
];

const JourneySection = () => (
  <section className="pt-20" data-testid="journey-section">
    <h2 className="text-center font-fredoka text-4xl font-bold sm:text-5xl">A Journey from Kindergarten to Grade 8</h2>
    <p className="mt-2 text-center text-lg font-bold">One companion. Nine years. A learning experience that evolves with your child.</p>
    <div className="mt-10 space-y-4">
      {JOURNEY_STAGES.map((s, i) => {
        const Icon = { Sparkles, BookOpen, Globe, Code, GraduationCap }[s.icon] || Sparkles;
        return (
          <motion.div
            key={s.grade}
            initial={{ x: i % 2 ? 30 : -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-center gap-4 rounded-[1.75rem] border-[3px] border-hc-navy p-5 ${s.color}`}
            style={{ boxShadow: "0 5px 0 #1F2547" }}
            data-testid={`journey-stage-${i}`}
          >
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border-[3px] border-hc-navy bg-white"><Icon className="h-8 w-8" strokeWidth={2.5} /></span>
            <div className="flex-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <h3 className="font-fredoka text-2xl font-bold">{s.grade}</h3>
                <span className="rounded-full border-2 border-hc-navy bg-white px-2 py-0.5 text-xs font-bold">{s.ages}</span>
              </div>
              <p className="font-fredoka text-lg font-semibold">{s.title}</p>
              <p className="font-bold">{s.desc}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  </section>
);

const FUTURE_ICON_MAP = { BookOpen, Globe, Brain, Code, Coins, Lightbulb };

const FutureWorldsSection = () => (
  <section className="pt-20" data-testid="future-worlds-section">
    <h2 className="text-center font-fredoka text-4xl font-bold sm:text-5xl">The Universe is Growing</h2>
    <p className="mt-2 text-center text-lg font-bold">Six more worlds are on the way as your child advances through the grades.</p>
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {FUTURE_WORLDS.map((w, i) => {
        const Icon = FUTURE_ICON_MAP[w.icon] || Sparkles;
        return (
          <motion.div
            key={w.title}
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-[1.75rem] border-[3px] border-dashed border-hc-navy/50 bg-white/60 p-5"
            data-testid={`future-world-${i}`}
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl border-[3px] border-hc-navy bg-hc-cream"><Icon className="h-7 w-7" strokeWidth={2.5} /></span>
            <h3 className="mt-3 font-fredoka text-2xl font-bold">{w.title}</h3>
            <p className="font-fredoka text-sm font-semibold opacity-80">{w.subject}</p>
            <p className="mt-2 text-sm font-bold">{w.desc}</p>
            <span className="mt-3 inline-block rounded-full border-2 border-hc-navy bg-hc-lavlight px-3 py-1 text-xs font-bold">Coming in later phases</span>
          </motion.div>
        );
      })}
    </div>
  </section>
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
          <p className="mt-2 text-center text-lg font-bold">Six colourful worlds today. More on the way as your child grows.</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WORLDS.map((w, i) => <WorldCard key={w.id} w={w} i={i} onClick={() => navigate(`/world/${w.id}`)} />)}
          </div>
        </section>

        <CharacterShowcase />

        <JourneySection />

        <section className="pt-20" data-testid="why-section">
          <h2 className="text-center font-fredoka text-4xl font-bold sm:text-5xl">Why HappyKids?</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <WhyBlock icon={Sparkles} title="Learns With Your Child" text="Activities adapt to your child's level — from first counting to algebra." bg="bg-hc-skylight" />
            <WhyBlock icon={Star} title="Builds Confidence" text="Gentle hints and stars celebrate every effort, never pressure." bg="bg-hc-sunlight" />
            <WhyBlock icon={Music} title="Characters With Voices" text="Friendly companions guide, encourage and celebrate alongside your child." bg="bg-hc-mintlight" />
            <WhyBlock icon={ShieldCheck} title="Safe for Every Learner" text="No ads, no chat, no public profiles. Privacy by design, always." bg="bg-hc-lavlight" />
          </div>
        </section>

        <FutureWorldsSection />

        <section className="toy-card mt-20 grid items-center gap-6 overflow-hidden p-6 sm:p-10 md:grid-cols-[1.4fr_1fr]" data-testid="story-section">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border-[3px] border-hc-navy bg-hc-corallight px-3 py-1 font-fredoka font-semibold"><Heart className="h-4 w-4 fill-hc-coral" /> Our story</span>
            <h2 className="mt-3 font-fredoka text-4xl font-bold">Inspired by a Father's Love</h2>
            <div className="mt-4 space-y-3 text-lg font-semibold">
              <p>HappyKids began with a father's dream to make learning joyful, accessible and exciting for every child.</p>
              <p>We believe every child has a wonderful mind waiting to discover the world.</p>
              <p>Through playful experiences, friendly characters and interactive adventures, we help children develop confidence, creativity and a lifelong love of learning — from their first letters to the skills they need for the future.</p>
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
