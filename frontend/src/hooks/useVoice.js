import { useCallback, useEffect, useRef, useState } from "react";
import { useAppState } from "../context/AppState";
import { speak, stopSpeaking } from "../lib/audioManager";
import { recognitionSupported, startListening, stopListening } from "../lib/speechRecognitionManager";

export default function useVoice(onCommand) {
  const { state, updateSettings } = useAppState();
  const [listening, setListening] = useState(false);
  const [micDenied, setMicDenied] = useState(false);
  const cmdRef = useRef(onCommand);
  cmdRef.current = onCommand;
  const session = useRef(0);
  const micOn = state.settings.mic;

  const listen = useCallback((force = false) => {
    if ((!micOn && !force) || !recognitionSupported()) return;
    const id = ++session.current;
    setListening(true);
    startListening({
      onCommand: (c) => cmdRef.current?.(c),
      onEnd: () => { if (session.current === id) setListening(false); },
      onDenied: () => { updateSettings({ mic: false }); setMicDenied(true); },
    });
  }, [micOn, updateSettings]);

  const stop = useCallback(() => { session.current++; stopListening(); setListening(false); }, []);

  const say = useCallback((text, { listenAfter = false } = {}) => {
    stop();
    speak(text, { onEnd: () => { if (listenAfter) listen(); } });
  }, [listen, stop]);

  useEffect(() => () => { stopListening(); stopSpeaking(); }, []);

  return { say, listen, stop, listening, micDenied };
}
