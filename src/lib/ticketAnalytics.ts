import { apiRequest } from "./api";
import { getValidAuthToken } from "./auth";
import type { EngagementTicket } from "../types/engagement";

export type PaymentTransaction = {
  transactionID?: string;
  receiptNo?: string;
  accountReference?: string;
  amount?: number;
  fees?: number;
  paymentDate?: string;
  phoneNumber?: string;
  paymentMethod?: string;
  payerName?: string;
  description?: string;
  transactionReference?: string;
  reconciled?: string;
  completed?: string;
  extraData?: Record<string, unknown> | null;
};

export type TicketSalesRow = {
  id: string;
  name: string;
  blurb: string;
  priceKes: number;
  capacity: number;
  sold: number;
  canceled: number;
  status: string;
};

export type TicketSalesTrendPoint = {
  date: string;
  label: string;
  count: number;
};

export type TicketSalesAnalytics = {
  rows: TicketSalesRow[];
  capacity: number;
  sold: number;
  remaining: number;
  paid: number;
  canceled: number;
  soldPct: number;
  remainPct: number;
  totalRevenue: number;
  trend: TicketSalesTrendPoint[];
  source: "transactions" | "ticket-fields" | "registered" | "empty";
};

/** Parse KES amount from strings like "KES 60,000 / USD 470". */
export function parseKesPrice(value?: string | number | null): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value == null) return 0;
  const text = String(value);
  const kesMatch = text.match(/KES\s*([\d,]+(?:\.\d+)?)/i);
  if (kesMatch) return Number(kesMatch[1].replace(/,/g, "")) || 0;
  // Prefer the first amount before a slash (dual-currency strings).
  const beforeSlash = text.split("/")[0] || text;
  const digits = beforeSlash.replace(/[^\d.]/g, "");
  return Number(digits) || 0;
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) return Number(value.replace(/,/g, "")) || 0;
  return 0;
}

function ticketId(ticket: EngagementTicket, index: number) {
  return ticket.id || `tk-${index + 1}`;
}

function isCompleted(tx: PaymentTransaction): boolean {
  const raw = String(tx.completed ?? "").trim().toLowerCase();
  if (!raw) return true; // treat missing completed as paid when amount is present
  return !["false", "0", "no", "failed", "cancelled", "canceled", "refunded", "pending"].includes(raw);
}

function isCanceled(tx: PaymentTransaction): boolean {
  const hay = `${tx.completed || ""} ${tx.reconciled || ""} ${tx.description || ""}`.toLowerCase();
  return /cancel|refund|void|fail/.test(hay);
}

function parseCutoffDate(period?: string): Date | null {
  if (!period) return null;
  // "Up to 31 October 2026"
  const upTo = period.match(/up\s+to\s+(\d{1,2}\s+\w+\s+\d{4})/i);
  if (upTo) {
    const d = new Date(`${upTo[1]} 23:59:59`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  // "1 to 18 November 2026" → starts on first date
  const range = period.match(/(\d{1,2}\s+\w+\s+\d{4})\s+to\s+(\d{1,2}\s+\w+\s+\d{4})/i);
  if (range) {
    const d = new Date(`${range[1]} 00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function matchesEvent(tx: PaymentTransaction, eventId: string, eventName: string): boolean {
  const extra = tx.extraData || {};
  const extraEng =
    extra.engagementID ?? extra.engagementId ?? extra.eventId ?? extra.eventID ?? extra.tenantEventId;
  if (extraEng != null && String(extraEng) === eventId) return true;

  const hay = `${tx.description || ""} ${tx.accountReference || ""} ${JSON.stringify(extra)}`.toLowerCase();
  if (eventId && hay.includes(eventId.toLowerCase())) return true;
  const nameToken = eventName.trim().toLowerCase();
  if (nameToken.length >= 6 && hay.includes(nameToken.slice(0, Math.min(12, nameToken.length)))) return true;
  // ISIPPE / ACA registration payments often mention these.
  if (/isippe|registration fee|ecitizen|aca/.test(hay)) return true;
  return false;
}

function matchTicketIndex(
  tx: PaymentTransaction,
  tickets: EngagementTicket[],
  prices: number[],
): number {
  const extra = tx.extraData || {};
  const ticketKey = extra.ticketId ?? extra.ticketID ?? extra.feeLabel ?? extra.ticketType;
  if (ticketKey != null) {
    const key = String(ticketKey).toLowerCase();
    const byId = tickets.findIndex((t, i) => (t.id || `tk-${i + 1}`).toLowerCase() === key);
    if (byId >= 0) return byId;
    const byName = tickets.findIndex((t) => t.name.toLowerCase().includes(key) || key.includes(t.name.toLowerCase()));
    if (byName >= 0) return byName;
  }

  const amount = Math.abs(asNumber(tx.amount));
  if (amount > 0) {
    let best = -1;
    let bestDiff = Infinity;
    prices.forEach((price, i) => {
      if (price <= 0) return;
      const diff = Math.abs(price - amount);
      // Allow eCitizen convenience fee (~50) and small rounding.
      if (diff <= 100 && diff < bestDiff) {
        best = i;
        bestDiff = diff;
      }
    });
    if (best >= 0) return best;
  }

  const when = tx.paymentDate ? new Date(tx.paymentDate) : null;
  if (when && !Number.isNaN(when.getTime())) {
    // Prefer early-bird style "Up to …" while payment is on/before cutoff.
    for (let i = 0; i < tickets.length; i += 1) {
      const period = tickets[i].period || "";
      if (!/up\s+to/i.test(period)) continue;
      const cutoff = parseCutoffDate(period);
      if (cutoff && when <= cutoff) return i;
    }
    for (let i = 0; i < tickets.length; i += 1) {
      const period = tickets[i].period || "";
      if (/up\s+to/i.test(period)) continue;
      const start = parseCutoffDate(period);
      if (start && when >= start) return i;
    }
  }

  return tickets.length ? 0 : -1;
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildTrend(dates: Date[], days = 30): TicketSalesTrendPoint[] {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const counts = new Map<string, number>();
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    counts.set(dayKey(d), 0);
  }
  for (const d of dates) {
    if (d < start || d > end) continue;
    const key = dayKey(d);
    if (counts.has(key)) counts.set(key, (counts.get(key) || 0) + 1);
  }

  return [...counts.entries()].map(([date, count]) => {
    const d = new Date(`${date}T12:00:00`);
    return {
      date,
      label: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      count,
    };
  });
}

/** Build SVG polyline/area paths for a sales trend series. */
export function buildTrendPaths(
  trend: TicketSalesTrendPoint[],
  width = 360,
  height = 205,
) {
  const padL = 34;
  const padR = 15;
  const padT = 18;
  const padB = 52;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const max = Math.max(...trend.map((p) => p.count), 1);
  const niceMax = Math.ceil(max / 5) * 5 || 5;
  const pts = trend.map((p, i) => {
    const x = padL + (trend.length <= 1 ? plotW / 2 : (i / (trend.length - 1)) * plotW);
    const y = padT + plotH - (p.count / niceMax) * plotH;
    return { x, y, ...p };
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = pts.length
    ? `${line} L${pts[pts.length - 1].x.toFixed(1)} ${(padT + plotH).toFixed(1)} L${pts[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`
    : "";
  const axis = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: padT + plotH * t,
    label: String(Math.round(niceMax * (1 - t))),
  }));
  const xLabels = pts
    .filter((_, i) => i === 0 || i === pts.length - 1 || i % Math.ceil(pts.length / 6) === 0)
    .map((p) => ({ x: p.x, label: p.label }));
  return { line, area, pts, axis, xLabels, padL, padT, plotH, niceMax };
}

export async function fetchEventTransactions(eventId: string, eventName: string) {
  const token = getValidAuthToken();
  if (!token) return [] as PaymentTransaction[];

  const filter = {
    order: "paymentDate DESC",
    limit: 500,
  };
  try {
    const rows = await apiRequest<PaymentTransaction[]>(
      `/transactions?filter=${encodeURIComponent(JSON.stringify(filter))}`,
      { token },
    );
    if (!Array.isArray(rows)) return [];
    // Prefer event-matched rows; if none match tightly, still keep amount-matched later.
    const matched = rows.filter((tx) => matchesEvent(tx, eventId, eventName));
    return matched.length ? matched : rows;
  } catch {
    return [];
  }
}

export function analyzeTicketSales(input: {
  eventId: string;
  eventName: string;
  tickets: EngagementTicket[];
  transactions?: PaymentTransaction[];
  registered?: number;
}): TicketSalesAnalytics {
  const { tickets, transactions = [], registered = 0 } = input;
  const prices = tickets.map((t) => parseKesPrice(t.price));

  const baseRows: TicketSalesRow[] = tickets.map((t, i) => {
    const record = t as EngagementTicket & {
      sold?: number | string;
      canceled?: number | string;
      cancelled?: number | string;
      status?: string;
    };
    return {
      id: ticketId(t, i),
      name: t.name,
      blurb: t.period || "Event ticket",
      priceKes: prices[i],
      capacity: t.capacity || 0,
      sold: asNumber(record.sold),
      canceled: asNumber(record.canceled ?? record.cancelled),
      status: record.status || "Active",
    };
  });

  const fieldSold = baseRows.reduce((s, r) => s + r.sold, 0);
  if (fieldSold > 0 || baseRows.some((r) => r.canceled > 0)) {
    const sold = baseRows.reduce((s, r) => s + r.sold, 0);
    const canceled = baseRows.reduce((s, r) => s + r.canceled, 0);
    const capacity = baseRows.reduce((s, r) => s + r.capacity, 0);
    const remaining = Math.max(capacity - sold, 0);
    return {
      rows: baseRows,
      capacity,
      sold,
      remaining,
      paid: sold,
      canceled,
      soldPct: capacity > 0 ? Math.round((sold / capacity) * 100) : 0,
      remainPct: capacity > 0 ? Math.round((remaining / capacity) * 100) : 0,
      totalRevenue: baseRows.reduce((s, r) => s + r.sold * r.priceKes, 0),
      trend: buildTrend([]),
      source: "ticket-fields",
    };
  }

  const soldCounts = tickets.map(() => 0);
  const canceledCounts = tickets.map(() => 0);
  const paidKeys = new Set<string>();
  const trendDates: Date[] = [];

  let usedTransactions = false;
  for (const tx of transactions) {
    const amount = Math.abs(asNumber(tx.amount));
    if (amount <= 0 && !isCanceled(tx)) continue;

    const idx = matchTicketIndex(tx, tickets, prices);
    if (idx < 0) continue;

    // Only count rows that look like event ticket payments (amount near a ticket, or matched event).
    const nearPrice = prices.some((p) => p > 0 && Math.abs(p - amount) <= 100);
    const eventHit = matchesEvent(tx, input.eventId, input.eventName);
    if (!nearPrice && !eventHit) continue;

    usedTransactions = true;
    if (isCanceled(tx)) {
      canceledCounts[idx] += 1;
      continue;
    }
    if (!isCompleted(tx)) continue;

    soldCounts[idx] += 1;
    const payer = (tx.phoneNumber || tx.payerName || tx.transactionID || tx.receiptNo || "").trim();
    if (payer) paidKeys.add(payer.toLowerCase());
    if (tx.paymentDate) {
      const d = new Date(tx.paymentDate);
      if (!Number.isNaN(d.getTime())) trendDates.push(d);
    }
  }

  if (usedTransactions) {
    const rows = baseRows.map((r, i) => ({
      ...r,
      sold: soldCounts[i],
      canceled: canceledCounts[i],
    }));
    const sold = rows.reduce((s, r) => s + r.sold, 0);
    const canceled = rows.reduce((s, r) => s + r.canceled, 0);
    const capacity = rows.reduce((s, r) => s + r.capacity, 0);
    const remaining = Math.max(capacity - sold, 0);
    return {
      rows,
      capacity,
      sold,
      remaining,
      paid: paidKeys.size || sold,
      canceled,
      soldPct: capacity > 0 ? Math.round((sold / capacity) * 100) : 0,
      remainPct: capacity > 0 ? Math.round((remaining / capacity) * 100) : 0,
      totalRevenue: rows.reduce((s, r) => s + r.sold * r.priceKes, 0),
      trend: buildTrend(trendDates),
      source: "transactions",
    };
  }

  // Fallback: engagement.registered aggregate — assign to the currently open ticket window.
  if (registered > 0 && baseRows.length) {
    const now = new Date();
    let target = 0;
    for (let i = 0; i < tickets.length; i += 1) {
      const period = tickets[i].period || "";
      if (/up\s+to/i.test(period)) {
        const cutoff = parseCutoffDate(period);
        if (cutoff && now <= cutoff) {
          target = i;
          break;
        }
      } else {
        target = i;
      }
    }
    const rows = baseRows.map((r, i) => ({
      ...r,
      sold: i === target ? registered : 0,
    }));
    const capacity = rows.reduce((s, r) => s + r.capacity, 0);
    const sold = registered;
    const remaining = Math.max(capacity - sold, 0);
    return {
      rows,
      capacity,
      sold,
      remaining,
      paid: registered,
      canceled: 0,
      soldPct: capacity > 0 ? Math.round((sold / capacity) * 100) : 0,
      remainPct: capacity > 0 ? Math.round((remaining / capacity) * 100) : 0,
      totalRevenue: rows.reduce((s, r) => s + r.sold * r.priceKes, 0),
      trend: buildTrend([]),
      source: "registered",
    };
  }

  const capacity = baseRows.reduce((s, r) => s + r.capacity, 0);
  return {
    rows: baseRows,
    capacity,
    sold: 0,
    remaining: capacity,
    paid: 0,
    canceled: 0,
    soldPct: 0,
    remainPct: capacity > 0 ? 100 : 0,
    totalRevenue: 0,
    trend: buildTrend([]),
    source: "empty",
  };
}
