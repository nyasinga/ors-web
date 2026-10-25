import type { ReactNode } from "react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import type { AddedParticipant } from "./AddParticipantModal";
import { waiverReasonLabel } from "../../lib/participantWaiver";

type Props = {
  open: boolean;
  participant: AddedParticipant | null;
  onClose: () => void;
  onVerify?: (p: AddedParticipant) => void;
  onWaiver?: (p: AddedParticipant) => void;
  verifyBusy?: boolean;
};

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 border-b border-blue-50 py-2 text-[13px] last:border-0">
      <dt className="font-semibold text-[#26468e]">{label}</dt>
      <dd className="m-0 text-[#07135f] break-words">{value || "—"}</dd>
    </div>
  );
}

export function ParticipantDetailModal({
  open,
  participant,
  onClose,
  onVerify,
  onWaiver,
  verifyBusy,
}: Props) {
  const p = participant;
  const pending = p?.status === "Pending verification";
  const canAct = pending || p?.status === "Registered";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registration details"
      className="md:max-w-lg"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {p && canAct && onWaiver ? (
            <Button
              variant="ghost"
              disabled={verifyBusy}
              onClick={() => onWaiver(p)}
              className="!text-sky-800"
            >
              Grant waiver
            </Button>
          ) : null}
          {p && canAct && onVerify ? (
            <Button disabled={verifyBusy} onClick={() => onVerify(p)}>
              {verifyBusy ? "Verifying…" : "Verify payment"}
            </Button>
          ) : null}
        </div>
      }
    >
      {p ? (
        <dl className="m-0">
          <Row label="Name" value={p.name} />
          <Row label="Email" value={p.email} />
          <Row label="Phone" value={p.phone} />
          <Row label="Organisation" value={p.org} />
          <Row label="Job title" value={p.jobTitle} />
          <Row label="Type" value={p.type} />
          <Row label="Country / city" value={[p.country, p.city].filter(Boolean).join(", ")} />
          <Row label="Status" value={p.status} />
          <Row label="Registered" value={`${p.date}${p.time ? ` · ${p.time}` : ""}`} />
          <Row
            label="Payment reference"
            value={p.displayPaymentReference || p.transactionReference || "—"}
          />
          <Row label="Ticket ID" value={p.ticketID} />
          <Row label="Pass code" value={p.passAllowed ? p.passCode || "—" : "Locked until verified"} />
          {p.waiverReason ? (
            <Row
              label="Waiver"
              value={`${waiverReasonLabel(p.waiverReason)}${p.agencyName ? ` · ${p.agencyName}` : ""}`}
            />
          ) : null}
          {p.paymentReceiptURL ? (
            <Row
              label="Proof / receipt"
              value={
                <a
                  href={p.paymentReceiptURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 underline"
                >
                  Open file
                </a>
              }
            />
          ) : (
            <Row
              label="Proof / receipt"
              value={
                pending
                  ? "Proof submitted — open via backend storage if linked; verify using payment reference."
                  : "—"
              }
            />
          )}
        </dl>
      ) : null}
    </Modal>
  );
}
