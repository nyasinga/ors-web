import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type Tone = "neutral" | "blue" | "green" | "red" | "orange" | "purple";

type Props = {
  children: ReactNode;
  tone?: Tone;
  className?: string;
};

const tones: Record<Tone, string> = {
  neutral: "bg-slate-100 text-mute",
  blue: "bg-soft text-blue",
  green: "bg-green-50 text-green",
  red: "bg-red-50 text-red",
  orange: "bg-orange-50 text-orange-700",
  purple: "bg-purple-50 text-purple-700",
};

export function Pill({ children, tone = "neutral", className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
