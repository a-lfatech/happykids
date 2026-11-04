import { MISSING_PUZZLES, MORE_LESS_PUZZLES } from "./logic";

// Add new learning modules (counting to 20, reading, phonics...) here.
export const GAMES = [
  {
    id: "missing-numbers",
    number: 1,
    title: "Missing Numbers",
    character: "hoppy",
    companion: "Hoppy the Bunny",
    blurb: "Help Hoppy find the missing numbers!",
    objective: "Counting forward and backward from 1 to 10",
    path: "/play/missing-numbers",
    total: MISSING_PUZZLES.length,
    tint: "bg-hc-lavlight",
  },
  {
    id: "more-or-less",
    number: 2,
    title: "More or Less",
    character: "froggy",
    companion: "Froggy the Frog",
    blurb: "Help Froggy hop forward and backward!",
    objective: "One more, one less, two more and two less",
    path: "/play/more-or-less",
    total: MORE_LESS_PUZZLES.length,
    tint: "bg-hc-mintlight",
  },
];

export const gameById = (id) => GAMES.find((g) => g.id === id);
