import { Check, Star } from "lucide-react";

const LABEL = { todo: "not started", current: "playing now", done: "completed", star: "completed first try" };

export const ProgressDots = ({ statuses }) => (
  <ol className="flex items-center gap-1.5 sm:gap-2" data-testid="progress-dots" aria-label="Puzzle progress">
    {statuses.map((s, i) => (
      <li
        key={i}
        data-testid={`progress-dot-${i}`}
        data-status={s}
        aria-label={`Puzzle ${i + 1}: ${LABEL[s]}`}
        className={`grid place-items-center rounded-full border-[3px] border-hc-navy transition-all duration-300 ${
          s === "current" ? "h-8 w-8 bg-hc-sunlight hc-pulse sm:h-9 sm:w-9" : "h-6 w-6 sm:h-7 sm:w-7"
        } ${s === "todo" ? "bg-white" : ""} ${s === "done" ? "bg-hc-mint" : ""} ${s === "star" ? "bg-hc-sun" : ""}`}
      >
        {s === "current" && <span className="font-fredoka text-sm font-bold">{i + 1}</span>}
        {s === "done" && <Check className="h-3.5 w-3.5" strokeWidth={4} />}
        {s === "star" && <Star className="h-3.5 w-3.5 fill-hc-navy" strokeWidth={2} />}
      </li>
    ))}
  </ol>
);
