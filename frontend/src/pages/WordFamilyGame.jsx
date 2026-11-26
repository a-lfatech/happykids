import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Image, Lightbulb, Mic, Pause, Puzzle, Star, Trophy, Volume2 } from "lucide-react";
import { ToyButton } from "../components/ToyButton";
import { PlayerSwitch } from "../components/PlayerSwitch";
import { useAppState } from "../context/AppState";
import { Character } from "../components/Characters";
import { Modal } from "../components/Modal";
import { Confetti } from "../components/Confetti";
import { FamilyTabs, PictureChoices, ReadingBook } from "../components/ReadingBook";
import { getStickers } from "../components/ReadingBonus";
import { LearningPlay, PLAY_GAMES } from "../components/LearningPlay";
import { WordPicture } from "../components/WordPicture";
import { createLearner, getHelp, getLearner, saveLearner, submitAnswer } from "../lib/mastery";
import { supabase } from "../lib/supabase";
import { sfx, stopSpeaking } from "../lib/audioManager";
import useVoice from "../hooks/useVoice";
import "./WordFamilyGame.css";
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
  const { profile, updateProfile } = useAppState();
  const [learner, setLearner] = useState(getLearner);
  const [families, setFamilies] = useState([]);
  const [active, setActive] = useState(profile.readingJourney?.active || "reading-n");
  const [mode, setMode] = useState(profile.readingJourney?.mode || "explore");
  const [index, setIndex] = useState(0);
  const [stageCount, setStageCount] = useState(profile.readingJourney?.count || 0);
  const [destination, setDestination] = useState(null);
  const [gamesOpen, setGamesOpen] = useState(false);
  const [aboutPractice, setAboutPractice] = useState(false);
  const advanceTimer = useRef(null);
  const blendTimer = useRef(null);
  const [round, setRound] = useState(null);
  const [feedback, setFeedback] = useState("Flip the page and read the word!");
  const [help, setHelp] = useState(null);
  const [highlight, setHighlight] = useState(0);
  const [solved, setSolved] = useState(false);
  const [praise, setPraise] = useState("");
  const [party, setParty] = useState(0);
  const [wins, setWins] = useState(0);
  const [bonus, setBonus] = useState(null);
  const [bonusCount, setBonusCount] = useState(0);
  const [stickers, setStickers] = useState(getStickers);
  const [shake, setShake] = useState(null);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [listening, setListening] = useState(false);
  const busy = useRef(false);
  const playArea = useRef(null);
  useEffect(() => {
    const element = playArea.current;
    const resize = () => {
      element.style.setProperty('--play-height', `${element.clientHeight}px`);
      element.style.setProperty('--play-width', `${element.clientWidth}px`);
    };
    resize();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    observer?.observe(element);
    window.addEventListener('resize', resize);
    return () => { observer?.disconnect(); window.removeEventListener('resize', resize); };
  }, []);
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
    return data;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let l = learner;
        if (!l) { const result = await createLearner("K"); l = { ...result, name: profile.name }; saveLearner(l); }
        if (!cancelled) { setLearner(l); await refresh(l); }
      } catch (e) { if (!cancelled) setError(e.message); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; clearTimeout(advanceTimer.current); clearTimeout(blendTimer.current); stopSpeaking(); stopListening(); }; 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRound = async () => {
    if (!learner) return;
    if (mode === "explore") { setLoading(false); return; }
    setLoading(true); setError(""); setSolved(false); setHelp(null); setHighlight(0); setPraise("");
    try {
      const data = await rpc("hk_reading_round", { p_token: learner.token, p_unit: active, p_mode: mode });
      if (!data.attempt_id || !data.visual || !Array.isArray(data.choices)) throw new Error("The reading question is incomplete.");
      setRound(data); setHelp(data.help);
      say(mode === "explore" ? "Swipe up or tap the arrow to flip the page. Tap a page to hear its sound!" : data.say);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(() => { if (learner && families.length) loadRound(); }, [learner, active, mode, families.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveJourney = (nextActive, nextMode, count = 0) => updateProfile(profile.id, { readingJourney: { active: nextActive, mode: nextMode, count } });
  const startBonus = (to = null) => {
    clearTimeout(advanceTimer.current);
    setDestination(to);
    if (to) saveJourney(to.active, to.mode);
    setBonusCount(n => n + 1);
    setBonus(PLAY_GAMES[bonusCount % PLAY_GAMES.length].id);
  };
  const finishBonus = () => {
    setBonus(null); setStickers(getStickers());
    if (destination) {
      setActive(destination.active); setMode(destination.mode); setStageCount(0); setIndex(0); setSolved(false);
      saveJourney(destination.active, destination.mode);
      say(`Next adventure: ${MODES.find(m => m.id === destination.mode)?.label}!`);
      setDestination(null);
    } else if (mode !== "explore") loadRound();
    else say("Choose Build, Match or Challenge whenever you are ready.");
  };
  const advanceStage = () => {
    const position = MODES.findIndex(m => m.id === mode);
    const nextMode = MODES[position+1]?.id || "explore";
    const familyIndex = families.findIndex(f => f.id === active);
    const nextActive = position === MODES.length-1 ? families[(familyIndex+1) % families.length]?.id || active : active;
    startBonus({ active: nextActive, mode: nextMode });
  }; 

  const ending = (family?.content?.ending_cue || family?.content?.rime || "").split(",")[0];

  const flipPage = (delta) => {
    const next = (index + delta + words.length) % words.length;
    setIndex(next);
    const w = words[next];
    voice.say(family.content.whole_word || ["n", "i"].includes(w.onset) ? `${w.word}. ${w.meaning || ""}` : `${w.sound} ... ${ending} ... ${w.word}!`);
    setFeedback(`${w.onset} + ${family.content.rime} = ${w.word}`);
    const n = stageCount + 1; setStageCount(n); saveJourney(active, mode, n);
    if (n >= Math.max(1, words.length-1)) {
      setFeedback("Flip complete! A play break, then Build.");
      clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(advanceStage, 1800);
    }
  };

  const successMessage = (result) => {
    const rime = `-${target.rime}`;
    if (family.content.whole_word || ["n", "i"].includes(target.onset)) return `You read ${target.word}!`;
    if (result.newly_mastered) return `You learned the ${rime} family!`; 
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
        const count = stageCount + 1; setStageCount(count); saveJourney(active, mode, count);
        await refresh();
        if (count >= 3) {
          say(`${cheer} ${MODES.find(m => m.id === mode)?.label} complete! Time for a game, then a new adventure.`);
          clearTimeout(advanceTimer.current);
          advanceTimer.current = setTimeout(advanceStage, 1800);
        }
      } else {
        sfx.wrong(); setShake(choice); setTimeout(() => setShake(null), 500);
        setHelp(result.help); setHighlight(1);
        setFeedback("Nice try! Listen to the first sound again.");
        voice.say(`Nice try! Listen... ${["n", "i"].includes(target.onset) ? target.word : target.sound}`);
      }
    } catch (e) { setError(e.message); } finally { busy.current = false; }
  };

  const next = () => {
    sfx.tap();
    clearTimeout(advanceTimer.current);
    if (stageCount >= 3) advanceStage(); else loadRound();
  };

  const askHelp = async () => {
    if (!round || solved || busy.current || mode === "explore") return;
    busy.current = true;
    try {
      const result = await getHelp(learner.token, round.attempt_id);
      setHelp(result.help);
      const level = result.help?.level || 1;
      setHighlight(level === 1 ? 1 : 2);
      say(family.content.whole_word || ["n", "i"].includes(target.onset) ? `${target.word}. ${target.meaning || ""}` : level === 1 ? target.sound : level === 2 ? `Listen to the ending: ${ending}. Now join the first sound to it.` : `${target.sound} Then ${ending}. Together they make ${target.word}. Let's pick it together!`);
    } catch (e) { setError(e.message); } finally { busy.current = false; }
  };

  const exploreDone = () => { sfx.hop(); advanceStage(); };

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
    if (bonus) return <LearningPlay key={bonus} kind={bonus} say={say} onDone={finishBonus} />;
    if (mode === "explore" && shown) return <div className="reading-explore">
      <ReadingBook key={active} word={shown} index={index} rime={family.content.rime} endingSound={ending} wholeWord={family.content.whole_word} highlight={highlight} flip={flipPage} hear={voice.say} />
      <div className="reading-book-actions">
        <ToyButton color="sky" className="text-lg" onClick={() => { sfx.place(); setHighlight(1); say(family.content.whole_word || ["n", "i"].includes(shown.onset) ? `${shown.word}. ${shown.meaning || ""}` : `${shown.sound} ... ${ending} ... ${shown.word}!`); clearTimeout(blendTimer.current); blendTimer.current = setTimeout(() => { setHighlight(2); blendTimer.current = setTimeout(() => setHighlight(0), 1000); }, 600); }}>Blend it!</ToyButton>
        <ToyButton color="mint" className="text-lg" onClick={exploreDone}><Puzzle className="h-5 w-5" /> Next: Build!</ToyButton>
      </div>
    </div>;
    if (loading || !target) return <p role="status" className="font-fredoka text-xl font-bold">Opening your book...</p>;
    const wholeWord = family.content.whole_word || target.whole_word;
    const showWord = mode === "match" || challengeQuestion;
    const pictureWords = wholeWord ? choices.map(c => families.flatMap(f => f.content.words).find(w => w.word === c)).filter(Boolean) : words;
    return <div className={`reading-round ${showWord ? 'reading-match' : 'reading-build'}`}>
      <h2 className="reading-round-title font-fredoka">{solved ? praise : showWord ? wholeWord ? "Match the word to its clue!" : "Read it. Find the picture!" : mode === "challenge" ? `Story challenge · ${Math.min(stageCount,3)}/3` : wholeWord ? "Find the missing word!" : "Which sound starts this word?"}</h2>
      {showWord
        ? <p className="reading-target-word font-fredoka">{target.word}</p>
        : <>
          <button className="reading-target-picture" type="button" onClick={() => voice.say(target.word)} aria-label={`Picture of ${target.word}`}><WordPicture word={target.word} picture={target.picture} /></button>
          {wholeWord ? <p className="reading-context font-fredoka">{(target.meaning || target.word).replace(new RegExp(`\\b${target.word}\\b`, "i"), "___")}</p> : <p className="reading-build-word font-fredoka">
            <span className={`inline-block min-w-[1.2em] rounded-2xl border-[3px] border-dashed border-hc-navy px-2 ${solved ? "bg-hc-mintlight" : highlight === 1 ? "bg-hc-sun" : "bg-hc-skylight"}`}>{solved ? target.onset : "?"}</span>
            <span className={`rounded-2xl px-2 ${highlight === 2 ? "bg-hc-sun" : ""}`}>{target.rime}</span>
          </p>}
        </>}
      {solved
        ? <ToyButton color="mint" className="hc-pulse text-2xl" onClick={next}>{stageCount >= 3 ? 'Play & move on' : 'Next word'} <Star className="h-6 w-6 fill-hc-sun" /></ToyButton>
        : showWord
          ? <PictureChoices words={pictureWords} choose={choose} disabled={solved} limit={help?.choices} />
          : <div className="reading-letter-choices">{choices.map(c => <motion.button key={c} type="button" whileTap={{ scale: 0.9 }} animate={shake === c ? { x: [0, -10, 10, -6, 0] } : {}} onClick={() => choose(c)}
            className="toy-focus bg-hc-sky font-fredoka font-bold">{c}</motion.button>)}</div>}
    </div>;
  };

  return <div data-testid="word-family-game" className="reading-game relative flex h-screen flex-col overflow-hidden bg-gradient-to-br from-hc-skylight via-hc-vanilla to-hc-corallight text-hc-navy" style={{ height: "100dvh" }}>
    <span className="pointer-events-none absolute left-4 top-24 text-4xl opacity-30 hc-float" aria-hidden="true">⭐</span>
    <span className="pointer-events-none absolute bottom-28 right-6 text-5xl opacity-30 hc-float" aria-hidden="true">🌈</span>
    {party > 0 && solved && <div key={party} className="pointer-events-none fixed inset-0 z-40"><Confetti count={36} /></div>}

    <header className="relative z-10 flex shrink-0 items-center gap-2 px-3 pt-3">
      <ToyButton color="white" className="px-3" onClick={() => navigate("/world/read-and-shine")} aria-label="Back to Read & Shine"><ArrowLeft className="h-6 w-6" strokeWidth={3} /></ToyButton>
      <PlayerSwitch />
      <h1 className="min-w-0 flex-1 truncate font-fredoka text-xl font-bold sm:text-3xl">Word Family Flip</h1>
      <div className="flex h-12 items-center gap-1 rounded-2xl border-[3px] border-hc-navy bg-hc-sunlight px-2 font-fredoka text-lg font-bold" aria-label={`${wins} words read this visit`}><Star className="h-5 w-5 fill-hc-sun" />{wins}</div>
      {stickers.length > 0 && <div className="hidden h-12 items-center rounded-2xl border-[3px] border-hc-navy bg-white px-2 text-2xl sm:flex" aria-label={`${stickers.length} stickers`}>{stickers.slice(-4).join("")}</div>}
      <ToyButton color="white" className="px-3" onClick={() => { voice.stop(); stopSpeaking(); setPaused(true); }} aria-label="Take a break"><Pause className="h-6 w-6" strokeWidth={3} /></ToyButton>
    </header>

    <div className="relative z-10 flex shrink-0 flex-col items-center gap-1 px-3 pt-2">
      <FamilyTabs families={families} active={active} select={id => { clearTimeout(advanceTimer.current); setBonus(null); setIndex(0); setActive(id); setMode("explore"); setStageCount(0); saveJourney(id, "explore"); }} />
      <nav className="flex max-w-full gap-2 overflow-x-auto py-1" aria-label="Game modes">{MODES.map(({ id, label, icon: Icon, color }) => (
        <button key={id} type="button" aria-pressed={mode === id} onClick={() => { clearTimeout(advanceTimer.current); sfx.tap(); setBonus(null); setMode(id); setStageCount(0); saveJourney(active, id); }}
          className={`toy-focus flex shrink-0 items-center gap-1 rounded-full border-[3px] border-hc-navy px-3 py-1 text-sm font-bold sm:text-base ${mode === id ? "bg-hc-navy text-white" : color}`}><Icon className="h-4 w-4" />{label}</button>
      ))}<button type="button" onClick={() => setGamesOpen(true)} className="toy-focus rounded-full border-2 border-hc-navy bg-hc-sunlight px-3 font-bold">Games</button></nav>
      <div className="reading-stage-progress"><span>All words open · {MODES.find(m => m.id === mode)?.label} {Math.min(stageCount, mode === "explore" ? Math.max(1,words.length-1) : 3)}/{mode === "explore" ? Math.max(1,words.length-1) : 3}</span><button className="toy-focus underline" onClick={() => setAboutPractice(true)}>Why practise?</button></div>
    </div>

    {error && <div role="alert" className="relative z-10 mx-3 mt-1 flex shrink-0 items-center justify-between gap-2 rounded-2xl bg-hc-corallight p-2 font-bold">{error}<ToyButton color="white" onClick={() => learner ? loadRound() : window.location.reload()}>Try again</ToyButton></div>}

    <main ref={playArea} className="reading-play-area relative z-10">{renderGame()}</main>

    <footer className="reading-instructions relative z-10">
      <Character name="hoppy" mood={solved || bonus ? "celebrate" : "talking"} className="w-12 shrink-0 sm:w-16" />
      <div className="flex min-w-0 flex-1 items-center gap-1 rounded-2xl border-[3px] border-hc-navy bg-white px-3 py-1">
        <p aria-live="polite" className="line-clamp-2 flex-1 text-sm font-bold sm:text-lg">{feedback}</p>
        <button type="button" onClick={() => voice.say(feedback)} aria-label="Say it again" className="toy-focus shrink-0 rounded-xl p-2"><Volume2 className="h-6 w-6" /></button>
      </div>
      {mode !== "explore" && !bonus && <ToyButton color="sun" className="px-3" disabled={solved} onClick={askHelp} aria-label={`Help${help ? `, step ${help.level} of 3` : ""}`}><Lightbulb className="h-6 w-6" /><span className="hidden sm:inline">Help{help && ` ${help.level}/3`}</span></ToyButton>}
      <ToyButton color={listening ? "coral" : "white"} className="px-3" disabled={!recognitionSupported()} onClick={() => listening ? (stopListening(), setListening(false)) : readAloud()} aria-label={listening ? "Stop listening" : "Read aloud to Hoppy (optional, never marked)"} title="Read aloud (optional, never marked)"><Mic className="h-6 w-6" /></ToyButton>
    </footer>

    <Modal open={gamesOpen} onClose={() => setGamesOpen(false)} testId="reading-games"><h2 className="font-fredoka text-2xl font-bold">Choose a play break</h2><div className="mt-4 grid grid-cols-2 gap-3">{PLAY_GAMES.map(g => <ToyButton key={g.id} color="sky" onClick={() => { clearTimeout(advanceTimer.current); setDestination(null); setBonus(g.id); setGamesOpen(false); }}>{g.title}</ToyButton>)}</div></Modal>
    <Modal open={aboutPractice} onClose={() => setAboutPractice(false)} testId="reading-practice-explanation"><h2 className="font-fredoka text-2xl font-bold">A little practice, lots of play</h2><p className="mt-4 leading-relaxed">Seeing a word again helps it become familiar, so reading takes less effort. We change the activity: flip, build, match, then a short challenge, with games between. After three successful answers you move on. Stars show practice, not a lock. You can choose any family or game, and never have to repeat a family to unlock another.</p></Modal>
    <Modal open={paused} onClose={() => setPaused(false)} testId="reading-break"><h2 className="font-fredoka text-3xl font-bold">A little reading break</h2><p className="my-4 font-bold">Stretch, take a breath, and come back when you feel ready. Your game is saved.</p><ToyButton color="mint" onClick={() => setPaused(false)}>Keep reading</ToyButton></Modal>
  </div>;
}
