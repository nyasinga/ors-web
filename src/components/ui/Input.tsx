import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export function Input({ label, error, hint, id, className, ...rest }: Props) {
  const inputId = id ?? rest.name;
  return (
    <label className="grid gap-1.5 text-sm">
      {label ? (
        <span className="font-medium text-ink">
          {label}
          {rest.required ? <span className="text-red"> *</span> : null}
        </span>
      ) : null}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-ink placeholder:text-mute/70",
          "focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20",
          error && "border-red focus:border-red focus:ring-red/20",
          className,
        )}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...rest}
      />
      {hint && !error ? (
        <span id={`${inputId}-hint`} className="text-xs text-mute">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={`${inputId}-error`} className="text-xs text-red" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}
