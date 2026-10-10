import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CalendarDays, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEventCopy } from "../../i18n/useEventCopy";
import { cn } from "../../lib/cn";
import { pageContainer } from "../../lib/pageContainer";

export const RegistrationStep = {
  PARTICIPATION: 1,
  DETAILS: 2,
  PAYMENT: 3,
  CONFIRMATION: 4,
} as const;

export type RegistrationStep =
  (typeof RegistrationStep)[keyof typeof RegistrationStep];

const stepLabels: Record<RegistrationStep, string> = {
  [RegistrationStep.PARTICIPATION]: "Participation",
  [RegistrationStep.DETAILS]: "Details",
  [RegistrationStep.PAYMENT]: "Payment",
  [RegistrationStep.CONFIRMATION]: "Confirmation",
};

const registrationSteps: RegistrationStep[] = [
  RegistrationStep.PARTICIPATION,
  RegistrationStep.DETAILS,
  RegistrationStep.PAYMENT,
  RegistrationStep.CONFIRMATION,
];

const TOTAL_STEPS = registrationSteps.length;

type InitialRegistrationSelection = {
  type: string;
  package: string;
};

type HeroProps = {
  current?: RegistrationStep;
  defaultStep?: RegistrationStep;
  title?: string;
  subtitle?: string;
  crumb?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  onStepChange?: (step: RegistrationStep) => void;
  onInitialSelection?: (
    selection: InitialRegistrationSelection,
  ) => void;
};

/** Registration hero and responsive registration stepper. */
export function RegisterHero({
  current,
  defaultStep = RegistrationStep.PARTICIPATION,
  title = "Register for ISIPPE-3",
  subtitle = "Join global experts, policymakers and industry leaders to advance intellectual property protection and enforcement.",
  crumb = "Register",
  onNext,
  onPrevious,
  onStepChange,
  onInitialSelection,
}: HeroProps) {
  const { t } = useTranslation("common");
  const event = useEventCopy();
  const [searchParams, setSearchParams] = useSearchParams();

  // Capture the initial selection before removing the query parameters.
  const initialSelection = useRef<InitialRegistrationSelection | null>(
    null,
  );

  const initialized = useRef(false);
  const startedFromUrl = useRef(false);

  const [internalStep, setInternalStep] =
    useState<RegistrationStep>(() => {
      const type = searchParams.get("type");
      const packageName = searchParams.get("package");

      if (type && packageName) {
        initialSelection.current = {
          type,
          package: packageName,
        };

        startedFromUrl.current = true;

        return RegistrationStep.DETAILS;
      }

      return current ?? defaultStep;
    });

  // A URL-provided selection takes precedence over a stale parent step.
  const activeStep = startedFromUrl.current
    ? internalStep
    : current ?? internalStep;

  const progress = (activeStep / TOTAL_STEPS) * 100;

  const isFirstStep =
    activeStep === RegistrationStep.PARTICIPATION;

  const isLastStep =
    activeStep === RegistrationStep.CONFIRMATION;

  useEffect(() => {
    if (initialized.current) return;

    initialized.current = true;

    const selection = initialSelection.current;

    if (!selection) return;

    // Notify the parent of the initial step and selected package.
    onStepChange?.(RegistrationStep.DETAILS);
    onInitialSelection?.(selection);

    // Remove only the parameters consumed during initialization.
    const nextParams = new URLSearchParams(searchParams);

    nextParams.delete("type");
    nextParams.delete("package");

    setSearchParams(nextParams, { replace: true });
  }, [
    searchParams,
    setSearchParams,
    onStepChange,
    onInitialSelection,
  ]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 760px)").matches
    ) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [activeStep]);

  return (
    <>
      <section className="overflow-hidden bg-[#021c5d] text-white">
        <div
          className={cn(
            pageContainer,
            "min-h-[276px] pt-[23px]",
            "[background:linear-gradient(90deg,rgba(3,30,98,0.99)_0%,rgba(3,32,103,0.96)_35%,rgba(3,32,103,0.45)_55%,rgba(3,32,103,0)_78%),url('/assets/registration-hero.jpg')_96%_center/auto_108%_no-repeat]",
            "max-[1100px]:min-h-[390px]",
            "max-[1100px]:[background:linear-gradient(180deg,rgba(3,30,98,0.99)_0%,rgba(3,32,103,0.88)_48%,rgba(3,32,103,0.1)_100%),url('/assets/registration-hero.jpg')_center_bottom/auto_65%_no-repeat]",
            "max-[760px]:min-h-0 max-[760px]:pt-[18px]",
            "max-[760px]:[background:linear-gradient(180deg,rgba(3,30,98,0.99)_0%,rgba(3,32,103,0.99)_100%)]",
            "min-[1600px]:[background-size:auto,auto_110%]",
          )}
        >
          <div className="mb-3 text-[14px] text-white max-[760px]:text-[10px]">
            <Link to="/" className="hover:underline">
              {t("nav.home")}
            </Link>{" "}
            <span className="px-2 opacity-70">›</span>
            {crumb}
          </div>

          <div
            className="mb-3 h-1 w-[42px] bg-[#ed1c24] max-[760px]:h-[3px] max-[760px]:w-[38px]"
            aria-hidden="true"
          />

          <h1
            className={cn(
              "m-0 mb-[10px] text-[47px] font-black leading-[1.02] tracking-[-1.8px] text-white",
              "max-[760px]:text-[35px] max-[760px]:tracking-[-1.2px]",
              "max-[640px]:text-[clamp(1.85rem,8vw,2.75rem)] max-[640px]:tracking-[-0.04em] max-[640px]:leading-[1.05]",
            )}
          >
            {title}
          </h1>

          <p className="mb-[18px] max-w-[620px] text-[19px] leading-[1.3] text-white max-[760px]:mb-[13px] max-[760px]:max-w-[390px] max-[760px]:text-[12px]">
            {subtitle}
          </p>

          <div className="flex items-center gap-[17px] max-[760px]:block">
            <div className="mb-0 flex items-center gap-[10px] text-white max-[760px]:mb-[7px]">
              <div className="h-[34px] w-[34px] shrink-0 max-[760px]:h-[26px] max-[760px]:w-[26px]">
                <CalendarDays
                  size={34}
                  strokeWidth={2}
                  className="block h-[34px] w-[34px] max-[760px]:h-[26px] max-[760px]:w-[26px]"
                />
              </div>

              <strong className="text-[14px] font-extrabold max-[760px]:text-[11px]">
                {event.dates}
              </strong>
            </div>

            <div
              className="h-[39px] w-px bg-[#c8d3e5] max-[760px]:hidden"
              aria-hidden="true"
            />

            <div className="mb-0 flex items-center gap-[10px] text-white max-[760px]:mb-[7px]">
              <div className="h-[34px] w-[34px] shrink-0 max-[760px]:h-[26px] max-[760px]:w-[26px]">
                <MapPin
                  size={34}
                  strokeWidth={0}
                  fill="currentColor"
                  className="block h-[34px] w-[34px] max-[760px]:h-[26px] max-[760px]:w-[26px]"
                />
              </div>

              <strong className="text-[14px] font-extrabold max-[760px]:text-[11px]">
                {event.venue}
                <br />
                {event.city}
              </strong>
            </div>
          </div>
        </div>

        {/* Mobile visual */}
        <div
          className={cn(
            "relative z-0 hidden max-[960px]:order-2 max-[960px]:block",
            "max-[960px]:mx-[calc(50%-50vw)] max-[960px]:mt-0",
            "max-[960px]:h-[clamp(100px,20vw,180px)] max-[960px]:w-screen max-[960px]:max-w-none",
            "max-[960px]:bg-[url('/assets/hero-home-visual-mobile.png')]",
            "max-[960px]:bg-[length:100%_auto] max-[960px]:bg-top max-[960px]:bg-no-repeat",
            "max-[640px]:h-[clamp(90px,20vw,140px)]",
            "max-[380px]:h-[76px]",
          )}
          aria-hidden="true"
        />
      </section>

      {/* Registration progress */}
      <div className="pb-[14px] pt-5 max-[760px]:py-3">
        <div className={cn(pageContainer, "max-[760px]:px-4")}>
          {/* Desktop stepper */}
          <div
            className="grid grid-cols-[repeat(7,minmax(0,1fr))] items-center gap-0 max-[760px]:hidden"
            aria-label="Registration steps"
          >
            {registrationSteps.flatMap((step, index) => {
              const label = stepLabels[step];
              const done = step < activeStep;
              const active = step === activeStep;

              return [
                <div
                  key={label}
                  className={cn(
                    "flex items-center gap-[10px] whitespace-nowrap text-[13px]",
                    active
                      ? "font-bold text-[#075fe5]"
                      : "text-[#65728c]",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full font-extrabold",
                      active && "bg-[#075fe5] text-white",
                      done && "bg-[#078047] text-white",
                      !active &&
                        !done &&
                        "bg-[#edf1f6] text-[#1d2a42]",
                    )}
                  >
                    {done ? "✓" : step}
                  </span>

                  <span>{label}</span>
                </div>,

                ...(index < registrationSteps.length - 1
                  ? [
                      <span
                        key={`connector-${step}`}
                        className="h-px w-full bg-[#cfd9e6]"
                        aria-hidden="true"
                      />,
                    ]
                  : []),
              ];
            })}
          </div>

          {/* Mobile stepper */}
          <div
            className="hidden max-[760px]:block"
            aria-label="Registration progress"
          >
            <div className="flex items-center justify-between gap-3">
              <div
                className="flex min-w-0 items-center gap-3"
                aria-live="polite"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#075fe5] text-sm font-extrabold text-white">
                  {activeStep}
                </span>

                <div className="min-w-0">
                  <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#65728c]">
                    Step {activeStep} of {TOTAL_STEPS}
                  </p>

                  <p className="m-0 mt-0.5 text-[13px] font-bold text-[#10216d]">
                    {stepLabels[activeStep]}
                  </p>
                </div>
              </div>

              <span className="shrink-0 text-[12px] font-bold text-[#075fe5]">
                {Math.round(progress)}%
              </span>
            </div>

            <div
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#edf1f6]"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={TOTAL_STEPS}
              aria-valuenow={activeStep}
              aria-label="Registration progress"
            >
              <div
                className="h-full rounded-full bg-[#075fe5] transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function PrivacyBar() {
  return (
    <div
      className={cn(
        pageContainer,
        "mt-[10px] flex items-center justify-between gap-3 rounded-[7px] bg-[#f1f8ff] px-[15px] py-[11px] text-[#52627d]",
        "max-[760px]:block max-[760px]:p-[10px]",
      )}
    >
      <div>
        <strong className="text-[12px] text-[#10216d]">
          Data Privacy
        </strong>
        <br />
        <span className="text-[10px]">
          Your personal information will be used only for ISIPPE-3
          registration and event communications.
        </span>
      </div>

      <a
        href="#privacy"
        className="whitespace-nowrap text-[11px] font-bold text-[#064fd0] max-[760px]:mt-[5px] max-[760px]:block"
      >
        Read our Privacy Policy →
      </a>
    </div>
  );
}