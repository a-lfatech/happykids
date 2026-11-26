import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2 } from "lucide-react";
import { LearningPlay } from "../components/LearningPlay";
import { PlayerSwitch } from "../components/PlayerSwitch";
import { ToyButton } from "../components/ToyButton";
import { useAppState } from "../context/AppState";
import useVoice from "../hooks/useVoice";
import "./WordFamilyGame.css";

export default function LearningPlayPage({ activity }) {
  const navigate = useNavigate();
  const voice = useVoice();
  const { recordGameComplete, recordComplete } = useAppState();
  return <main className="reading-game learning-play-page bg-hc-skylight text-hc-navy">
    <header className="flex items-center justify-between gap-2"><ToyButton color="white" onClick={() => navigate(`/world/${activity.world}`)} aria-label="Back to learning world"><ArrowLeft /></ToyButton><PlayerSwitch /><ToyButton color="white" onClick={() => voice.say(activity.blurb)} aria-label="Read instructions"><Volume2 /></ToyButton></header>
    <LearningPlay kind={activity.playKind} rounds={6} say={voice.say} onRoundComplete={index => recordComplete(activity.id, index, true, 0)} onExit={() => navigate(`/world/${activity.world}`)} onDone={() => { recordGameComplete(activity.id); navigate(`/world/${activity.world}`); }} />
  </main>;
}
