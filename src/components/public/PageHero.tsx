import { CalendarDays, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEventCopy } from "../../i18n/useEventCopy";
import { cn } from "../../lib/cn";

type Props = {
  title: string;
  /** Secondary heading under the title (bold). */
  subtitle?: string;
  /** Body copy under subtitle. */
  description?: string;
  eyebrow?: string;
  breadcrumb?: string;
  image?: string;
  dark?: boolean;
  showMeta?: boolean;
  /** When true, location meta shows venue + city on one line (Venue page). */
  combinedLocation?: boolean;
  showTagline?: boolean;
  className?: string;
};

export function PageHero({
  title,
  subtitle,
  description,
  eyebrow,
  breadcrumb,
  image = "/placeholders/skyline.jpg",
  dark = false,
  showMeta = true,
  combinedLocation = false,
  showTagline,
  className,
}: Props) {
  const { t } = useTranslation("common");
  const event = useEventCopy();
  const taglineVisible = showTagline ?? !dark;

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-slate-200",
        dark ? "bg-navy text-white" : "bg-white text-ink",
        className,
      )}
    >
      <img
        src={image}
        alt=""
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 h-full w-full object-cover object-right",
          dark ? "opacity-50" : "opacity-90",
        )}
      />
      <div
        className={cn(
          "absolute inset-0",
          dark
            ? "bg-gradient-to-r from-navy via-navy/85 to-navy/40"
            : "bg-gradient-to-r from-white via-white/95 to-white/25",
        )}
        aria-hidden
      />
      <div className="page-container relative grid gap-4 py-10 md:py-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          {breadcrumb ? (
            <p className={cn("mb-2 text-xs", dark ? "text-white/80" : "text-mute")}>
              <Link to="/" className="hover:underline">
                {t("nav.home")}
              </Link>{" "}
              <span className="opacity-60">/</span> {breadcrumb}
            </p>
          ) : null}
          <div className="mb-3 flex h-1 w-12 overflow-hidden rounded-sm" aria-hidden>
            <span className="w-1/2 bg-red" />
            <span className="w-1/2 bg-green" />
          </div>
          {eyebrow ? (
            <p
              className={cn(
                "mb-2 text-xs font-bold tracking-[0.14em] uppercase",
                dark ? "text-white/80" : "text-navy",
              )}
            >
              {eyebrow}
            </p>
          ) : null}
          <h1
            className={cn(
              "max-w-[22ch] text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl",
              dark ? "text-white" : "text-ink",
            )}
          >
            {title}
          </h1>
          {subtitle ? (
            <p
              className={cn(
                "mt-2 max-w-2xl text-base font-bold md:text-lg",
                dark ? "text-white" : "text-ink",
              )}
            >
              {subtitle}
            </p>
          ) : null}
          {description ? (
            <p className={cn("mt-3 max-w-xl text-sm md:text-base", dark ? "text-white/85" : "text-mute")}>
              {description}
            </p>
          ) : null}
          {showMeta ? (
            <div className="mt-5 flex flex-wrap gap-4 md:gap-6">
              <div className="flex items-start gap-2 text-sm">
                <CalendarDays size={18} className={dark ? "text-white" : "text-blue"} />
                <strong className={dark ? "text-white" : "text-ink"}>{event.dates}</strong>
              </div>
              <div className={cn("hidden h-10 w-px sm:block", dark ? "bg-white/30" : "bg-slate-200")} />
              <div className="flex items-start gap-2 text-sm">
                <MapPin size={18} className={cn("shrink-0", dark ? "text-white" : "text-blue")} />
                {combinedLocation ? (
                  <strong className={cn("block max-w-xs", dark ? "text-white" : "text-ink")}>
                    {event.venue}, {event.city}
                  </strong>
                ) : (
                  <div>
                    <strong className={cn("block", dark ? "text-white" : "text-ink")}>{event.city}</strong>
                    <span className={cn("text-xs", dark ? "text-white/75" : "text-mute")}>{event.venue}</span>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
        {taglineVisible ? (
          <div className="max-w-[26ch] justify-self-start lg:justify-self-end lg:text-right">
            <div className="mb-2 ml-auto hidden h-1 w-10 bg-red lg:block" aria-hidden />
            <p className={cn("text-sm font-semibold", dark ? "text-white" : "text-ink")}>{event.tagline}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
