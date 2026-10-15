import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { PrivacyBar, RegisterHero } from "../../components/registration/RegisterChrome";
import { useToast } from "../../components/ui/Toast";
import { useRegistration } from "../../contexts/RegistrationContext";
import { usePublicEngagement } from "../../hooks/usePublicEngagement";
import { cn } from "../../lib/cn";
import { engagementToPublicSponsors } from "../../lib/publicEvent";
import * as r from "../../components/registration/registerStyles";

const priceColor: Record<string, string> = {
  platinum: "text-[#075fd8]",
  gold: "text-[#b77d00]",
  silver: "text-[#53617b]",
  bronze: "text-[#ad321e]",
};

/** Register Now → Sponsor path: choose package before Details. */
export function RegisterSponsorPackagePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { engagement } = usePublicEngagement();
  const {
    participationType,
    selectedSponsorPackage,
    selectSponsorPackage,
  } = useRegistration();

  const packages = useMemo(() => engagementToPublicSponsors(engagement), [engagement]);
  const [selectedId, setSelectedId] = useState(
    selectedSponsorPackage?.id || packages[0]?.id || "",
  );

  useEffect(() => {
    if (!packages.some((p) => p.id === selectedId)) {
      setSelectedId(packages[0]?.id || "");
    }
  }, [packages, selectedId]);

  if (participationType !== "sponsor") {
    return <Navigate to="/register" replace />;
  }

  const selected = packages.find((p) => p.id === selectedId) || packages[0];

  const continueToDetails = () => {
    if (!selected) {
      toast.error("No sponsorship packages are available yet.");
      return;
    }
    selectSponsorPackage(selected, "register");
    navigate("/register/details");
  };

  return (
    <div className={r.registerPage}>
      <RegisterHero current={2} />

      <main className={r.main}>
        <div className={cn(r.container, r.layout)}>
          <section className={cn(r.card, r.section)}>
            <h2 className={r.sectionTitle}>2. Select Package</h2>
            <p className={r.subtitle}>
              Choose a sponsorship package to continue with your registration details.
            </p>

            {!selected ? (
              <p className="rounded-lg border border-[#dbe5f0] bg-[#f7fbff] px-4 py-8 text-center text-[13px] text-[#53627a]">
                No sponsorship packages have been published for this event yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
                {packages.map((item) => {
                  const active = selectedId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={cn(
                        "relative flex min-h-[200px] flex-col rounded-lg px-3 pb-3 pt-4 text-left cursor-pointer",
                        active
                          ? "border-[1.5px] border-[#075fe5] bg-[#f5f9ff]"
                          : "border border-[#dbe5f0] bg-white",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute right-2 top-2 grid h-[22px] w-[22px] place-items-center rounded-full bg-[#075fe5] text-[13px] text-white",
                          active ? "grid" : "hidden",
                        )}
                        aria-hidden
                      >
                        ✓
                      </span>
                      <div className="mb-2 flex h-[56px] items-center justify-center">
                        <img
                          className="h-[52px] w-auto object-contain"
                          src={item.medal}
                          alt=""
                        />
                      </div>
                      <h3 className="text-[15px] font-extrabold text-[#10216d]">{item.name}</h3>
                      <div
                        className={cn(
                          "mt-1 text-[18px] font-black",
                          priceColor[item.tierKey] || "text-[#075fe5]",
                        )}
                      >
                        {item.price}
                      </div>
                      <p className="mt-2 text-[12px] leading-snug text-[#5a6881]">
                        {item.description}
                      </p>
                      <ul className="mt-3 m-0 list-none p-0">
                        {item.benefits.slice(0, 3).map((benefit) => (
                          <li
                            key={benefit}
                            className="my-1 text-[11px] text-[#5a6881] before:mr-1.5 before:content-['✓'] before:text-[#078047]"
                          >
                            {benefit}
                          </li>
                        ))}
                        {item.benefits.length > 3 ? (
                          <li className="my-1 text-[11px] text-[#075fe5] font-semibold">
                            +{item.benefits.length - 3} more benefits
                          </li>
                        ) : null}
                      </ul>
                    </button>
                  );
                })}
              </div>
            )}

            <div className={r.actions}>
              <Link className={r.btn} to="/register">
                ← Back
              </Link>
              <button
                type="button"
                className={r.btnPrimary}
                disabled={!selected}
                onClick={continueToDetails}
              >
                Next: Personal Details{" "}
                <span className={r.arrow} aria-hidden>
                  →
                </span>
              </button>
            </div>
          </section>

          <aside className={r.sidebar}>
            {selected ? (
              <div className={r.sidePrice}>
                <div className={r.priceLabel}>🏷 Selected Package</div>
                <div className={r.period}>
                  {selected.name} &nbsp; <b>Sponsorship</b>
                </div>
                <div className={r.price}>{selected.price}</div>
                <div className={r.period}>{selected.description}</div>
              </div>
            ) : null}
            <div className={r.infoBox}>
              <div className={r.infoTitle}>👥 What&apos;s Included?</div>
              <p className={r.infoText}>
                {(selected?.benefits || []).map((item) => (
                  <span key={item}>
                    ✓ {item}
                    <br />
                  </span>
                ))}
              </p>
            </div>
          </aside>
        </div>
      </main>

      <PrivacyBar />
    </div>
  );
}
