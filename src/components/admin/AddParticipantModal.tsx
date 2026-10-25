import { useEffect, useMemo, useState } from "react";
import { SearchableSelect } from "../ui/SearchableSelect";
import { COUNTRY_NAME_OPTIONS } from "../../data/countries";
import { participationTypes, type ParticipationType } from "../../data/registration";
import type { RegistrationDetails } from "../../contexts/registrationShared";
import { cn } from "../../lib/cn";
import {
  SPONSOR_COMPLIMENTARY_SEATS,
  sponsorSeatsRemaining,
  waiverReasonLabel,
  type WaiverReason,
} from "../../lib/participantWaiver";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

export type AddedParticipant = {
  id: string;
  name: string;
  email: string;
  org: string;
  type: string;
  category: string;
  status: string;
  date: string;
  time: string;
  checkIn: string;
  initials: string;
  avatarTone: string;
  title: string;
  phone: string;
  jobTitle: string;
  country: string;
  city: string;
  dietary: string;
  accessibility: string;
  participationType: ParticipationType;
  /** Ticket pass code — used for GET /ticketing/{passCode}/event-pass */
  passCode?: string;
  /** Engagement ticket id — used for GET /ticketing/{ticketID}/confirm */
  ticketID?: string;
  reference?: string;
  /** Raw API ticket status (issued | registered | checked-in | cancelled). */
  rawStatus?: string;
  /** payable | waived | complimentary — set when admin grants a waiver. */
  paymentMode?: "payable" | "waived" | "complimentary";
  waiverReason?: "staff" | "gov_speaker" | "sponsor_allocation";
  agencyName?: string;
  /** Paid sponsor ticket this complimentary seat is charged against. */
  sponsorTicketID?: string;
  transactionReference?: string;
  /** User-facing payment ref (VERIFIED| prefix stripped). */
  displayPaymentReference?: string;
  paymentReceiptURL?: string;
  /** Resolved bank payment proof file URL(s). */
  paymentProofUrls?: string[];
  verificationBucket?:
    | "draft"
    | "registered"
    | "pending_verification"
    | "confirmed"
    | "waived"
    | "complimentary"
    | "cancelled";
  /** Whether event pass / QR may be issued. */
  passAllowed?: boolean;
};

const emptyDetails: RegistrationDetails = {
  title: "",
  fullName: "",
  email: "",
  phone: "",
  organisation: "",
  jobTitle: "",
  country: "",
  city: "",
  dietary: "",
  accessibility: "",
};

const fieldClass =
  "h-9 w-full rounded-md border border-blue-100 bg-white px-2.5 text-[15px] text-[#07135f] outline-none focus:border-blue-400";
const fieldSelectClass = cn(fieldClass, "register-field-select");
const labelClass = "mb-1 block text-[14px] font-semibold text-[#26468e]";
const errorClass = "mt-0.5 block text-[13px] text-red-600";

export type AddParticipantDraft = {
  participationType: ParticipationType;
  details: RegistrationDetails;
  waiver?: {
    reason: WaiverReason;
    agencyName?: string;
    sponsorTicketID?: string;
  };
};

type Props = {
  open: boolean;
  busy?: boolean;
  /** Existing participants — used for sponsor complimentary seat picker. */
  participants?: AddedParticipant[];
  onClose: () => void;
  /** Persist participant (API). Throw to keep the modal open. */
  onAdd: (draft: AddParticipantDraft) => void | Promise<void>;
};

function isEligibleSponsor(p: AddedParticipant): boolean {
  if (p.participationType !== "sponsor") return false;
  if (p.status === "Cancelled" || p.status === "Pending") return false;
  if (p.paymentMode === "complimentary") return false;
  if (p.status === "Confirmed" || p.status === "Waived") return true;
  if ((p.rawStatus || "").includes("checked")) return true;
  return false;
}

export function AddParticipantModal({
  open,
  busy,
  participants = [],
  onClose,
  onAdd,
}: Props) {
  const [participationType, setParticipationType] = useState<ParticipationType>("delegate");
  const [details, setDetails] = useState<RegistrationDetails>(emptyDetails);
  const [grantWaiver, setGrantWaiver] = useState(false);
  const [waiverReason, setWaiverReason] = useState<WaiverReason>("staff");
  const [agencyName, setAgencyName] = useState("");
  const [sponsorTicketID, setSponsorTicketID] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setParticipationType("delegate");
    setDetails(emptyDetails);
    setGrantWaiver(false);
    setWaiverReason("staff");
    setAgencyName("");
    setSponsorTicketID("");
    setErrors({});
    setSubmitError(null);
  }, [open]);

  const sponsors = useMemo(() => {
    return participants
      .filter(isEligibleSponsor)
      .map((s) => {
        const id = s.ticketID || s.id;
        const remaining = sponsorSeatsRemaining(participants, id);
        return { ...s, seatId: id, remaining };
      })
      .filter((s) => s.remaining > 0);
  }, [participants]);

  const selectedRemaining = sponsorTicketID
    ? sponsorSeatsRemaining(participants, sponsorTicketID)
    : SPONSOR_COMPLIMENTARY_SEATS;

  const patch = (next: Partial<RegistrationDetails>) => {
    setDetails((prev) => ({ ...prev, ...next }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!details.title) next.title = "Select a title";
    if (!details.fullName.trim()) next.fullName = "Full name is required";
    if (!details.email.trim() || !details.email.includes("@")) next.email = "Valid email is required";
    if (!details.phone.trim()) next.phone = "Phone number is required";
    if (!details.organisation.trim()) next.organisation = "Organisation is required";
    if (!details.jobTitle.trim()) next.jobTitle = "Job title is required";
    if (!details.country) next.country = "Select a country";
    if (!details.city.trim()) next.city = "City is required";
    if (grantWaiver) {
      if (waiverReason === "gov_speaker" && !agencyName.trim()) {
        next.agencyName = "Enter the government agency name.";
      }
      if (waiverReason === "sponsor_allocation") {
        if (!sponsorTicketID) next.sponsorTicketID = "Select a sponsor with remaining free seats.";
        else if (selectedRemaining <= 0) {
          next.sponsorTicketID = "This sponsor has no complimentary seats left.";
        }
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (busy) return;
    if (!validate()) return;
    setSubmitError(null);
    try {
      await onAdd({
        participationType,
        details,
        waiver: grantWaiver
          ? {
              reason: waiverReason,
              agencyName: agencyName.trim() || undefined,
              sponsorTicketID: sponsorTicketID || undefined,
            }
          : undefined,
      });
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not add participant.");
    }
  };

  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onClose}
      title="Add Participant"
      className="md:max-w-2xl"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={busy}>
            {busy ? "Saving…" : grantWaiver ? "Add with waiver" : "Add Participant"}
          </Button>
        </div>
      }
    >
      <div className="grid gap-4">
        {submitError ? <p className={errorClass}>{submitError}</p> : null}
        <div>
          <label className={labelClass}>
            Participation Type <span className="text-red-500">*</span>
          </label>
          <select
            className={fieldSelectClass}
            value={participationType}
            disabled={busy}
            onChange={(e) => setParticipationType(e.target.value as ParticipationType)}
          >
            {participationTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <h3 className="mb-2 text-[15px] font-extrabold text-[#07135f]">Personal Information</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                Title <span className="text-red-500">*</span>
              </label>
              <select
                className={fieldSelectClass}
                value={details.title}
                onChange={(e) => patch({ title: e.target.value })}
              >
                <option value="">Select title</option>
                <option value="Mr">Mr</option>
                <option value="Ms">Ms</option>
                <option value="Mrs">Mrs</option>
                <option value="Dr">Dr</option>
                <option value="Prof">Prof</option>
              </select>
              {errors.title ? <span className={errorClass}>{errors.title}</span> : null}
            </div>
            <div>
              <label className={labelClass}>
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                className={fieldClass}
                value={details.fullName}
                onChange={(e) => patch({ fullName: e.target.value })}
                placeholder="Enter full name"
              />
              {errors.fullName ? <span className={errorClass}>{errors.fullName}</span> : null}
            </div>
            <div>
              <label className={labelClass}>
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                className={fieldClass}
                type="email"
                value={details.email}
                onChange={(e) => patch({ email: e.target.value })}
                placeholder="Enter email address"
              />
              {errors.email ? <span className={errorClass}>{errors.email}</span> : null}
            </div>
            <div>
              <label className={labelClass}>
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-[88px_1fr] gap-1.5">
                <select className={fieldSelectClass} defaultValue="+254" aria-label="Country code">
                  <option value="+254">🇰🇪 +254</option>
                </select>
                <input
                  className={fieldClass}
                  value={details.phone}
                  onChange={(e) => patch({ phone: e.target.value })}
                  placeholder="712 345 678"
                />
              </div>
              {errors.phone ? <span className={errorClass}>{errors.phone}</span> : null}
            </div>
            <div>
              <label className={labelClass}>
                Organisation <span className="text-red-500">*</span>
              </label>
              <input
                className={fieldClass}
                value={details.organisation}
                onChange={(e) => patch({ organisation: e.target.value })}
                placeholder="Enter organisation"
              />
              {errors.organisation ? (
                <span className={errorClass}>{errors.organisation}</span>
              ) : null}
            </div>
            <div>
              <label className={labelClass}>
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                className={fieldClass}
                value={details.jobTitle}
                onChange={(e) => patch({ jobTitle: e.target.value })}
                placeholder="Enter job title"
              />
              {errors.jobTitle ? <span className={errorClass}>{errors.jobTitle}</span> : null}
            </div>
            <div>
              <label className={labelClass}>
                Country <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                compact
                aria-label="Country"
                value={details.country}
                onChange={(country) => patch({ country })}
                placeholder="Select country"
                searchPlaceholder="Search countries…"
                options={COUNTRY_NAME_OPTIONS.map((name) => ({
                  value: name,
                  label: name,
                }))}
              />
              {errors.country ? <span className={errorClass}>{errors.country}</span> : null}
            </div>
            <div>
              <label className={labelClass}>
                City <span className="text-red-500">*</span>
              </label>
              <input
                className={fieldClass}
                value={details.city}
                onChange={(e) => patch({ city: e.target.value })}
                placeholder="Enter city"
              />
              {errors.city ? <span className={errorClass}>{errors.city}</span> : null}
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-[15px] font-extrabold text-[#07135f]">
            Additional Information (Optional)
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Dietary Requirements</label>
              <select
                className={fieldSelectClass}
                value={details.dietary}
                disabled={busy}
                onChange={(e) => patch({ dietary: e.target.value })}
              >
                <option value="">Select option</option>
                <option value="None">None</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Halal">Halal</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Accessibility Needs</label>
              <select
                className={fieldSelectClass}
                value={details.accessibility}
                disabled={busy}
                onChange={(e) => patch({ accessibility: e.target.value })}
              >
                <option value="">Select option</option>
                <option value="None">None</option>
                <option value="Mobility">Mobility support</option>
                <option value="Hearing">Hearing support</option>
                <option value="Vision">Vision support</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3">
          <label className="flex cursor-pointer items-start gap-2.5 text-[15px] text-[#07135f]">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              checked={grantWaiver}
              disabled={busy}
              onChange={(e) => setGrantWaiver(e.target.checked)}
            />
            <span>
              <span className="font-extrabold">Grant waiver</span>
              <span className="mt-0.5 block text-[13px] leading-relaxed text-blue-700">
                Skip bank payment / proof. Marks the ticket waived or complimentary and
                confirmed.
              </span>
            </span>
          </label>

          {grantWaiver ? (
            <div className="mt-3 grid gap-3 border-t border-blue-100 pt-3">
              <div>
                <label className={labelClass}>
                  Waiver type <span className="text-red-500">*</span>
                </label>
                <select
                  className={fieldSelectClass}
                  value={waiverReason}
                  disabled={busy}
                  onChange={(e) => setWaiverReason(e.target.value as WaiverReason)}
                >
                  <option value="staff">{waiverReasonLabel("staff")}</option>
                  <option value="gov_speaker">{waiverReasonLabel("gov_speaker")}</option>
                  <option value="sponsor_allocation">
                    {waiverReasonLabel("sponsor_allocation")}
                  </option>
                </select>
              </div>

              {waiverReason === "gov_speaker" ? (
                <div>
                  <label className={labelClass}>
                    Government agency <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={fieldClass}
                    value={agencyName}
                    disabled={busy}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="e.g. Ministry of Trade"
                  />
                  {errors.agencyName ? (
                    <span className={errorClass}>{errors.agencyName}</span>
                  ) : null}
                </div>
              ) : null}

              {waiverReason === "sponsor_allocation" ? (
                <div>
                  <label className={labelClass}>
                    Sponsor package <span className="text-red-500">*</span>
                  </label>
                  {sponsors.length === 0 ? (
                    <p className="rounded-md border border-amber-100 bg-amber-50 px-2.5 py-2 text-[14px] text-amber-900">
                      No sponsors with remaining free seats. Register a paid sponsor first;
                      each package gets {SPONSOR_COMPLIMENTARY_SEATS} complimentary seats.
                    </p>
                  ) : (
                    <select
                      className={fieldSelectClass}
                      value={sponsorTicketID}
                      disabled={busy}
                      onChange={(e) => setSponsorTicketID(e.target.value)}
                    >
                      <option value="">Select sponsor…</option>
                      {sponsors.map((s) => (
                        <option key={s.seatId} value={s.seatId}>
                          {s.name}
                          {s.org && s.org !== "—" ? ` (${s.org})` : ""} — {s.remaining} of{" "}
                          {SPONSOR_COMPLIMENTARY_SEATS} left
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.sponsorTicketID ? (
                    <span className={errorClass}>{errors.sponsorTicketID}</span>
                  ) : null}
                  {sponsorTicketID && !errors.sponsorTicketID ? (
                    <p className="mt-1 text-[13px] text-blue-700">
                      {selectedRemaining} complimentary seat
                      {selectedRemaining === 1 ? "" : "s"} remaining for this sponsor.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
