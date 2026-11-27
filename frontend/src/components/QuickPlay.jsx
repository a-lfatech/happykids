import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ToyButton } from "./ToyButton";
import { Confetti } from "./Confetti";
import { shuffleItems } from "../games/logic";
import { sfx } from "../lib/audioManager";

const ANIMALS = [["cat","🐈"],["dog","🐕"],["frog","🐸"],["fish","🐟"],["bee","🐝"],["mouse","🐭"],["rabbit","🐇"],["bird","🐦"],["bear","🐻"]];
const GROUPS = [
  { label: "fruit", items: [["apple","🍎"],["pear","🍐"],["banana","🍌"],["orange","🍊"]], odd: ANIMALS },
  { label: "animals", items: ANIMALS, odd: [["car","🚗"],["bus","🚌"],["boat","⛵"]] },
  { label: "vehicles", items: [["car","🚗"],["bus","🚌"],["boat","⛵"],["train","🚂"]], odd: [["apple","🍎"],["cake","🍰"],["banana","🍌"]] },
];
export function QuickPlay({ kind, say, onDone, onExit = onDone, onRoundComplete, rounds = 3 }) {
  const [round, setRound] = useState(0);
  const [peek, setPeek] = useState(true);
  const [solved, setSolved] = useState(false);
  const [steps, setSteps] = useState(0);
  const [message, setMessage] = useState("");
  const [deck] = useState(() => shuffleItems(GROUPS));
  const challenge = useMemo(() => {
    const animals = shuffleItems(ANIMALS);
    const group = deck[round % deck.length];
    const odd = shuffleItems(group.odd)[0];
    return { animals: animals.slice(0,3), hidden: animals[Math.floor(Math.random()*3)], choices: shuffleItems(animals.slice(0,4)), sequence: animals.slice(0,round % 2 + 2), odd, group, detectives: shuffleItems([...shuffleItems(group.items).slice(0,3),odd]) };
  }, [round, deck]);
  const title = kind === "memory-peek" ? "Who Hid?" : kind === "sound-trail" ? "Sound Safari" : "Little Detective";
  const trail = challenge.sequence.map(a => a[0]).join(" ... ");
  useEffect(() => { say(kind === "memory-peek" ? "Look at these animals. When you are ready, let one hide!" : kind === "sound-trail" ? `Follow this trail: ${trail}` : "One picture does not belong. Can you find it?"); }, [round,kind]); // eslint-disable-line react-hooks/exhaustive-deps
  const win = text => { if (solved) return; setSolved(true); onRoundComplete?.(round); sfx.fanfare(); setMessage(text); say(text); };
  const tap = animal => {
    if (solved) return;
    sfx.pop();
    if (kind === "sound-trail") {
      if (animal[0] === challenge.sequence[steps][0]) {
        setSteps(s => s+1);
        if (steps+1 === challenge.sequence.length) win("You followed the whole trail! Amazing listening!");
        else { setMessage("Great! Find the next animal."); say("Great! Find the next animal."); }
      } else { setSteps(0); setMessage("Let's try the trail again. No rush!"); say(`Let's try again: ${trail}`); }
    } else if (animal[0] === (kind === "memory-peek" ? challenge.hidden[0] : challenge.odd[0])) win(kind === "memory-peek" ? `You found ${animal[0]}! What a brilliant memory!` : `Yes! ${animal[0]} is not one of the ${challenge.group.label}. Super detective!`);
    else { setMessage("Have another look. You've got this!"); say("Have another look. You've got this!"); }
  };
  const next = () => { if (round+1 === rounds) { onDone(); return; } setRound(r => r+1); setPeek(true); setSolved(false); setSteps(0); setMessage(""); };
  return <section className="learning-play relative">
    {solved && <div className="pointer-events-none absolute inset-0 overflow-hidden"><Confetti count={24} /></div>}
    <div className="play-heading"><h2 className="font-fredoka">{title}</h2><span>{round+1} / {rounds}</span></div>
    <p className="play-prompt">{kind === "memory-peek" ? peek ? "Remember these three friends." : "Who is hiding?" : kind === "sound-trail" ? `Trail: ${trail} · ${steps}/${challenge.sequence.length}` : "Which picture does not belong?"}</p>
    {kind === "memory-peek" && <div className="play-options">{challenge.animals.map(a => <div key={a[0]} className="play-option"><span>{peek || solved || a[0] !== challenge.hidden[0] ? a[1] : "?"}</span>{peek || solved || a[0] !== challenge.hidden[0] ? a[0] : "hidden"}</div>)}</div>}
    {kind === "memory-peek" && peek ? <ToyButton color="sun" onClick={() => { setPeek(false); say("One friend is hiding! Who is it?"); }}>Ready! Let one hide</ToyButton> : <div className="play-options">{(kind === "odd-one" ? challenge.detectives : challenge.choices).map(a => <motion.button key={a[0]} type="button" whileTap={{scale:0.85}} disabled={solved} className="toy-focus play-option" onClick={() => tap(a)}><span>{a[1]}</span><strong>{a[0]}</strong></motion.button>)}</div>}
    {!solved && kind === "sound-trail" && <ToyButton color="sky" onClick={() => { setSteps(0); say(trail); }}>Listen to the trail again</ToyButton>}
    {!solved && kind === "memory-peek" && !peek && <button className="toy-focus underline font-bold" onClick={() => setPeek(true)}>Peek again</button>}
    <p className="play-message" role="status">{message}</p>
    {solved ? <ToyButton color="mint" onClick={next}>{round+1 === rounds ? "Next adventure" : "Another surprise!"}</ToyButton> : <button className="toy-focus underline font-bold" onClick={onExit}>Choose something else</button>}
  </section>;
}
