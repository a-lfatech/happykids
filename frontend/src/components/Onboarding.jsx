import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Delete, Keyboard, Loader2, Mic, Type } from "lucide-react";
import { ToyButton } from "./ToyButton";
import { Modal } from "./Modal";
import { speak, unlockAudio } from "../lib/audioManager";
import { START_LEVELS, createLearner, saveLearner } from "../lib/mastery";
import { extractGrade, extractName, listenForText, recognitionSupported, stopListening } from "../lib/speechRecognitionManager";
import { useAppState } from "../context/AppState";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const TILE_COLORS = ["bg-hc-sunlight", "bg-hc-skylight", "bg-hc-mintlight", "bg-hc-tanglight", "bg-hc-corallight"];
const gradeFor = (g) => (g === 0 ? "K" : g >= 6 ? "G6" : "G1");
const tidy = (n) => n.trim().replace(/\s+/g, " ").toLowerCase().replace(/(^|\s|-)\p{L}/gu, (m) => m.toUpperCase());
const fade = { initial: { y: 10, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: -10, opacity: 0 } };

const SpellPad = ({ open, name, setName, onClose, onDone }) => {
  const [typing, setTyping] = useState(false);
  const tap = (l) => {
    if (name.length >= 16) return;
    setName((n) => n + l);
    speak(l.toLowerCase());
  };
  return (
    <Modal open={open} onClose={onClose} testId="spell-pad">
      <h2 className="text-center font-fredoka text-2xl font-bold">Spell your name</h2>
      <div className="mt-3 flex min-h-[56px] items-center justify-center rounded-[1.25rem] border-[3px] border-dashed border-hc-navy bg-white px-3 font-fredoka text-3xl font-bold tracking-wider" data-testid="onboarding-name">
        {name || <span className="text-lg font-semibold opacity-50">Your name goes here</span>}
      </div>
      {typing ? (
        <input autoFocus value={name} maxLength={16} onChange={(e) => setName(e.target.value.replace(/[^\p{L}\s'-]/gu, ""))} onKeyDown={(e) => e.key === "Enter" && onDone()} className="toy-focus mt-3 w-full rounded-2xl border-[3px] border-hc-navy px-4 py-3 text-center font-fredoka text-2xl" placeholder="Type your name" aria-label="Type your name" data-testid="onboarding-name-input" />
      ) : (
        <div className="mt-3 grid grid-cols-7 gap-1.5" data-testid="letter-tiles">
          {LETTERS.map((l, i) => (
            <motion.button key={l} type="button" whileTap={{ scale: 0.85 }} onClick={() => tap(l)} className={`toy-focus aspect-square rounded-xl border-[3px] border-hc-navy font-fredoka text-xl font-bold ${TILE_COLORS[i % TILE_COLORS.length]}`} style={{ boxShadow: "0 3px 0 #1F2547" }} aria-label={`Letter ${l}`}>{l}</motion.button>
          ))}
        </div>
      )}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <ToyButton color="white" onClick={() => setName((n) => n.slice(0, -1))} aria-label="Remove last letter" disabled={!name}><Delete className="h-5 w-5" /> Oops</ToyButton>
        <ToyButton color="white" onClick={() => setTyping((t) => !t)} data-testid="onboarding-toggle-typing"><Keyboard className="h-5 w-5" /> {typing ? "Tiles" : "Type"}</ToyButton>
        <ToyButton color="mint" onClick={onDone} disabled={!tidy(name)} data-testid="spell-done"><Check className="h-5 w-5" strokeWidth={3} /> Done</ToyButton>
      </div>
    </Modal>
  );
};

export default function Onboarding({ onDone }) {
  const { profile, updateProfile } = useAppState();
  const [step, setStep] = useState("hello");
  const [name, setName] = useState("");
  const [spelling, setSpelling] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const [micNote, setMicNote] = useState("");
  const canListen = recognitionSupported();

  const greet = () => {
    unlockAudio();
    setStep("name");
    speak(canListen ? "Hi, welcome! I am Hoppy the bunny. What's your name? Tap Say it and tell me, or tap Spell it." : "Hi, welcome! I am Hoppy the bunny. What's your name? Tap Spell it to spell it with letters.");
  };

  const hear = (onText) => {
    unlockAudio();
    setMicNote("");
    setListening(true);
    listenForText({
      onText,
      onDenied: () => setMicNote("The microphone is switched off. Ask a grown-up, or tap Spell it."),
      onEnd: () => setListening(false),
    });
  };

  const sayName = () => {
    if (listening) { stopListening(); return; }
    hear((text) => {
      const n = tidy(extractName(text));
      if (!n) { setMicNote("I didn't catch that. Try again!"); return; }
      setName(n);
      speak(`Is your name ${n}? Tap That's me! Or tap Spell it to fix it.`);
    });
  };

  const sayGrade = () => {
    if (listening) { stopListening(); return; }
    hear((text) => {
      const g = extractGrade(text);
      if (g === null) { setMicNote("Try saying: grade six, or kindergarten."); speak("Try saying grade six, or kindergarten."); return; }
      const note = g >= 2 && g <= 5 ? `Grade ${g} is still being built, so we'll start with Grade 1 and climb up. ` : g >= 7 ? `Grade ${g} is still being built, so we'll start with Grade 6. ` : "";
      pick(gradeFor(g), note);
    });
  };

  const confirmName = () => {
    const n = tidy(name);
    if (!n) return;
    setName(n);
    setSpelling(false);
    setStep("level");
    setMicNote("");
    speak(`Nice to meet you, ${n}! Where shall we start?`);
  };

  const pick = async (grade, note = "") => {
    setBusy(true);
    setError("");
    try {
      const res = await createLearner(grade);
      if (!res.token) throw new Error("network");
      const learner = { token: res.token, name, startGrade: res.start_grade || grade };
      saveLearner(learner);
      updateProfile(profile.id, { name, ...(grade === "G6" ? {} : { level: grade }) });
      speak(`${note}Hooray, ${name}! Everything in ${START_LEVELS.find((l) => l.id === grade)?.label || "your level"} is open for you. Let's go!`);
      onDone(learner);
    } catch {
      setError("I couldn't reach the learning map. Check the internet and try again.");
    } finally {
      setBusy(false);
    }
  };

  const heading = {
    hello: "Hi, welcome! I'm Hoppy.",
    name: name ? `Is your name ${name}?` : "What's your name?",
    level: `Hi ${name}! Where shall we start?`,
  }[step];

  return (
    <div className="flex w-full flex-col items-center gap-2 text-center" data-testid="onboarding">
      <motion.p key={heading} initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-fredoka text-xl font-bold leading-tight sm:text-3xl" aria-live="polite">
        {heading}
      </motion.p>

      <AnimatePresence mode="wait">
        {step === "hello" && (
          <motion.div key="hello" {...fade}>
            <ToyButton color="coral" className="min-h-[52px] px-8 text-xl" onClick={greet} data-testid="onboarding-say-hi">SAY HI! <ArrowRight className="h-6 w-6" strokeWidth={3} /></ToyButton>
          </motion.div>
        )}

        {step === "name" && (
          <motion.div key="name" {...fade} className="flex flex-wrap justify-center gap-2">
            {canListen && (
              <ToyButton color={listening ? "coral" : "sun"} className={`min-h-[48px] ${listening ? "hc-pulse" : ""}`} onClick={sayName} data-testid="onboarding-say-name">
                <Mic className="h-5 w-5" strokeWidth={2.5} /> {listening ? "Listening..." : "Say it"}
              </ToyButton>
            )}
            <ToyButton color="sky" className="min-h-[48px]" onClick={() => setSpelling(true)} data-testid="onboarding-spell"><Type className="h-5 w-5" strokeWidth={2.5} /> Spell it</ToyButton>
            {name && <ToyButton color="mint" className="min-h-[48px]" onClick={confirmName} data-testid="onboarding-name-done">THAT'S ME! <ArrowRight className="h-5 w-5" strokeWidth={3} /></ToyButton>}
          </motion.div>
        )}

        {step === "level" && (
          <motion.div key="level" {...fade} className="flex flex-wrap items-center justify-center gap-2">
            {START_LEVELS.map((lv) => (
              <motion.button key={lv.id} type="button" whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }} disabled={busy} onClick={() => pick(lv.id)} title={lv.hint} className={`toy-focus flex min-h-[48px] items-center gap-1.5 rounded-full border-[3px] border-hc-navy px-4 font-fredoka text-base font-bold disabled:opacity-60 sm:text-lg ${lv.color}`} style={{ boxShadow: "0 4px 0 #1F2547" }} data-testid={`start-level-${lv.id}`}>
                <span aria-hidden="true">{lv.emoji}</span> {lv.label}
              </motion.button>
            ))}
            {canListen && (
              <ToyButton color={listening ? "coral" : "sun"} className={`min-h-[48px] ${listening ? "hc-pulse" : ""}`} onClick={sayGrade} disabled={busy} aria-label="Say your grade" data-testid="onboarding-say-grade">
                <Mic className="h-5 w-5" strokeWidth={2.5} /> {listening ? "Listening..." : "Say it"}
              </ToyButton>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {busy && <p className="flex items-center gap-2 text-sm font-bold"><Loader2 className="h-4 w-4 animate-spin" /> Getting your map ready...</p>}
      {(micNote || error) && <p className="text-sm font-bold" role={error ? "alert" : "status"}>{error || micNote}</p>}
      {step === "level" && !busy && <button type="button" className="toy-focus rounded-full px-2 text-sm font-bold underline" onClick={() => setStep("name")}>Change my name</button>}

      <SpellPad open={spelling} name={name} setName={setName} onClose={() => setSpelling(false)} onDone={confirmName} />
    </div>
  );
}
