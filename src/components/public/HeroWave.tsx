import { cn } from "../../lib/cn";

type Props = {
  /** White scoop under dark heroes (Register / Participant Login). */
  variant?: "light" | "brand";
  className?: string;
};

/** Bottom edge divider matching Screen B hero curves. */
export function HeroWave({ variant = "light", className }: Props) {
  if (variant === "brand") {
    return (
      <div
        className={cn("pointer-events-none absolute inset-x-0 bottom-0 leading-[0]", className)}
        aria-hidden
      >
        <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="block h-10 w-full md:h-14">
          <path
            fill="#0B45E0"
            d="M0,28 C200,64 420,8 720,32 C1000,56 1220,12 1440,36 L1440,72 L0,72 Z"
          />
          <path
            fill="#0B7A3B"
            d="M0,40 C260,70 480,24 720,42 C960,60 1200,30 1440,48 L1440,72 L0,72 Z"
          />
          <path
            fill="#D7263D"
            d="M0,52 C300,74 540,44 720,54 C980,68 1240,48 1440,58 L1440,72 L0,72 Z"
            opacity="0.9"
          />
          <path
            fill="#ffffff"
            d="M0,60 C340,78 700,52 1000,62 C1220,70 1360,64 1440,62 L1440,72 L0,72 Z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={cn("pointer-events-none absolute inset-x-0 bottom-0 leading-[0]", className)}
      aria-hidden
    >
      <svg viewBox="0 0 1440 56" preserveAspectRatio="none" className="block h-8 w-full md:h-11">
        <path
          fill="#ffffff"
          d="M0,28 C240,56 480,8 720,28 C960,48 1200,12 1440,30 L1440,56 L0,56 Z"
        />
      </svg>
    </div>
  );
}
