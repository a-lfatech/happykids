import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppState";

export default function useGameSession(gameId, total) {
  const { recordAttempt, recordComplete, recordGameComplete } = useAppState();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState(() => Array(total).fill(null));
  const [wrongs, setWrongs] = useState(0);
  const [solved, setSolved] = useState(false);
  const touched = useRef(false);

  useEffect(() => {
    const warn = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const markAttempt = useCallback(() => {
    if (!touched.current) { touched.current = true; recordAttempt(gameId, index); }
  }, [gameId, index, recordAttempt]);

  const registerWrong = () => { markAttempt(); setWrongs(wrongs + 1); return wrongs + 1; };

  const registerCorrect = () => {
    markAttempt();
    const star = wrongs === 0;
    setResults((r) => r.map((x, i) => (i === index ? { star } : x)));
    recordComplete(gameId, index, star, wrongs);
    setSolved(true);
    return star;
  };

  const next = () => {
    if (index + 1 >= total) {
      recordGameComplete(gameId);
      navigate(`/done/${gameId}`, { state: { results } });
      return;
    }
    touched.current = false;
    setWrongs(0);
    setSolved(false);
    setIndex(index + 1);
  };

  const statuses = results.map((r, i) => (r ? (r.star ? "star" : "done") : i === index ? "current" : "todo"));
  const sessionStars = results.filter((r) => r?.star).length;
  const isLast = index === total - 1;

  return { index, total, wrongs, solved, statuses, sessionStars, isLast, markAttempt, registerWrong, registerCorrect, next };
}
