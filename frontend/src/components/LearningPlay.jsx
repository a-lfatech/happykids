import { useEffect, useState } from "react";
import { ToyButton } from "./ToyButton";
import { sfx } from "../lib/audioManager";

export const PLAY_GAMES = [
  { id: "rhymes", title: "Rhyming Words", note: "Find words with the same ending sound." },
  { id: "rhyme-match", title: "Find & Match Rhymes", note: "Tap two pictures whose words rhyme." },
  { id: "shapes", title: "Shape Connections", note: "Find shapes in everyday objects." },
  { id: "corners", title: "Counting Corners", note: "Tap the corners, then choose how many." },
  { id: "fish", title: "F is for Fish", note: "Decorate a fish with repeating colours." },
  { id: "patterns", title: "Pattern Fish", note: "Roll a die and follow its colour pattern." },
];
const RHYMES = [
  ["cat", "hat", "sun", "dog", "🐈", "🎩", "☀️", "🐕"],
  ["boat", "goat", "cake", "star", "⛵", "🐐", "🍰", "⭐"],
  ["clock", "lock", "fish", "ball", "🕰️", "🔒", "🐟", "⚽"],
  ["pan", "fan", "book", "tree", "🍳", "🪭", "📕", "🌳"],
  ["log", "frog", "hat", "moon", "🪵", "🐸", "🎩", "🌙"],
  ["car", "star", "cat", "sun", "🚗", "⭐", "🐈", "☀️"],
];
const SHAPES = [
  { name: "circle", object: "a round clock", picture: "🕰️", points: [] },
  { name: "triangle", object: "a triangular roof", picture: "🏠", points: [[50,12],[12,88],[88,88]] },
  { name: "square", object: "a square gift box", picture: "🎁", points: [[15,15],[85,15],[85,85],[15,85]] },
  { name: "rectangle", object: "a rectangular book", picture: "📕", points: [[10,25],[90,25],[90,75],[10,75]] },
  { name: "oval", object: "an oval egg", picture: "🥚", points: [] },
  { name: "hexagon", object: "a honeycomb cell", picture: "🍯", points: [[25,12],[75,12],[95,50],[75,88],[25,88],[5,50]] },
];
const COLORS = ["#ed6067", "#68bc86", "#58aee6"];
const PATTERNS = [[0,1],[1,2],[0,0,2],[0,1,1],[0,0,1,1],[0,1,2]];
export function Shape({ name, marked = [], onCorner }) {
  const shape = SHAPES.find(s => s.name === name);
  return <svg viewBox="0 0 100 100" className="play-shape" aria-label={name} role="img">
    {name === "circle" ? <circle cx="50" cy="50" r="38" fill="#fff1b5" stroke="#1f2547" strokeWidth="3" /> : name === "oval" ? <ellipse cx="50" cy="50" rx="42" ry="28" fill="#d5efff" stroke="#1f2547" strokeWidth="3" /> : <polygon points={shape.points.map(p => p.join(",")).join(" ")} fill="#d5f5e5" stroke="#1f2547" strokeWidth="3" />}
    {onCorner && shape.points.map(([x,y],i) => <g key={i} role="button" tabIndex="0" aria-label={`Corner ${i+1}`} onClick={() => onCorner(i)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") onCorner(i); }}>
      <circle cx={x} cy={y} r="8" fill={marked.includes(i) ? "#ffb94b" : "white"} stroke="#1f2547" strokeWidth="2" />
      <text x={x} y={y+3} fontSize="9" textAnchor="middle" fill="#1f2547">{marked.includes(i) ? marked.indexOf(i)+1 : "•"}</text>
    </g>)}
  </svg>;
}
function ShapeObject({ name }) {
  return <svg viewBox="0 0 140 100" className="shape-object-scene" role="img" aria-label={SHAPES.find(s => s.name === name).object}>
    {name === "circle" && <><circle cx="70" cy="50" r="37" fill="#fff1b5" stroke="#1f2547" strokeWidth="3" /><path d="M70 24V50L90 62" fill="none" stroke="#1f2547" strokeWidth="4" /><text x="70" y="21" textAnchor="middle" fontSize="10">12</text><text x="70" y="85" textAnchor="middle" fontSize="10">6</text></>}
    {name === "triangle" && <><rect x="40" y="54" width="60" height="40" fill="#ffd38c" stroke="#1f2547" strokeWidth="3" /><path d="M70 8L18 57H122Z" fill="#ef7976" stroke="#1f2547" strokeWidth="3" /><rect x="60" y="66" width="20" height="28" fill="#1f2547" /></>}
    {name === "square" && <><rect x="32" y="12" width="76" height="76" rx="2" fill="#58aee6" stroke="#1f2547" strokeWidth="3" /><path d="M70 12V88M32 50H108" stroke="#ffd16a" strokeWidth="10" /><path d="M70 17Q35 -1 47 22L70 27Q108 7 88 5Z" fill="#ffd16a" stroke="#1f2547" strokeWidth="2" /></>}
    {name === "rectangle" && <><rect x="15" y="20" width="110" height="65" rx="4" fill="#68bc86" stroke="#1f2547" strokeWidth="3" /><path d="M28 20V85M45 40H107M45 52H100M45 64H90" stroke="#1f2547" strokeWidth="3" /></>}
    {name === "oval" && <ellipse cx="70" cy="50" rx="27" ry="42" fill="#fff1d5" stroke="#1f2547" strokeWidth="3" />}
    {name === "hexagon" && <polygon points="45,10 95,10 120,50 95,90 45,90 20,50" fill="#ffd16a" stroke="#1f2547" strokeWidth="4" />}
  </svg>;
}
function PatternFish({ colors }) {
  return <svg viewBox="0 0 360 180" className="pattern-fish" role="img" aria-label="Fish with coloured pattern scales">
    <path d="M280 90L340 35L326 90L340 145Z" fill="#ffd16a" stroke="#1f2547" strokeWidth="4" />
    <ellipse cx="166" cy="90" rx="135" ry="72" fill="#fff5d5" stroke="#1f2547" strokeWidth="4" />
    {colors.map((c,i) => <ellipse key={i} cx={90+i*31} cy="90" rx="13" ry="45" fill={COLORS[c]} stroke="#1f2547" strokeWidth="2" />)}
    <circle cx="53" cy="66" r="12" fill="white" stroke="#1f2547" strokeWidth="3" /><circle cx="50" cy="66" r="5" fill="#1f2547" />
    <path d="M33 96Q46 112 60 97" fill="none" stroke="#1f2547" strokeWidth="3" />
  </svg>;
}
export function LearningPlay({ kind, say, onDone, onExit = onDone, onRoundComplete, rounds = 3 }) {
  const [round, setRound] = useState(0);
  const [solved, setSolved] = useState(false);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState([]);
  const [marked, setMarked] = useState([]);
  const [die, setDie] = useState(null);
  const [scales, setScales] = useState([]);
  const [custom, setCustom] = useState(false);
  const game = PLAY_GAMES.find(g => g.id === kind) || PLAY_GAMES[0];
  const rhyme = RHYMES[round % RHYMES.length];
  const shape = SHAPES[round % SHAPES.length];
  const pattern = PATTERNS[kind === "fish" ? round % PATTERNS.length : (die || 1)-1];
  useEffect(() => { say(game.note); }, [kind]); // eslint-disable-line react-hooks/exhaustive-deps
  const answer = (correct, explanation) => {
    if (solved) return;
    if (correct) { onRoundComplete?.(round); setSolved(true); sfx.correct(); sfx.sparkle(); setMessage(explanation); say(explanation); }
    else { sfx.tap(); setMessage("Try another one. You can do it!"); say("Try another one. You can do it!"); }
  };
  const next = () => {
    if (round+1 >= rounds) { onDone(); return; }
    setRound(r => r+1); setSolved(false); setMessage(""); setSelected([]); setMarked([]); setDie(null); setScales([]);
  };
  const color = c => {
    if (solved || (kind === "patterns" && !die)) return;
    const expected = pattern[scales.length % pattern.length];
    if (!custom && c !== expected) { say("Look at the guide. Which colour comes next?"); return; }
    const updated = [...scales,c]; setScales(updated); sfx.place();
    if (updated.length === 6) answer(true, custom ? "Your own colourful fish!" : "You followed the pattern! Beautiful fish!");
  };
  const pair = i => {
    if (solved) return;
    say(rhyme[i]);
    const picked = selected.includes(i) ? selected.filter(x => x!==i) : [...selected,i];
    setSelected(picked);
    if (picked.length===2) { answer(picked.includes(0) && picked.includes(1), `${rhyme[0]} and ${rhyme[1]} rhyme! They have the same ending sound.`); setSelected([]); }
  };
  return <section className="learning-play">
    <div className="play-heading"><h2 className="font-fredoka">{game.title}</h2><span>{round+1} / {rounds}</span></div>
    <p className="play-prompt">{kind === "rhymes" ? `What rhymes with ${rhyme[0]}?` : kind === "rhyme-match" ? "Tap two rhyming pictures." : kind === "shapes" ? `Which shape is like ${shape.object}?` : kind === "corners" ? `Count the corners of a ${shape.name}.` : "Add six colour scales to your fish."}</p>
    {(kind === "rhymes" || kind === "rhyme-match") && <>
      {kind === "rhymes" && <button className="rhyme-target toy-focus" onClick={() => say(rhyme[0])}><span>{rhyme[4]}</span>{rhyme[0]}</button>}
      <div className="play-options">{(kind === "rhymes" ? [[1,2,3],[2,1,3],[2,3,1]][round%3] : [0,2,1,3]).map(i => <button key={i} disabled={solved} aria-pressed={selected.includes(i)} className={`toy-focus play-option ${selected.includes(i) ? "selected" : ""}`} onClick={() => kind === "rhymes" ? answer(i===1, `${rhyme[0]} and ${rhyme[1]} rhyme!`) : pair(i)}><span>{rhyme[i+4]}</span><strong>{rhyme[i]}</strong></button>)}</div>
    </>}
    {kind === "shapes" && <><div className="play-object"><ShapeObject name={shape.name} /><small>{shape.object}</small></div><div className="play-options">{[shape.name,...SHAPES.filter(s => s.name!==shape.name).slice(round%3,round%3+2).map(s => s.name)].sort().map(name => <button className="toy-focus play-option" disabled={solved} key={name} onClick={() => answer(name===shape.name, `Yes! ${shape.object} has a ${shape.name} shape.`)}><Shape name={name} /><strong>{name}</strong></button>)}</div></>}
    {kind === "corners" && <><Shape name={shape.name} marked={marked} onCorner={i => { if (!marked.includes(i)) { setMarked([...marked,i]); say(String(marked.length+1)); } }} /><div className="play-options">{[...new Set([shape.points.length,Math.max(1,shape.points.length-1),shape.points.length+1])].sort((a,b)=>a-b).map(n => <ToyButton key={n} disabled={solved} color="sun" onClick={() => answer(n===shape.points.length, `${shape.name} has ${n} corners!`)}>{n}</ToyButton>)}</div></>}
    {(kind === "fish" || kind === "patterns") && <>
      {kind === "patterns" && <div className="fish-guide"><ToyButton color="sun" onClick={() => { const d=1+Math.floor(Math.random()*6); setDie(d); setScales([]); setSolved(false); say(`You rolled ${d}. Follow the colour guide.`); }} disabled={solved}>Roll die {die && `: ${die}`}</ToyButton><button className="toy-focus rounded-xl bg-white px-2 py-1 font-bold" disabled={solved} onClick={() => { setCustom(c => !c); setScales([]); }}>{custom ? "Use guide" : "Create my own"}</button></div>}
      {(kind === "fish" || die) && <div className="fish-guide" aria-label="Colour pattern guide">{pattern.map((c,i) => <span key={i} style={{background:COLORS[c]}}>{["Red","Green","Blue"][c]}</span>)}<strong>repeat</strong></div>}
      <PatternFish colors={scales} />
      <div className="play-options">{COLORS.map((c,i) => <button key={c} className="toy-focus play-color" style={{background:c}} disabled={solved} onClick={() => color(i)}>{["Red","Green","Blue"][i]}</button>)}</div>
      {kind === "patterns" && <details className="pattern-guide-table"><summary>Dice to pattern guide</summary>{PATTERNS.map((p,i) => <div key={i}>{i+1}: {p.map(c => ["Red","Green","Blue"][c]).join(" · ")}</div>)}</details>}
    </>}
    <p className="play-message" role="status">{message}</p>
    {solved ? <ToyButton color="mint" onClick={next}>{round+1===rounds ? "Next adventure" : "Next game"}</ToyButton> : <button className="toy-focus rounded-xl px-3 py-2 font-bold underline" onClick={onExit}>Choose something else</button>}
  </section>;
}
