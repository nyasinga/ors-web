import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import type { AddedParticipant } from "./AddParticipantModal";
import {
  SPONSOR_COMPLIMENTARY_SEATS,
  sponsorSeatsRemaining,
  waiverReasonLabel,
  type WaiverReason,
} from "../../lib/participantWaiver";
import { cn } from "../../lib/cn";

const labelClass = "mb-1 block text-[14px] font-semibold text-[#26468e]";
const fieldClass =
  "h-9 w-full rounded-md border border-blue-100 bg-white px-2.5 text-[15px] text-[#07135f] outline-none focus:border-blue-400";
const fieldSelectClass = cn(fieldClass, "register-field-select");
const errorClass = "mt-0.5 block text-[13px] text-red-600";

type Props = {
  open: boolean;
  participant: AddedParticipant | null;
  /** All participants — used to list paid sponsors and remaining seats. */
  participants: AddedParticipant[];
  busy?: boolean;
  onClose: () => void;
  onGrant: (input: {
    reason: WaiverReason;
    agencyName?: string;
    sponsorTicketID?: string;
  }) => void;
};

function isEligibleSponsor(p: AddedParticipant): boolean {
  if (p.participationType !== "sponsor") return false;
  if (p.status === "Cancelled" || p.status === "Pending") return false;
  // Free seats only after the sponsor package itself is paid / confirmed
  if (p.paymentMode === "complimentary") return false;
  if (p.status === "Confirmed" || p.status === "Waived") return true;
  if ((p.rawStatus || "").includes("checked")) return true;
  return false;
}

export function GrantWaiverModal({
  open,
  participant,
  participants,
  busy,
  onClose,
  onGrant,
}: Props) {
  const [reason, setReason] = useState<WaiverReason>("staff");
  const [agencyName, setAgencyName] = useState("");
  const [sponsorTicketID, setSponsorTicketID] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setReason("staff");
    setAgencyName("");
    setSponsorTicketID("");
    setError(null);
  }, [open, participant?.id]);

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

  const submit = () => {
    if (reason === "gov_speaker" && !agencyName.trim()) {
      setError("Enter the government agency name.");
      return;
    }
    if (reason === "sponsor_allocation") {
      if (!sponsorTicketID) {
        setError("Select a sponsor with remaining free seats.");
        return;
      }
      if (selectedRemaining <= 0) {
        setError("This sponsor has no complimentary seats left (max 3).");
        return;
      }
    }
    setError(null);
    onGrant({
      reason,
      agencyName: agencyName.trim() || undefined,
      sponsorTicketID: sponsorTicketID || undefined,
    });
  };

  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onClose}
      title="Grant waiver"
      className="md:max-w-md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy || !participant}>
            {busy ? "Granting…" : "Grant waiver"}
          </Button>
        </div>
      }
    >
      {participant ? (
        <div className="grid gap-3 text-[15px] text-[#07135f]">
          <p className="rounded-md border border-blue-50 bg-blue-50/60 px-2.5 py-2 text-[14px] text-blue-900">
            <strong className="font-bold">{participant.name}</strong>
            <span className="text-blue-700"> · {participant.type}</span>
            {participant.email ? (
              <span className="mt-0.5 block text-blue-700">{participant.email}</span>
            ) : null}
          </p>

          <div>
            <label className={labelClass}>
              Waiver type <span className="text-red-500">*</span>
            </label>
            <select
              className={fieldSelectClass}
              value={reason}
              disabled={busy}
              onChange={(e) => setReason(e.target.value as WaiverReason)}
            >
              <option value="staff">{waiverReasonLabel("staff")}</option>
              <option value="gov_speaker">{waiverReasonLabel("gov_speaker")}</option>
              <option value="sponsor_allocation">{waiverReasonLabel("sponsor_allocation")}</option>
            </select>
          </div>

          {reason === "gov_speaker" ? (
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
            </div>
          ) : null}

          {reason === "sponsor_allocation" ? (
            <div>
              <label className={labelClass}>
                Sponsor package <span className="text-red-500">*</span>
              </label>
              {sponsors.length === 0 ? (
                <p className="rounded-md border border-amber-100 bg-amber-50 px-2.5 py-2 text-[14px] text-amber-900">
                  No sponsors with remaining free seats. A sponsor must be registered first;
                  each paid package gets {SPONSOR_COMPLIMENTARY_SEATS} complimentary seats.
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
              {sponsorTicketID ? (
                <p className="mt-1 text-[13px] text-blue-700">
                  {selectedRemaining} complimentary seat{selectedRemaining === 1 ? "" : "s"} remaining
                  for this sponsor.
                </p>
              ) : null}
            </div>
          ) : null}

          <p className="text-[13px] leading-relaxed text-blue-700">
            Admin only. Skips bank payment / proof. The ticket is marked{" "}
            {reason === "sponsor_allocation" ? "complimentary" : "waived"} and confirmed.
          </p>

          {error ? <span className={errorClass}>{error}</span> : null}
        </div>
      ) : null}
    </Modal>
  );
}
