import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { VolumeX, X } from "lucide-react";
import { useAppState } from "../context/AppState";

export const AudioHelp = () => {
  const { audioHelp, setAudioHelp } = useAppState();
  useEffect(() => {
    if (!audioHelp) return;
    const t = setTimeout(() => setAudioHelp(false), 9000);
    return () => clearTimeout(t);
  }, [audioHelp, setAudioHelp]);
  return (
    <AnimatePresence>
      {audioHelp && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-3 left-3 right-3 z-40 mx-auto flex max-w-md items-start gap-3 rounded-2xl border-[3px] border-hc-navy bg-white p-3 text-sm font-bold shadow-[0_4px_0_#1F2547] sm:top-auto sm:bottom-4 sm:left-4 sm:right-auto"
          data-testid="audio-help"
          role="status"
        >
          <VolumeX className="mt-0.5 h-5 w-5 shrink-0 text-hc-coral" strokeWidth={3} />
          <p className="flex-1 leading-snug">
            <span className="font-fredoka text-base">Grown-ups:</span> can't hear the voice? Ask a grown-up to check the volume, silent mode and browser settings. Safari or Chrome work best.
          </p>
          <button type="button" onClick={() => setAudioHelp(false)} aria-label="Close audio help" data-testid="audio-help-close" className="toy-focus grid h-10 w-10 shrink-0 place-items-center rounded-full border-[3px] border-hc-navy bg-hc-vanilla">
            <X className="h-4 w-4" strokeWidth={3} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
