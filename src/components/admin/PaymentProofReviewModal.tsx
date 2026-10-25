import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import type { AddedParticipant } from "./AddParticipantModal";

type Props = {
  open: boolean;
  participant: AddedParticipant | null;
  approveBusy?: boolean;
  cancelBusy?: boolean;
  onClose: () => void;
  onApprove: (p: AddedParticipant) => void;
  onCancelTicket: (p: AddedParticipant) => void;
};

function isPdf(url: string) {
  return /\.pdf($|\?)/i.test(url) || /application\/pdf/i.test(url);
}

function isImage(url: string) {
  return /\.(png|jpe?g|gif|webp|bmp)($|\?)/i.test(url) || url.startsWith("data:image/");
}

export function PaymentProofReviewModal({
  open,
  participant,
  approveBusy,
  cancelBusy,
  onClose,
  onApprove,
  onCancelTicket,
}: Props) {
  const p = participant;
  const busy = Boolean(approveBusy || cancelBusy);
  const proofs = p?.paymentProofUrls?.length
    ? p.paymentProofUrls
    : p?.paymentReceiptURL
      ? [p.paymentReceiptURL]
      : [];
  const canApprove =
    p &&
    p.status !== "Cancelled" &&
    p.status !== "Confirmed" &&
    p.status !== "Waived" &&
    p.status !== "Complimentary";
  const canCancel = p && p.status !== "Cancelled";

  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onClose}
      title="Payment proof review"
      className="md:max-w-2xl"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Close
          </Button>
          {p && canCancel ? (
            <Button
              variant="danger"
              disabled={busy}
              onClick={() => onCancelTicket(p)}
            >
              {cancelBusy ? "Cancelling…" : "Cancel ticket"}
            </Button>
          ) : null}
          {p && canApprove ? (
            <Button disabled={busy} onClick={() => onApprove(p)}>
              {approveBusy ? "Approving…" : "Approve payment"}
            </Button>
          ) : null}
        </div>
      }
    >
      {p ? (
        <div className="grid gap-3 text-[14px] text-[#07135f]">
          <div className="rounded-md border border-blue-50 bg-blue-50/50 px-3 py-2">
            <p className="m-0 font-extrabold">{p.name}</p>
            <p className="m-0 mt-0.5 text-[13px] text-blue-800">
              {p.type}
              {p.email ? ` · ${p.email}` : ""}
            </p>
            <p className="m-0 mt-1 text-[13px] text-blue-800">
              Status: <strong>{p.status}</strong>
              {p.rawStatus ? (
                <span className="text-blue-700"> ({p.rawStatus})</span>
              ) : null}
            </p>
            <p className="m-0 mt-1 text-[13px] text-blue-800">
              Payment reference:{" "}
              <strong className="break-all">
                {p.displayPaymentReference || p.transactionReference || "—"}
              </strong>
            </p>
          </div>

          {proofs.length === 0 ? (
            <p className="m-0 rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-[13px] text-amber-950">
              No bank payment proof file is linked on this ticket yet. You can still approve using
              the payment reference, or cancel the registration.
            </p>
          ) : (
            <div className="grid gap-3">
              <p className="m-0 text-[13px] font-semibold text-[#26468e]">
                Bank payment proof ({proofs.length})
              </p>
              {proofs.map((url) => (
                <div
                  key={url}
                  className="overflow-hidden rounded-lg border border-blue-100 bg-slate-50"
                >
                  {isImage(url) ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                      <img
                        src={url}
                        alt={`Payment proof for ${p.name}`}
                        className="max-h-[420px] w-full object-contain bg-white"
                      />
                    </a>
                  ) : isPdf(url) ? (
                    <iframe
                      title={`Payment proof PDF for ${p.name}`}
                      src={url}
                      className="h-[420px] w-full border-0 bg-white"
                    />
                  ) : (
                    <div className="px-3 py-4 text-[13px]">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-600 underline"
                      >
                        Open proof file
                      </a>
                    </div>
                  )}
                  <div className="border-t border-blue-50 px-3 py-1.5 text-[12px]">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-600 underline break-all"
                    >
                      Open in new tab
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
