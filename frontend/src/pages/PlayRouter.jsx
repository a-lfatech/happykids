import { Navigate, useParams } from "react-router-dom";
import { activityById } from "../data/worlds";
import { QUIZZES } from "../data/quizzes";
import MissingNumbersGame from "./MissingNumbersGame";
import MoreOrLessGame from "./MoreOrLessGame";
import QuizCore from "./QuizCore";
import StoryGame from "./StoryGame";
import MemoryGame from "./MemoryGame";
import DrawGame from "./DrawGame";
import ColourGame from "./ColourGame";
import LetterSoundsGame from "./LetterSoundsGame";
import WordSliderGame from "./WordSliderGame";
import TracingGame from "./TracingGame";

export default function PlayRouter() {
  const { activityId } = useParams();
  const a = activityById(activityId);
  if (!a) return <Navigate to="/learn" replace />;
  if (a.kind === "missing") return <MissingNumbersGame />;
  if (a.kind === "moreless") return <MoreOrLessGame />;
  if (a.kind === "quiz") return <QuizCore activity={a} rounds={QUIZZES[a.id]} />;
  if (a.kind === "story") return <StoryGame activity={a} />;
  if (a.kind === "memory") return <MemoryGame activity={a} />;
  if (a.kind === "draw") return <DrawGame activity={a} />;
  if (a.kind === "colour") return <ColourGame activity={a} />;
  if (a.kind === "letters") return <LetterSoundsGame activity={a} />;
  if (a.kind === "slider") return <WordSliderGame activity={a} />;
  return <TracingGame activity={a} />;
}
