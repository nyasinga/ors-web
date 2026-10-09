import { Link, useNavigate } from "react-router-dom";
import { Handshake, Mic2, Monitor, Users } from "lucide-react";
import { PrivacyBar, RegisterHero } from "../../components/registration/RegisterChrome";
import { useRegistration } from "../../contexts/RegistrationContext";
import { participationTypes, type ParticipationType } from "../../data/registration";
import { cn } from "../../lib/cn";
import * as r from "../../components/registration/registerStyles";

const icons = {
  delegate: Users,
  speaker: Mic2,
  sponsor: Handshake,
  virtual: Monitor,
} as const;

const iconColor = {
  delegate: "text-[#075fe5]",
  speaker: "text-[#ed1c24]",
  sponsor: "text-[#078047]",
  virtual: "text-[#10216d]",
} as const;

const includedLabel: Record<ParticipationType, string> = {
  delegate: "Delegates",
  speaker: "Speakers",
  sponsor: "Sponsors / Exhibitors",
  virtual: "Virtual Participants",
};

/** Registration step 1 — structure & CSS from HTML package */
export function RegisterParticipationPage() {
  const navigate = useNavigate();
  const { participationType, setParticipationType } = useRegistration();
  const selected = participationTypes.find((t) => t.id === participationType)!;
  const SelectedIcon = icons[selected.id];

  return (
    <div className={r.registerPage}>
      <RegisterHero current={1} />

      <main className={r.main}>
        <div className={cn(r.container, r.layout)}>
          <section className={cn(r.card, r.section)}>
            <h2 className={r.sectionTitle}>1. Participation</h2>
            <p className={r.subtitle}>Select how you will participate in ISIPPE-3.</p>

            <div className="grid grid-cols-[repeat(4,1fr)] gap-[11px] max-[760px]:grid-cols-[1fr] max-[760px]:gap-2">
              {participationTypes.map((type) => {
                const Icon = icons[type.id];
                const active = participationType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    className={cn(
                      "relative min-h-[190px] py-[18px] px-[13px] rounded-[7px] text-center [transition:0.15s] cursor-pointer w-full flex flex-col items-stretch",
                      "max-[760px]:min-h-[80px] max-[760px]:text-left max-[760px]:grid max-[760px]:grid-cols-[58px_1fr_24px] max-[760px]:items-center max-[760px]:p-[9px]",
                      active
                        ? "border-[1.5px] border-[#075fe5] bg-[#f5f9ff]"
                        : "border border-[#dbe5f0] bg-white",
                    )}
                    onClick={() => setParticipationType(type.id)}
                  >
                    <span
                      className={cn(
                        "absolute right-2 top-2 w-[25px] h-[25px] rounded-full bg-[#075fe5] text-white place-items-center text-[15px] leading-none max-[760px]:right-[7px] max-[760px]:top-[7px]",
                        active ? "grid" : "hidden",
                      )}
                      aria-hidden
                    >
                      ✓
                    </span>
                    <div
                      className={cn(
                        "h-[55px] mb-[9px] grid place-items-center max-[760px]:h-12 max-[760px]:m-0",
                        iconColor[type.id],
                      )}
                    >
                      <Icon
                        size={55}
                        strokeWidth={1.7}
                        className="block h-[55px] w-[55px] max-[760px]:h-12 max-[760px]:w-12"
                      />
                    </div>
                    <div>
                      <h3 className="text-[14px] text-[#10216d] mb-[5px] font-extrabold max-[760px]:text-[12px]">
                        {type.title}
                      </h3>
                      <p className="text-[12px] leading-[1.35] text-[#60708b] mb-[15px] flex-1 max-[760px]:text-[10px] max-[760px]:mt-[2px] max-[760px]:mb-0">
                        {type.description}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "block w-5 h-5 border-2 rounded-full m-auto max-[760px]:m-[0_2px_0_auto]",
                        active
                          ? "border-[#075fe5] relative after:content-[''] after:absolute after:inset-1 after:rounded-full after:bg-[#075fe5]"
                          : "border-[#acbad0]",
                      )}
                      aria-hidden
                    />
                  </button>
                );
              })}
            </div>

            <div className="mt-4 p-[17px] border border-[#dbe5f0] rounded-lg grid grid-cols-[62px_1fr] gap-[10px] max-[760px]:grid-cols-[42px_1fr] max-[760px]:p-[11px]">
              <div className="w-[54px] h-[54px] text-[#075fe5] max-[760px]:w-10 max-[760px]:h-10">
                <SelectedIcon
                  size={54}
                  strokeWidth={1.7}
                  className="block w-[54px] h-[54px] max-[760px]:w-10 max-[760px]:h-10"
                />
              </div>
              <div>
                <h3 className="mb-[9px] text-[#10216d] text-[15px] font-extrabold max-[760px]:text-[12px]">{`What's included for ${includedLabel[selected.id]}?`}</h3>
                <div className="grid grid-cols-[1fr_1fr] gap-x-5 gap-y-[7px] max-[760px]:grid-cols-[1fr] max-[760px]:gap-[5px]">
                  {selected.includes.map((item) => (
                    <span
                      key={item}
                      className="text-[12px] text-[#5a6881] flex items-start gap-0 before:content-['✓'] before:inline-grid before:place-items-center before:w-[18px] before:h-[18px] before:rounded-full before:bg-[#098047] before:text-white before:text-[11px] before:font-extrabold before:mr-[9px] before:shrink-0 before:mt-px max-[760px]:text-[10px]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className={r.actions}>
              <Link className={r.btn} to="/">
                ← Back to Home
              </Link>
              <button
                type="button"
                className={r.btnPrimary}
                onClick={() => navigate("/register/details")}
              >
                Next: Personal Details{" "}
                <span className={r.arrow} aria-hidden>
                  →
                </span>
              </button>
            </div>
          </section>

          <aside className={r.sidebar}>
            <div className={r.infoBox}>
              <div className={r.infoTitle}>
                <span className={r.infoIcon}>i</span>
                Registration Information
              </div>
              <p className={r.infoText}>
                Please select the option that best describes how you will participate. You can update
                your selection before the payment step.
              </p>
            </div>
            <div className="p-[15px] bg-[#f3f8ff] border border-[#e0eaf4] rounded-lg max-[760px]:p-3">
              <h3 className="mb-[10px] text-[#10216d] text-[14px] font-extrabold">
                Participation Categories
              </h3>
              {participationTypes.map((type) => {
                const Icon = icons[type.id];
                return (
                  <div key={type.id} className="grid grid-cols-[42px_1fr] gap-[10px] my-[13px]">
                    <div className={cn("w-[38px] h-[38px]", iconColor[type.id])}>
                      <Icon size={38} strokeWidth={1.7} className="block w-[38px] h-[38px]" />
                    </div>
                    <div>
                      <strong className="block text-[13px] text-[#10216d] max-[760px]:text-[11px]">
                        {type.title}
                      </strong>
                      <p className="mt-[2px] text-[11px] text-[#60708b] leading-[1.3] max-[760px]:text-[10px]">
                        {type.categoryBlurb}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </main>

      <PrivacyBar />
    </div>
  );
}
