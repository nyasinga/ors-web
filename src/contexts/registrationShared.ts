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
