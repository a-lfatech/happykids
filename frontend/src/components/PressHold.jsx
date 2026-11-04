import { useRef, useState } from "react";
import { Lock } from "lucide-react";

export const PressHold = ({ onComplete, duration = 3000, testId }) => {
  const [p, setP] = useState(0);
  const raf = useRef();
  const t0 = useRef(0);

  const cancel = () => { cancelAnimationFrame(raf.current); setP(0); };
  const tick = () => {
    const v = Math.min(1, (performance.now() - t0.current) / duration);
    setP(v);
    if (v >= 1) { cancel(); onComplete(); } else raf.current = requestAnimationFrame(tick);
  };
  const start = () => { cancelAnimationFrame(raf.current); t0.current = performance.now(); raf.current = requestAnimationFrame(tick); };
  const C = 2 * Math.PI * 16;

  return (
    <button
      type="button"
      data-testid={testId}
      aria-label="Grown-up corner: press and hold for 3 seconds"
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !e.repeat) { e.preventDefault(); start(); } }}
      onKeyUp={cancel}
      onContextMenu={(e) => e.preventDefault()}
      className="toy-btn inline-flex items-center gap-2 bg-white px-3 text-sm sm:text-base"
      style={{ touchAction: "none" }}
    >
      <span className="relative grid h-9 w-9 place-items-center">
        <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
          <circle cx="20" cy="20" r="16" fill="none" stroke="#EEE7FF" strokeWidth="5" />
          <circle cx="20" cy="20" r="16" fill="none" stroke="#FF7F91" strokeWidth="5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - p)} />
        </svg>
        <Lock className="relative h-4 w-4" strokeWidth={3} />
      </span>
      <span className="text-left leading-tight">
        Grown-ups
        <span className="block font-nunito text-xs font-bold opacity-70">{p > 0 ? "Keep holding..." : "Hold 3 seconds"}</span>
      </span>
    </button>
  );
};
