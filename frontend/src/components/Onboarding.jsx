import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Delete, Keyboard, Loader2 } from "lucide-react";
import { Character } from "./Characters";
import { ToyButton } from "./ToyButton";
import { speak, unlockAudio } from "../lib/audioManager";
import { START_LEVELS, createLearner, saveLearner } from "../lib/mastery";
import { useAppState } from "../context/AppState";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const TILE_COLORS = ["bg-hc-sunlight", "bg-hc-skylight", "bg-hc-mintlight", "bg-hc-tanglight", "bg-hc-corallight"];
const tidy = (n) => n.trim().replace(/\s+/g, " ").toLowerCase().replace(/(^|\s|-)\p{L}/gu, (m) => m.toUpperCase());

export default function Onboarding({ onDone }) {
  const { profile, updateProfile } = useAppState();
  const [step, setStep] = useState("hello");
  const [name, setName] = useState("");
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const greet = () => {
    unlockAudio();
    setStep("name");
    speak("Hi, welcome! I am Hoppy the bunny. What's your name? Tap the letters to spell it.");
  };

  const tap = (l) => {
    if (name.length >= 16) return;
    setName((n) => n + l);
    speak(l.toLowerCase());
  };

  const confirmName = () => {
    const n = tidy(name);
    if (!n) return;
    setName(n);
    setStep("level");
    speak(`Nice to meet you, ${n}! Where shall we start?`);
  };

  const pick = async (grade) => {
    setBusy(true);
    setError("");
    try {
      const res = await createLearner(grade);
      if (!res.token) throw new Error("network");
      const learner = { token: res.token, name, startGrade: res.start_grade || grade };
      saveLearner(learner);
      updateProfile(profile.id, { name, ...(grade === "G6" ? {} : { level: grade }) });
      speak(`Hooray, ${name}! Let's go on an adventure!`);
      onDone(learner);
    } catch {
      setError("Hmm, I couldn't reach the learning map. Please check the internet and try again.");
    } finally {
      setBusy(false);
    }
  };

  const bubble = {
    hello: "Hi, welcome! I am Hoppy.",
    name: "What's your name?",
    level: `Nice to meet you, ${name}! Where shall we start?`,
  }[step];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 text-center" data-testid="onboarding">
      <div className="flex w-full items-end justify-center gap-3">
        <Character name="hoppy" mood={step === "level" ? "celebrate" : "wave"} className="w-24 shrink-0 sm:w-32" testId="onboarding-hoppy" />
        <motion.p key={bubble} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative max-w-md rounded-[1.75rem] border-[3px] border-hc-navy bg-white px-5 py-3 text-left font-fredoka text-2xl font-semibold leading-tight sm:text-3xl" style={{ boxShadow: "0 5px 0 #1F2547" }} aria-live="polite">
          {bubble}
        </motion.p>
      </div>

      <AnimatePresence mode="wait">
        {step === "hello" && (
          <motion.div key="hello" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
            <ToyButton color="coral" className="min-h-[72px] px-10 text-2xl" onClick={greet} data-testid="onboarding-say-hi">SAY HI! <ArrowRight className="h-7 w-7" strokeWidth={3} /></ToyButton>
          </motion.div>
        )}

        {step === "name" && (
          <motion.div key="name" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex w-full flex-col items-center gap-3">
            <div className="flex min-h-[64px] w-full max-w-lg items-center justify-center gap-2 rounded-[1.5rem] border-[3px] border-dashed border-hc-navy bg-white/80 px-4 py-2 font-fredoka text-4xl font-bold tracking-wider" data-testid="onboarding-name">
              {name || <span className="text-xl font-semibold opacity-50">Your name goes here</span>}
            </div>
            {typing ? (
              <input autoFocus value={name} maxLength={16} onChange={(e) => setName(e.target.value.replace(/[^\p{L}\s'-]/gu, ""))} onKeyDown={(e) => e.key === "Enter" && confirmName()} className="toy-focus w-full max-w-lg rounded-2xl border-[3px] border-hc-navy px-4 py-3 text-center font-fredoka text-2xl" placeholder="Type your name" aria-label="Type your name" data-testid="onboarding-name-input" />
            ) : (
              <div className="grid w-full max-w-3xl grid-cols-7 gap-1.5 sm:grid-cols-9 sm:gap-2 lg:grid-cols-[repeat(13,minmax(0,1fr))]" data-testid="letter-tiles">
                {LETTERS.map((l, i) => (
                  <motion.button key={l} type="button" whileTap={{ scale: 0.85 }} onClick={() => tap(l)} className={`toy-focus aspect-square rounded-xl border-[3px] border-hc-navy font-fredoka text-2xl font-bold sm:text-3xl ${TILE_COLORS[i % TILE_COLORS.length]}`} style={{ boxShadow: "0 3px 0 #1F2547" }} aria-label={`Letter ${l}`}>{l}</motion.button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-3">
              <ToyButton color="white" className="min-h-[56px]" onClick={() => setName((n) => n.slice(0, -1))} aria-label="Remove last letter" disabled={!name}><Delete className="h-6 w-6" /> Oops</ToyButton>
              <ToyButton color="white" className="min-h-[56px]" onClick={() => setTyping((t) => !t)} data-testid="onboarding-toggle-typing"><Keyboard className="h-6 w-6" /> {typing ? "Letter tiles" : "Type it"}</ToyButton>
              <ToyButton color="mint" className="min-h-[56px] px-8 text-xl" onClick={confirmName} disabled={!tidy(name)} data-testid="onboarding-name-done">THAT'S ME! <ArrowRight className="h-6 w-6" strokeWidth={3} /></ToyButton>
            </div>
          </motion.div>
        )}

        {step === "level" && (
          <motion.div key="level" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex w-full flex-col items-center gap-3">
            <div className="grid w-full gap-3 sm:grid-cols-3">
              {START_LEVELS.map((lv) => (
                <motion.button key={lv.id} type="button" whileHover={{ y: -4 }} whileTap={{ scale: 0.96 }} disabled={busy} onClick={() => pick(lv.id)} className={`toy-focus flex flex-col items-center gap-1 rounded-[1.75rem] border-[3px] border-hc-navy p-4 disabled:opacity-60 ${lv.color}`} style={{ boxShadow: "0 5px 0 #1F2547" }} data-testid={`start-level-${lv.id}`}>
                  <span className="text-5xl" aria-hidden="true">{lv.emoji}</span>
                  <span className="font-fredoka text-2xl font-bold">{lv.label}</span>
                  <span className="text-sm font-bold opacity-80">{lv.hint}</span>
                </motion.button>
              ))}
            </div>
            {busy && <p className="flex items-center gap-2 font-bold"><Loader2 className="h-5 w-5 animate-spin" /> Getting your map ready...</p>}
            {error && <p className="rounded-2xl border-[3px] border-hc-navy bg-hc-corallight px-4 py-2 font-bold" role="alert">{error}</p>}
            <button type="button" className="toy-focus rounded-full px-3 py-1 font-bold underline" onClick={() => setStep("name")}>Change my name</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
