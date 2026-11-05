const fit = (min, vh, max) => ({ fontSize: `clamp(${min}rem, ${vh}vh, ${max}rem)` });

const Box = ({ children, dashed }) => (
  <span className={`grid min-w-[1.6em] place-items-center rounded-2xl border-[3px] border-hc-navy px-2 font-fredoka font-bold leading-none ${dashed ? "border-dashed bg-hc-sunlight" : "bg-white"}`} style={{ minHeight: "1.6em" }}>
    {children}
  </span>
);

const Spot = ({ on, label, children }) => (
  <span className={`relative inline-block transition-transform duration-300 ${on ? "scale-125" : ""}`}>
    {children}
    {label != null && (
      <span className="absolute -bottom-1 left-1/2 grid h-6 w-6 -translate-x-1/2 place-items-center rounded-full border-2 border-hc-navy bg-hc-sunlight font-fredoka text-sm font-bold leading-none" aria-hidden="true">{label}</span>
    )}
  </span>
);

export const demoSteps = (visual) => {
  if (visual?.type === "count") {
    const n = Math.max(0, Math.min(Number(visual.n) || 0, 20)) + (visual.plus ? 1 : 0);
    return Array.from({ length: n }, (_, i) => String(i + 1));
  }
  if (visual?.type === "pattern") return [...(visual.items || []), "What comes next?"];
  if (visual?.type === "sequence") return (visual.items || []).map((t) => (t === "?" ? "Which number goes here?" : t));
  return [];
};

export default function QuestionVisual({ visual, step = null }) {
  if (!visual?.type) return null;
  const on = (i) => step === i;

  if (visual.type === "count") {
    const n = Math.max(0, Math.min(Number(visual.n) || 0, 20));
    return (
      <div className="flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 leading-none" style={fit(1.75, n > 6 ? 6 : 8, n > 6 ? 3.5 : 4.5)} data-testid="visual-count" aria-label={`${n} pictures`}>
        {Array.from({ length: n }, (_, i) => <Spot key={i} on={on(i)} label={step != null && i <= step ? i + 1 : null}>{visual.emoji}</Spot>)}
        {visual.plus ? (
          <>
            <span className="px-1 font-fredoka font-bold">+</span>
            <Spot on={on(n)} label={step != null && n <= step ? n + 1 : null}><span className="rounded-full border-[3px] border-dashed border-hc-navy bg-hc-sunlight p-1">{visual.emoji}</span></Spot>
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
        {tail.map((t, i) => (
          <Spot key={i} on={on(i)}>
            {t === "?" ? <Box dashed>?</Box> : visual.type === "sequence" ? <Box>{t}</Box> : <span className="leading-none">{t}</span>}
          </Spot>
        ))}
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
