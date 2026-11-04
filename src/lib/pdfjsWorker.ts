import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

/** Ensure worker loads even when the host serves `.mjs` as octet-stream. */
let workerReady: Promise<void> | null = null;

export function ensurePdfWorker(): Promise<void> {
  if (!workerReady) {
    workerReady = (async () => {
      try {
        const res = await fetch(pdfWorkerUrl);
        if (!res.ok) throw new Error(`Worker fetch failed (${res.status})`);
        const buf = await res.arrayBuffer();
        const blob = new Blob([buf], { type: "text/javascript" });
        GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
      } catch {
        // Last resort: point at the bundled URL (works when MIME is correct).
        GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      }
    })();
  }
  return workerReady;
}

/**
 * Load a PDF from raw bytes (preferred on Android — avoids blob: worker fetch failures).
 * Tries the worker first, then retries with worker fetch disabled.
 */
export async function loadPdfDocument(data: ArrayBuffer): Promise<PDFDocumentProxy> {
  await ensurePdfWorker();
  // PDF.js retains the buffer; copy so callers can still use the original.
  const copy = data.slice(0);
  try {
    return await getDocument({ data: copy }).promise;
  } catch {
    return getDocument({
      data: data.slice(0),
      useWorkerFetch: false,
      isEvalSupported: false,
    }).promise;
  }
}

/** Wait until a ref's element is mounted (Modal children can lag one frame). */
export async function waitForElement(
  getEl: () => HTMLElement | null,
  attempts = 12,
): Promise<HTMLElement | null> {
  for (let i = 0; i < attempts; i += 1) {
    const el = getEl();
    if (el) return el;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }
  return getEl();
}
