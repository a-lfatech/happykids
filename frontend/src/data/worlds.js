import { MISSING_PUZZLES, MORE_LESS_PUZZLES } from "../games/logic";
import { QUIZZES } from "./quizzes";
import { STORIES } from "./stories";

export const GRADE_LEVELS = [
  { id: "K", label: "Kindergarten", ages: "Ages 4-5", color: "bg-hc-sunlight" },
  { id: "G1", label: "Grade 1", ages: "Ages 6-7", color: "bg-hc-mintlight" },
  { id: "G2", label: "Grade 2", ages: "Ages 7-8", color: "bg-hc-skylight" },
  { id: "G3", label: "Grades 3-4", ages: "Ages 8-9", color: "bg-hc-tanglight" },
  { id: "G5", label: "Grades 5-6", ages: "Ages 10-11", color: "bg-hc-lavlight" },
  { id: "G7", label: "Grades 7-8", ages: "Ages 12-14", color: "bg-hc-corallight" },
];

export const FUTURE_WORLDS = [
  { title: "Word Wizards", subject: "Language & Writing", grade: "G1", desc: "Build vocabulary, write sentences and tell stories.", icon: "BookOpen" },
  { title: "World Explorers", subject: "Geography & History", grade: "G3", desc: "Discover countries, cultures and the story of our world.", icon: "Globe" },
  { title: "Brain Power", subject: "Logic & Strategy", grade: "G3", desc: "Advanced puzzles, strategy games and brain teasers.", icon: "Brain" },
  { title: "Code & Create", subject: "Coding & Technology", grade: "G5", desc: "Learn to code, build apps and explore technology.", icon: "Code" },
  { title: "Life Skills Lab", subject: "Financial Literacy", grade: "G5", desc: "Money, budgeting and everyday life skills.", icon: "Coins" },
  { title: "Imagine & Invent", subject: "Innovation & Design", grade: "G7", desc: "Design thinking, entrepreneurship and creative projects.", icon: "Lightbulb" },
];

export const WORLDS = [
  { id: "hop-and-count", num: "01", title: "Hop & Count", subject: "Mathematics", blurb: "Count, calculate and discover the magic of numbers!", icon: "/hk/icon_math.png", character: "froggy", card: "bg-hc-skylight", strong: "bg-hc-sky", badge: { id: "number-explorer", name: "Number Explorer" }, grades: ["K", "G1"] },
  { id: "read-and-shine", num: "02", title: "Read & Shine", subject: "Reading and Phonics", blurb: "Discover letters, sounds, words and wonderful stories!", icon: "/hk/icon_reading.png", character: "hoppy", card: "bg-hc-corallight", strong: "bg-hc-coral", badge: { id: "reading-superstar", name: "Reading Superstar" }, grades: ["K", "G1"] },
  { id: "think-and-play", num: "03", title: "Think & Play", subject: "Critical Thinking", blurb: "Solve puzzles, explore patterns and challenge your little mind!", icon: "/hk/icon_thinking.png", character: "ellie", card: "bg-hc-mintlight", strong: "bg-hc-mint", badge: { id: "puzzle-champion", name: "Puzzle Champion" }, grades: ["K", "G1"] },
  { id: "create-and-explore", num: "04", title: "Create & Explore", subject: "Creativity", blurb: "Draw, colour, imagine and bring your ideas to life!", icon: "/hk/icon_create.png", character: "finn", card: "bg-hc-tanglight", strong: "bg-hc-tang", badge: { id: "creative-genius", name: "Creative Genius" }, grades: ["K", "G1"] },
  { id: "little-discoverers", num: "05", title: "Little Discoverers", subject: "Science", blurb: "Explore nature, animals, the human body and the world around you!", icon: "/hk/icon_science.png", character: "sunny", card: "bg-hc-lavlight", strong: "bg-hc-lav", badge: { id: "little-scientist", name: "Little Scientist" }, grades: ["K", "G1"] },
  { id: "move-and-groove", num: "06", title: "Move & Groove", subject: "Music & Movement", blurb: "Sing, dance, clap and feel the joy of music and movement!", icon: "/hk/icon_create.png", character: "melody", card: "bg-hc-corallight", strong: "bg-hc-coral", badge: { id: "music-star", name: "Music Star" }, grades: ["K", "G1"] },
];

const quiz = (id, world, title, blurb, character, skill) => ({ id, world, title, blurb, character, skill, kind: "quiz", total: QUIZZES[id].length });
const story = (id, character) => ({ id, world: "read-and-shine", title: STORIES[id].title, blurb: "Listen, read along and answer questions.", character, skill: "Story comprehension", kind: "story", total: STORIES[id].questions.length });

export const ACTIVITIES = [
  { id: "missing-numbers", world: "hop-and-count", title: "Missing Numbers", blurb: "Help Hoppy find the missing numbers!", character: "hoppy", kind: "missing", total: MISSING_PUZZLES.length, skill: "Counting" },
  { id: "more-or-less", world: "hop-and-count", title: "More or Less", blurb: "Help Froggy hop forward and backward!", character: "froggy", kind: "moreless", total: MORE_LESS_PUZZLES.length, skill: "More and less" },
  quiz("count-the-stars", "hop-and-count", "Count the Stars", "Count the stars and pick the number.", "sunny", "Counting objects"),
  quiz("alphabet-adventures", "read-and-shine", "Alphabet Adventures", "Match big and little letters.", "hoppy", "Letter recognition"),
  { id: "letter-sounds", world: "read-and-shine", title: "Letter Sounds", blurb: "Hear every letter's name and sound, then find them.", character: "finn", kind: "letters", total: 6, skill: "Letter sounds" },
  { id: "word-slider", world: "read-and-shine", title: "Word Slider", blurb: "Slide under the letters to blend sounds into words.", character: "hoppy", kind: "slider", total: 6, skill: "Blending words" },
  story("little-sentences", "ellie"),
  quiz("phonics-fun", "read-and-shine", "Phonics Fun", "Which letter makes that sound?", "finn", "Beginning sounds"),
  quiz("first-words", "read-and-shine", "First Words", "Read little words and match the picture.", "ellie", "Word reading"),
  story("hoppys-lost-carrot", "hoppy"),
  story("froggy-and-the-rain", "froggy"),
  quiz("pattern-party", "think-and-play", "Pattern Party", "What comes next in the pattern?", "sunny", "Patterns"),
  quiz("odd-one-out", "think-and-play", "Odd One Out", "Find the one that does not belong.", "froggy", "Sorting & logic"),
  quiz("shape-match", "think-and-play", "Shape Match", "Find the matching shape.", "ellie", "Shapes"),
  { id: "memory-cards", world: "think-and-play", title: "Memory Cards", blurb: "Flip the cards and find the pairs.", character: "hoppy", kind: "memory", total: 1, skill: "Memory" },
  { id: "colour-the-scene", world: "create-and-explore", title: "Colour the Scene", blurb: "Listen and colour the picture.", character: "finn", kind: "colour", total: 4, skill: "Colour recognition" },
  { id: "trace-and-write", world: "create-and-explore", title: "Trace & Write", blurb: "Trace letters and numbers with your finger.", character: "ellie", kind: "trace", total: 6, skill: "Letter & number formation" },
  { id: "drawing-studio", world: "create-and-explore", title: "Drawing Studio", blurb: "Draw with your finger and finish fun challenges.", character: "ellie", kind: "draw", total: 3, skill: "Drawing" },
  quiz("animal-homes", "little-discoverers", "Animal Homes", "Where do animals live?", "finn", "Animals & habitats"),
  quiz("my-body", "little-discoverers", "My Body & Senses", "Eyes, ears, hands and healthy food.", "hoppy", "Body & senses"),
  quiz("weather-and-sky", "little-discoverers", "Weather & Sky", "Rain, snow, sun, moon and plants.", "sunny", "Weather & space"),
  quiz("music-and-moves", "move-and-groove", "Music & Moves", "Clap, sing and discover the joy of music!", "melody", "Music & movement"),
];

export const activityById = (id) => ACTIVITIES.find((a) => a.id === id);
export const worldById = (id) => WORLDS.find((w) => w.id === id);
export const activitiesOf = (worldId) => ACTIVITIES.filter((a) => a.world === worldId);
export const activityPath = (a) => (a.kind === "missing" || a.kind === "moreless" ? `/play/${a.id}` : `/play/${a.id}`);

export const solvedCount = (pdata, id) => Object.values(pdata.games[id]?.puzzles || {}).filter((p) => p.completed > 0).length;
export const isFinished = (pdata, id) => (pdata.games[id]?.plays || 0) > 0;

export const EXTRA_BADGES = [
  { id: "star-collector", name: "Star Collector", need: "Collect 10 stars", earned: (p) => p.totalStars >= 10 },
  { id: "super-effort", name: "Super Effort", need: "Finish 6 activities", earned: (p) => ACTIVITIES.filter((a) => isFinished(p, a.id)).length >= 6 },
];
export const allBadges = (pdata) => [
  ...WORLDS.map((w) => ({ ...w.badge, need: `Finish an activity in ${w.title}`, world: w.id, earned: activitiesOf(w.id).some((a) => isFinished(pdata, a.id)) })),
  ...EXTRA_BADGES.map((b) => ({ ...b, earned: b.earned(pdata) })),
];

export const AVATAR_UNLOCKS = { hoppy: 0, froggy: 0, sunny: 0, melody: 0, ellie: 5, finn: 10 };

export const dailyAdventure = (pdata, level) => {
  const pool = ACTIVITIES.filter((a) => (level === "K" ? a.kind !== "story" || a.id === "hoppys-lost-carrot" : true));
  const fresh = pool.filter((a) => !isFinished(pdata, a.id));
  const list = fresh.length ? fresh : pool;
  const day = Math.floor(Date.now() / 86400000);
  return list[day % list.length];
};
