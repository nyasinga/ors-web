import { useEffect, useState } from "react";
import { SearchableSelect } from "../ui/SearchableSelect";
import { COUNTRY_NAME_OPTIONS } from "../../data/countries";
import { participationTypes, type ParticipationType } from "../../data/registration";
import type { RegistrationDetails } from "../../contexts/registrationShared";
import { cn } from "../../lib/cn";
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

const typeLabel: Record<ParticipationType, string> = {
  delegate: "Delegate",
  speaker: "Speaker",
  sponsor: "Exhibitor",
  virtual: "Virtual Participant",
};

const typeTone: Record<ParticipationType, string> = {
  delegate: "blue",
  speaker: "red",
  sponsor: "green",
  virtual: "purple",
};

function initialsFromName(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || "")
      .join("") || "?"
  );
}

const fieldClass =
  "h-9 w-full rounded-md border border-blue-100 bg-white px-2.5 text-[12px] text-[#07135f] outline-none focus:border-blue-400";
const fieldSelectClass = cn(fieldClass, "register-field-select");
const labelClass = "mb-1 block text-[11px] font-semibold text-[#26468e]";
const errorClass = "mt-0.5 block text-[10px] text-red-600";

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (participant: AddedParticipant) => void;
};

export function AddParticipantModal({ open, onClose, onAdd }: Props) {
  const [participationType, setParticipationType] = useState<ParticipationType>("delegate");
  const [details, setDetails] = useState<RegistrationDetails>(emptyDetails);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setParticipationType("delegate");
    setDetails(emptyDetails);
    setErrors({});
  }, [open]);

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
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    const now = new Date();
    const name = details.fullName.trim();
    onAdd({
      id: `p-${Date.now()}`,
      name,
      email: details.email.trim(),
      org: details.organisation.trim(),
      type: typeLabel[participationType],
      category: "",
      status: "Confirmed",
      date: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      time: now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      checkIn: "—",
      initials: initialsFromName(name),
      avatarTone: typeTone[participationType],
      title: details.title,
      phone: details.phone.trim(),
      jobTitle: details.jobTitle.trim(),
      country: details.country,
      city: details.city.trim(),
      dietary: details.dietary,
      accessibility: details.accessibility,
      participationType,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Participant"
      className="md:max-w-2xl"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>Add Participant</Button>
        </div>
      }
    >
      <div className="grid gap-4">
        <div>
          <label className={labelClass}>
            Participation Type <span className="text-red-500">*</span>
          </label>
          <select
            className={fieldSelectClass}
            value={participationType}
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
          <h3 className="mb-2 text-[12px] font-extrabold text-[#07135f]">Personal Information</h3>
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
          <h3 className="mb-2 text-[12px] font-extrabold text-[#07135f]">
            Additional Information (Optional)
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Dietary Requirements</label>
              <select
                className={fieldSelectClass}
                value={details.dietary}
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
      </div>
    </Modal>
  );
}
