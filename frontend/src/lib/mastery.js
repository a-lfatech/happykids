import { supabase } from "./supabase";

const KEY = "hk_learner_v1";

export const START_LEVELS = [
  { id: "K", label: "Pre-K & Kindergarten", hint: "Counting, shapes and patterns", emoji: "🧸", color: "bg-hc-sunlight" },
  { id: "G1", label: "Grade 1", hint: "Numbers 1 to 20", emoji: "🎒", color: "bg-hc-mintlight" },
  { id: "G6", label: "Grade 6", hint: "Decimals and powers of ten", emoji: "🚀", color: "bg-hc-skylight" },
];

export const getLearner = () => {
  try {
    const l = JSON.parse(localStorage.getItem(KEY));
    return l && l.token && l.name ? l : null;
  } catch {
    return null;
  }
};

export const saveLearner = (l) => localStorage.setItem(KEY, JSON.stringify(l));
export const clearLearner = () => localStorage.removeItem(KEY);

const FRIENDLY = {
  unit_locked: "locked",
  learner_not_found: "unknown_learner",
  invalid_grade: "invalid_grade",
};

const rpc = async (fn, args) => {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) {
    const code = Object.keys(FRIENDLY).find((k) => error.message?.includes(k));
    const err = new Error(code ? FRIENDLY[code] : "network");
    err.code = code ? FRIENDLY[code] : "network";
    throw err;
  }
  if (!data || typeof data !== "object") {
    const err = new Error("network");
    err.code = "network";
    throw err;
  }
  return data;
};

export const createLearner = (grade) => rpc("hk_create_learner", { p_start_grade: grade });
export const setStartGrade = (token, grade) => rpc("hk_set_start_grade", { p_token: token, p_grade: grade });
export const fetchGradeMap = (token) => rpc("hk_grade_map", { p_token: token });
export const nextQuestion = (token, unit) => rpc("hk_next_question", { p_token: token, p_unit: unit });
export const submitAnswer = (token, attempt, choice) => rpc("hk_answer", { p_token: token, p_attempt: attempt, p_choice: choice });

export const nextOpenUnit = (map) => {
  if (!map?.grades) return null;
  const start = map.grades.find((g) => g.id === map.start_grade);
  const ordered = start ? [start, ...map.grades.filter((g) => g !== start)] : map.grades;
  for (const g of ordered) {
    const u = g.units.find((x) => x.status === "unlocked");
    if (u) return { ...u, grade: g.title };
  }
  return null;
};
