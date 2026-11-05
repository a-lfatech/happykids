const fit = (min, vh, max) => ({ fontSize: `clamp(${min}rem, ${vh}vh, ${max}rem)` });

const Box = ({ children, dashed }) => (
  <span className={`grid min-w-[1.6em] place-items-center rounded-2xl border-[3px] border-hc-navy px-2 font-fredoka font-bold leading-none ${dashed ? "border-dashed bg-hc-sunlight" : "bg-white"}`} style={{ minHeight: "1.6em" }}>
    {children}
  </span>
);

export default function QuestionVisual({ visual }) {
  if (!visual?.type) return null;

  if (visual.type === "count") {
    const n = Math.max(0, Math.min(Number(visual.n) || 0, 20));
    return (
      <div className="flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 leading-none" style={fit(1.75, n > 6 ? 6 : 8, n > 6 ? 3.5 : 4.5)} data-testid="visual-count" aria-label={`${n} pictures`}>
        {Array.from({ length: n }, (_, i) => <span key={i}>{visual.emoji}</span>)}
        {visual.plus ? (
          <>
            <span className="px-1 font-fredoka font-bold">+</span>
            <span className="rounded-full border-[3px] border-dashed border-hc-navy bg-hc-sunlight p-1">{visual.emoji}</span>
          </>
        ) : null}
      </div>
    );
  }

  if (visual.type === "pattern" || visual.type === "sequence") {
    const items = Array.isArray(visual.items) ? visual.items : [];
    const tail = visual.type === "pattern" ? [...items, "?"] : items;
    return (
      <div className="flex flex-wrap items-center justify-center gap-2" style={fit(1.75, 7, 4)} data-testid={`visual-${visual.type}`}>
        {tail.map((t, i) => (t === "?" ? <Box key={i} dashed>?</Box> : visual.type === "sequence" ? <Box key={i}>{t}</Box> : <span key={i} className="leading-none">{t}</span>))}
      </div>
    );
  }

  if (visual.type === "big") {
    return (
      <div className="rounded-[1.75rem] border-[3px] border-hc-navy bg-white px-6 py-2 text-center font-fredoka font-bold leading-tight" style={{ ...fit(2, 8, 4.5), boxShadow: "0 5px 0 #1F2547" }} data-testid="visual-big">
        {visual.text}
      </div>
    );
  }

  return null;
}
