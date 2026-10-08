import { Check } from "lucide-react";
import { cn } from "../../lib/cn";

export type Step = { id: string | number; label: string; description?: string };

type Props = {
  steps: Step[];
  current: number;
  className?: string;
  /** Completed step colour — registration uses green; create-event wizard uses blue */
  doneTone?: "green" | "blue";
};

/** 1-based current step index — done = green/blue, active = blue */
export function Stepper({ steps, current, className, doneTone = "green" }: Props) {
  const doneBg = doneTone === "blue" ? "bg-blue text-white" : "bg-green text-white";
  const doneText = doneTone === "blue" ? "text-blue" : "text-green";
  const doneLine = doneTone === "blue" ? "bg-blue" : "bg-green";

  return (
    <ol className={cn("flex w-full items-center gap-0 overflow-x-auto", className)}>
      {steps.map((step, index) => {
        const n = index + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={step.id} className="flex min-w-0 flex-1 items-center">
            <div className="flex min-w-0 flex-col items-center gap-1 px-1">
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full text-sm font-bold",
                  done && doneBg,
                  active && "bg-blue text-white",
                  !done && !active && "bg-slate-100 text-mute",
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check size={16} /> : n}
              </span>
              <span
                className={cn(
                  "truncate text-center text-xs font-semibold",
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
            </div>
            {index < steps.length - 1 ? (
              <div
                className={cn("mb-5 h-0.5 flex-1", n < current ? doneLine : "bg-slate-200")}
                aria-hidden
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
