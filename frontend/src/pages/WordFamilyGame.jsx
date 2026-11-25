import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, BookOpen, Image, Lightbulb, Mic, Pause, Puzzle, Star, Trophy, Volume2 } from "lucide-react";
import { ToyButton } from "../components/ToyButton";
import { Character } from "../components/Characters";
import { Modal } from "../components/Modal";
import { Confetti } from "../components/Confetti";
import { FamilyTabs, PictureChoices, ReadingBook } from "../components/ReadingBook";
import { ReadingBonus, getStickers } from "../components/ReadingBonus";
import { createLearner, getHelp, getLearner, saveLearner, submitAnswer } from "../lib/mastery";
import { supabase } from "../lib/supabase";
import { sfx, stopSpeaking } from "../lib/audioManager";
import useVoice from "../hooks/useVoice";
import { listenForText, recognitionSupported, stopListening } from "../lib/speechRecognitionManager";

const MODES = [
  { id: "explore", label: "Flip", icon: BookOpen, color: "bg-hc-skylight" },
  { id: "build", label: "Build", icon: Puzzle, color: "bg-hc-mintlight" },
  { id: "match", label: "Match", icon: Image, color: "bg-hc-corallight" },
  { id: "challenge", label: "Challenge", icon: Trophy, color: "bg-hc-tanglight" },
];
const PRAISE = ["Super reader!", "Wow, amazing!", "You did it!", "Brilliant!", "High five!", "Fantastic!", "Reading star!"];
const pick = (list) => list[Math.floor(Math.random() * list.length)];

async function rpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error || !data) throw new Error("Could not save reading progress. Please try again.");
  return data;
}

export default function WordFamilyGame() {
  const navigate = useNavigate();
  const [learner, setLearner] = useState(getLearner);
  const [families, setFamilies] = useState([]);
  const [active, setActive] = useState("reading-at");
  const [mode, setMode] = useState("explore");
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState(null);
  const [feedback, setFeedback] = useState("Flip the page and read the word!");
  const [help, setHelp] = useState(null);
  const [highlight, setHighlight] = useState(0);
  const [solved, setSolved] = useState(false);
  const [praise, setPraise] = useState("");
  const [party, setParty] = useState(0);
  const [wins, setWins] = useState(0);
  const [flips, setFlips] = useState(0);
  const [bonus, setBonus] = useState(null);
  const [bonusCount, setBonusCount] = useState(0);
  const [stickers, setStickers] = useState(getStickers);
  const [shake, setShake] = useState(null);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [listening, setListening] = useState(false);
  const busy = useRef(false);
  const voice = useVoice();
  const family = families.find(f => f.id === active);
  const words = family?.content.words || [];
  const shown = words[index % Math.max(words.length, 1)];
  const target = round?.visual;

  const say = (text) => { setFeedback(text); voice.say(text); };
  const refresh = async (l = learner) => {
    const data = await rpc("hk_reading_catalog", { p_token: l.token });
    if (!Array.isArray(data)) throw new Error("Reading families could not be loaded.");
    setFamilies(data);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let l = learner;
        if (!l) { const result = await createLearner("K"); l = { ...result, name: "Reader" }; saveLearner(l); }
        if (!cancelled) { setLearner(l); await refresh(l); }
      } catch (e) { if (!cancelled) setError(e.message); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; stopSpeaking(); stopListening(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRound = async () => {
    if (!learner) return;
    setLoading(true); setError(""); setSolved(false); setHelp(null); setHighlight(0); setPraise("");
    try {
      const data = await rpc("hk_reading_round", { p_token: learner.token, p_unit: active, p_mode: mode });
      if (!data.attempt_id || !data.visual || !Array.isArray(data.choices)) throw new Error("The reading question is incomplete.");
      setRound(data); setHelp(data.help);
      say(mode === "explore" ? "Swipe up or tap the arrow to flip the page. Tap a page to hear its sound!" : data.say);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(() => { if (learner && families.length) loadRound(); }, [learner, active, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const startBonus = () => {
    const kind = bonusCount % 2 === 0 ? "balloons" : "present";
    setBonusCount(bonusCount + 1); setBonus(kind);
  };
  const finishBonus = () => {
    setBonus(null); setStickers(getStickers());
    if (mode === "explore") say("Back to the flip book. Keep flipping!");
    else loadRound();
  };

  const flipPage = (delta) => {
    const next = (index + delta + words.length) % words.length;
    setIndex(next);
    const w = words[next];
    voice.say(`${w.sound} ... ${family.content.ending_cue} ... ${w.word}!`);
    setFeedback(`${w.onset} + ${family.content.rime} = ${w.word}`);
    const n = flips + 1; setFlips(n);
    if (n % 8 === 0) setTimeout(startBonus, 1600);
  };

  const successMessage = (result) => {
    const rime = `-${target.rime}`;
    if (result.newly_mastered) return `You learned the ${rime} family! A new family is ready.`;
    if (mode === "build") return `${target.onset} + ${target.rime} makes ${target.word}!`;
    if (mode === "match") return `You read ${target.word}!`;
    return `${target.word}! You found a ${rime} word!`;
  };

  const choose = async (choice) => {
    if (busy.current || solved || !round) return;
    busy.current = true; setError("");
    try {
      const result = await submitAnswer(learner.token, round.attempt_id, choice);
      if (result.correct) {
        setSolved(true); sfx.correct(); sfx.sparkle();
        const cheer = pick(PRAISE);
        setPraise(cheer); setParty(p => p + 1); setWins(w => w + 1);
        if (result.newly_mastered) setTimeout(() => sfx.fanfare(), 600);
        say(`${cheer} ${successMessage(result)}`);
        await refresh();
      } else {
        sfx.wrong(); setShake(choice); setTimeout(() => setShake(null), 500);
        setHelp(result.help); setHighlight(1);
        setFeedback("Nice try! Listen to the first sound again.");
        voice.say(`Nice try! Listen... ${target.sound}`);
      }
    } catch (e) { setError(e.message); } finally { busy.current = false; }
  };

  const next = () => {
    sfx.tap();
    if (wins > 0 && wins % 3 === 0) startBonus(); else loadRound();
  };

  const askHelp = async () => {
    if (!round || solved || busy.current || mode === "explore") return;
    busy.current = true;
    try {
      const result = await getHelp(learner.token, round.attempt_id);
      setHelp(result.help);
      const level = result.help?.level || 1;
      setHighlight(level === 1 ? 1 : 2);
      say(level === 1 ? target.sound : level === 2 ? `Listen to the ending: ${target.rime}. Now join the first sound to it.` : `${target.sound} Then ${target.rime}. Together they make ${target.word}. Let's pick it together!`);
    } catch (e) { setError(e.message); } finally { busy.current = false; }
  };

  const exploreDone = async () => {
    if (busy.current || !round) return;
    busy.current = true;
    try { await submitAnswer(learner.token, round.attempt_id, target.onset); await refresh(); sfx.hop(); setMode("build"); }
    catch (e) { setError(e.message); } finally { busy.current = false; }
  };

  const readAloud = () => {
    voice.stop(); stopSpeaking(); setListening(true);
    setFeedback("I'm listening! Read the word out loud.");
    listenForText({
      onText: () => { sfx.sparkle(); say(`${pick(PRAISE)} Thank you for reading to me!`); },
      onEnd: () => setListening(false),
      onDenied: () => { setListening(false); setFeedback("The microphone is not available. You can tap instead!"); },
    });
  };

  const choices = round?.choices.filter(c => !help?.choices || help.choices.includes(c)) || [];
  const challengeQuestion = mode === "challenge" && target?.mode === "match";

  const renderGame = () => {
    if (bonus) return <ReadingBonus kind={bonus} words={words} say={say} onDone={finishBonus} />;
    if (loading || !target) return <p role="status" className="font-fredoka text-2xl font-bold">Turning the page...</p>;
    if (mode === "explore" && shown) return <div className="flex h-full w-full max-w-2xl flex-col">
      <ReadingBook word={shown} index={index} rime={family.content.rime} flip={flipPage} hear={voice.say} />
      <div className="mt-3 flex shrink-0 justify-center gap-3">
        <ToyButton color="sky" className="text-lg" onClick={() => voice.say(`${shown.sound} ... ${family.content.ending_cue} ... ${shown.word}!`)}>Blend it!</ToyButton>
        <ToyButton color="mint" className="text-lg" onClick={exploreDone}><Puzzle className="h-5 w-5" /> Let's build!</ToyButton>
      </div>
    </div>;
    const showWord = mode === "match" || challengeQuestion;
    return <div className="relative flex h-full w-full max-w-2xl flex-col items-center justify-center gap-3 rounded-3xl border-[3px] border-hc-navy bg-white/90 p-3 text-center shadow-[0_6px_0_#1F2547] sm:gap-5 sm:p-6">
      <h2 className="font-fredoka text-xl font-bold sm:text-2xl">{showWord ? "Read it. Find the picture!" : mode === "challenge" ? "Word Challenge: build it!" : "Which sound starts this word?"}</h2>
      {showWord
        ? <p className="font-fredoka font-bold" style={{ fontSize: "clamp(4rem, 18vmin, 9rem)", lineHeight: 1 }}>{target.word}</p>
        : <>
          <button type="button" onClick={() => voice.say(target.word)} aria-label={`Picture of ${target.word}`} style={{ fontSize: "clamp(4rem, 16vmin, 8rem)", lineHeight: 1 }}>{target.picture}</button>
          <p className="font-fredoka font-bold" style={{ fontSize: "clamp(3.5rem, 14vmin, 7rem)", lineHeight: 1 }}>
            <span className={`inline-block min-w-[1.2em] rounded-2xl border-[3px] border-dashed border-hc-navy px-2 ${solved ? "bg-hc-mintlight" : highlight === 1 ? "bg-hc-sun" : "bg-hc-skylight"}`}>{solved ? target.onset : "?"}</span>
            <span className={`rounded-2xl px-2 ${highlight === 2 ? "bg-hc-sun" : ""}`}>{target.rime}</span>
          </p>
        </>}
      {solved
        ? <ToyButton color="mint" className="hc-pulse text-2xl" onClick={next}>Next word <Star className="h-6 w-6 fill-hc-sun" /></ToyButton>
        : showWord
          ? <PictureChoices words={words} choose={choose} disabled={solved} limit={help?.choices} />
          : <div className="flex flex-wrap justify-center gap-3">{choices.map(c => <motion.button key={c} type="button" whileTap={{ scale: 0.9 }} animate={shake === c ? { x: [0, -10, 10, -6, 0] } : {}} onClick={() => choose(c)}
            className="toy-btn bg-hc-sky font-fredoka font-bold" style={{ fontSize: "clamp(2.25rem, 9vmin, 4rem)", minWidth: "clamp(4.5rem, 18vmin, 7rem)", minHeight: "clamp(4.5rem, 18vmin, 7rem)" }}>{c}</motion.button>)}</div>}
      <AnimatePresence>{praise && <motion.div key={party} initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: -6 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 300, damping: 12 }}
        className="pointer-events-none absolute -top-3 right-2 rounded-2xl border-[3px] border-hc-navy bg-hc-sun px-3 py-1 font-fredoka text-xl font-bold shadow-[0_4px_0_#1F2547] sm:text-2xl">{praise}</motion.div>}</AnimatePresence>
    </div>;
  };

  return <div data-testid="word-family-game" className="relative flex h-screen flex-col overflow-hidden bg-gradient-to-br from-hc-skylight via-hc-vanilla to-hc-corallight text-hc-navy" style={{ height: "100dvh" }}>
    <span className="pointer-events-none absolute left-4 top-24 text-4xl opacity-30 hc-float" aria-hidden="true">⭐</span>
    <span className="pointer-events-none absolute bottom-28 right-6 text-5xl opacity-30 hc-float" aria-hidden="true">🌈</span>
    {party > 0 && solved && <div key={party} className="pointer-events-none fixed inset-0 z-40"><Confetti count={36} /></div>}

    <header className="relative z-10 flex shrink-0 items-center gap-2 px-3 pt-3">
      <ToyButton color="white" className="px-3" onClick={() => navigate("/world/read-and-shine")} aria-label="Back to Read & Shine"><ArrowLeft className="h-6 w-6" strokeWidth={3} /></ToyButton>
      <h1 className="min-w-0 flex-1 truncate font-fredoka text-xl font-bold sm:text-3xl">Word Family Flip</h1>
      <div className="flex h-12 items-center gap-1 rounded-2xl border-[3px] border-hc-navy bg-hc-sunlight px-2 font-fredoka text-lg font-bold" aria-label={family ? `${family.best} of ${family.target} stars` : "Stars"}><Star className="h-5 w-5 fill-hc-sun" />{family ? `${family.best}/${family.target}` : 0}</div>
      {stickers.length > 0 && <div className="hidden h-12 items-center rounded-2xl border-[3px] border-hc-navy bg-white px-2 text-2xl sm:flex" aria-label={`${stickers.length} stickers`}>{stickers.slice(-4).join("")}</div>}
      <ToyButton color="white" className="px-3" onClick={() => { voice.stop(); stopSpeaking(); setPaused(true); }} aria-label="Take a break"><Pause className="h-6 w-6" strokeWidth={3} /></ToyButton>
    </header>

    <div className="relative z-10 flex shrink-0 flex-col items-center gap-1 px-3 pt-2">
      <FamilyTabs families={families} active={active} select={id => { setIndex(0); setActive(id); }} />
      <nav className="flex max-w-full gap-2 overflow-x-auto py-1" aria-label="Game modes">{MODES.map(({ id, label, icon: Icon, color }) => (
        <button key={id} type="button" aria-pressed={mode === id} onClick={() => { sfx.tap(); setBonus(null); setMode(id); }}
          className={`toy-focus flex shrink-0 items-center gap-1 rounded-full border-[3px] border-hc-navy px-3 py-1 text-sm font-bold sm:text-base ${mode === id ? "bg-hc-navy text-white" : color}`}><Icon className="h-4 w-4" />{label}</button>
      ))}</nav>
    </div>

    {error && <div role="alert" className="relative z-10 mx-3 mt-1 flex shrink-0 items-center justify-between gap-2 rounded-2xl bg-hc-corallight p-2 font-bold">{error}<ToyButton color="white" onClick={() => learner ? loadRound() : window.location.reload()}>Try again</ToyButton></div>}

    <main className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-3 py-3">{renderGame()}</main>

    <footer className="relative z-10 flex shrink-0 items-center gap-2 px-3 pb-3">
      <Character name="hoppy" mood={solved || bonus ? "celebrate" : "talking"} className="w-12 shrink-0 sm:w-16" />
      <div className="flex min-w-0 flex-1 items-center gap-1 rounded-2xl border-[3px] border-hc-navy bg-white px-3 py-1">
        <p aria-live="polite" className="line-clamp-2 flex-1 text-sm font-bold sm:text-lg">{feedback}</p>
        <button type="button" onClick={() => voice.say(feedback)} aria-label="Say it again" className="toy-focus shrink-0 rounded-xl p-2"><Volume2 className="h-6 w-6" /></button>
      </div>
      {mode !== "explore" && !bonus && <ToyButton color="sun" className="px-3" disabled={solved} onClick={askHelp} aria-label={`Help${help ? `, step ${help.level} of 3` : ""}`}><Lightbulb className="h-6 w-6" /><span className="hidden sm:inline">Help{help && ` ${help.level}/3`}</span></ToyButton>}
      <ToyButton color={listening ? "coral" : "white"} className="px-3" disabled={!recognitionSupported()} onClick={() => listening ? (stopListening(), setListening(false)) : readAloud()} aria-label={listening ? "Stop listening" : "Read aloud to Hoppy (optional, never marked)"} title="Read aloud (optional, never marked)"><Mic className="h-6 w-6" /></ToyButton>
    </footer>

    <Modal open={paused} onClose={() => setPaused(false)} testId="reading-break"><h2 className="font-fredoka text-3xl font-bold">A little reading break</h2><p className="my-4 font-bold">Stretch, take a breath, and come back when you feel ready. Your game is saved.</p><ToyButton color="mint" onClick={() => setPaused(false)}>Keep reading</ToyButton></Modal>
  </div>;
}
