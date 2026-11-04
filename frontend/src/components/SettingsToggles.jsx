import { Mic, MessageCircle, Music, Music2, PauseCircle } from "lucide-react";
import { useAppState } from "../context/AppState";
import { recognitionSupported } from "../lib/speechRecognitionManager";
import { speechSupported } from "../lib/audioManager";

const Row = ({ icon: Icon, label, hint, on, onToggle, testId, disabled }) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl border-[3px] border-hc-navy bg-hc-cream p-3">
    <div className="flex items-center gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-[3px] border-hc-navy bg-white"><Icon className="h-5 w-5" strokeWidth={3} /></span>
      <div>
        <p className="font-fredoka text-lg font-semibold leading-tight">{label}</p>
        {hint && <p className="text-xs font-bold opacity-70">{hint}</p>}
      </div>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      data-testid={testId}
      className={`toy-btn min-w-[84px] px-3 text-base ${on ? "bg-hc-mint" : "bg-white"}`}
    >
      {on ? "ON" : "OFF"}
    </button>
  </div>
);

export const SettingsToggles = () => {
  const { state, updateSettings } = useAppState();
  const { sound, speech, mic, volume, music, reducedMotion } = state.settings;
  return (
    <div className="space-y-3" data-testid="settings-toggles">
      <Row icon={Music} label="Sounds & chimes" on={sound} onToggle={() => updateSettings({ sound: !sound })} testId="setting-sound" />
      <Row icon={MessageCircle} label="Read aloud" hint={speechSupported() ? "Characters speak the questions" : "Not available on this browser"} on={speech} disabled={!speechSupported()} onToggle={() => updateSettings({ speech: !speech })} testId="setting-speech" />
      <Row icon={Mic} label="Voice listening" hint={recognitionSupported() ? "Say \"thank you\", \"next\" or \"try again\"" : "Not available on this browser"} on={mic} disabled={!recognitionSupported()} onToggle={() => updateSettings({ mic: !mic })} testId="setting-mic" />
      <Row icon={Music2} label="Background music" hint="A gentle tune while playing" on={music} onToggle={() => updateSettings({ music: !music })} testId="setting-music" />
      <Row icon={PauseCircle} label="Calm motion" hint="Fewer bouncing animations" on={reducedMotion} onToggle={() => updateSettings({ reducedMotion: !reducedMotion })} testId="setting-reduced-motion" />
      <label className="block rounded-2xl border-[3px] border-hc-navy bg-hc-cream p-3">
        <span className="font-fredoka text-lg font-semibold">Volume</span>
        <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => updateSettings({ volume: Number(e.target.value) })} className="mt-2 h-8 w-full accent-[#FF7F91]" data-testid="setting-volume" aria-label="Volume" />
      </label>
    </div>
  );
};
