import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, Lightbulb, Loader2, Map as MapIcon, RefreshCw, Volume2, X } from "lucide-react";
import { Character } from "../components/Characters";
import { ToyButton } from "../components/ToyButton";
import { Confetti } from "../components/Confetti";
import { StarRow } from "../components/GradeMap";
import QuestionVisual, { demoSteps } from "../components/QuestionVisual";
import { sfx, speak, stopSpeaking } from "../lib/audioManager";
import { getHelp, getLearner, nextQuestion, submitAnswer } from "../lib/mastery";

const CHEERS = ["Great job", "You got it", "Super", "Well done", "Brilliant"];
const HELP_STEPS = { 1: "Hint", 2: "Another way", 3: "Together" };
const isPictures = (s) => !/[\p{L}\p{N}]/u.test(s);

const ChoiceButton = ({ choice, state, onClick, cols }) => {
  const pics = isPictures(choice);
  const long = Array.from(choice).length > 6;
  const bg = state === "right" ? "bg-hc-mint" : state === "tried" ? "bg-[#ECE8DE] opacity-60" : "bg-white";
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={state === "tried"}
      whileTap={{ scale: 0.95 }}
      animate={state === "right" ? { scale: [1, 1.08, 1] } : state === "tried" ? { x: [0, -6, 6, 0] } : {}}
      className={`toy-focus flex min-h-0 items-center justify-center rounded-[1.5rem] border-[3px] border-hc-navy px-2 py-2 font-fredoka font-bold leading-tight ${bg}`}
      style={{ boxShadow: "0 5px 0 #1F2547", fontSize: pics ? (long ? "clamp(1.1rem, 3.6vh, 2rem)" : "clamp(1.75rem, 6vh, 3.25rem)") : `clamp(1.25rem, ${cols > 3 ? 4.5 : 5.5}vh, 2.75rem)` }}
      data-testid="mastery-choice"
    >
      <span className="break-words">{choice}</span>
    </motion.button>
  );
};

export default function PracticePage() {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const learner = useRef(getLearner()).current;
  const [q, setQ] = useState(null);
  const [status, setStatus] = useState("loading");
  const [tried, setTried] = useState([]);
  const [right, setRight] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [progress, setProgress] = useState({ best: 0, target: 4 });
  const [won, setWon] = useState(null);
  const [help, setHelp] = useState(null);
  const [demo, setDemo] = useState(null);
  const busy = useRef(false);
  const struggled = useRef(false);
  const demoTimer = useRef(null);

  const stopDemo = () => { clearInterval(demoTimer.current); setDemo(null); };

  const load = useCallback(async () => {
    clearInterval(demoTimer.current);
    setDemo(null);
    setHelp(null);
    setStatus("loading");
    setTried([]);
    setRight(null);
    setFeedback(null);
    try {
      const data = await nextQuestion(learner.token, unitId);
      if (!data.attempt_id || !Array.isArray(data.choices)) throw new Error("network");
      setQ(data);
      setProgress({ best: data.best ?? 0, target: data.target ?? 4 });
      setStatus("ready");
      if (struggled.current) {
        struggled.current = false;
        setFeedback({ tone: "info", text: "Now try this one on your own. You've got this!" });
        speak(`Now try this one on your own. ${data.say || data.prompt}`);
      } else {
        speak(data.say || data.prompt);
      }
    } catch (e) {
      if (e.code === "locked" || e.code === "unknown_learner") {
        speak("That adventure is still locked. Let's pick one from your map!");
        navigate("/#map", { replace: true });
        return;
      }
      setStatus("error");
    }
  }, [learner, unitId, navigate]);

  useEffect(() => {
    if (!learner) { navigate("/", { replace: true }); return undefined; }
    load();
    return () => { clearInterval(demoTimer.current); stopSpeaking(); };
  }, [learner, load, navigate]);

  const applyHelp = (h, lead = "") => {
    if (!h?.level || !h.text) return false;
    setHelp(h);
    if (h.level >= 2) struggled.current = true;
    const text = `${lead}${h.text}`;
    setFeedback({ tone: "hint", step: h.level, text });
    speak(h.demo ? `${text} Tap show me, and we'll do it together.` : text);
    return true;
  };

  const askHelp = async () => {
    if (busy.current || right || !q || help?.level >= 3) return;
    busy.current = true;
    stopDemo();
    try {
      const res = await getHelp(learner.token, q.attempt_id);
      sfx.tap();
      if (!applyHelp(res?.help)) throw new Error("network");
    } catch {
      setFeedback({ tone: "hint", text: "Oops, I couldn't get help just now. Please try again." });
    } finally {
      busy.current = false;
    }
  };

  const runDemo = () => {
    const steps = demoSteps(q?.visual);
    if (!steps.length) return;
    clearInterval(demoTimer.current);
    let i = 0;
    setDemo(0);
    speak(steps[0]);
    demoTimer.current = setInterval(() => {
      i += 1;
      if (i >= steps.length) { clearInterval(demoTimer.current); setTimeout(() => setDemo(null), 1600); return; }
      setDemo(i);
      speak(steps[i]);
    }, 1100);
  };

  const choose = async (choice) => {
    if (busy.current || right || !q) return;
    busy.current = true;
    stopDemo();
    try {
      const res = await submitAnswer(learner.token, q.attempt_id, choice);
      setProgress({ best: res.best ?? progress.best, target: res.target ?? progress.target });
      if (res.correct) {
        sfx.correct();
        setRight(choice);
        const cheer = `${CHEERS[Math.floor(Math.random() * CHEERS.length)]}, ${learner.name}!`;
        setFeedback({ tone: "right", text: res.explain ? `${cheer} ${res.explain}` : cheer });
        speak(res.explain ? `${cheer} ${res.explain}` : cheer);
        if (res.newly_mastered) {
          setTimeout(() => {
            sfx.fanfare();
            setWon(res.next_unit || {});
            speak(res.next_unit ? `Amazing, ${learner.name}! You mastered ${q.unit_title}. ${res.next_unit.title} is open now!` : `Amazing, ${learner.name}! You mastered ${q.unit_title}!`);
          }, 1400);
        }
      } else {
        sfx.wrong();
        setTried((t) => [...t, choice]);
        if (!applyHelp(res.help, "Almost! ")) {
          const text = res.hint ? `Almost! ${res.hint}` : "Almost! Have another try.";
          setFeedback({ tone: "hint", text });
          speak(text);
        }
      }
    } catch {
      setFeedback({ tone: "hint", text: "Oops, I couldn't check that. Please try again." });
    } finally {
      busy.current = false;
    }
  };

  if (!learner) return null;
  const guided = help?.level === 3 && Array.isArray(help.choices);
  const shown = q ? (guided ? q.choices.filter((c) => help.choices.includes(c) || c === right) : q.choices) : [];
  const cols = shown.length > 3 ? 4 : shown.length === 2 ? 2 : 3;
  const gridCols = cols === 4 ? "grid-cols-2 sm:grid-cols-4" : cols === 2 ? "grid-cols-2" : "grid-cols-3";
  const canShow = help?.demo && !right && demoSteps(q?.visual).length > 0;

  return (
    <main className="hc-bg flex h-[100dvh] flex-col overflow-hidden px-3 pb-3 pt-3 sm:px-6" data-testid="practice-page">
      <header className="flex shrink-0 items-center gap-2">
        <ToyButton color="white" className="h-12 px-3" onClick={() => navigate("/#map")} aria-label="Back to my map" data-testid="practice-back"><ArrowLeft className="h-6 w-6" strokeWidth={3} /></ToyButton>
        <p className="min-w-0 flex-1 truncate font-fredoka text-lg font-bold sm:text-2xl">{q ? q.unit_title : "Practice"}</p>
        <div className="flex flex-col items-end rounded-2xl border-[3px] border-hc-navy bg-white px-3 py-1" data-testid="practice-stars">
          <StarRow best={progress.best} target={progress.target} size="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="hidden text-xs font-bold sm:block">{progress.best >= progress.target ? "Mastered!" : `${progress.target} stars open the next one`}</span>
        </div>
      </header>

      {status === "loading" && <div className="grid flex-1 place-items-center"><Loader2 className="h-10 w-10 animate-spin" aria-label="Loading" /></div>}
      {status === "error" && (
        <div className="grid flex-1 place-items-center text-center">
          <div>
            <p className="font-bold">I couldn't get the next question.</p>
            <ToyButton color="white" className="mt-3" onClick={load}><RefreshCw className="h-5 w-5" /> Try again</ToyButton>
          </div>
        </div>
      )}

      {status === "ready" && q && (
        <>
          <section className="mt-2 flex shrink-0 items-center gap-2 sm:gap-3">
            <Character name="hoppy" mood={right ? "celebrate" : tried.length || help ? "thinking" : "talking"} className="w-14 shrink-0 sm:w-20 [@media(max-height:560px)]:hidden" testId="practice-hoppy" />
            <button type="button" onClick={() => speak(q.say || q.prompt)} className="toy-focus flex min-w-0 flex-1 items-center gap-2 rounded-[1.5rem] border-[3px] border-hc-navy bg-white px-4 py-2 text-left" style={{ boxShadow: "0 4px 0 #1F2547" }} aria-label={`${q.prompt} Tap to hear it again.`} data-testid="practice-prompt">
              <span className="min-w-0 flex-1 font-fredoka font-semibold leading-tight" style={{ fontSize: "clamp(1.15rem, 3.8vh, 2rem)" }}>{q.prompt}</span>
              <Volume2 className="h-7 w-7 shrink-0 text-[#2F95E0]" strokeWidth={2.75} />
            </button>
            <ToyButton color="sun" className="h-14 shrink-0 flex-col gap-0 px-3 text-sm leading-none sm:h-16 sm:px-4" onClick={askHelp} disabled={!!right || help?.level >= 3} aria-label="Help me" data-testid="practice-help">
              <Lightbulb className="h-6 w-6" strokeWidth={2.75} />
              <span className="mt-0.5 font-bold">Help</span>
            </ToyButton>
          </section>

          <section className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden py-2">
            <QuestionVisual visual={q.visual} step={demo} />
            {canShow && demo === null && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute bottom-2 right-0">
                <ToyButton color="sky" className="h-12 px-4" onClick={runDemo} data-testid="practice-show-me"><Eye className="h-5 w-5" strokeWidth={2.75} /> Show me</ToyButton>
              </motion.div>
            )}
          </section>

          <section className={`grid shrink-0 gap-2 sm:gap-3 ${gridCols}`} style={{ height: cols === 4 ? "clamp(7rem, 26vh, 12rem)" : "clamp(4.5rem, 17vh, 9rem)" }}>
            {shown.map((c) => (
              <ChoiceButton key={c} choice={c} cols={cols} state={right === c ? "right" : tried.includes(c) ? "tried" : "idle"} onClick={() => choose(c)} />
            ))}
          </section>

          <footer className="mt-2 flex shrink-0 items-center gap-2 sm:gap-3" style={{ minHeight: "4.5rem" }}>
            <AnimatePresence mode="wait">
              {feedback && (
                <motion.p key={feedback.text} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className={`max-h-28 min-w-0 flex-1 overflow-y-auto rounded-2xl border-[3px] border-hc-navy px-3 py-1.5 text-sm font-bold leading-snug sm:text-base ${feedback.tone === "right" ? "bg-hc-mintlight" : feedback.tone === "info" ? "bg-white" : "bg-hc-sunlight"}`} aria-live="polite" data-testid="practice-feedback">
                  {feedback.step && (
                    <span className="mr-2 inline-flex items-center gap-1 rounded-full border-2 border-hc-navy bg-white px-2 align-middle text-xs" data-testid="practice-help-step">
                      Step {feedback.step} of 3: {HELP_STEPS[feedback.step]}
                    </span>
                  )}
                  {feedback.text}
                </motion.p>
              )}
            </AnimatePresence>
            {!feedback && <p className="min-w-0 flex-1 text-sm font-bold opacity-70">Tap your answer. Take your time!</p>}
            <ToyButton color="mint" className="h-16 shrink-0 px-6 text-xl sm:h-[72px] sm:px-10 sm:text-2xl" onClick={load} disabled={!right} data-testid="next-button">
              NEXT <ArrowRight className="h-6 w-6" strokeWidth={3} />
            </ToyButton>
          </footer>
        </>
      )}

      <AnimatePresence>
        {won && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 overflow-y-auto bg-hc-navy/60 p-4" role="dialog" aria-modal="true" data-testid="mastered-dialog">
            <Confetti />
            <div className="flex min-h-full items-center justify-center">
            <motion.div initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 220, damping: 16 }} className="toy-card relative w-full max-w-md p-6 text-center">
              <button type="button" onClick={() => navigate("/")} className="toy-focus absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full border-[3px] border-hc-navy bg-white transition-transform hover:scale-110" style={{ boxShadow: "0 3px 0 #1F2547" }} aria-label="Close and go home" data-testid="mastered-close"><X className="h-5 w-5" strokeWidth={3} /></button>
              <Character name="hoppy" mood="celebrate" className="mx-auto w-28" />
              <h2 className="mt-2 font-fredoka text-3xl font-bold">You did it, {learner.name}!</h2>
              <p className="mt-1 font-bold">You mastered {q?.unit_title}.</p>
              {won.id && <p className="mt-3 rounded-2xl border-[3px] border-hc-navy bg-hc-sunlight px-3 py-2 font-fredoka text-xl font-bold"><span aria-hidden="true">{won.emoji}</span> {won.title} is open!</p>}
              <div className="mt-5 grid gap-3">
                {won.id && <ToyButton color="coral" className="min-h-[64px] text-xl" onClick={() => { setWon(null); navigate(`/practice/${won.id}`); }} data-testid="mastered-next">PLAY {won.title.toUpperCase()} <ArrowRight className="h-6 w-6" strokeWidth={3} /></ToyButton>}
                <ToyButton color="white" className="min-h-[56px]" onClick={() => navigate("/#map")} data-testid="mastered-map"><MapIcon className="h-5 w-5" /> My map</ToyButton>
                <button type="button" className="toy-focus font-bold underline" onClick={() => { setWon(null); load(); }}>Keep practising this one</button>
              </div>
            </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
