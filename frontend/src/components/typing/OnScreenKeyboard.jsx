import { FINGERS, KEY_ROWS, fingerOf } from "../../data/typing";

const OFFSETS = ["pl-0", "pl-[4%]", "pl-[9%]"];

export const OnScreenKeyboard = ({ next, focusKeys = "abcdefghijklmnopqrstuvwxyz;,./" }) => {
  const target = next === "?" ? "/" : next?.toLowerCase();
  const finger = next ? fingerOf(next) : null;
  return (
    <div className="mx-auto w-full max-w-3xl select-none" aria-hidden="true" data-testid="onscreen-keyboard">
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {KEY_ROWS.map((row, r) => (
          <div key={r} className={`flex gap-1.5 sm:gap-2 ${OFFSETS[r]}`}>
            {row.map(([k, f]) => {
              const isNext = k === target;
              const inLesson = focusKeys.includes(k);
              return (
                <span
                  key={k}
                  className={`flex aspect-square flex-1 items-center justify-center rounded-lg border-[3px] border-hc-navy font-fredoka text-base font-bold uppercase transition-all duration-150 sm:rounded-xl sm:text-xl ${isNext ? `${FINGERS[f].color} -translate-y-1 scale-110` : inLesson ? "bg-white" : "bg-white/50 opacity-60"} ${r === 1 && (k === "f" || k === "j") ? "underline decoration-4 underline-offset-4" : ""}`}
                  style={{ boxShadow: isNext ? "0 5px 0 #1F2547" : "0 2px 0 #1F2547", maxWidth: "4.5rem" }}
                >
                  {k}
                </span>
              );
            })}
          </div>
        ))}
        <div className="flex justify-center">
          <span className={`flex h-10 w-1/2 items-center justify-center rounded-xl border-[3px] border-hc-navy text-sm font-bold transition-all sm:h-12 ${target === " " ? "-translate-y-1 bg-hc-sun" : "bg-white/60"}`} style={{ boxShadow: target === " " ? "0 5px 0 #1F2547" : "0 2px 0 #1F2547" }}>space</span>
        </div>
      </div>
      <p className="mt-3 text-center font-bold" aria-live="polite">
        {finger ? <>Use your <span className={`rounded-full border-2 border-hc-navy px-2 ${FINGERS[finger].color}`}>{FINGERS[finger].label}</span> finger</> : "\u00a0"}
      </p>
    </div>
  );
};
