import { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
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

/** Same worker bootstrap as EventPassPreviewModal (handles bad .mjs MIME). */
let workerReady: Promise<void> | null = null;

function ensurePdfWorker(): Promise<void> {
  if (!workerReady) {
    workerReady = (async () => {
      try {
        const res = await fetch(pdfWorkerUrl);
        if (!res.ok) throw new Error(`Worker fetch failed (${res.status})`);
        const buf = await res.arrayBuffer();
        const blob = new Blob([buf], { type: "text/javascript" });
        GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
      } catch {
        GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      }
    })();
  }
  return workerReady;
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
  if (head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46) {
    return "pdf";
  }
  if (head[0] === 0xff && head[1] === 0xd8) return "image";
  if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) {
    return "image";
  }
  if (head[0] === 0x47 && head[1] === 0x49 && head[2] === 0x46) return "image";
  if (head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46) {
    return "image";
  }
  return "other";
}

type PreviewState =
  | { status: "loading" }
  | { status: "image"; src: string; openSrc: string }
  | { status: "pdf"; openSrc: string; pageCount: number }
  | { status: "other"; openSrc: string }
  | { status: "error"; message: string; openSrc: string };

/**
 * Bank proof preview — images as <img>, PDFs rendered with PDF.js canvases
 * (native PDF iframe/embed is blank in several browsers).
 */
function ProofPreview({ url, label }: { url: string; label: string }) {
  const [state, setState] = useState<PreviewState>({ status: "loading" });
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | undefined;

    async function load() {
      setState({ status: "loading" });
      const host = canvasHostRef.current;
      if (host) host.replaceChildren();

      try {
        const token = authToken();
        const res = await fetch(url, {
          headers: {
            Accept: "*/*",
            "x-tenant-id": TENANT_ID,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error(`Could not load proof (${res.status})`);

        const headerType = (res.headers.get("content-type") || "").toLowerCase();
        const blob = await res.blob();
        const kind =
          headerType.includes("pdf")
            ? "pdf"
            : headerType.startsWith("image/")
              ? "image"
              : await sniffKind(blob);

        if (cancelled) return;

        if (kind === "image") {
          objectUrl = URL.createObjectURL(
            blob.type.startsWith("image/")
              ? blob
              : new Blob([blob], { type: "image/jpeg" }),
          );
          setState({ status: "image", src: objectUrl, openSrc: objectUrl });
          return;
        }

        if (kind === "pdf") {
          const pdfBlob = blob.type.includes("pdf")
            ? blob
            : new Blob([blob], { type: "application/pdf" });
          objectUrl = URL.createObjectURL(pdfBlob);
          const data = await pdfBlob.arrayBuffer();

          await ensurePdfWorker();
          let pdf: PDFDocumentProxy;
          try {
            pdf = await getDocument({ data }).promise;
          } catch {
            pdf = await getDocument({
              data,
              useWorkerFetch: false,
              isEvalSupported: false,
            }).promise;
          }
          if (cancelled) {
            await pdf.destroy();
            return;
          }
          pdfRef.current = pdf;

          const maxWidth = Math.min(host?.clientWidth || 680, 720);
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
            const page = await pdf.getPage(pageNum);
            if (cancelled) return;

            const unscaled = page.getViewport({ scale: 1 });
            const scale = maxWidth / unscaled.width;
            const viewport = page.getViewport({
              scale: Math.min(Math.max(scale, 1.05), 2.2),
            });

            const canvas = document.createElement("canvas");
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            canvas.className =
              "mb-3 w-full rounded-md border border-blue-100 bg-white shadow-sm last:mb-0";
            canvas.setAttribute("aria-label", `${label} page ${pageNum}`);

            const ctx = canvas.getContext("2d");
            if (!ctx) continue;
            await page.render({ canvasContext: ctx, viewport }).promise;
            if (cancelled) return;
            host?.appendChild(canvas);
          }

          setState({
            status: "pdf",
            openSrc: objectUrl,
            pageCount: pdf.numPages,
          });
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setState({ status: "other", openSrc: objectUrl });
      } catch (err) {
        if (cancelled) return;
        setState({
          status: "error",
          message:
            err instanceof Error ? err.message : "Could not load payment proof.",
          openSrc: url,
        });
      }
    }

    void load();

    return () => {
      cancelled = true;
      pdfRef.current?.destroy().catch(() => undefined);
      pdfRef.current = null;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url, label]);

  const openSrc =
    state.status === "loading" ? url : state.openSrc;

  return (
    <div className="overflow-hidden rounded-lg border border-blue-100 bg-slate-50">
      {state.status === "loading" ? (
        <div className="flex h-[280px] items-center justify-center bg-white text-[13px] text-blue-800">
          Loading proof preview…
        </div>
      ) : null}

      {state.status === "error" ? (
        <div className="px-3 py-6 text-center text-[13px] text-amber-950">
          <p className="m-0 mb-2">{state.message}</p>
        </div>
      ) : null}

      {state.status === "image" ? (
        <a
          href={state.openSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white p-2"
        >
          <img
            src={state.src}
            alt={label}
            className="mx-auto max-h-[520px] w-auto max-w-full object-contain"
          />
        </a>
      ) : null}

      {/* PDF canvases mount here (also kept mounted while loading so width is known). */}
      <div
        ref={canvasHostRef}
        className={
          state.status === "pdf" || state.status === "loading"
            ? "bg-slate-100 p-2"
            : "hidden"
        }
      />

      {state.status === "other" ? (
        <div className="px-3 py-6 text-center text-[13px] text-blue-900">
          <p className="m-0">This file type can’t be previewed inline.</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-blue-50 bg-white px-3 py-2 text-[12px]">
        <a
          href={openSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-blue-600 underline"
        >
          Open in new tab
        </a>
        {state.status === "pdf" ? (
          <>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">
              PDF · {state.pageCount} page{state.pageCount === 1 ? "" : "s"}
            </span>
          </>
        ) : null}
      </div>
    </div>
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
                <ProofPreview key={url} url={url} label={`Payment proof for ${p.name}`} />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
