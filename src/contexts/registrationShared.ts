import { createContext } from "react";
import type { ParticipationType } from "../data/registration";
import type { PublicSponsorPackage } from "../lib/publicEvent";

export const IMAGE_KEY = "avatar.jpg";
export const PERSIST_KEY = "isippe-registration-details";
export const IMAGE_PERSIST_KEY = `${PERSIST_KEY}-avatar`;

export type PersistedImage = {
  dataUrl: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
};

export type RegistrationDetails = {
  title: string;
  fullName: string;
  email: string;
  phone: string;
  organisation: string;
  jobTitle: string;
  country: string;
  city: string;
  language: string;
  otherLanguage: string;
  dietary: string;
  accessibility: string;
  googleCalendarURL?: string;
  passCodeQR?: string;
  reference?: string;
  status?: string;
  passCode?: string;
  engagementID?: string;
  /** Bank / M-Pesa ref submitted with proof (pending until admin verifies). */
  paymentReference?: string;
  /** Set after proof submit — gates pass until admin verifies. */
  verificationStatus?: "pending_verification" | "confirmed" | "waived";
};

/** Snapshot of what the registrant had selected when the invoice was created. */
export type InvoiceSelectionSnapshot = {
  participationType: ParticipationType;
  packageId?: string;
  amountKes?: number;
};

/** Invoice created after Details submit — shown before bank payment. */
export type RegistrationInvoice = {
  /** URL to view / download the invoice (PDF or HTML). */
  url: string;
  /** Bill / invoice reference for bank narration. */
  reference: string;
  amount?: number;
  currency?: string;
  /** From signup-isippe — used to re-fetch GET /ticketing/{ticketID}/invoice */
  ticketID?: string;
  /** JWT from signup — required for invoice endpoint */
  token?: string;
  /** True when `url` is a blob: object URL (do not persist across reloads). */
  isBlobUrl?: boolean;
  /**
   * Selection used to create this invoice. If the user later changes type/package,
   * this no longer matches and Payment must force a new invoice.
   */
  selection?: InvoiceSelectionSnapshot;
  /** participationType / userType returned by signup (source of truth for the PDF). */
  serverType?: string;
  /** ticketPrice returned by signup. */
  serverAmount?: number;
};

export type SelectedSponsorPackage = {
  id: string;
  name: string;
  price: string;
  description: string;
  benefits: string[];
  medal: string;
  kes: number;
  usd: number;
};

/**
 * True when stored invoice still matches the current registration selection
 * and (when known) the server ticket type/amount.
 */
export function invoiceMatchesSelection(
  invoice: RegistrationInvoice | null | undefined,
  opts: {
    participationType: ParticipationType;
    selectedSponsorPackage: SelectedSponsorPackage | null;
    expectedAmountKes: number;
  },
): boolean {
  if (!invoice?.reference && !invoice?.ticketID) return false;
  const sel = invoice.selection;
  // Pre-fix / client-only stamps without server fields — force recreate.
  if (!sel) return false;
  if (!invoice.serverType && !(invoice.serverAmount && invoice.serverAmount > 0)) {
    return false;
  }

  const isSponsor =
    opts.participationType === "sponsor" || Boolean(opts.selectedSponsorPackage);

  if (isSponsor) {
    if (sel.participationType !== "sponsor") return false;
    const pkgId = opts.selectedSponsorPackage?.id;
    if (pkgId && sel.packageId && sel.packageId !== pkgId) return false;
    if (pkgId && !sel.packageId) return false;
  } else if (sel.participationType === "sponsor" || sel.packageId) {
    return false;
  }

  const expected = opts.expectedAmountKes > 0 ? opts.expectedAmountKes : 0;
  if (expected > 0 && sel.amountKes && Math.abs(sel.amountKes - expected) > 1) {
    return false;
  }

  // Server ticket type must agree with current selection (PDF Category).
  const serverType = String(invoice.serverType || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (serverType) {
    const serverIsSponsor = serverType === "sponsor" || serverType === "exhibitor";
    if (isSponsor !== serverIsSponsor) return false;
  }
  if (
    expected > 0 &&
    invoice.serverAmount &&
    invoice.serverAmount > 0 &&
    Math.abs(invoice.serverAmount - expected) > 1
  ) {
    return false;
  }

  return true;
}

export type RegistrationContextValue = {
  files: File[];
  setFiles: (files: File[] | ((prev: File[]) => File[])) => void;
  profilePicturePreview: string;
  setProfilePicturePreview: (value: string) => void;
  participationType: ParticipationType;
  setParticipationType: (t: ParticipationType) => void;
  details: RegistrationDetails;
  setDetails: (patch: Partial<RegistrationDetails>) => void;
  clearDetails: () => void;
  reference: string;
  feeKes: number;
  feeUsd: number;
  feeLabel: string;
  feeUntil: string;
  /** @deprecated Prefer feeLabel */
  feeLabelKey: string;
  earlyBird: {
    label: string;
    until: string;
    kes: number;
    usd: number;
  };
  late: {
    label: string;
    until: string;
    kes: number;
    usd: number;
  };
  selectedSponsorPackage: SelectedSponsorPackage | null;
  sponsorEntrySource: "sponsorship" | "register" | null;
  selectSponsorPackage: (
    pkg: PublicSponsorPackage,
    source?: "sponsorship" | "register",
  ) => void;
  clearSponsorPackage: () => void;
  fromSponsorship: boolean;
  /** Invoice from Details → API; required before bank payment. */
  invoice: RegistrationInvoice | null;
  setInvoice: (invoice: RegistrationInvoice | null) => void;
  /** Payment sub-step: invoice preview, then bank instructions. */
  paymentPhase: "invoice" | "bank";
  setPaymentPhase: (phase: "invoice" | "bank") => void;
  /** Proof-of-payment files (endpoint wired later). */
  paymentProofFiles: File[];
  setPaymentProofFiles: (files: File[] | ((prev: File[]) => File[])) => void;
  /** True once details / invoice have been restored from storage. */
  registrationHydrated: boolean;
};

export const RegistrationContext = createContext<RegistrationContextValue | null>(null);
