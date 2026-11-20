import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { DEFAULT_EVENT_ENDED_BANNER } from "../../lib/resources";

type Props = {
  /** Resolved banner image URL (packaged art or admin upload). */
  bannerUrl?: string | null;
  /** Optional message shown under the artwork (admin override). */
  message?: string | null;
  className?: string;
};

/**
 * Full homepage hero when Event Ended is active — client artwork first,
 * with programme / info CTAs beneath for navigation.
 */
export function EventEndedHero({ bannerUrl, message, className }: Props) {
  const { t } = useTranslation("common");
  const src = bannerUrl?.trim() || DEFAULT_EVENT_ENDED_BANNER;
  const note = message?.trim();

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden bg-white",
        "animate-[eventEndedHeroIn_0.55s_ease-out_both]",
        className,
      )}
      aria-label={t("actions.eventEnded")}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full",
          "bg-[conic-gradient(from_210deg,#ed1c24_0deg,#075fd8_120deg,#08713f_240deg,#ed1c24_360deg)]",
          "opacity-[0.12] blur-2xl max-[640px]:h-28 max-[640px]:w-28",
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute -bottom-12 -left-10 h-44 w-44 rounded-full",
          "bg-[conic-gradient(from_40deg,#08713f_0deg,#075fd8_140deg,#ed1c24_260deg,#08713f_360deg)]",
          "opacity-[0.12] blur-2xl max-[640px]:h-28 max-[640px]:w-28",
        )}
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-[1600px] px-[clamp(4px,1vw,16px)] pt-3 sm:pt-5">
        <img
          src={src}
          alt={t("actions.eventEnded")}
          className={cn(
            "mx-auto block h-auto w-full object-contain",
            "rounded-sm shadow-[0_8px_28px_rgba(8,16,28,0.08)]",
          )}
        />

        {note ? (
          <p className="mx-auto mt-5 max-w-[640px] whitespace-pre-line text-center text-[13.5px] leading-[1.55] text-[#3a4454]">
            {note}
          </p>
        ) : null}

        <div
          className={cn(
            "mx-auto mt-6 flex max-w-[520px] flex-wrap justify-center gap-3 pb-10",
            "max-[640px]:grid max-[640px]:grid-cols-1 max-[640px]:pb-8",
          )}
        >
          <Link
            to="/programme"
            className={cn(
              "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[7px] bg-[#075fd8] px-5 text-[14px] font-bold text-white",
              "max-[640px]:w-full",
            )}
          >
            {t("actions.viewProgramme")}
            <span aria-hidden>→</span>
          </Link>
          <Link
            to="/info"
            className={cn(
              "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[7px] border border-[#08713f] bg-white px-5 text-[14px] font-bold text-[#08713f]",
              "max-[640px]:w-full",
            )}
          >
            {t("nav.info")}
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes eventEndedHeroIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
