import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ParticipationType } from "../data/registration";
import { fees } from "../data/event";

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
};

type RegistrationContextValue = {
  participationType: ParticipationType;
  setParticipationType: (t: ParticipationType) => void;
  details: RegistrationDetails;
  setDetails: (patch: Partial<RegistrationDetails>) => void;
  reference: string;
  feeKes: number;
  feeUsd: number;
  feeLabelKey: string;
};

const defaultDetails: RegistrationDetails = {
  title: "",
  fullName: "",
  email: "",
  phone: "",
  organisation: "",
  jobTitle: "",
  country: "",
  city: "",
  dietary: "",
  accessibility: "",
};

const RegistrationContext = createContext<RegistrationContextValue | null>(null);

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [participationType, setParticipationType] = useState<ParticipationType>("delegate");
  const [details, setDetailsState] = useState<RegistrationDetails>(defaultDetails);
  const [reference] = useState(() => `ISIPPE-2026-${Math.floor(100000 + Math.random() * 900000)}`);

  const value = useMemo<RegistrationContextValue>(
    () => ({
      participationType,
      setParticipationType,
      details,
      setDetails: (patch) => setDetailsState((d) => ({ ...d, ...patch })),
      reference,
      feeKes: fees.earlyBird.kes,
      feeUsd: fees.earlyBird.usd,
      feeLabelKey: fees.earlyBird.labelKey,
    }),
    [participationType, details, reference],
  );

  return (
    <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const ctx = useContext(RegistrationContext);
  if (!ctx) throw new Error("useRegistration must be used within RegistrationProvider");
  return ctx;
}
