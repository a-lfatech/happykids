import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { ToyButton } from "./ToyButton";

export function ReadingBook({ word, rime, flip, hear, highlight, reveal = true }) {
  const reduced = useReducedMotion();
  return <div className="mx-auto max-w-xl" style={{ perspective: 900 }}>
    <div className="relative grid grid-cols-2 gap-2 rounded-3xl border-[3px] border-hc-navy bg-hc-cream p-4 pt-8 shadow-lg">
      <div className="absolute inset-x-8 top-0 flex justify-around" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <span key={i} className="h-8 w-3 rounded-full border-[3px] border-hc-navy bg-white" />)}</div>
      <motion.button key={word.word} initial={reduced ? false : { rotateX: -65, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} transition={{ duration: .3 }} onClick={() => hear(word.sound)} className={`toy-focus min-h-36 rounded-2xl border-[3px] border-hc-navy bg-hc-skylight p-4 font-fredoka text-6xl font-bold sm:text-8xl ${highlight === 1 ? 'ring-4 ring-hc-sun' : ''}`} style={{ transformOrigin: 'top' }} aria-label={`Hear beginning sound ${word.onset}`}>{word.onset}</motion.button>
      <button onClick={() => hear(`The ending sounds like ${rime}.`)} className={`toy-focus min-h-36 rounded-2xl border-[3px] border-hc-navy bg-hc-mintlight p-4 font-fredoka text-6xl font-bold sm:text-8xl ${highlight === 2 ? 'ring-4 ring-hc-sun' : ''}`} aria-label={`Hear ending ${rime}`}>{rime}</button>
    </div>
    <div className="mt-4 flex items-center justify-between gap-4">
      <ToyButton color="white" onClick={() => flip(-1)} aria-label="Previous beginning sound"><ChevronLeft /></ToyButton>
      <p className="text-center font-fredoka text-3xl font-bold">{reveal ? word.word : 'Join the sounds'}</p>
      <ToyButton color="white" onClick={() => flip(1)} aria-label="Next beginning sound"><ChevronRight /></ToyButton>
    </div>
    {reveal && <button onClick={() => hear(word.word)} className="toy-focus mx-auto mt-4 flex items-center gap-3 rounded-2xl bg-white p-4 text-lg font-bold"><span role="img" aria-label={word.meaning || word.word} className="text-6xl">{word.picture}</span><Volume2 /> Hear {word.word}</button>}
  </div>;
}

export function FamilyTabs({ families, active, select }) {
  return <div className="flex flex-wrap justify-center gap-2" aria-label="Word families">{families.map(f => <button key={f.id} disabled={f.status === 'locked'} onClick={() => select(f.id)} aria-pressed={active === f.id} className={`toy-focus rounded-xl border-[3px] border-hc-navy px-4 py-2 font-fredoka text-xl font-bold ${active === f.id ? 'bg-hc-sun' : 'bg-white'} disabled:opacity-50`}>-{f.content.rime} {f.status === 'locked' ? '· Locked' : f.status === 'mastered' ? '· Learned' : ''}</button>)}</div>;
}

export function PictureChoices({ words, choose, disabled, limit }) {
  return <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">{words.filter(w => !limit || limit.includes(w.word)).map(w => <button key={w.word} disabled={disabled} onClick={() => choose(w.word)} className="toy-focus rounded-2xl border-[3px] border-hc-navy bg-white p-4 disabled:opacity-60" aria-label={w.meaning || w.word}><span className="text-6xl" role="img" aria-label={w.meaning || w.word}>{w.picture}</span>{w.meaning && <span className="mt-2 block text-sm font-bold">{w.meaning}</span>}</button>)}</div>;
}
