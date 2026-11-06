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
const G = 150;
const CELL = W / G;
const LANE = 26;
const glyph = (ctx, ch, fill, stroke, lw) => {
  ctx.font = `700 ${H * 0.78}px Fredoka, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (fill) { ctx.fillStyle = fill; ctx.fillText(ch, W / 2, H * 0.54); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = "round"; ctx.strokeText(ch, W / 2, H * 0.54); }
};

const maskGrid = (ch, lw) => {
  const c = document.createElement("canvas");
  c.width = G; c.height = G;
  const x = c.getContext("2d");
  x.scale(G / W, G / H);
  glyph(x, ch, "#000", "#000", lw);
  const d = x.getImageData(0, 0, G, G).data;
  const m = new Uint8Array(G * G);
  for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 127 ? 1 : 0;
  return m;
};

// Zhang-Suen thinning: reduces the letter lane to its one-pixel centre path.
const thin = (src) => {
  const a = src.slice();
  const at = (x, y) => a[y * G + x];
  let changed = true;
  while (changed) {
    changed = false;
    for (const step of [0, 1]) {
      const del = [];
      for (let y = 1; y < G - 1; y++) {
        for (let x = 1; x < G - 1; x++) {
          if (!at(x, y)) continue;
          const p = [at(x, y - 1), at(x + 1, y - 1), at(x + 1, y), at(x + 1, y + 1), at(x, y + 1), at(x - 1, y + 1), at(x - 1, y), at(x - 1, y - 1)];
          const b = p.reduce((s, v) => s + v, 0);
          if (b < 2 || b > 6) continue;
          let t = 0;
          for (let i = 0; i < 8; i++) if (!p[i] && p[(i + 1) % 8]) t++;
          if (t !== 1) continue;
          if (step === 0 ? (p[0] && p[2] && p[4]) || (p[2] && p[4] && p[6]) : (p[0] && p[2] && p[6]) || (p[0] && p[4] && p[6])) continue;
          del.push(y * G + x);
        }
      }
      if (del.length) { changed = true; del.forEach((i) => { a[i] = 0; }); }
    }
  }
  const pts = [];
  for (let i = 0; i < a.length; i++) if (a[i]) pts.push(i);
  return pts;
};

const buildShape = (ch) => ({ path: thin(maskGrid(ch, LANE)), near: maskGrid(ch, LANE + 56) });

// Success = the child's line runs along the letter's centre path, mostly staying inside the lane.
const score = (ink, shape) => {
  const d = ink.getContext("2d").getImageData(0, 0, W, H).data;
  const on = new Uint8Array(G * G);
  let inkN = 0, outside = 0;
  for (let y = 0; y < G; y++) {
    for (let x = 0; x < G; x++) {
      const px = Math.floor(x * CELL + CELL / 2), py = Math.floor(y * CELL + CELL / 2);
      if (d[(py * W + px) * 4 + 3] > 0) { on[y * G + x] = 1; inkN++; if (!shape.near[y * G + x]) outside++; }
    }
  }
  const R = 4;
  let covered = 0;
  for (const i of shape.path) {
    const cx = i % G, cy = Math.floor(i / G);
    let hit = false;
    for (let dy = -R; dy <= R && !hit; dy++) {
      for (let dx = -R; dx <= R; dx++) {
        const x = cx + dx, y = cy + dy;
        if (x >= 0 && y >= 0 && x < G && y < G && on[y * G + x]) { hit = true; break; }
      }
    }
    if (hit) covered++;
  }
  return { coverage: shape.path.length ? covered / shape.path.length : 0, outside: inkN ? outside / inkN : 1, inkN };
};

const passes = (r) => r.coverage >= 0.8 && r.outside <= 0.3;

export default function TracingGame({ activity }) {
  const s = useGameSession(activity.id, TRACE_TARGETS.length);
  const ch = TRACE_TARGETS[s.index];
  const kind = /\d/.test(ch) ? "number" : "letter";
  const guide = useRef(null);
  const ink = useRef(null);
  const drawing = useRef(false);
  const shape = useRef(null);
  const [mood, setMood] = useState("happy");
  const [text, setText] = useState("Draw along the dotted path, staying between the lines.");
  const say = `Let's trace the ${kind} ${ch}! Draw along the dotted path, between the lines.`;
  const voice = useVoice((cmd) => { if (cmd === "next" && s.solved) s.next(); else voice.say(say); });

  const clearInk = () => ink.current.getContext("2d").clearRect(0, 0, W, H);
  useEffect(() => {
    const draw = () => {
      const g = guide.current.getContext("2d");
      g.clearRect(0, 0, W, H);
      glyph(g, ch, "#7FB8E6", "#7FB8E6", LANE + 8);
      glyph(g, ch, "#E8F4FD", "#E8F4FD", LANE);
      shape.current = buildShape(ch);
      const kept = [];
      g.fillStyle = "#8DBFE8";
      for (const i of shape.current.path) {
        const x = (i % G) * CELL + CELL / 2, y = Math.floor(i / G) * CELL + CELL / 2;
        if (kept.some(([kx, ky]) => (kx - x) ** 2 + (ky - y) ** 2 < 22 * 22)) continue;
        kept.push([x, y]);
        g.beginPath(); g.arc(x, y, 5, 0, Math.PI * 2); g.fill();
      }
    };
    document.fonts?.ready.then(draw);
    draw();
    clearInk(); setMood("happy"); setText("Draw along the dotted path, staying between the lines.");
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

  const succeed = () => {
    s.registerCorrect();
    const m = `Congratulations! You traced the ${kind} ${ch} beautifully!`;
    setMood("celebrate"); setText(m); sfx.correct(); voice.say(m, { listenAfter: true });
  };

  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (!s.solved && shape.current && passes(score(ink.current, shape.current))) succeed();
  };

  const check = () => {
    if (s.solved || !shape.current) return;
    const r = score(ink.current, shape.current);
    if (passes(r)) { succeed(); return; }
    const level = s.registerWrong();
    const m = r.inkN === 0 ? `Let's start! Put your finger on the dotted path inside the ${kind} ${ch} and follow it.`
      : r.outside > 0.3 ? `Good try! Some lines went outside the ${kind}. Stay between the lines. ${level > 1 ? "Go slowly, like a snail!" : "Try again!"}`
      : `Nearly there! Follow every part of the ${kind} ${ch}. Try again!`;
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
            <canvas ref={ink} width={W} height={H} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} className="absolute inset-0 h-full w-full touch-none" data-testid="trace-canvas" aria-label={`Trace the ${kind} ${ch}`} />
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
