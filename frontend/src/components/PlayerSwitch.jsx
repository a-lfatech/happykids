import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Plus, Users } from "lucide-react";
import { useAppState } from "../context/AppState";
import { stopSpeaking } from "../lib/audioManager";
import { stopListening } from "../lib/speechRecognitionManager";
import { CHARACTERS } from "./Characters";
import { Modal } from "./Modal";
import { ToyButton } from "./ToyButton";
import Onboarding from "./Onboarding";

export function PlayerSwitch() {
  const { state, profile, setActive } = useAppState();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const close = () => { setOpen(false); setAdding(false); stopSpeaking(); stopListening(); };
  const finish = () => { close(); navigate("/learn"); };
  return (
    <>
      <button type="button" onClick={() => { stopSpeaking(); stopListening(); setOpen(true); }} className="toy-focus flex min-h-[44px] items-center gap-2 rounded-2xl border-[3px] border-hc-navy bg-hc-skylight px-2 py-1 font-fredoka font-semibold text-hc-navy" aria-label={`Change player. Playing as ${profile.name}`}>
        <Users className="h-5 w-5 shrink-0" />
        <span className="text-left text-xs leading-tight"><span className="block max-w-[88px] truncate">{profile.name}</span><span className="block">Change player</span></span>
      </button>
      <Modal open={open} onClose={close} testId="change-player-dialog">
        {adding ? <Onboarding newPlayer onDone={finish} /> : <>
          <h2 className="font-fredoka text-3xl font-bold">Who is playing?</h2>
          <p className="mt-2 font-semibold">Choose a child. Each player keeps their own progress.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {state.profiles.map(p => <button type="button" key={p.id} onClick={() => { setActive(p.id); finish(); }} className={`toy-btn flex h-auto flex-col items-center gap-2 p-3 ${p.id === profile.id ? "bg-hc-sunlight" : "bg-white"}`} aria-pressed={p.id === profile.id}>
              <img src={(CHARACTERS[p.avatar] || CHARACTERS.hoppy).img} alt="" className="h-16 w-16 object-contain" />
              <span className="max-w-full break-words">{p.name}</span>
              {p.id === profile.id && <span className="flex items-center gap-1 text-xs"><Check className="h-4 w-4" /> Playing now</span>}
            </button>)}
          </div>
          <ToyButton color="mint" className="mt-4 w-full" onClick={() => setAdding(true)}><Plus className="h-5 w-5" /> Add another child</ToyButton>
        </>}
      </Modal>
    </>
  );
}
