import type { SelectHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type Option = { value: string; label: string };

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
};

export function Select({
  label,
  error,
  options,
  placeholder,
  id,
  className,
  ...rest
}: Props) {
  const selectId = id ?? rest.name;
  return (
    <label className="grid gap-1.5 text-sm">
      {label ? (
        <span className="font-medium text-ink">
          {label}
          {rest.required ? <span className="text-red"> *</span> : null}
        </span>
      ) : null}
      <select
        id={selectId}
        className={cn(
          "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-ink",
          "focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20",
          error && "border-red",
          className,
        )}
        aria-invalid={Boolean(error) || undefined}
        {...rest}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <span className="text-xs text-red" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}
