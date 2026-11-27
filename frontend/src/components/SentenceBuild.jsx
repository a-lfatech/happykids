import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { Volume2, Star } from "lucide-react";
import { ToyButton } from "./ToyButton";
import { WordPicture } from "./WordPicture";

export function sentenceParts(sentence, word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`\\b${escaped}\\b`, "i").exec(sentence);
  return match ? [sentence.slice(0,match.index),match[0],sentence.slice(match.index+match[0].length)] : ["",word,sentence];
}
export function SentenceBuild({ target, attempt, choices, solved, praise, choose, next, say, stageCount, shake }) {
  const reduced = useReducedMotion();
  const sentence = target.meaning || target.word;
  const [before, word, after] = sentenceParts(sentence, target.word);
  return <LayoutGroup id={`sentence-${attempt}`}><section className="reading-round sentence-round">
    <h2 className="reading-round-title font-fredoka" aria-live="polite">{solved ? `${praise} You made a sentence!` : "Pop the missing word into place!"}</h2>
    <div className="sentence-picture"><WordPicture word={target.word} picture={target.picture} /></div>
    <p className="sentence-line font-fredoka" aria-label={solved ? sentence : `${before} blank ${after}`}>
      {before}{solved ? <motion.span layoutId={`word-${target.word}`} className="sentence-answer" transition={reduced ? {duration:0} : {type:"spring",stiffness:180,damping:18}}>{word}</motion.span> : <span className="sentence-blank" aria-hidden="true">?</span>}{after}
    </p>
    {solved ? <div className="sentence-actions"><ToyButton color="sky" onClick={() => say(`Let's read it together. ${sentence}`)}><Volume2 className="h-5 w-5" /> Read the whole sentence</ToyButton><ToyButton color="mint" onClick={next}><Star className="h-5 w-5" /> {stageCount >= 3 ? "I've read it! Next adventure" : "I've read it! Next word"}</ToyButton></div> : <div className="reading-letter-choices">{choices.map(c => <motion.button key={c} layoutId={`word-${c}`} type="button" whileTap={{scale:0.9}} animate={shake===c ? {x:[0,-8,8,0]} : {}} onClick={() => choose(c)} className="toy-focus bg-hc-sky font-fredoka font-bold">{c}</motion.button>)}</div>}
  </section></LayoutGroup>;
}
