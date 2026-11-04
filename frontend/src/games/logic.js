// Game 1: five positions, null = blank to fill.
export const MISSING_PUZZLES = [
  { seq: [1, 2, null, null, 5] },
  { seq: [4, 5, null, null, 8] },
  { seq: [7, 6, null, null, 3] },
  { seq: [10, 9, null, null, 6] },
  { seq: [5, null, null, null, 9] },
  { seq: [8, null, null, 5, null] },
];

// Game 2: start number and how many hops (+ more, - less).
export const MORE_LESS_PUZZLES = [
  { start: 6, delta: 1 },
  { start: 5, delta: -2 },
  { start: 4, delta: -1 },
  { start: 7, delta: 2 },
  { start: 3, delta: 1 },
  { start: 9, delta: -2 },
  { start: 4, delta: 2 },
  { start: 10, delta: -1 },
];

export const CHEERS = [
  "Great counting!",
  "Amazing work!",
  "You're a little maths superstar!",
  "Hooray! You got it!",
  "That was clever counting!",
];
export const randomCheer = () => CHEERS[Math.floor(Math.random() * CHEERS.length)];

const WORD = { 1: "one", 2: "two" };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// --- Missing numbers ---
export const sequenceStep = (seq) => {
  const known = seq.map((v, i) => ({ v, i })).filter((k) => k.v != null);
  const a = known[0];
  const b = known[known.length - 1];
  return (b.v - a.v) / (b.i - a.i);
};
export const expectedAt = (seq, i) => {
  const k = seq.findIndex((v) => v != null);
  return seq[k] + sequenceStep(seq) * (i - k);
};
export const mergeValues = (seq, filled) => seq.map((v, i) => (v != null ? v : filled[i] ?? null));
export const isValidSequence = (values, step) =>
  values.every((v) => Number.isInteger(v) && v >= 1 && v <= 10) &&
  values.every((v, i) => i === 0 || v - values[i - 1] === step);
// Index of the blank this number mathematically belongs to, or -1.
export const fitBlank = (seq, filled, n) =>
  seq.findIndex((v, i) => v == null && filled[i] == null && expectedAt(seq, i) === n);
export const isComplete = (seq, filled) => {
  const m = mergeValues(seq, filled);
  return m.every((v) => v != null) && isValidSequence(m, sequenceStep(seq)) && seq.every((v, i) => v == null || m[i] === v);
};
export const spokenSequence = (values) => values.map((v) => (v == null ? "blank" : v)).join(", ");

export const missingHint = (p, filled, n, level) => {
  const step = sequenceStep(p.seq);
  const dir = step > 0 ? "forward" : "backward";
  const m = mergeValues(p.seq, filled);
  const gap = m.findIndex((v) => v == null);
  const before = m[Math.max(gap - 1, 0)];
  if (level <= 1) return `Not quite! You picked ${n}. Let's count together. Start with the number before the empty space. What number comes next?`;
  if (level === 2) return `Good try! Find ${before} and count ${dir} one step. Counting ${dir} means each number gets one ${step > 0 ? "bigger" : "smaller"}. You can do it!`;
  return `Let's count out loud together: ${m.slice(0, gap).join(", ")}... what comes next? Look for it on the number buttons!`;
};

// --- More or less ---
export const answerOf = (p) => p.start + p.delta;
export const relationPhrase = (p) => `${cap(WORD[Math.abs(p.delta)])} ${p.delta > 0 ? "more" : "less"} than ${p.start}`;
export const numberWindow = (p) => {
  const a = answerOf(p);
  const lo = Math.min(p.start, a);
  const hi = Math.max(p.start, a);
  let s = lo - Math.floor((6 - (hi - lo + 1)) / 2);
  s = Math.max(1, Math.min(5, s));
  return Array.from({ length: 6 }, (_, i) => s + i);
};
export const answerChoices = (p) => {
  const a = answerOf(p);
  const sign = Math.sign(p.delta);
  const win = numberWindow(p);
  const cands = [p.start - p.delta, a + sign, p.start, a - sign * 3, a + sign * 2];
  const picks = [];
  for (const c of cands) if (c !== a && win.includes(c) && !picks.includes(c) && picks.length < 2) picks.push(c);
  return [a, ...picks].sort((x, y) => x - y);
};

export const moreLessHint = (p, n, level) => {
  const more = p.delta > 0;
  const hops = Math.abs(p.delta);
  const hopWords = hops === 1 ? "one little hop" : "two little hops";
  if (level <= 1) return `Oops! You selected ${n}. ${more ? "More means hopping forward to the right" : "Less means hopping backward to the left"}. Remember! Find ${p.start} on the number line and take ${hopWords} ${more ? "forward" : "backward"}. One hop at a time. You can do it!`;
  if (level === 2) return `Let's hop together! Put your finger on ${p.start}. Now hop to the ${more ? "right" : "left"}: ${hops === 1 ? "one" : "one, two"}. Where did you land? You've got this!`;
  return `Watch Froggy hop from ${p.start}. Count the hops with me, then tap the box where Froggy lands!`;
};

export const skillOf = (gameId, idx) => {
  if (gameId === "missing-numbers") return sequenceStep(MISSING_PUZZLES[idx].seq) > 0 ? "Counting forward" : "Counting backward";
  const p = MORE_LESS_PUZZLES[idx];
  return `${cap(WORD[Math.abs(p.delta)])} ${p.delta > 0 ? "more" : "less"}`;
};
