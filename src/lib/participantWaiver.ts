/**
 * Admin-only registration waivers.
 *
 * Grant: POST /ticketing multipart (JWT required; JSON → 415)
 * Re-hydrate from paymentMode / transactionReference / extraData on list.
 */

import { toTicketingUserType } from "../data/registration";
import { apiForm, toFormData } from "./api";
import { getValidAuthToken } from "./auth";
import type { EngagementParticipantTicket } from "./eventParticipants";

export type WaiverReason = "staff" | "gov_speaker" | "sponsor_allocation";
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
  /** Snapshot fields forwarded on POST /ticketing */
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
  if (reason === "gov_speaker") return "Speaker — Government Agency";
  return "Sponsor complimentary seat";
}

export function encodeWaiverReference(input: {
  reason: WaiverReason;
  agencyName?: string;
  sponsorTicketID?: string;
}): string {
  if (input.reason === "staff") return `${WAIVER_PREFIX}-STAFF`;
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

  if (modeRaw === "waived" || modeRaw === "complimentary") {
    const reason =
      normalizeReason(reasonRaw) || (modeRaw === "complimentary" ? "sponsor_allocation" : "staff");
    return {
      paymentMode: modeRaw === "complimentary" ? "complimentary" : "waived",
      waiverReason: reason,
      agencyName: String(extra?.agencyName || extra?.agency || "").trim() || undefined,
      sponsorTicketID:
        String(extra?.sponsorTicketID || extra?.sponsor_ticket_id || "").trim() || undefined,
      transactionReference: ref || encodeWaiverReference({ reason }),
    };
  }

  if (!ref.toUpperCase().startsWith(`${WAIVER_PREFIX}-`)) return null;

  const upper = ref.toUpperCase();
  if (upper.startsWith(`${WAIVER_PREFIX}-STAFF`)) {
    return { paymentMode: "waived", waiverReason: "staff", transactionReference: ref };
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
  if (upper.startsWith(`${WAIVER_PREFIX}-SPONSOR:`)) {
    const sponsorTicketID = ref.slice(ref.indexOf(":") + 1).trim();
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
  if (raw === "gov_speaker" || raw === "gov-speaker" || raw === "government_speaker") {
    return "gov_speaker";
  }
  if (raw === "sponsor_allocation" || raw === "sponsor" || raw === "complimentary") {
    return "sponsor_allocation";
  }
  return undefined;
}

function pickTicket(result: Record<string, unknown>, fallbackId?: string): EngagementParticipantTicket {
  const ticket = (result.ticket || result) as EngagementParticipantTicket;
  return {
    ...ticket,
    ticketID: String(ticket.ticketID || fallbackId || ""),
  };
}

/**
 * Admin grant waiver via POST /ticketing (multipart — JSON returns 415).
 */
export async function grantParticipantWaiver(input: GrantWaiverInput): Promise<GrantWaiverResult> {
  const engagementID = input.engagementID.trim();
  if (!engagementID) throw new Error("Engagement ID is required to grant a waiver.");

  if (input.reason === "gov_speaker" && !input.agencyName?.trim()) {
    throw new Error("Enter the government agency for this speaker waiver.");
  }
  if (input.reason === "sponsor_allocation" && !input.sponsorTicketID?.trim()) {
    throw new Error("Select which sponsor this complimentary seat belongs to.");
  }

  const token = getValidAuthToken();
  if (!token) throw new Error("Sign in as admin to grant a waiver.");

  const paymentMode: PaymentMode =
    input.reason === "sponsor_allocation" ? "complimentary" : "waived";
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

  // Backend validates `userType` against a fixed allow-list (not participationType).
  const userType =
    input.reason === "gov_speaker"
      ? "speaker"
      : toTicketingUserType(input.participationType, "delegate");

  const body: Record<string, unknown> = {
    engagementID,
    ticketPrice: 0,
    currency: "KES",
    userType,
    participationType: userType,
    paymentMode: waiver.paymentMode,
    waiverReason: waiver.waiverReason,
    transactionReference: waiver.transactionReference,
    status: "registered",
    extraData: {
      paymentMode: waiver.paymentMode,
      waiverReason: waiver.waiverReason,
      userType,
      ...(waiver.agencyName ? { agencyName: waiver.agencyName } : {}),
      ...(waiver.sponsorTicketID ? { sponsorTicketID: waiver.sponsorTicketID } : {}),
    },
  };

  if (input.ticketID?.trim()) body.ticketID = input.ticketID.trim();
  if (input.fullName?.trim()) body.fullName = input.fullName.trim();
  if (input.email?.trim()) body.email = input.email.trim();
  if (input.phoneNo?.trim()) body.phoneNo = input.phoneNo.trim();
  if (input.organisation?.trim()) body.organisation = input.organisation.trim();
  if (input.jobTitle?.trim()) body.jobTitle = input.jobTitle.trim();
  if (input.country?.trim()) body.country = input.country.trim();
  if (input.city?.trim()) body.city = input.city.trim();
  if (input.title?.trim()) body.title = input.title.trim();
  if (waiver.agencyName) body.agencyName = waiver.agencyName;
  if (waiver.sponsorTicketID) body.sponsorTicketID = waiver.sponsorTicketID;

  const result = await apiForm<Record<string, unknown>>("/ticketing", {
    method: "POST",
    token,
    formData: toFormData(body),
  });

  const ticket = pickTicket(result, input.ticketID);
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
