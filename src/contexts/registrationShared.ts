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
  dietary: string;
  accessibility: string;
  googleCalendarURL?: string;
  passCodeQR?: string;
  reference?: string;
  status?: string;
  passCode?: string;
  engagementID?: string;
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
};

export const RegistrationContext = createContext<RegistrationContextValue | null>(null);
