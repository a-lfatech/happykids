import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { configure, onSpeechFail, setMusic, unlockAudio } from "../lib/audioManager";

const KEY = "hopcount_progress_v1";
export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const blankData = () => ({ games: {}, totalStars: 0, recent: [] });
const defaultSettings = { sound: true, speech: true, mic: false, music: false, volume: 0.8, reducedMotion: false };
const fresh = () => ({ settings: defaultSettings, profiles: [{ id: "p1", name: "Little Explorer", avatar: "hoppy", level: "K" }], activeId: "p1", data: { p1: blankData() }, updatedAt: 0 });

const migrate = (s) => {
  if (!s) return fresh();
  const d = fresh();
  if (s.profiles?.length) return { ...d, ...s, settings: { ...defaultSettings, ...s.settings } };
  return { ...d, settings: { ...defaultSettings, ...s.settings }, data: { p1: { games: s.games || {}, totalStars: s.totalStars || 0, recent: [] } } };
};
const load = () => { try { return migrate(JSON.parse(localStorage.getItem(KEY))); } catch (e) { return fresh(); } };
const blank = { attempts: 0, completed: 0, firstTry: 0, wrongs: 0 };

const Ctx = createContext(null);

export function AppStateProvider({ children }) {
  const [state, setState] = useState(load);
  const [audioHelp, setAudioHelp] = useState(false);
  const [user, setUser] = useState(null);
  const [cloud, setCloud] = useState("idle");
  const syncReady = useRef(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
    configure(state.settings);
    document.documentElement.classList.toggle("reduce-motion", !!state.settings.reducedMotion);
  }, [state]);
  useEffect(() => { setMusic(state.settings.music); }, [state.settings.music]);

  useEffect(() => {
    let shown = false;
    onSpeechFail(() => { if (!shown) { shown = true; setAudioHelp(true); } });
    const u = () => unlockAudio();
    window.addEventListener("pointerdown", u, { once: true });
    window.addEventListener("keydown", u, { once: true });
    if (!window.location.hash.includes("session_id=")) {
      fetch(`${API}/auth/me`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)).then(setUser).catch(() => setUser(null));
    }
    return () => { window.removeEventListener("pointerdown", u); window.removeEventListener("keydown", u); };
  }, []);

  // Cloud sync: newest copy wins on sign-in, then save changes automatically.
  useEffect(() => {
    if (!user) { syncReady.current = false; return; }
    setCloud("syncing");
    fetch(`${API}/progress`, { credentials: "include" }).then((r) => r.json()).then((doc) => {
      setState((local) => (doc.state && doc.updated_at > local.updatedAt ? migrate(doc.state) : local));
      syncReady.current = true;
      setCloud("saved");
    }).catch(() => setCloud("error"));
  }, [user]);

  useEffect(() => {
    if (!user || !syncReady.current) return;
    const t = setTimeout(() => {
      setCloud("syncing");
      fetch(`${API}/progress`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state, updated_at: state.updatedAt }) })
        .then((r) => setCloud(r.ok ? "saved" : "error")).catch(() => setCloud("error"));
    }, 1200);
    return () => clearTimeout(t);
  }, [state, user]);

  const updateSettings = useCallback((patch) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })), []);
  const mutate = useCallback((fn) => setState((s) => ({ ...s, updatedAt: Date.now(), data: { ...s.data, [s.activeId]: fn(s.data[s.activeId] || blankData()) } })), []);

  const updatePuzzle = useCallback((gameId, idx, fn, starDelta = 0) => mutate((d) => {
    const g = d.games[gameId] || { puzzles: {}, plays: 0 };
    return { ...d, totalStars: d.totalStars + starDelta, games: { ...d.games, [gameId]: { ...g, puzzles: { ...g.puzzles, [idx]: fn({ ...blank, ...g.puzzles[idx] }) } } } };
  }), [mutate]);

  const recordAttempt = useCallback((gameId, idx) => updatePuzzle(gameId, idx, (p) => ({ ...p, attempts: p.attempts + 1 })), [updatePuzzle]);
  const recordComplete = useCallback((gameId, idx, star, wrongs) => updatePuzzle(gameId, idx, (p) => ({ ...p, completed: p.completed + 1, firstTry: p.firstTry + (star ? 1 : 0), wrongs: p.wrongs + wrongs }), star ? 1 : 0), [updatePuzzle]);
  const recordGameComplete = useCallback((gameId) => mutate((d) => {
    const g = d.games[gameId] || { puzzles: {}, plays: 0 };
    const recent = [{ id: gameId, at: Date.now() }, ...(d.recent || []).filter((r) => r.id !== gameId)].slice(0, 8);
    return { ...d, recent, games: { ...d.games, [gameId]: { ...g, plays: (g.plays || 0) + 1 } } };
  }), [mutate]);
  const resetProgress = useCallback((id) => setState((s) => ({ ...s, updatedAt: Date.now(), data: { ...s.data, [id || s.activeId]: blankData() } })), []);

  const addProfile = useCallback((name, avatar, level) => setState((s) => {
    const id = `p${Date.now()}`;
    return { ...s, updatedAt: Date.now(), profiles: [...s.profiles, { id, name, avatar, level }], data: { ...s.data, [id]: blankData() }, activeId: id };
  }), []);
  const updateProfile = useCallback((id, patch) => setState((s) => ({ ...s, updatedAt: Date.now(), profiles: s.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)) })), []);
  const removeProfile = useCallback((id) => setState((s) => {
    if (s.profiles.length < 2) return s;
    const profiles = s.profiles.filter((p) => p.id !== id);
    const data = { ...s.data };
    delete data[id];
    return { ...s, updatedAt: Date.now(), profiles, data, activeId: s.activeId === id ? profiles[0].id : s.activeId };
  }), []);
  const setActive = useCallback((id) => setState((s) => ({ ...s, activeId: id })), []);

  const logout = useCallback(async () => {
    await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    setUser(null);
    setCloud("idle");
  }, []);

  const profile = state.profiles.find((p) => p.id === state.activeId) || state.profiles[0];
  const pdata = state.data[profile.id] || blankData();

  return (
    <Ctx.Provider value={{ state, profile, pdata, updateSettings, recordAttempt, recordComplete, recordGameComplete, resetProgress, addProfile, updateProfile, removeProfile, setActive, audioHelp, setAudioHelp, user, setUser, logout, cloud }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAppState = () => useContext(Ctx);
