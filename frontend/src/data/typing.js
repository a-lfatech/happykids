export const FINGERS = {
  lp: { label: "Left pinky", color: "bg-hc-coral" },
  lr: { label: "Left ring", color: "bg-hc-tang" },
  lm: { label: "Left middle", color: "bg-hc-sun" },
  li: { label: "Left pointer", color: "bg-hc-mint" },
  ri: { label: "Right pointer", color: "bg-hc-sky" },
  rm: { label: "Right middle", color: "bg-hc-sun" },
  rr: { label: "Right ring", color: "bg-hc-tang" },
  rp: { label: "Right pinky", color: "bg-hc-coral" },
  th: { label: "Thumb", color: "bg-white" },
};

export const KEY_ROWS = [
  [["q", "lp"], ["w", "lr"], ["e", "lm"], ["r", "li"], ["t", "li"], ["y", "ri"], ["u", "ri"], ["i", "rm"], ["o", "rr"], ["p", "rp"]],
  [["a", "lp"], ["s", "lr"], ["d", "lm"], ["f", "li"], ["g", "li"], ["h", "ri"], ["j", "ri"], ["k", "rm"], ["l", "rr"], [";", "rp"]],
  [["z", "lp"], ["x", "lr"], ["c", "lm"], ["v", "li"], ["b", "li"], ["n", "ri"], ["m", "ri"], [",", "rm"], [".", "rr"], ["/", "rp"]],
];

export const fingerOf = (ch) => {
  if (ch === " ") return "th";
  const k = ch === "?" ? "/" : ch.toLowerCase();
  for (const row of KEY_ROWS) for (const [key, f] of row) if (key === k) return f;
  return null;
};

export const TYPING_LESSONS = [
  { id: "home-1", title: "Home Row: F and J", emoji: "🏠", keys: "fj", tip: "Find the little bumps on F and J. Rest your pointer fingers there!", text: "f j f j ff jj fj jf fff jjj fj fj jjf ffj" },
  { id: "home-2", title: "Home Row: D and K", emoji: "🏡", keys: "dkfj", tip: "Middle fingers sit on D and K.", text: "d k d k dd kk dk kd fd jk dfj kjf fdk jkd" },
  { id: "home-3", title: "Home Row: S and L", emoji: "🌳", keys: "slfjdk", tip: "Ring fingers rest on S and L.", text: "s l sl ls sd lk fsl jls sdf lkj dsl kls" },
  { id: "home-4", title: "Home Row: A and ;", emoji: "🌈", keys: "asdfjkl;", tip: "Little pinky fingers press A and the ; key.", text: "a ; as ;l sad lad fad jak ask a lass; a lad" },
  { id: "home-5", title: "Home Row Words", emoji: "⭐", keys: "asdfghjkl", tip: "G and H are just one stretch from your pointers.", text: "had gas dad lag hall glad flash sash half dash" },
  { id: "top-1", title: "Top Row: E and I", emoji: "🦉", keys: "ei", tip: "Reach up with your middle fingers for E and I.", text: "e i ie ei fed kid lid hide side like file dies" },
  { id: "top-2", title: "Top Row: R, T, U, Y", emoji: "🚀", keys: "rtuy", tip: "Pointer fingers stretch up to R, T, Y and U.", text: "rut try tug yet sky fur jet stay tiger tray" },
  { id: "top-3", title: "Top Row: Q, W, O, P", emoji: "🐧", keys: "qwop", tip: "Pinky and ring fingers reach for Q, W, O and P.", text: "pop owl wow quip top hop wipe word quote power" },
  { id: "bottom-1", title: "Bottom Row: C, V, N, M", emoji: "🐢", keys: "cvnm", tip: "Curl your fingers down for the bottom row.", text: "can man vim cave move name mice van come numb" },
  { id: "bottom-2", title: "Bottom Row: Z, X, B, ,", emoji: "🦓", keys: "zxb,", tip: "Z and X are pinky and ring finger jobs.", text: "box zoo fox, buzz, zebra, bat, six, fizz, bump" },
  { id: "words-1", title: "Sight Words", emoji: "📚", keys: "", tip: "These words appear in almost every book!", text: "the and you said was come here they play look like what" },
  { id: "sent-1", title: "Silly Sentences", emoji: "😂", keys: "", tip: "Use your thumb for the space bar.", text: "the frog sat on a log. a fox can jump. we like to read and play." },
];

export const lessonById = (id) => TYPING_LESSONS.find((l) => l.id === id);

export const TEST_PASSAGES = [
  "the sun is up and the sky is blue. hoppy the bunny hops to the park to play with his friends.",
  "ellie likes to paint big red flowers. finn the fox can solve any puzzle in a flash.",
  "sunny reads a story under the old oak tree. froggy jumps in the pond and makes a big splash.",
  "we can count the stars at night. one, two, three, four, five. how many can you see?",
  "a little seed grows into a tall tree. it needs water, sun and lots of time to grow.",
];

export const RAIN_WORDS = {
  1: ["a", "s", "d", "f", "j", "k", "l", "g", "h", "e", "i", "r", "u"],
  2: ["cat", "dog", "sun", "hop", "fun", "red", "big", "map", "jam", "fox", "bee", "egg", "hat", "kid", "log"],
  3: ["frog", "jump", "star", "play", "book", "fish", "tree", "milk", "cake", "duck", "bird", "rain", "snow", "lion"],
  4: ["happy", "bunny", "zebra", "apple", "tiger", "music", "plant", "smile", "cloud", "river", "dance", "paint"],
};

const KEY = "hk_typing_v1";

export const loadTyping = () => {
  try { return { lessons: {}, best: 0, rainBest: 0, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
  catch { return { lessons: {}, best: 0, rainBest: 0 }; }
};

const save = (s) => localStorage.setItem(KEY, JSON.stringify(s));

export const starsFor = (wpm, acc) => (acc >= 95 && wpm >= 12 ? 3 : acc >= 90 ? 2 : acc >= 75 ? 1 : 0);

export const saveLessonResult = (id, wpm, acc) => {
  const s = loadTyping();
  const prev = s.lessons[id] || { stars: 0, wpm: 0, acc: 0 };
  s.lessons[id] = { stars: Math.max(prev.stars, starsFor(wpm, acc)), wpm: Math.max(prev.wpm, wpm), acc: Math.max(prev.acc, acc) };
  s.best = Math.max(s.best, wpm);
  save(s);
  return s.lessons[id];
};

export const saveTestResult = (wpm) => { const s = loadTyping(); s.best = Math.max(s.best, wpm); save(s); return s.best; };
export const saveRainResult = (score) => { const s = loadTyping(); s.rainBest = Math.max(s.rainBest, score); save(s); return s.rainBest; };
