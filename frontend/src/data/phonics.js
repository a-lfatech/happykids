// Letter name, a child-friendly sound to speak, and a keyword.
export const LETTERS = [
  ["A", "ah", "apple"], ["B", "buh", "bus"], ["C", "kuh", "cat"], ["D", "duh", "dog"], ["E", "eh", "egg"], ["F", "fff", "fish"],
  ["G", "guh", "goat"], ["H", "huh", "house"], ["I", "ih", "insect"], ["J", "juh", "jam"], ["K", "kuh", "kite"], ["L", "lll", "leaf"],
  ["M", "mmm", "moon"], ["N", "nnn", "nest"], ["O", "aw", "octopus"], ["P", "puh", "pig"], ["Q", "kwuh", "queen"], ["R", "rrr", "rabbit"],
  ["S", "sss", "sun"], ["T", "tuh", "tree"], ["U", "uh", "umbrella"], ["V", "vvv", "van"], ["W", "wuh", "web"], ["X", "ks", "fox"],
  ["Y", "yuh", "yo-yo"], ["Z", "zzz", "zebra"],
].map(([L, sound, word]) => ({ L, sound, word }));
export const letterOf = (L) => LETTERS.find((x) => x.L === L);

export const FIND_ROUNDS = ["M", "S", "A", "T", "P", "B"];

export const SLIDER_WORDS = [
  { word: "cat", icon: "Cat", color: "tang" }, { word: "dog", icon: "Dog", color: "sun" }, { word: "sun", icon: "Sun", color: "sun" },
  { word: "bus", icon: "Bus", color: "sky" }, { word: "bed", icon: "Bed", color: "lav" }, { word: "box", icon: "Box", color: "tang" },
];

export const TRACE_TARGETS = ["A", "B", "C", "1", "2", "3"];
