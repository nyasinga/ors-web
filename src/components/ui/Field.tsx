import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type Props = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
};

/** Label + control + hint/error wrapper for composed fields */
export function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
}: Props) {
  return (
    <div className={cn("grid gap-1.5 text-sm", className)}>
      <label htmlFor={htmlFor} className="font-medium text-ink">
        {label}
        {required ? <span className="text-red"> *</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-mute">{hint}</p> : null}
      {error ? (
        <p className="text-xs text-red" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
