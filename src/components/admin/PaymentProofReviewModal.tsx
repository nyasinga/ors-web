import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { TENANT_ID } from "../../lib/api";
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

function authToken(): string | null {
  return (
    localStorage.getItem("ors_auth_token") ||
    sessionStorage.getItem("ors_auth_token") ||
    null
  );
}

async function sniffKind(blob: Blob): Promise<"image" | "pdf" | "other"> {
  const type = (blob.type || "").toLowerCase();
  if (type.startsWith("image/")) return "image";
  if (type.includes("pdf")) return "pdf";

  const head = new Uint8Array(await blob.slice(0, 8).arrayBuffer());
  // %PDF
  if (head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46) {
    return "pdf";
  }
  // JPEG / PNG / GIF / WEBP
  if (head[0] === 0xff && head[1] === 0xd8) return "image";
  if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) return "image";
  if (head[0] === 0x47 && head[1] === 0x49 && head[2] === 0x46) return "image";
  if (head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46) return "image";

  return "other";
}

type PreviewState =
  | { status: "loading" }
  | { status: "ready"; kind: "image" | "pdf"; src: string }
  | { status: "error"; message: string };

function ProofPreview({ url, label }: { url: string; label: string }) {
  const [state, setState] = useState<PreviewState>({ status: "loading" });
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | undefined;

    async function load() {
      setImgFailed(false);

      // Direct URLs with a clear extension can render without fetching.
      if (isImage(url) && !/\/resources\/download\//i.test(url)) {
        if (!cancelled) setState({ status: "ready", kind: "image", src: url });
        return;
      }
      if (isPdf(url) && !/\/resources\/download\//i.test(url)) {
        if (!cancelled) setState({ status: "ready", kind: "pdf", src: url });
        return;
      }

      try {
        const token = authToken();
        const res = await fetch(url, {
          headers: {
            Accept: "*/*",
            "x-tenant-id": TENANT_ID,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) {
          throw new Error(`Could not load proof (${res.status})`);
        }
        const blob = await res.blob();
        const kind = await sniffKind(blob);
        objectUrl = URL.createObjectURL(
          kind === "pdf" && !blob.type.includes("pdf")
            ? new Blob([blob], { type: "application/pdf" })
            : blob,
        );
        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        if (kind === "image" || kind === "pdf") {
          setState({ status: "ready", kind, src: objectUrl });
        } else {
          // Unknown binary — try as image first; UI falls back to iframe on error.
          setState({ status: "ready", kind: "image", src: objectUrl });
        }
      } catch {
        // CORS or network — still try embedding the raw URL in an iframe/img.
        if (cancelled) return;
        if (isImage(url)) {
          setState({ status: "ready", kind: "image", src: url });
        } else {
          setState({ status: "ready", kind: "pdf", src: url });
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  if (state.status === "loading") {
    return (
      <div className="flex h-[320px] items-center justify-center bg-white text-[13px] text-blue-800">
        Loading proof preview…
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="px-3 py-4 text-[13px] text-amber-950">
        <p className="m-0 mb-2">{state.message}</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 underline">
          Open proof file
        </a>
      </div>
    );
  }

  if (state.kind === "image" && !imgFailed) {
    return (
      <img
        src={state.src}
        alt={label}
        className="max-h-[480px] w-full object-contain bg-white"
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <iframe
      title={label}
      src={state.src}
      className="h-[480px] w-full border-0 bg-white"
    />
  );
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
      className="md:max-w-3xl"
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
                  <ProofPreview url={url} label={`Payment proof for ${p.name}`} />
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
