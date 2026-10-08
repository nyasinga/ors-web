import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padded?: boolean;
};

export function Card({ children, className, padded = true, ...rest }: Props) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white shadow-card",
        padded && "p-4 md:p-5",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
