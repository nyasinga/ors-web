/** Excel-friendly CSV helpers (UTF-8 BOM + ASCII placeholders). */

const EMPTY_MARKERS = new Set(["—", "–", "-", "—", ""]);

/** Turn UI em-dash placeholders into plain export text. */
export function csvPlain(value: unknown, empty = ""): string {
  const raw = String(value ?? "").trim();
  if (EMPTY_MARKERS.has(raw) || /^[\u2013\u2014\u2212\-–—]+$/.test(raw)) {
    return empty;
  }
  return String(value ?? "");
}

export function csvEscape(value: unknown): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export function csvRow(cells: unknown[]): string {
  return cells.map(csvEscape).join(",");
}

/** Download CSV with UTF-8 BOM so Excel keeps accents / dashes readable. */
export function downloadCsv(filename: string, content: string) {
  const withBom = content.startsWith("\uFEFF") ? content : `\uFEFF${content}`;
  const blob = new Blob([withBom], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
