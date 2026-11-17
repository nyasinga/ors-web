/**
 * Registration analytics for the admin Statistics / Trends dashboard.
 *
 * Two independent dimensions:
 * - Participation type (delegates / speakers / sponsors / other)
 * - Payment category (paid / waived / complimentary / pending)
 *
 * Waived registrants stay in their participation type and are counted under payment.
 */

import type { AddedParticipant } from "../components/admin/AddParticipantModal";

export type StatsCategoryKey = "delegates" | "speakers" | "sponsors" | "other";

export type PaymentCategoryKey = "paid" | "waived" | "complimentary" | "pending";

export const STATS_CATEGORY_META: Record<
  StatsCategoryKey,
  { label: string; color: string; short: string }
> = {
  delegates: { label: "Delegates", color: "#2563eb", short: "Delegates" },
  speakers: { label: "Speakers", color: "#8b5cf6", short: "Speakers" },
  sponsors: { label: "Sponsors", color: "#f97316", short: "Sponsors" },
  other: { label: "Other", color: "#64748b", short: "Other" },
};

export const STATS_CATEGORY_ORDER: StatsCategoryKey[] = [
  "delegates",
  "speakers",
  "sponsors",
  "other",
];

export const PAYMENT_CATEGORY_META: Record<
  PaymentCategoryKey,
  { label: string; color: string; short: string }
> = {
  paid: { label: "Paid", color: "#16a34a", short: "Paid" },
  waived: { label: "Waived", color: "#0284c7", short: "Waived" },
  complimentary: { label: "Complimentary", color: "#7c3aed", short: "Comp" },
  pending: { label: "Pending", color: "#d97706", short: "Pending" },
};

export const PAYMENT_CATEGORY_ORDER: PaymentCategoryKey[] = [
  "paid",
  "waived",
  "complimentary",
  "pending",
];

/** Confirmed attendees only — paid + waived + complimentary. */
export const CONFIRMED_PAYMENT_ORDER: Exclude<PaymentCategoryKey, "pending">[] = [
  "paid",
  "waived",
  "complimentary",
];

export type DateRange = { start: string; end: string }; // YYYY-MM-DD inclusive

export type CategoryCounts = Record<StatsCategoryKey, number>;
export type PaymentCounts = Record<PaymentCategoryKey, number>;

export type DailyCategoryRow = {
  date: string; // YYYY-MM-DD
  label: string;
  total: number;
} & CategoryCounts &
  PaymentCounts;

export type RegistrationStats = {
  range: DateRange;
  total: number;
  counts: CategoryCounts;
  percents: CategoryCounts;
  payment: PaymentCounts;
  paymentPercents: PaymentCounts;
  /** Confirmed subset: paid + waived + complimentary (excludes pending). */
  confirmedTotal: number;
  confirmed: Pick<PaymentCounts, "paid" | "waived" | "complimentary">;
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

/** Fallback when no registrations exist: current calendar month. */
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
  return { delegates: 0, speakers: 0, sponsors: 0, other: 0 };
}

function emptyPayment(): PaymentCounts {
  return { paid: 0, waived: 0, complimentary: 0, pending: 0 };
}

/** Participation type only — waived people stay in their real type. */
export function categorizeParticipant(p: AddedParticipant): StatsCategoryKey {
  const t = String(p.participationType || p.type || "").toLowerCase();
  if (t.includes("speaker")) return "speakers";
  if (t.includes("sponsor") || t.includes("exhibitor")) return "sponsors";
  if (t.includes("delegate")) return "delegates";
  return "other";
}

/**
 * Payment / confirmation category for reporting.
 * Complimentary and waived are confirmed without payment; paid is verified payment.
 */
export function categorizePayment(p: AddedParticipant): PaymentCategoryKey {
  if (p.status === "Cancelled") return "pending";

  const mode = String(p.paymentMode || "").toLowerCase();
  const bucket = String(p.verificationBucket || "").toLowerCase();
  const status = String(p.status || "").toLowerCase();
  const rawStatus = String(p.rawStatus || "").toLowerCase();
  const reason = String(p.waiverReason || "").toLowerCase();
  const txRef = String(p.transactionReference || "").toUpperCase();

  const looksComplimentary =
    mode === "complimentary" ||
    mode === "complementary" ||
    mode === "comp" ||
    bucket === "complimentary" ||
    status === "complimentary" ||
    status === "complementary" ||
    rawStatus === "complimentary" ||
    rawStatus === "complementary" ||
    reason === "sponsor_allocation" ||
    reason === "facilitator" ||
    txRef.startsWith("WAIVER-SPONSOR") ||
    txRef.startsWith("WAIVER-FACILITATOR");

  if (looksComplimentary) return "complimentary";

  if (
    mode === "waived" ||
    bucket === "waived" ||
    status === "waived" ||
    rawStatus === "waived" ||
    reason === "staff" ||
    reason === "gov_speaker" ||
    txRef.startsWith("WAIVER-STAFF") ||
    txRef.startsWith("WAIVER-GOV-SPEAKER") ||
    (txRef.startsWith("WAIVER-") && !looksComplimentary)
  ) {
    return "waived";
  }
  // Paid confirmed: UI "Confirmed", bucket confirmed, or API issued/confirmed.
  if (
    status === "confirmed" ||
    bucket === "confirmed" ||
    rawStatus === "issued" ||
    rawStatus === "confirmed" ||
    rawStatus === "checked-in" ||
    rawStatus === "checked_in"
  ) {
    return "paid";
  }
  return "pending";
}

export function paymentCategoryLabel(key: PaymentCategoryKey): string {
  return PAYMENT_CATEGORY_META[key].label;
}

function participantDay(p: AddedParticipant): string | null {
  if (p.registeredAtIso) {
    const d = new Date(p.registeredAtIso);
    if (!Number.isNaN(d.getTime())) return toYmd(d);
  }
  return null;
}

/** Full span covering every dated registration (for “show everything” default). */
export function participantsDateSpan(participants: AddedParticipant[]): DateRange | null {
  let min: string | null = null;
  let max: string | null = null;
  for (const p of participants) {
    if (p.status === "Cancelled") continue;
    const day = participantDay(p);
    if (!day) continue;
    if (!min || day < min) min = day;
    if (!max || day > max) max = day;
  }
  if (!min || !max) return null;
  return { start: min, end: max };
}

/** Default dashboard range: all registrations when available, else this month. */
export function defaultStatsRange(participants: AddedParticipant[] = []): DateRange {
  return participantsDateSpan(participants) ?? defaultMonthRange();
}

function inRange(ymd: string | null, range: DateRange): boolean {
  if (!ymd) return false;
  return ymd >= range.start && ymd <= range.end;
}

function countInRange(
  rows: AddedParticipant[],
  range: DateRange,
  includeUndated = false,
): { category: CategoryCounts; payment: PaymentCounts } {
  const category = emptyCounts();
  const payment = emptyPayment();
  for (const p of rows) {
    if (p.status === "Cancelled") continue;
    const day = participantDay(p);
    if (!day) {
      if (includeUndated) {
        category[categorizeParticipant(p)] += 1;
        payment[categorizePayment(p)] += 1;
      }
      continue;
    }
    if (!inRange(day, range)) continue;
    category[categorizeParticipant(p)] += 1;
    payment[categorizePayment(p)] += 1;
  }
  return { category, payment };
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

function toPaymentPercents(counts: PaymentCounts, total: number): PaymentCounts {
  const pct = emptyPayment();
  for (const k of PAYMENT_CATEGORY_ORDER) {
    pct[k] = total > 0 ? Math.round((counts[k] / total) * 1000) / 10 : 0;
  }
  return pct;
}

export function buildRegistrationStats(
  participants: AddedParticipant[],
  range: DateRange,
  options?: { includeUndated?: boolean },
): RegistrationStats {
  const includeUndated = Boolean(options?.includeUndated);
  const { category: counts, payment } = countInRange(participants, range, includeUndated);
  const total = sumCounts(counts);
  const previous = countInRange(participants, shiftRangeBack(range), false);
  const previousTotal = sumCounts(previous.category);
  const vsPreviousPct =
    previousTotal > 0
      ? Math.round(((total - previousTotal) / previousTotal) * 1000) / 10
      : total > 0
        ? 100
        : null;

  const days = eachDay(range);
  const byDay = new Map<string, CategoryCounts & PaymentCounts>();
  for (const d of days) byDay.set(d, { ...emptyCounts(), ...emptyPayment() });

  for (const p of participants) {
    if (p.status === "Cancelled") continue;
    const day = participantDay(p);
    if (!day || !byDay.has(day)) continue;
    const bucket = byDay.get(day)!;
    bucket[categorizeParticipant(p)] += 1;
    bucket[categorizePayment(p)] += 1;
  }

  const daily: DailyCategoryRow[] = days.map((date) => {
    const c = byDay.get(date) || { ...emptyCounts(), ...emptyPayment() };
    return {
      date,
      label: formatAxisDay(date),
      total: STATS_CATEGORY_ORDER.reduce((n, k) => n + c[k], 0),
      delegates: c.delegates,
      speakers: c.speakers,
      sponsors: c.sponsors,
      other: c.other,
      paid: c.paid,
      waived: c.waived,
      complimentary: c.complimentary,
      pending: c.pending,
    };
  });

  const confirmed = {
    paid: payment.paid,
    waived: payment.waived,
    complimentary: payment.complimentary,
  };
  const confirmedTotal = confirmed.paid + confirmed.waived + confirmed.complimentary;

  return {
    range,
    total,
    counts,
    percents: toPercents(counts, total),
    payment,
    paymentPercents: toPaymentPercents(payment, total),
    confirmedTotal,
    confirmed,
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
    ["Confirmed (paid + waived + complimentary)", String(stats.confirmedTotal)],
    [],
    ["Payment category", "Count", "Percent of total"],
    ...PAYMENT_CATEGORY_ORDER.map((k) => [
      PAYMENT_CATEGORY_META[k].label,
      String(stats.payment[k]),
      `${stats.paymentPercents[k]}%`,
    ]),
    [],
    ["Confirmed breakdown", "Count", "Percent of confirmed"],
    ...CONFIRMED_PAYMENT_ORDER.map((k) => [
      PAYMENT_CATEGORY_META[k].label,
      String(stats.confirmed[k]),
      stats.confirmedTotal > 0
        ? `${Math.round((stats.confirmed[k] / stats.confirmedTotal) * 1000) / 10}%`
        : "0%",
    ]),
    [],
    ["Participation type", "Count", "Percent"],
    ...STATS_CATEGORY_ORDER.map((k) => [
      STATS_CATEGORY_META[k].label,
      String(stats.counts[k]),
      `${stats.percents[k]}%`,
    ]),
    [],
    [
      "Date",
      "Total",
      ...STATS_CATEGORY_ORDER.map((k) => STATS_CATEGORY_META[k].label),
      ...PAYMENT_CATEGORY_ORDER.map((k) => PAYMENT_CATEGORY_META[k].label),
    ],
    ...stats.daily.map((row) => [
      row.date,
      String(row.total),
      ...STATS_CATEGORY_ORDER.map((k) => String(row[k])),
      ...PAYMENT_CATEGORY_ORDER.map((k) => String(row[k])),
    ]),
  ].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));

  return lines.join("\n");
}

export function downloadTextFile(filename: string, content: string, mime = "text/csv;charset=utf-8") {
  const isCsv = mime.includes("csv");
  const body = isCsv && !content.startsWith("\uFEFF") ? `\uFEFF${content}` : content;
  const blob = new Blob([body], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
