import { CalendarCheck2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";

type Props = {
  /** Full event name for the thank-you paragraph. */
  eventName: string;
  /** e.g. 16th – 19th November 2026 */
  datesLabel: string;
  /** e.g. Mombasa, Kenya */
  placeLabel: string;
  className?: string;
  /** Compact card for registration / secondary pages. */
  variant?: "hero" | "page";
};

/**
 * Post-event homepage / gate notice — matches client “Event Ended” artwork intent.
 */
export function EventEndedNotice({
  eventName,
  datesLabel,
  placeLabel,
  className,
  variant = "hero",
}: Props) {
  const { t } = useTranslation(["home", "common"]);
  const place = placeLabel.trim() || "Mombasa, Kenya";
  const dates = datesLabel.trim() || "16th – 19th November 2026";
  const name =
    eventName.trim() ||
    "3rd International Symposium on Intellectual Property Protection and Enforcement (ISIPPE 2026)";

  const body = t("home:hero.ended.body", {
    eventName: name,
    dates,
    place,
  });

  return (
    <div
      className={cn(
        variant === "hero" ? "mt-5 max-w-[520px]" : "mx-auto max-w-xl text-center",
        className,
      )}
    >
      <div
        className={cn(
          "inline-flex items-center gap-2.5 rounded-full border-2 border-[#c6e86b]",
          "bg-[linear-gradient(90deg,#0b6b3a_0%,#08713f_45%,#0a8a4a_100%)]",
          "px-5 py-2.5 text-white shadow-[0_4px_14px_rgba(8,113,63,0.28)]",
          "animate-[eventEndedIn_0.55s_ease-out_both]",
        )}
        role="status"
      >
        <CalendarCheck2 className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden />
        <span className="text-[17px] font-extrabold italic tracking-wide sm:text-[18px]">
          {t("home:hero.ended.badge")}
        </span>
      </div>

      <p
        className={cn(
          "mt-4 whitespace-pre-line text-[13.5px] leading-[1.55] text-[#3a4454]",
          "animate-[eventEndedIn_0.65s_ease-out_0.08s_both]",
          variant === "page" && "text-[14px]",
        )}
      >
        {body}
      </p>

      <div
        className={cn(
          "mx-auto mt-3 h-0.5 w-16 rounded-full bg-[#08713f]",
          variant === "hero" && "mx-0",
        )}
        aria-hidden
      />

      <div
        className={cn(
          "mt-5 flex flex-wrap gap-3",
          variant === "page" && "justify-center",
          "max-[640px]:grid max-[640px]:grid-cols-1",
        )}
      >
        <Link
          to="/programme"
          className={cn(
            "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[7px] bg-[#075fd8] px-5 text-[14px] font-bold text-white",
            "max-[640px]:w-full",
          )}
        >
          {t("common:actions.viewProgramme")}
          <span aria-hidden>→</span>
        </Link>
        <Link
          to="/info"
          className={cn(
            "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[7px] border border-[#08713f] bg-white px-5 text-[14px] font-bold text-[#08713f]",
            "max-[640px]:w-full",
          )}
        >
          {t("common:nav.info")}
        </Link>
      </div>

      <style>{`
        @keyframes eventEndedIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
