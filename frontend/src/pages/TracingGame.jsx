import { useEffect, useRef, useState } from "react";
import { Check, Eraser } from "lucide-react";
import useGameSession from "../hooks/useGameSession";
import useVoice from "../hooks/useVoice";
import { sfx } from "../lib/audioManager";
import { GameTopBar } from "../components/GameTopBar";
import { SpeechPanel } from "../components/SpeechPanel";
import { NextButton } from "../components/NextButton";
import { ToyButton } from "../components/ToyButton";
import { TRACE_TARGETS } from "../data/phonics";

const W = 600;
const H = 600;
const glyph = (ctx, ch, fill, stroke, lw) => {
  ctx.font = `700 ${H * 0.78}px Fredoka, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (fill) { ctx.fillStyle = fill; ctx.fillText(ch, W / 2, H * 0.54); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = "round"; ctx.strokeText(ch, W / 2, H * 0.54); }
};

// Compares the child's ink with the letter shape: enough of the letter covered, little ink outside it.
const score = (ink, ch) => {
  const mk = (lw) => { const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d"); glyph(x, ch, "#000", "#000", lw); return x.getImageData(0, 0, W, H).data; };
  const shape = mk(1);
  const near = mk(60);
  const d = ink.getContext("2d").getImageData(0, 0, W, H).data;
  let shapeN = 0, covered = 0, inkN = 0, outside = 0;
  for (let i = 3; i < d.length; i += 16) {
    const on = d[i] > 0;
    if (shape[i] > 0) { shapeN++; if (on) covered++; }
    if (on) { inkN++; if (near[i] === 0) outside++; }
  }
  return { coverage: shapeN ? covered / shapeN : 0, outside: inkN ? outside / inkN : 1, inkN };
};

export default function TracingGame({ activity }) {
  const s = useGameSession(activity.id, TRACE_TARGETS.length);
  const ch = TRACE_TARGETS[s.index];
  const kind = /\d/.test(ch) ? "number" : "letter";
  const guide = useRef(null);
  const ink = useRef(null);
  const drawing = useRef(false);
  const [mood, setMood] = useState("happy");
  const [text, setText] = useState("Follow the dotted shape with your finger, then tap Check.");
  const say = `Let's trace the ${kind} ${ch}! Follow the dotted lines with your finger.`;
  const voice = useVoice((cmd) => { if (cmd === "next" && s.solved) s.next(); else voice.say(say); });

  const clearInk = () => ink.current.getContext("2d").clearRect(0, 0, W, H);
  useEffect(() => {
    const draw = () => {
      const g = guide.current.getContext("2d");
      g.clearRect(0, 0, W, H);
      glyph(g, ch, "#EEE7FF", null);
      g.setLineDash([10, 12]);
      glyph(g, ch, null, "#9B7BEA", 4);
      g.setLineDash([]);
    };
    document.fonts?.ready.then(draw);
    draw();
    clearInk(); setMood("happy"); setText("Follow the dotted shape with your finger, then tap Check.");
    const t = setTimeout(() => voice.say(say), 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.index]);

  const pos = (e) => { const r = ink.current.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H]; };
  const down = (e) => {
    if (s.solved) return;
    s.markAttempt(); ink.current.setPointerCapture(e.pointerId); drawing.current = true;
    const x = ink.current.getContext("2d"); const [px, py] = pos(e);
    x.strokeStyle = "#3B9BEA"; x.lineWidth = 34; x.lineCap = "round"; x.lineJoin = "round";
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + 0.1, py); x.stroke();
  };
  const move = (e) => { if (!drawing.current) return; const [px, py] = pos(e); const x = ink.current.getContext("2d"); x.lineTo(px, py); x.stroke(); };

  const check = () => {
    if (s.solved) return;
    const r = score(ink.current, ch);
    if (r.coverage >= 0.5 && r.outside <= 0.3) {
      s.registerCorrect();
      const m = `Congratulations! You traced the ${kind} ${ch} beautifully!`;
      setMood("celebrate"); setText(m); sfx.correct(); voice.say(m, { listenAfter: true });
      return;
    }
    const level = s.registerWrong();
    const m = r.inkN === 0 ? `Let's start! Put your finger on the dotted ${kind} ${ch} and follow it.`
      : r.outside > 0.3 ? `Good try! Some lines went outside the ${kind}. Stay on the dotted path. ${level > 1 ? "Go slowly, like a snail!" : "Try again!"}`
      : `Nearly there! Trace all of the ${kind} ${ch}, every part of it. Try again!`;
    setMood("thinking"); setText(m); sfx.wrong(); voice.say(m, { listenAfter: true });
    clearInk();
  };

  return (
    <main className="hc-bg min-h-screen px-4 pb-10 pt-4 sm:px-8" data-testid="tracing-game">
      <div className="mx-auto max-w-4xl">
        <GameTopBar statuses={s.statuses} stars={s.sessionStars} character={activity.character} backTo={`/world/${activity.world}`} onMicOn={() => voice.listen(true)} onMicOff={voice.stop} />
        <section className="mt-6"><SpeechPanel character={activity.character} mood={mood} title={`Trace the ${kind} ${ch}`} text={text} tone={s.solved ? "correct" : "neutral"} onListen={() => voice.say(say)} listening={voice.listening} onStopListening={voice.stop} /></section>
        <section className="toy-card mx-auto mt-6 max-w-md p-3 sm:p-5">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-[3px] border-hc-navy bg-white">
            <canvas ref={guide} width={W} height={H} className="absolute inset-0 h-full w-full" data-testid="trace-guide" />
            <canvas ref={ink} width={W} height={H} onPointerDown={down} onPointerMove={move} onPointerUp={() => (drawing.current = false)} onPointerCancel={() => (drawing.current = false)} className="absolute inset-0 h-full w-full touch-none" data-testid="trace-canvas" aria-label={`Trace the ${kind} ${ch}`} />
          </div>
          <div className="mt-4 flex justify-center gap-3">
            <ToyButton color="white" onClick={clearInk} disabled={s.solved} data-testid="trace-clear"><Eraser className="h-5 w-5" /> Clear</ToyButton>
            <ToyButton color="mint" className="px-8 text-xl" onClick={check} disabled={s.solved} data-testid="trace-check"><Check className="h-6 w-6" strokeWidth={3} /> Check</ToyButton>
          </div>
        </section>
        <div className="mt-8"><NextButton show={s.solved} isLast={s.isLast} onClick={s.next} /></div>
      </div>
    </main>
  );
}
