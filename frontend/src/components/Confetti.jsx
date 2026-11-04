import { useMemo } from "react";

const COLORS = ["#FFC93C", "#63BCF7", "#3DD6A3", "#FF9A52", "#C9B6FF", "#FF7F91"];

export const Confetti = ({ count = 70 }) => {
  const pieces = useMemo(() => Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    size: 8 + Math.random() * 10,
    delay: Math.random() * 2.5,
    dur: 3.5 + Math.random() * 3,
    drift: `${(Math.random() - 0.5) * 160}px`,
    color: COLORS[i % COLORS.length],
    round: i % 3 === 0,
  })), [count]);
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true" data-testid="confetti">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="hc-confetti border-2 border-hc-navy"
          style={{
            left: `${p.left}%`, width: p.size, height: p.round ? p.size : p.size * 0.6,
            background: p.color, borderRadius: p.round ? "50%" : 3,
            animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, "--drift": p.drift,
          }}
        />
      ))}
    </div>
  );
};
