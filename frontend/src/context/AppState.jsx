import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { configure, onSpeechFail, unlockAudio } from "../lib/audioManager";

const KEY = "hopcount_progress_v1";
const fresh = () => ({ settings: { sound: true, speech: true, mic: false, volume: 0.8 }, games: {}, totalStars: 0 });
const load = () => {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (!s) return fresh();
    const d = fresh();
    return { ...d, ...s, settings: { ...d.settings, ...s.settings } };
  } catch (e) {
    return fresh();
  }
};
const blank = { attempts: 0, completed: 0, firstTry: 0, wrongs: 0 };

const Ctx = createContext(null);

export function AppStateProvider({ children }) {
  const [state, setState] = useState(load);
  const [audioHelp, setAudioHelp] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
    configure(state.settings);
  }, [state]);

  useEffect(() => {
    onSpeechFail(() => setAudioHelp(true));
    const u = () => unlockAudio();
    window.addEventListener("pointerdown", u, { once: true });
    window.addEventListener("keydown", u, { once: true });
    return () => { window.removeEventListener("pointerdown", u); window.removeEventListener("keydown", u); };
  }, []);

  const updateSettings = useCallback((patch) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })), []);

  const updatePuzzle = useCallback((gameId, idx, fn, starDelta = 0) => setState((s) => {
    const g = s.games[gameId] || { puzzles: {}, plays: 0 };
    const p = fn({ ...blank, ...g.puzzles[idx] });
    return { ...s, totalStars: s.totalStars + starDelta, games: { ...s.games, [gameId]: { ...g, puzzles: { ...g.puzzles, [idx]: p } } } };
  }), []);

  const recordAttempt = useCallback((gameId, idx) => updatePuzzle(gameId, idx, (p) => ({ ...p, attempts: p.attempts + 1 })), [updatePuzzle]);
  const recordComplete = useCallback((gameId, idx, star, wrongs) => updatePuzzle(gameId, idx, (p) => ({
    ...p, completed: p.completed + 1, firstTry: p.firstTry + (star ? 1 : 0), wrongs: p.wrongs + wrongs,
  }), star ? 1 : 0), [updatePuzzle]);
  const recordGameComplete = useCallback((gameId) => setState((s) => {
    const g = s.games[gameId] || { puzzles: {}, plays: 0 };
    return { ...s, games: { ...s.games, [gameId]: { ...g, plays: (g.plays || 0) + 1 } } };
  }), []);
  const resetProgress = useCallback(() => setState((s) => ({ ...fresh(), settings: s.settings })), []);

  return (
    <Ctx.Provider value={{ state, updateSettings, recordAttempt, recordComplete, recordGameComplete, resetProgress, audioHelp, setAudioHelp }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAppState = () => useContext(Ctx);
