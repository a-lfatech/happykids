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
  return <ColourGame activity={a} />;
}
