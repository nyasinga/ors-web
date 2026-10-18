import { useEffect, useRef, useState } from "react";
import { Download, ExternalLink, Printer } from "lucide-react";
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { cn } from "../../lib/cn";

GlobalWorkerOptions.workerSrc = pdfWorker;

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
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);

  useEffect(() => {
    if (!open || !url) return;

    let cancelled = false;
    const host = canvasHostRef.current;

    (async () => {
      setRendering(true);
      setPageCount(0);
      if (host) host.replaceChildren();

      try {
        pdfRef.current?.destroy().catch(() => undefined);
        pdfRef.current = null;

        const pdf = await getDocument({ url }).promise;
        if (cancelled) {
          await pdf.destroy();
          return;
        }
        pdfRef.current = pdf;
        setPageCount(pdf.numPages);

        const maxWidth = Math.min(host?.clientWidth || 640, 720);

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
          const page = await pdf.getPage(pageNum);
          if (cancelled) return;

          const unscaled = page.getViewport({ scale: 1 });
          const scale = maxWidth / unscaled.width;
          const viewport = page.getViewport({ scale: Math.min(Math.max(scale, 1.1), 2.4) });

          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.className = "mb-3 w-full rounded-md border border-[#e0e9f3] bg-white shadow-sm last:mb-0";
          canvas.setAttribute("aria-label", `Event pass page ${pageNum}`);

          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          await page.render({ canvasContext: ctx, viewport }).promise;
          if (cancelled) return;
          host?.appendChild(canvas);
        }
      } catch (err) {
        if (!cancelled) {
          onError?.(err instanceof Error ? err.message : "Unable to preview event pass.");
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
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
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
          <Button type="button" variant="outline" size="sm" onClick={download} disabled={!url}>
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
      <div
        className={cn(
          "min-h-[min(50vh,420px)] overflow-y-auto rounded-md bg-[#f4f7fb] p-2",
          rendering && "grid place-items-center",
        )}
      >
        {rendering ? (
          <p className="py-16 text-center text-sm font-medium text-[#687aa0]" role="status">
            Loading event pass…
          </p>
        ) : null}
        <div ref={canvasHostRef} className={cn(rendering && "hidden")} />
        {!rendering && pageCount === 0 && url ? (
          <div className="grid place-items-center gap-3 py-12 text-center">
            <p className="text-sm text-[#51689d]">Preview unavailable on this device.</p>
            <Button type="button" size="sm" onClick={openExternal}>
              <ExternalLink size={14} className="mr-1.5" />
              Open Event Pass
            </Button>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
