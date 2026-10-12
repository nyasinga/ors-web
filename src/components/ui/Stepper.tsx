import { Check } from "lucide-react";
import { cn } from "../../lib/cn";

export type Step = { id: string | number; label: string; description?: string };

type Props = {
  steps: Step[];
  current: number;
  className?: string;
  /** Completed step colour — registration uses green; create-event wizard uses blue */
  doneTone?: "green" | "blue";
  /** Click a completed (or current) step to jump back — keeps wizard interactive */
  onStepClick?: (stepNumber: number) => void;
};

/** 1-based current step index — done = green/blue, active = blue */
export function Stepper({ steps, current, className, doneTone = "green", onStepClick }: Props) {
  const doneBg = doneTone === "blue" ? "bg-blue text-white" : "bg-green text-white";
  const doneText = doneTone === "blue" ? "text-blue" : "text-green";
  const doneLine = doneTone === "blue" ? "bg-blue" : "bg-green";

  return (
    <ol className={cn("flex w-full items-center gap-0 overflow-x-auto", className)}>
      {steps.map((step, index) => {
        const n = index + 1;
        const done = n < current;
        const active = n === current;
        const clickable = Boolean(onStepClick) && n <= current;
        return (
          <li key={step.id} className="flex min-w-0 flex-1 items-center">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => onStepClick?.(n)}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1 px-1",
                clickable && "cursor-pointer",
                !clickable && "cursor-default",
              )}
              aria-current={active ? "step" : undefined}
              aria-label={step.label}
            >
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full text-sm font-bold transition-[transform,background-color,color,box-shadow] duration-200",
                  done && doneBg,
                  active && "bg-blue text-white scale-110 shadow-[0_0_0_4px_rgba(7,100,232,0.14)]",
                  !done && !active && "bg-slate-100 text-mute",
                  clickable && !active && "hover:scale-105",
                )}
              >
                {done ? <Check size={16} /> : n}
              </span>
              <span
                className={cn(
                  "truncate text-center text-xs font-semibold transition-colors duration-200",
                  done && doneText,
                  active && "text-blue",
                  !done && !active && "text-mute",
                )}
              >
                {step.label}
              </span>
              {step.description ? (
                <span className="hidden truncate text-center text-[10px] text-mute sm:block">
                  {step.description}
                </span>
              ) : null}
            </button>
            {index < steps.length - 1 ? (
              <div
                className={cn(
                  "mb-5 h-0.5 flex-1 transition-colors duration-300",
                  n < current ? doneLine : "bg-slate-200",
                )}
                aria-hidden
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
