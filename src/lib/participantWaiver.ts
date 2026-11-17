/**
 * Admin-only registration waivers.
 *
 * Grant (existing ticket): PATCH /ticketing/{ticketID} multipart (JWT; JSON → 415)
 * Re-hydrate from paymentMode / transactionReference / extraData on list.
 */

import { toTicketingUserType } from "../data/registration";
import { apiForm, toFormData } from "./api";
import { getValidAuthToken } from "./auth";
import type { EngagementParticipantTicket } from "./eventParticipants";

export type WaiverReason = "staff" | "gov_speaker" | "sponsor_allocation" | "facilitator";
export type PaymentMode = "payable" | "waived" | "complimentary";

export const SPONSOR_COMPLIMENTARY_SEATS = 3;

export type WaiverInfo = {
  paymentMode: PaymentMode;
  waiverReason?: WaiverReason;
  agencyName?: string;
  sponsorTicketID?: string;
  /** Encoded value written to transactionReference */
  transactionReference: string;
};

export type GrantWaiverInput = {
  /** Existing ticket to waive (when converting a pending registration). */
  ticketID?: string;
  engagementID: string;
  reason: WaiverReason;
  /** Required when reason is gov_speaker */
  agencyName?: string;
  /** Required when reason is sponsor_allocation — the paid sponsor ticket */
  sponsorTicketID?: string;
  /** True when correcting a paid-confirmed ticket → waived/complimentary. */
  convertFromPaid?: boolean;
  /** True when restoring a cancelled ticket → waived/complimentary. */
  restoreFromCancelled?: boolean;
  /** Snapshot fields forwarded on PATCH /ticketing */
  fullName?: string;
  email?: string;
  phoneNo?: string;
  participationType?: string;
  organisation?: string;
  jobTitle?: string;
  country?: string;
  city?: string;
  title?: string;
};

export type GrantWaiverResult = {
  ticket: EngagementParticipantTicket;
  waiver: WaiverInfo;
  message?: string;
};

const WAIVER_PREFIX = "WAIVER";

export function waiverReasonLabel(reason: WaiverReason): string {
  if (reason === "staff") return "Staff waiver";
  if (reason === "facilitator") return "Facilitator complementary";
  if (reason === "gov_speaker") return "Speaker — Government Agency";
  return "Sponsor complimentary seat";
}

export function encodeWaiverReference(input: {
  reason: WaiverReason;
  agencyName?: string;
  sponsorTicketID?: string;
}): string {
  if (input.reason === "staff") return `${WAIVER_PREFIX}-STAFF`;
  if (input.reason === "facilitator") return `${WAIVER_PREFIX}-FACILITATOR`;
  if (input.reason === "gov_speaker") {
    const agency = (input.agencyName || "").trim().replace(/\|/g, " ").slice(0, 80);
    return agency ? `${WAIVER_PREFIX}-GOV-SPEAKER|${agency}` : `${WAIVER_PREFIX}-GOV-SPEAKER`;
  }
  const sponsorId = (input.sponsorTicketID || "").trim();
  if (!sponsorId) throw new Error("Select the sponsor package this free seat belongs to.");
  return `${WAIVER_PREFIX}-SPONSOR:${sponsorId}`;
}

export function parseWaiverFromTicket(ticket: {
  transactionReference?: unknown;
  extraData?: unknown;
  ticketPrice?: unknown;
  paymentMode?: unknown;
  waiverReason?: unknown;
}): WaiverInfo | null {
  const extra =
    ticket.extraData && typeof ticket.extraData === "object" && !Array.isArray(ticket.extraData)
      ? (ticket.extraData as Record<string, unknown>)
      : null;

  const modeRaw = String(
    ticket.paymentMode || extra?.paymentMode || extra?.payment_mode || "",
  ).toLowerCase();
  const reasonRaw = String(
    ticket.waiverReason || extra?.waiverReason || extra?.waiver_reason || "",
  ).toLowerCase();
  const ref = String(ticket.transactionReference || extra?.waiverReference || "").trim();

  const modeIsComp =
    modeRaw === "complimentary" ||
    modeRaw === "complementary" ||
    modeRaw === "comp";
  const modeIsWaived = modeRaw === "waived";

  if (modeIsComp || modeIsWaived) {
    const reason =
      normalizeReason(reasonRaw) ||
      (modeIsComp ? "sponsor_allocation" : "staff");
    const isComp =
      modeIsComp ||
      reason === "sponsor_allocation" ||
      reason === "facilitator";
    const sponsorTicketID =
      String(extra?.sponsorTicketID || extra?.sponsor_ticket_id || "").trim() || undefined;
    return {
      paymentMode: isComp ? "complimentary" : "waived",
      waiverReason: reason,
      agencyName: String(extra?.agencyName || extra?.agency || "").trim() || undefined,
      sponsorTicketID,
      transactionReference:
        ref || safeWaiverReference({ reason, sponsorTicketID, agencyName: String(extra?.agencyName || extra?.agency || "").trim() || undefined }),
    };
  }

  // Reason alone (API may keep status=waived but still send waiverReason).
  const reasonOnly = normalizeReason(reasonRaw);
  if (reasonOnly === "sponsor_allocation" || reasonOnly === "facilitator") {
    const sponsorTicketID =
      String(extra?.sponsorTicketID || extra?.sponsor_ticket_id || "").trim() || undefined;
    return {
      paymentMode: "complimentary",
      waiverReason: reasonOnly,
      agencyName: String(extra?.agencyName || extra?.agency || "").trim() || undefined,
      sponsorTicketID,
      transactionReference:
        ref ||
        safeWaiverReference({
          reason: reasonOnly,
          sponsorTicketID,
          agencyName: String(extra?.agencyName || extra?.agency || "").trim() || undefined,
        }),
    };
  }

  if (!ref.toUpperCase().startsWith(`${WAIVER_PREFIX}-`)) return null;

  const upper = ref.toUpperCase();
  if (upper.startsWith(`${WAIVER_PREFIX}-STAFF`)) {
    return { paymentMode: "waived", waiverReason: "staff", transactionReference: ref };
  }
  if (upper.startsWith(`${WAIVER_PREFIX}-FACILITATOR`)) {
    return {
      paymentMode: "complimentary",
      waiverReason: "facilitator",
      transactionReference: ref,
    };
  }
  if (upper.startsWith(`${WAIVER_PREFIX}-GOV-SPEAKER`)) {
    const agency = ref.includes("|") ? ref.split("|").slice(1).join("|").trim() : "";
    return {
      paymentMode: "waived",
      waiverReason: "gov_speaker",
      agencyName: agency || undefined,
      transactionReference: ref,
    };
  }
  if (upper.startsWith(`${WAIVER_PREFIX}-SPONSOR`)) {
    const sponsorTicketID = upper.includes(":")
      ? ref.slice(ref.indexOf(":") + 1).trim()
      : "";
    return {
      paymentMode: "complimentary",
      waiverReason: "sponsor_allocation",
      sponsorTicketID: sponsorTicketID || undefined,
      transactionReference: ref,
    };
  }

  if (upper.startsWith(WAIVER_PREFIX)) {
    return { paymentMode: "waived", waiverReason: "staff", transactionReference: ref };
  }

  return null;
}

function normalizeReason(raw: string): WaiverReason | undefined {
  if (raw === "staff") return "staff";
  if (raw === "facilitator") return "facilitator";
  if (raw === "gov_speaker" || raw === "gov-speaker" || raw === "government_speaker") return "gov_speaker";
  if (
    raw === "sponsor_allocation" ||
    raw === "sponsor" ||
    raw === "complimentary" ||
    raw === "complementary"
  ) {
    return "sponsor_allocation";
  }
  return undefined;
}

/** Encode without throwing when sponsor id is missing (list/parse path). */
function safeWaiverReference(input: {
  reason: WaiverReason;
  agencyName?: string;
  sponsorTicketID?: string;
}): string {
  try {
    if (input.reason === "sponsor_allocation" && !input.sponsorTicketID?.trim()) {
      return `${WAIVER_PREFIX}-SPONSOR`;
    }
    return encodeWaiverReference(input);
  } catch {
    return `${WAIVER_PREFIX}-${input.reason.toUpperCase()}`;
  }
}

function pickTicket(result: Record<string, unknown>, fallbackId?: string): EngagementParticipantTicket {
  const ticket = (result.ticket || result) as EngagementParticipantTicket;
  return {
    ...ticket,
    ticketID: String(ticket.ticketID || fallbackId || ""),
  };
}

/**
 * Admin grant waiver via PATCH /ticketing/{ticketID} (multipart — JSON returns 415).
 * Same route shape as cancel; marks fee waived/complimentary and confirms the ticket.
 */
export async function grantParticipantWaiver(input: GrantWaiverInput): Promise<GrantWaiverResult> {
  const engagementID = input.engagementID.trim();
  if (!engagementID) throw new Error("Engagement ID is required to grant a waiver.");

  const ticketID = input.ticketID?.trim() || "";
  if (!ticketID) throw new Error("A ticket ID is required to grant a waiver.");

  if (input.reason === "gov_speaker" && !input.agencyName?.trim()) {
    throw new Error("Enter the government agency for this speaker waiver.");
  }
  if (input.reason === "sponsor_allocation" && !input.sponsorTicketID?.trim()) {
    throw new Error("Select which sponsor this complimentary seat belongs to.");
  }

  const token = getValidAuthToken();
  if (!token) throw new Error("Sign in as admin to grant a waiver.");

  // Sponsor seats + facilitators are complementary; staff / gov speakers are waived.
  const paymentMode: PaymentMode =
    input.reason === "sponsor_allocation" || input.reason === "facilitator"
      ? "complimentary"
      : "waived";
  const waiver: WaiverInfo = {
    paymentMode,
    waiverReason: input.reason,
    agencyName: input.agencyName?.trim() || undefined,
    sponsorTicketID: input.sponsorTicketID?.trim() || undefined,
    transactionReference: encodeWaiverReference({
      reason: input.reason,
      agencyName: input.agencyName,
      sponsorTicketID: input.sponsorTicketID,
    }),
  };

  // EngagementTicket rejects unknown top-level props — put profile/waiver meta in extraData.
  const userType =
    input.reason === "gov_speaker"
      ? "speaker"
      : toTicketingUserType(input.participationType, "delegate");

  const body: Record<string, unknown> = {
    ticketID,
    engagementID,
    ticketPrice: 0,
    currency: "KES",
    participationType: userType,
    transactionReference: waiver.transactionReference,
    // Prefer complimentary when applicable; some backends only accept waived —
    // paymentMode / WAIVER-* ref still drive reporting.
    status: paymentMode === "complimentary" ? "complimentary" : "waived",
    extraData: {
      paymentMode: waiver.paymentMode,
      waiverReason: waiver.waiverReason,
      userType,
      ...(input.convertFromPaid
        ? {
            convertedFrom: "paid",
            convertedAt: new Date().toISOString(),
          }
        : {}),
      ...(input.restoreFromCancelled
        ? {
            restoredFrom: "cancelled",
            restoredAs: paymentMode,
            restoredAt: new Date().toISOString(),
          }
        : {}),
      ...(input.title?.trim() ? { title: input.title.trim() } : {}),
      ...(input.organisation?.trim() ? { organisation: input.organisation.trim() } : {}),
      ...(input.jobTitle?.trim() ? { jobTitle: input.jobTitle.trim() } : {}),
      ...(input.country?.trim() ? { country: input.country.trim() } : {}),
      ...(input.city?.trim() ? { city: input.city.trim() } : {}),
      ...(waiver.agencyName ? { agencyName: waiver.agencyName } : {}),
      ...(waiver.sponsorTicketID ? { sponsorTicketID: waiver.sponsorTicketID } : {}),
    },
  };

  if (input.fullName?.trim()) body.fullName = input.fullName.trim();
  if (input.email?.trim()) body.email = input.email.trim();
  if (input.phoneNo?.trim()) body.phoneNo = input.phoneNo.trim();

  const result = await apiForm<Record<string, unknown>>(`/ticketing/${encodeURIComponent(ticketID)}`, {
    method: "PATCH",
    token,
    formData: toFormData(body),
  });

  const ticket = pickTicket(result, ticketID);
  const message =
    typeof result.message === "string" && result.message.trim() ? result.message.trim() : undefined;

  return { ticket, waiver, message };
}

export function countSponsorComplimentaryUsed(
  participants: Array<{
    paymentMode?: PaymentMode;
    waiverReason?: WaiverReason;
    sponsorTicketID?: string;
  }>,
  sponsorTicketID: string,
): number {
  const id = sponsorTicketID.trim();
  if (!id) return 0;
  return participants.filter(
    (p) =>
      p.paymentMode === "complimentary" &&
      p.waiverReason === "sponsor_allocation" &&
      (p.sponsorTicketID || "") === id,
  ).length;
}

export function sponsorSeatsRemaining(
  participants: Array<{
    paymentMode?: PaymentMode;
    waiverReason?: WaiverReason;
    sponsorTicketID?: string;
  }>,
  sponsorTicketID: string,
  limit = SPONSOR_COMPLIMENTARY_SEATS,
): number {
  return Math.max(0, limit - countSponsorComplimentaryUsed(participants, sponsorTicketID));
}
