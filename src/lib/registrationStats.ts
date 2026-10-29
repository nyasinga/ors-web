/**
 * Registration analytics for the admin Statistics / Trends dashboard.
 * Buckets are mutually exclusive so donut %s sum to ~100%.
 */

import type { AddedParticipant } from "../components/admin/AddParticipantModal";

export type StatsCategoryKey = "delegates" | "speakers" | "sponsors" | "waivers" | "other";

export const STATS_CATEGORY_META: Record<
  StatsCategoryKey,
  { label: string; color: string; short: string }
> = {
  delegates: { label: "Delegates", color: "#2563eb", short: "Delegates" },
  speakers: { label: "Speakers", color: "#8b5cf6", short: "Speakers" },
  sponsors: { label: "Sponsors", color: "#f97316", short: "Sponsors" },
  waivers: { label: "Waivers", color: "#16a34a", short: "Waivers" },
  other: { label: "Other", color: "#64748b", short: "Other" },
};

export const STATS_CATEGORY_ORDER: StatsCategoryKey[] = [
  "delegates",
  "speakers",
  "sponsors",
  "waivers",
  "other",
];

export type DateRange = { start: string; end: string }; // YYYY-MM-DD inclusive

export type CategoryCounts = Record<StatsCategoryKey, number>;

export type DailyCategoryRow = {
  date: string; // YYYY-MM-DD
  label: string;
  total: number;
} & CategoryCounts;

export type RegistrationStats = {
  range: DateRange;
  total: number;
  counts: CategoryCounts;
  percents: CategoryCounts;
  previousTotal: number;
  vsPreviousPct: number | null;
  daily: DailyCategoryRow[];
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function toYmd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function parseYmd(ymd: string): Date {
  const [y, m, day] = ymd.split("-").map(Number);
  return new Date(y, (m || 1) - 1, day || 1);
}

export function formatRangeLabel(range: DateRange): string {
  const fmt = (ymd: string) => {
    const d = parseYmd(ymd);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };
  return `${fmt(range.start)} - ${fmt(range.end)}`;
}

export function formatAxisDay(ymd: string): string {
  const d = parseYmd(ymd);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

/** Default: current calendar month. */
export function defaultMonthRange(now = new Date()): DateRange {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: toYmd(start), end: toYmd(end) };
}

function eachDay(range: DateRange): string[] {
  const out: string[] = [];
  const cur = parseYmd(range.start);
  const last = parseYmd(range.end);
  while (cur <= last) {
    out.push(toYmd(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

function shiftRangeBack(range: DateRange): DateRange {
  const start = parseYmd(range.start);
  const end = parseYmd(range.end);
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - (days - 1));
  return { start: toYmd(prevStart), end: toYmd(prevEnd) };
}

function emptyCounts(): CategoryCounts {
  return { delegates: 0, speakers: 0, sponsors: 0, waivers: 0, other: 0 };
}

export function categorizeParticipant(p: AddedParticipant): StatsCategoryKey {
  if (
    p.waiverReason ||
    p.paymentMode === "waived" ||
    p.paymentMode === "complimentary" ||
    p.verificationBucket === "waived" ||
    p.verificationBucket === "complimentary" ||
    p.status === "Waived"
  ) {
    return "waivers";
  }
  const t = String(p.participationType || p.type || "").toLowerCase();
  if (t.includes("speaker")) return "speakers";
  if (t.includes("sponsor") || t.includes("exhibitor")) return "sponsors";
  if (t.includes("delegate")) return "delegates";
  return "other";
}

function participantDay(p: AddedParticipant): string | null {
  if (p.registeredAtIso) {
    const d = new Date(p.registeredAtIso);
    if (!Number.isNaN(d.getTime())) return toYmd(d);
  }
  return null;
}

function inRange(ymd: string | null, range: DateRange): boolean {
  if (!ymd) return false;
  return ymd >= range.start && ymd <= range.end;
}

function countInRange(rows: AddedParticipant[], range: DateRange): CategoryCounts {
  const counts = emptyCounts();
  for (const p of rows) {
    if (p.status === "Cancelled") continue;
    const day = participantDay(p);
    // Include undated rows only when counting "all time" style? For ranged views, skip undated.
    if (!inRange(day, range)) continue;
    counts[categorizeParticipant(p)] += 1;
  }
  return counts;
}

function sumCounts(c: CategoryCounts): number {
  return STATS_CATEGORY_ORDER.reduce((n, k) => n + c[k], 0);
}

function toPercents(counts: CategoryCounts, total: number): CategoryCounts {
  const pct = emptyCounts();
  for (const k of STATS_CATEGORY_ORDER) {
    pct[k] = total > 0 ? Math.round((counts[k] / total) * 1000) / 10 : 0;
  }
  return pct;
}

export function buildRegistrationStats(
  participants: AddedParticipant[],
  range: DateRange,
): RegistrationStats {
  const counts = countInRange(participants, range);
  const total = sumCounts(counts);
  const previous = countInRange(participants, shiftRangeBack(range));
  const previousTotal = sumCounts(previous);
  const vsPreviousPct =
    previousTotal > 0
      ? Math.round(((total - previousTotal) / previousTotal) * 1000) / 10
      : total > 0
        ? 100
        : null;

  const days = eachDay(range);
  const byDay = new Map<string, CategoryCounts>();
  for (const d of days) byDay.set(d, emptyCounts());

  for (const p of participants) {
    if (p.status === "Cancelled") continue;
    const day = participantDay(p);
    if (!day || !byDay.has(day)) continue;
    const bucket = byDay.get(day)!;
    bucket[categorizeParticipant(p)] += 1;
  }

  const daily: DailyCategoryRow[] = days.map((date) => {
    const c = byDay.get(date) || emptyCounts();
    return {
      date,
      label: formatAxisDay(date),
      total: sumCounts(c),
      ...c,
    };
  });

  return {
    range,
    total,
    counts,
    percents: toPercents(counts, total),
    previousTotal,
    vsPreviousPct,
    daily,
  };
}

export function exportRegistrationStatsCsv(stats: RegistrationStats, eventName: string): string {
  const lines: string[] = [
    ["Event", eventName],
    ["Range", formatRangeLabel(stats.range)],
    ["Total registrants", String(stats.total)],
    [],
    ["Category", "Count", "Percent"],
    ...STATS_CATEGORY_ORDER.map((k) => [
      STATS_CATEGORY_META[k].label,
      String(stats.counts[k]),
      `${stats.percents[k]}%`,
    ]),
    [],
    ["Date", "Total", ...STATS_CATEGORY_ORDER.map((k) => STATS_CATEGORY_META[k].label)],
    ...stats.daily.map((row) => [
      row.date,
      String(row.total),
      ...STATS_CATEGORY_ORDER.map((k) => String(row[k])),
    ]),
  ].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));

  return lines.join("\n");
}

export function downloadTextFile(filename: string, content: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
