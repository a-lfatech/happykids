import { motion } from "framer-motion";
import { Mic, Square, Volume2 } from "lucide-react";
import { Character } from "./Characters";
import { ToyButton } from "./ToyButton";

export const ListenButton = ({ onClick }) => (
  <ToyButton color="sun" onClick={onClick} data-testid="listen-button" aria-label="Listen to the question" className="text-lg sm:text-xl px-6">
    <Volume2 className="h-6 w-6" strokeWidth={2.75} /> LISTEN
  </ToyButton>
);

export const ListeningBadge = ({ onStop }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    data-testid="listening-badge"
    className="flex items-center gap-2 rounded-full border-[3px] border-hc-navy bg-hc-coral/90 py-1.5 pl-2 pr-1.5 font-bold"
  >
    <span className="relative grid h-9 w-9 place-items-center rounded-full bg-white">
      <span className="absolute inset-0 animate-ping rounded-full bg-white/70" />
      <Mic className="relative h-5 w-5" strokeWidth={2.75} />
    </span>
    <span className="text-sm sm:text-base leading-tight">I'm listening! You can say "thank you"!</span>
    <button type="button" onClick={onStop} data-testid="stop-listening-button" aria-label="Stop listening" className="toy-focus grid h-11 w-11 place-items-center rounded-full border-[3px] border-hc-navy bg-white">
      <Square className="h-4 w-4 fill-hc-navy" />
    </button>
  </motion.div>
);

export const SpeechPanel = ({ character, mood, title, text, tone = "neutral", onListen, listening, onStopListening }) => {
  const toneBg = { neutral: "bg-white", correct: "bg-hc-mintlight", wrong: "bg-hc-corallight" }[tone];
  return (
    <div className="flex items-end gap-3 sm:gap-4" data-testid="speech-panel">
      <Character name={character} mood={mood} className="w-16 shrink-0 sm:w-24 lg:w-32 [@media(max-height:720px)]:w-14" testId={`${character}-character`} />
      <div className="min-w-0 flex-1">
        <motion.div
          key={`${title}-${text}`}
          initial={{ scale: 0.95, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 20 }}
          className={`relative rounded-[1.75rem] border-[3px] border-hc-navy p-3 sm:p-4 ${toneBg}`}
          style={{ boxShadow: "0 5px 0 #1F2547" }}
          data-testid="speech-bubble"
          aria-live="polite"
        >
          <span className="speech-tail -left-[13px] bottom-6" style={{ background: "inherit" }} />
          <p className="font-fredoka text-xl font-semibold leading-tight sm:text-2xl lg:text-3xl" data-testid="speech-title">{title}</p>
          {text && <p className="mt-1.5 text-base font-bold leading-snug sm:text-lg" data-testid="speech-text">{text}</p>}
        </motion.div>
        <div className="mt-2 flex flex-wrap items-center gap-3 sm:mt-3">
          <ListenButton onClick={onListen} />
          {listening && <ListeningBadge onStop={onStopListening} />}
        </div>
      </div>
    </div>
  );
};
