import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Mic, MicOff, Star, Volume2, VolumeX } from "lucide-react";
import { useAppState } from "../context/AppState";
import { recognitionSupported } from "../lib/speechRecognitionManager";
import { Modal } from "./Modal";
import { ProgressDots } from "./ProgressDots";
import { ToyButton } from "./ToyButton";
import { Character } from "./Characters";

export const GameTopBar = ({ statuses, stars, onMicOn, onMicOff, character }) => {
  const navigate = useNavigate();
  const { state, updateSettings } = useAppState();
  const [leaving, setLeaving] = useState(false);
  const { sound, mic } = state.settings;
  const micSupported = recognitionSupported();

  const toggleMic = () => {
    if (mic) { updateSettings({ mic: false }); onMicOff?.(); }
    else { updateSettings({ mic: true }); onMicOn?.(); }
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <ToyButton color="white" onClick={() => setLeaving(true)} data-testid="game-back-button" aria-label="Back to home" className="px-3 sm:px-4">
        <ArrowLeft className="h-6 w-6" strokeWidth={3} /> <span className="hidden sm:inline">Home</span>
      </ToyButton>
      <div className="order-3 flex w-full justify-center sm:order-none sm:w-auto">
        <ProgressDots statuses={statuses} />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex h-14 items-center gap-1.5 rounded-2xl border-[3px] border-hc-navy bg-hc-sunlight px-3 font-fredoka text-xl font-bold" data-testid="session-stars" aria-label={`${stars} stars this game`}>
          <Star className="h-6 w-6 fill-hc-sun" strokeWidth={2.5} /> {stars}
        </div>
        <ToyButton color={mic ? "coral" : "white"} onClick={toggleMic} disabled={!micSupported} data-testid="mic-toggle" aria-pressed={mic} aria-label={micSupported ? (mic ? "Turn voice listening off" : "Turn voice listening on") : "Voice listening not available on this browser"} className="px-3" title={micSupported ? "Voice listening" : "Not available on this browser"}>
          {mic ? <Mic className="h-6 w-6" strokeWidth={2.75} /> : <MicOff className="h-6 w-6" strokeWidth={2.75} />}
        </ToyButton>
        <ToyButton color={sound ? "sky" : "white"} onClick={() => updateSettings({ sound: !sound })} data-testid="sound-toggle" aria-pressed={sound} aria-label={sound ? "Turn sounds off" : "Turn sounds on"} className="px-3">
          {sound ? <Volume2 className="h-6 w-6" strokeWidth={2.75} /> : <VolumeX className="h-6 w-6" strokeWidth={2.75} />}
        </ToyButton>
      </div>
      <Modal open={leaving} onClose={() => setLeaving(false)} testId="leave-game-dialog">
        <div className="flex flex-col items-center text-center">
          <Character name={character} mood="thinking" className="w-24" />
          <h2 className="mt-3 font-fredoka text-3xl font-bold">Leave the game?</h2>
          <p className="mt-2 font-bold text-lg">Your stars are saved. You can come back any time!</p>
          <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
            <ToyButton color="mint" className="flex-1 text-xl" onClick={() => setLeaving(false)} data-testid="keep-playing-button">Keep playing</ToyButton>
            <ToyButton color="white" className="flex-1 text-xl" onClick={() => navigate("/")} data-testid="confirm-leave-button"><Home className="h-5 w-5" strokeWidth={3} /> Go home</ToyButton>
          </div>
        </div>
      </Modal>
    </header>
  );
};
