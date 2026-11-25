import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lightbulb, Mic, Pause, Volume2 } from "lucide-react";
import { PageShell } from "../components/SiteNav";
import { ToyButton } from "../components/ToyButton";
import { Character } from "../components/Characters";
import { Modal } from "../components/Modal";
import { FamilyTabs, PictureChoices, ReadingBook } from "../components/ReadingBook";
import { createLearner, getHelp, getLearner, saveLearner, submitAnswer } from "../lib/mastery";
import { supabase } from "../lib/supabase";
import { sfx, stopSpeaking } from "../lib/audioManager";
import useVoice from "../hooks/useVoice";
import { listenForText, recognitionSupported, stopListening } from "../lib/speechRecognitionManager";

const MODES = { explore: 'Explore', build: 'Build the Word', match: 'Read & Match', challenge: 'Word Challenge' };
async function rpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error || !data) throw new Error('Could not save reading progress. Please try again.');
  return data;
}
export default function WordFamilyGame() {
  const navigate = useNavigate();
  const [learner, setLearner] = useState(getLearner);
  const [families, setFamilies] = useState([]);
  const [active, setActive] = useState('reading-at');
  const [mode, setMode] = useState('explore');
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState(null);
  const [feedback, setFeedback] = useState('Flip it. Build it. Sound it. Read it!');
  const [help, setHelp] = useState(null);
  const [highlight, setHighlight] = useState(0);
  const [solved, setSolved] = useState(false);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [listening, setListening] = useState(false);
  const busy = useRef(false);
  const voice = useVoice();
  const readAloud = () => {
    voice.stop(); stopSpeaking(); setListening(true);
    listenForText({ onText: () => setFeedback('Thank you for reading! Keep practising. Your voice is never graded.'), onEnd: () => setListening(false), onDenied: () => { setListening(false); setFeedback('The microphone is unavailable. Tap a picture or sound instead.'); } });
  };
  const family = families.find(f => f.id === active);
  const words = family?.content.words || [];
  const shown = words[index % Math.max(words.length, 1)];
  const target = round?.visual;
  const refresh = async (l = learner) => {
    const data = await rpc('hk_reading_catalog', { p_token: l.token });
    if (!Array.isArray(data)) throw new Error('Reading families could not be loaded.');
    setFamilies(data);
  };
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let l = learner;
        if (!l) { const result = await createLearner('K'); l = { ...result, name: 'Reader' }; saveLearner(l); }
        if (!cancelled) { setLearner(l); await refresh(l); }
      } catch (e) { if (!cancelled) setError(e.message); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; stopSpeaking(); stopListening(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const loadRound = async () => {
    if (!learner) return;
    setLoading(true); setError(''); setSolved(false); setHelp(null); setHighlight(0);
    try {
      const data = await rpc('hk_reading_round', { p_token: learner.token, p_unit: active, p_mode: mode });
      if (!data.attempt_id || !data.visual || !Array.isArray(data.choices)) throw new Error('The reading question is incomplete.');
      setRound(data); setHelp(data.help);
      const instruction = mode === 'explore' ? 'Flip a beginning sound. Listen, then blend the word.' : data.say;
      setFeedback(instruction); voice.say(instruction);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(() => { if (learner && families.length) loadRound(); }, [learner, active, mode]); // eslint-disable-line react-hooks/exhaustive-deps
  const choose = async (choice) => {
    if (busy.current || solved || !round) return;
    busy.current = true; setError('');
    try {
      const result = await submitAnswer(learner.token, round.attempt_id, choice);
      if (result.correct) {
        setSolved(true); sfx.correct();
        const message = result.newly_mastered ? 'You learned this word family! A new family is ready.' : `You matched ${target.word}! ${help ? 'Now try another on your own.' : 'Great independent practice!'}`;
        setFeedback(message); voice.say(`${target.word}. ${message}`); await refresh();
      } else {
        setHelp(result.help); setFeedback('Good effort. Let’s listen to the beginning sound again.');
        setHighlight(1); voice.say(target.sound);
      }
    } catch (e) { setError(e.message); } finally { busy.current = false; }
  };
  const askHelp = async () => {
    if (!round || solved || busy.current) return;
    busy.current = true;
    try {
      const result = await getHelp(learner.token, round.attempt_id);
      setHelp(result.help);
      const level = result.help?.level || 1;
      setHighlight(level === 1 ? 1 : 2);
      const message = level === 1 ? target.sound : level === 2 ? `Listen to the ending: ${target.rime}. Now join the beginning sound to it.` : `${target.sound} Then ${target.rime}. Together they make ${target.word}. Try the smaller choice set, then try the next word independently.`;
      setFeedback(message); voice.say(message);
    } catch (e) { setError(e.message); } finally { busy.current = false; }
  };
  const exploreDone = async () => {
    if (busy.current || !round) return;
    busy.current = true;
    try { await submitAnswer(learner.token, round.attempt_id, target.onset); await refresh(); setMode('build'); }
    catch (e) { setError(e.message); } finally { busy.current = false; }
  };
  return <PageShell testId="word-family-game">
    <div className="mx-auto max-w-4xl pb-12">
      <header className="flex items-center justify-between gap-4"><ToyButton color="white" onClick={() => navigate('/world/read-and-shine')}><ArrowLeft /> Read & Shine</ToyButton><ToyButton color="white" onClick={() => { voice.stop(); stopSpeaking(); setPaused(true); }}><Pause /> Break</ToyButton></header>
      <div className="my-6 text-center"><span className="rounded-full bg-hc-sun px-4 py-1 font-bold">NEW · Sample phonics content</span><h1 className="mt-4 font-fredoka text-3xl font-bold sm:text-5xl">Word Family Flip & Build</h1><p className="mt-2 font-bold">Flip it. Build it. Sound it. Read it!</p></div>
      {error && <div role="alert" className="mb-4 rounded-2xl bg-hc-corallight p-4 font-bold">{error}<ToyButton color="white" className="ml-4" onClick={() => learner ? loadRound() : window.location.reload()}>Try again</ToyButton></div>}
      {!family && loading && <p role="status">Opening your reading book…</p>}
      <FamilyTabs families={families} active={active} select={id => { setIndex(0); setActive(id); }} />
      {family && <>
        <p className="my-4 text-center text-sm font-bold">{family.content.grade} · {family.content.level} · {family.content.concept}</p>
        <nav className="mb-6 flex flex-wrap justify-center gap-2" aria-label="Reading modes">{Object.entries(MODES).map(([id,label]) => <ToyButton key={id} color={mode === id ? 'mint' : 'white'} aria-pressed={mode === id} onClick={() => setMode(id)}>{label}</ToyButton>)}</nav>
        <div className="mb-6 flex items-center gap-4 rounded-2xl border-[3px] border-hc-navy bg-hc-sunlight p-4"><Character name="hoppy" mood={solved ? 'celebrate' : 'talking'} className="w-16 shrink-0" /><p aria-live="polite" className="flex-1 font-bold">{feedback}</p><button onClick={() => voice.say(feedback)} aria-label="Replay instruction" className="toy-focus rounded-xl bg-white p-3"><Volume2 /></button></div>
        {loading ? <p role="status">Turning the page…</p> : mode === 'explore' && shown ? <>
          <ReadingBook word={shown} rime={family.content.rime} flip={delta => { setIndex((index + delta + words.length) % words.length); sfx.tap(); }} hear={voice.say} />
          <div className="mt-6 flex flex-wrap justify-center gap-4"><ToyButton color="sky" onClick={() => voice.say(`${shown.sound} The ending: ${family.content.ending_cue}. Together: ${shown.word}.`)}>Sound it & blend it</ToyButton><ToyButton color="mint" onClick={exploreDone}>Try building a word</ToyButton></div>
        </> : target && <section className="toy-card p-6 text-center">
          <h2 className="font-fredoka text-2xl font-bold">{mode === 'match' ? 'Read it. Find its picture.' : mode === 'challenge' ? 'Discover every word in this family!' : 'Which beginning builds this word?'}</h2>
          {mode === 'match' ? <p className="my-6 font-fredoka text-6xl font-bold">{target.word}</p> : <><span role="img" aria-label={target.word} className="my-6 block text-8xl">{target.picture}</span>{target.meaning && <p className="font-bold">{target.meaning}</p>}<p className="mb-6 font-fredoka text-5xl font-bold"><span className={highlight === 1 ? 'bg-hc-sun' : ''}>?</span> + <span className={highlight === 2 ? 'bg-hc-sun' : ''}>{target.rime}</span></p></>}
          {mode === 'match' ? <PictureChoices words={words} choose={choose} disabled={solved} limit={help?.choices} /> : <div className="flex flex-wrap justify-center gap-4">{round.choices.filter(c => !help?.choices || help.choices.includes(c)).map(c => <ToyButton key={c} color="sky" className="min-h-20 min-w-20 text-4xl" disabled={solved} onClick={() => choose(c)}>{c}</ToyButton>)}</div>}
          <div className="mt-6 flex flex-wrap justify-center gap-4"><ToyButton color="sun" disabled={solved} onClick={askHelp}><Lightbulb /> Help me{help && ` · ${help.level}/3`}</ToyButton><ToyButton color="white" disabled={!recognitionSupported()} onClick={readAloud}><Mic /> Read aloud</ToyButton>{solved && <ToyButton color="mint" onClick={loadRound}>Next word</ToyButton>}</div>
          <p className="mt-4 text-sm font-bold">Voice practice is optional and never graded. You can always tap instead.</p>{listening && <ToyButton color="white" onClick={() => { stopListening(); setListening(false); }}>Stop listening</ToyButton>}
        </section>}
        <p className="mt-6 text-center font-bold">{family.status === 'mastered' ? 'Family learned!' : `${family.best} / ${family.target} independent stars`} · {family.built} built · {family.read} reading matches · {family.assisted} supported tries</p>
        <p className="mt-2 text-center text-sm">Progress is saved to your learner. No timer. Repeat any unlocked family whenever you like.</p>
      </>}
    </div>
    <Modal open={paused} onClose={() => setPaused(false)} testId="reading-break"><h2 className="font-fredoka text-3xl font-bold">A little reading break</h2><p className="my-4 font-bold">Stretch, take a breath, and come back when you feel ready. Your unfinished question is saved.</p><ToyButton color="mint" onClick={() => setPaused(false)}>Keep reading</ToyButton></Modal>
  </PageShell>;
}
