import { useEffect, useRef, useState } from "react";
import { Check, Download, Eraser, Trash2, Undo2 } from "lucide-react";
import useGameSession from "../hooks/useGameSession";
import useVoice from "../hooks/useVoice";
import { sfx } from "../lib/audioManager";
import { GameTopBar } from "../components/GameTopBar";
import { SpeechPanel } from "../components/SpeechPanel";
import { NextButton } from "../components/NextButton";
import { ToyButton } from "../components/ToyButton";

export const PALETTE = [
  { name: "red", hex: "#F0484E" }, { name: "orange", hex: "#FF9A52" }, { name: "yellow", hex: "#FFD43B" }, { name: "green", hex: "#3DBE6A" },
  { name: "blue", hex: "#3B9BEA" }, { name: "purple", hex: "#9B7BEA" }, { name: "pink", hex: "#FF8FB1" }, { name: "brown", hex: "#9C6B3C" }, { name: "black", hex: "#1F2547" },
];
const CHALLENGES = ["Draw a big yellow sun!", "Draw a happy face with a big smile!", "Draw your favourite animal!"];
const SIZES = [6, 14, 26];

export const Swatches = ({ value, onPick }) => (
  <div className="flex flex-wrap justify-center gap-2" data-testid="colour-palette">
    {PALETTE.map((c) => (
      <button type="button" key={c.name} onClick={() => onPick(c)} data-testid={`colour-${c.name}`} aria-pressed={value === c.name} aria-label={c.name}
        className={`toy-btn flex h-auto min-w-[64px] flex-col items-center gap-0.5 px-2 py-1.5 text-xs ${value === c.name ? "-translate-y-1 bg-hc-sunlight" : "bg-white"}`}>
        <span className="h-8 w-8 rounded-full border-[3px] border-hc-navy" style={{ background: c.hex }} />{c.name}
      </button>
    ))}
  </div>
);

export default function DrawGame({ activity }) {
  const s = useGameSession(activity.id, CHALLENGES.length);
  const canvas = useRef(null);
  const drawing = useRef(false);
  const history = useRef([]);
  const inked = useRef(false);
  const [colour, setColour] = useState(PALETTE[4]);
  const [size, setSize] = useState(SIZES[1]);
  const [eraser, setEraser] = useState(false);
  const [mood, setMood] = useState("happy");
  const [text, setText] = useState("Use your finger to draw. Tap I did it when you finish!");
  const voice = useVoice((cmd) => { if (cmd === "next" && s.solved) s.next(); else voice.say(CHALLENGES[s.index]); });

  const ctx = () => canvas.current.getContext("2d");
  const clear = () => { const c = canvas.current; const x = ctx(); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); inked.current = false; };

  useEffect(() => {
    const c = canvas.current;
    const r = c.getBoundingClientRect();
    c.width = r.width * 2; c.height = r.height * 2;
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    clear(); history.current = []; setMood("happy"); setText("Use your finger to draw. Tap I did it when you finish!");
    const t = setTimeout(() => voice.say(CHALLENGES[s.index]), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.index]);

  const pos = (e) => { const r = canvas.current.getBoundingClientRect(); return [(e.clientX - r.left) * 2, (e.clientY - r.top) * 2]; };
  const down = (e) => {
    e.preventDefault(); s.markAttempt();
    canvas.current.setPointerCapture(e.pointerId);
    const c = canvas.current;
    history.current = [...history.current.slice(-19), ctx().getImageData(0, 0, c.width, c.height)];
    drawing.current = true;
    if (!eraser) inked.current = true;
    const x = ctx(); const [px, py] = pos(e);
    x.strokeStyle = eraser ? "#fff" : colour.hex; x.lineWidth = size * 2; x.lineCap = "round"; x.lineJoin = "round";
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + 0.1, py + 0.1); x.stroke();
  };
  const move = (e) => { if (!drawing.current) return; const [px, py] = pos(e); const x = ctx(); x.lineTo(px, py); x.stroke(); };
  const up = () => { drawing.current = false; };
  const undo = () => { const last = history.current.pop(); if (last) ctx().putImageData(last, 0, 0); };
  const save = () => { const a = document.createElement("a"); a.download = "happykids-drawing.png"; a.href = canvas.current.toDataURL("image/png"); a.click(); };
  const done = () => {
    if (s.solved) return;
    if (!inked.current) { const m = "Your page is still empty! Draw something first, then tap I did it."; setText(m); voice.say(m); return; }
    s.registerCorrect(true);
    const msg = "Congratulations! What a wonderful drawing! You're a creative genius!";
    setMood("celebrate"); setText(msg); sfx.correct(); voice.say(msg, { listenAfter: true });
  };

  return (
    <main className="hc-bg min-h-screen px-4 pb-10 pt-4 sm:px-8" data-testid="draw-game">
      <div className="mx-auto max-w-5xl">
        <GameTopBar statuses={s.statuses} stars={s.sessionStars} character={activity.character} backTo={`/world/${activity.world}`} onMicOn={() => voice.listen(true)} onMicOff={voice.stop} />
        <section className="mt-6"><SpeechPanel character={activity.character} mood={mood} title={CHALLENGES[s.index]} text={text} tone={s.solved ? "correct" : "neutral"} onListen={() => voice.say(CHALLENGES[s.index])} listening={voice.listening} onStopListening={voice.stop} /></section>
        <section className="toy-card mt-6 p-3 sm:p-5">
          <canvas ref={canvas} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} className="aspect-[16/10] w-full touch-none rounded-2xl border-[3px] border-hc-navy bg-white" data-testid="draw-canvas" aria-label="Drawing canvas" />
          <div className="mt-4"><Swatches value={eraser ? null : colour.name} onPick={(c) => { setColour(c); setEraser(false); }} /></div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {SIZES.map((sz, i) => (
              <button type="button" key={sz} onClick={() => setSize(sz)} aria-pressed={size === sz} aria-label={["thin", "medium", "thick"][i] + " brush"} data-testid={`brush-${i}`} className={`toy-btn px-3 ${size === sz ? "bg-hc-sunlight" : "bg-white"}`}>
                <span className="block rounded-full bg-hc-navy" style={{ width: sz + 4, height: sz + 4 }} />
              </button>
            ))}
            <ToyButton color={eraser ? "sun" : "white"} onClick={() => setEraser(!eraser)} data-testid="eraser-button"><Eraser className="h-5 w-5" /> Eraser</ToyButton>
            <ToyButton color="white" onClick={undo} data-testid="undo-button"><Undo2 className="h-5 w-5" /> Undo</ToyButton>
            <ToyButton color="white" onClick={clear} data-testid="clear-button"><Trash2 className="h-5 w-5" /> Clear</ToyButton>
            <ToyButton color="white" onClick={save} data-testid="save-drawing-button"><Download className="h-5 w-5" /> Save</ToyButton>
          </div>
          {!s.solved && <div className="mt-5 flex justify-center"><ToyButton color="mint" className="min-h-[68px] px-8 text-2xl" onClick={done} data-testid="drawing-done-button"><Check className="h-7 w-7" strokeWidth={3} /> I did it!</ToyButton></div>}
        </section>
        <div className="mt-8"><NextButton show={s.solved} isLast={s.isLast} onClick={s.next} /></div>
      </div>
    </main>
  );
}
