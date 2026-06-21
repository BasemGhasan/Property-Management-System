// ============================================================================
// RequestTimeline — vertical progress tracker for a request's lifecycle.
// ============================================================================

// Imports
import { Check } from "lucide-react";
import type { TimelineStep } from "../../constants/resident";

// Interfaces
interface RequestTimelineProps {
  steps: TimelineStep[];
}

// Component
export function RequestTimeline({ steps }: RequestTimelineProps) {
  return (
    <ol className="relative flex flex-col">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const done = step.state === "done";
        const current = step.state === "current";

        return (
          <li key={step.label} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Connector line */}
            {!isLast && (
              <span
                className={`absolute left-[11px] top-6 h-full w-px ${
                  done ? "bg-green-500/40" : "bg-slate-700"
                }`}
              />
            )}

            {/* Node */}
            <span
              className={[
                "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                done
                  ? "border-green-500 bg-green-500 text-white"
                  : current
                  ? "border-blue-500 bg-blue-500/20 text-blue-300"
                  : "border-slate-700 bg-slate-800 text-slate-600",
              ].join(" ")}
            >
              {done ? (
                <Check size={13} />
              ) : (
                <span className={`h-2 w-2 rounded-full ${current ? "bg-blue-400" : "bg-slate-600"}`} />
              )}
            </span>

            {/* Label */}
            <div className="-mt-0.5">
              <p className={current ? "text-slate-100" : done ? "text-slate-300" : "text-slate-500"}>
                {step.label}
              </p>
              {step.date && <p className="mt-0.5 text-xs text-slate-500">{step.date}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
