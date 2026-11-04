import { useEffect, useRef, useState } from "react";
import { Download, ExternalLink, Printer } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { cn } from "../../lib/cn";
import { loadPdfDocument, waitForElement } from "../../lib/pdfjsWorker";

type Props = {
  open: boolean;
  url: string | null;
  passCode?: string;
  title?: string;
  onClose: () => void;
  onError?: (message: string) => void;
};

/**
 * Event-pass PDF preview. Renders pages with PDF.js so mobile browsers
 * (which refuse blob PDFs in iframes) still show a scannable pass.
 * Loads via ArrayBuffer — blob: URLs into the worker fail on some Android browsers.
 */
export function EventPassPreviewModal({
  open,
  url,
  passCode,
  title = "Your Event Pass",
  onClose,
  onError,
}: Props) {
  const [rendering, setRendering] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const pdfBytesRef = useRef<ArrayBuffer | null>(null);

  useEffect(() => {
    if (!open || !url) return;

    let cancelled = false;

    (async () => {
      setRendering(true);
      setPageCount(0);
      setPreviewError(null);
      pdfBytesRef.current = null;

      try {
        pdfRef.current?.destroy().catch(() => undefined);
        pdfRef.current = null;

        const host = await waitForElement(() => canvasHostRef.current);
        if (cancelled) return;
        if (host) host.replaceChildren();

        // Prefer raw bytes over passing blob: into PDF.js (Android worker fetch).
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Could not load event pass (${res.status}).`);
        const data = await res.arrayBuffer();
        if (cancelled) return;
        pdfBytesRef.current = data.slice(0);

        const pdf = await loadPdfDocument(data);
        if (cancelled) {
          await pdf.destroy();
          return;
        }
        pdfRef.current = pdf;
        setPageCount(pdf.numPages);

        if (!host) {
          throw new Error("Preview surface unavailable. Use Download or Open instead.");
        }

        const narrow = typeof window !== "undefined" && window.innerWidth < 768;
        const maxWidth = Math.min(host.clientWidth || (narrow ? 360 : 640), narrow ? 420 : 720);
        const maxScale = narrow ? 1.5 : 2.4;
        const minScale = narrow ? 1 : 1.1;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
          const page = await pdf.getPage(pageNum);
          if (cancelled) return;

          const unscaled = page.getViewport({ scale: 1 });
          const scale = maxWidth / unscaled.width;
          const viewport = page.getViewport({
            scale: Math.min(Math.max(scale, minScale), maxScale),
          });

          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.className =
            "mb-3 w-full rounded-md border border-[#e0e9f3] bg-white shadow-sm last:mb-0";
          canvas.setAttribute("aria-label", `Event pass page ${pageNum}`);

          const ctx = canvas.getContext("2d", { alpha: false });
          if (!ctx) continue;

          await page.render({ canvasContext: ctx, viewport }).promise;
          if (cancelled) return;
          host.appendChild(canvas);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Unable to preview event pass.";
          setPreviewError(message);
          onError?.(message);
        }
      } finally {
        if (!cancelled) setRendering(false);
      }
    })();

    return () => {
      cancelled = true;
      pdfRef.current?.destroy().catch(() => undefined);
      pdfRef.current = null;
    };
  }, [open, url, onError]);

  const download = () => {
    if (!url && !pdfBytesRef.current) return;
    const link = document.createElement("a");
    if (pdfBytesRef.current) {
      const blob = new Blob([pdfBytesRef.current], { type: "application/pdf" });
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = `ticket-${passCode || "pass"}.pdf`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      return;
    }
    link.href = url!;
    link.download = `ticket-${passCode || "pass"}.pdf`;
    link.click();
  };

  const openExternal = () => {
    if (!url) return;
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) {
      // Popup blocked — fall back to same-tab navigation.
      window.location.assign(url);
    }
  };

  const printPass = () => {
    if (!url) return;
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) {
      onError?.("Pop-up blocked — allow pop-ups to print, or download the PDF.");
      return;
    }
    const trigger = () => {
      try {
        win.focus();
        win.print();
      } catch {
        onError?.("Unable to print. Try downloading the PDF.");
      }
    };
    // Give the PDF viewer a moment to load before printing.
    window.setTimeout(trigger, 600);
  };

  const showFallback = !rendering && (Boolean(previewError) || (pageCount === 0 && Boolean(url)));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      bottomSheetOnMobile={false}
      className="!max-w-3xl md:!max-w-3xl"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={openExternal} disabled={!url}>
            <ExternalLink size={14} className="mr-1.5" />
            Open
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={download}
            disabled={!url && !pdfBytesRef.current}
          >
            <Download size={14} className="mr-1.5" />
            Download
          </Button>
          <Button type="button" size="sm" onClick={printPass} disabled={!url}>
            <Printer size={14} className="mr-1.5" />
            Print
          </Button>
        </div>
      }
    >
      <div className="relative min-h-[min(50vh,420px)] overflow-y-auto rounded-md bg-[#f4f7fb] p-2">
        {rendering ? (
          <p
            className="absolute inset-0 z-[1] grid place-items-center bg-[#f4f7fb] text-sm font-medium text-[#687aa0]"
            role="status"
          >
            Loading event pass…
          </p>
        ) : null}
        {/* Keep host in layout while loading so clientWidth is measurable on mobile. */}
        <div ref={canvasHostRef} className={cn(showFallback && "hidden")} />
        {showFallback ? (
          <div className="grid place-items-center gap-3 py-12 text-center">
            <p className="max-w-sm text-sm text-[#51689d]">
              {previewError ||
                "Preview unavailable on this device. Download or open the PDF instead."}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button type="button" size="sm" variant="outline" onClick={download} disabled={!url}>
                <Download size={14} className="mr-1.5" />
                Download
              </Button>
              <Button type="button" size="sm" onClick={openExternal} disabled={!url}>
                <ExternalLink size={14} className="mr-1.5" />
                Open Event Pass
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
