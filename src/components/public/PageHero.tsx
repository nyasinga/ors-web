import type { ReactNode } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";

const container =
  "mx-auto box-border w-[min(calc(100%-clamp(28px,5vw,80px)),1440px)] max-w-full max-[1200px]:w-[min(calc(100%-48px),1440px)] max-[640px]:w-[calc(100%-32px)] max-[380px]:!w-[calc(100%-24px)]";

type Props = {
  title: ReactNode;
  /** Secondary heading under the title (bold). */
  subtitle?: ReactNode;
  /** Body copy under subtitle. */
  description?: ReactNode;
  eyebrow?: string;
  breadcrumb?: string;
  image: string;
  imageAlt?: string;
  dark?: boolean;
  showMeta?: boolean;
  /** When true, location meta shows venue + city on one line. */
  combinedLocation?: boolean;
  className?: string;
  /** Optional extra content under meta (e.g. CTAs). */
  children?: ReactNode;
};

/**
 * Adaptive public page hero — copy left, modest-gap image right with white fade.
 * Stacks on tablet/mobile; image is never full-bleed.
 */
export function PageHero({
  title,
  subtitle,
  description,
  eyebrow,
  breadcrumb,
  image,
  imageAlt = "",
  dark = false,
  showMeta = true,
  combinedLocation = false,
  className,
  children,
}: Props) {
  const { t } = useTranslation("common");

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        dark ? "bg-[#021c5d] text-white" : "bg-white text-[#101827]",
        className,
      )}
    >
      <div
        className={cn(
          container,
          "relative grid items-stretch gap-6 pt-6 pb-7",
          "min-[961px]:grid-cols-[minmax(0,1fr)_minmax(280px,min(48%,640px))] min-[961px]:gap-8 min-[961px]:pb-8 min-[961px]:pt-7",
          "max-[960px]:gap-5 max-[960px]:pb-6",
          "max-[640px]:gap-4 max-[640px]:pb-5 max-[640px]:pt-5",
        )}
      >
        {/* Copy */}
        <div className="relative z-[2] min-w-0 max-[960px]:max-w-none">
          {breadcrumb ? (
            <p
              className={cn(
                "mb-3 text-[15px] max-[640px]:mb-2.5 max-[640px]:text-[11px]",
                dark ? "text-white/90" : "text-[#101827]",
              )}
            >
              <Link to="/" className="hover:underline">
                {t("nav.home")}
              </Link>{" "}
              <span className="px-2 opacity-65">›</span> {breadcrumb}
            </p>
          ) : null}

          <div
            className={cn(
              "mb-3 flex h-1.5 w-[min(132px,30vw)] max-[640px]:mb-3 max-[640px]:h-1 max-[640px]:w-[68px]",
              dark && "mb-3.5",
            )}
            aria-hidden
          >
            {dark ? (
              <i className="block h-full w-11 bg-[#ed1c24] max-[640px]:w-11" />
            ) : (
              <>
                <i className="block h-full w-1/2 bg-[#ed1c24]" />
                <i className="block h-full w-1/2 bg-[#08713f]" />
              </>
            )}
          </div>

          {eyebrow ? (
            <p
              className={cn(
                "mb-2.5 text-[14px] font-bold uppercase leading-none max-[640px]:mb-2 max-[640px]:text-[11px]",
                dark ? "text-white/85" : "text-[#1d3551]",
              )}
            >
              {eyebrow}
            </p>
          ) : null}

          <h1
            className={cn(
              "m-0 font-black leading-[0.94] tracking-[-0.04em]",
              "text-[clamp(2.15rem,5.2vw,4.3rem)]",
              "max-[640px]:text-[clamp(1.85rem,8vw,2.75rem)] max-[640px]:leading-[1.05]",
              dark ? "text-white tracking-[-0.03em]" : "text-[#101827]",
            )}
          >
            {title}
          </h1>

          {subtitle ? (
            <div
              className={cn(
                "mt-2 max-w-[38rem] text-[clamp(1rem,1.6vw,1.45rem)] font-extrabold leading-[1.15]",
                "max-[640px]:mt-2 max-[640px]:text-base max-[640px]:leading-[1.2]",
                dark ? "text-white" : "text-[#101827]",
              )}
            >
              {subtitle}
            </div>
          ) : null}

          {description ? (
            <p
              className={cn(
                "mt-3 max-w-[36rem] text-[clamp(0.875rem,1.2vw,1.125rem)] leading-[1.35]",
                "max-[640px]:mt-2.5 max-[640px]:text-[13px] max-[640px]:leading-[1.4]",
                dark ? "text-white/90" : "text-[#344256]",
              )}
            >
              {description}
            </p>
          ) : null}

          {showMeta ? (
            <div
              className={cn(
                "mt-4 flex flex-wrap items-center gap-x-4 gap-y-2.5",
                "max-[640px]:mt-3.5 max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-2",
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-2.5 text-[13px] max-[640px]:text-[11px]",
                  dark ? "text-white" : "text-[#101827]",
                )}
              >
                <CalendarDays
                  size={28}
                  strokeWidth={2}
                  className={cn(
                    "h-7 w-7 shrink-0 max-[640px]:h-[22px] max-[640px]:w-[22px]",
                    dark ? "text-white" : "text-[#0964df]",
                  )}
                />
                <strong className="font-extrabold">{t("event.datesShort")}</strong>
              </div>
              <div
                className={cn(
                  "hidden h-9 w-px sm:block max-[640px]:!hidden",
                  dark ? "bg-white/35" : "bg-[#b9c3ce]",
                )}
                aria-hidden
              />
              <div
                className={cn(
                  "flex items-center gap-2.5 text-[13px] max-[640px]:text-[11px]",
                  dark ? "text-white" : "text-[#101827]",
                )}
              >
                <MapPin
                  size={28}
                  strokeWidth={0}
                  fill="currentColor"
                  className={cn(
                    "h-7 w-7 shrink-0 max-[640px]:h-[22px] max-[640px]:w-[22px]",
                    dark ? "text-white" : "text-[#0964df]",
                  )}
                />
                {combinedLocation ? (
                  <strong className="font-extrabold">
                    {t("event.venue")}, {t("event.city")}
                  </strong>
                ) : (
                  <div>
                    <strong className="block font-extrabold">{t("event.city")}</strong>
                    <span
                      className={cn(
                        "block text-[11px] max-[640px]:text-[9px]",
                        dark ? "text-white/75" : "text-[#53627a]",
                      )}
                    >
                      {t("event.venue")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {children ? <div className="mt-4 max-[640px]:mt-3">{children}</div> : null}
        </div>

        {/* Image — modest panel inside the container; fades toward copy */}
        <div
          className={cn(
            "relative min-h-[200px] overflow-hidden rounded-[6px]",
            "min-[961px]:min-h-0 min-[961px]:self-stretch min-[961px]:rounded-none",
            "max-[960px]:h-[clamp(180px,38vw,260px)]",
            "max-[640px]:h-[clamp(150px,44vw,220px)]",
          )}
        >
          <img
            src={image}
            alt={imageAlt}
            className="absolute inset-0 h-full w-full object-cover object-[center_35%] max-[960px]:object-center"
          />
          {/* Soft fade from copy side into the photo */}
          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 w-[min(40%,200px)]",
              dark
                ? "bg-gradient-to-r from-[#021c5d] via-[#021c5d]/65 to-transparent"
                : "bg-gradient-to-r from-white via-white/80 to-transparent",
              "max-[960px]:inset-x-0 max-[960px]:top-0 max-[960px]:bottom-auto max-[960px]:h-[38%] max-[960px]:w-full",
              dark
                ? "max-[960px]:bg-gradient-to-b max-[960px]:from-[#021c5d] max-[960px]:via-[#021c5d]/70 max-[960px]:to-transparent"
                : "max-[960px]:bg-gradient-to-b max-[960px]:from-white max-[960px]:via-white/75 max-[960px]:to-transparent",
            )}
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}
