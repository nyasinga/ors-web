import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ParticipationType } from "../data/registration";
import { useEventCopy, useRegistrationFees } from "../i18n/useEventCopy";

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
  const event = useEventCopy();
  const fees = useRegistrationFees();
  const [participationType, setParticipationType] = useState<ParticipationType>("delegate");
  const [details, setDetailsState] = useState<RegistrationDetails>(defaultDetails);
  const [referenceSuffix] = useState(() => Math.floor(100000 + Math.random() * 900000));
  const reference = `${event.referencePrefix}-${referenceSuffix}`;

  const active = fees[fees.active];

  const value = useMemo<RegistrationContextValue>(
    () => ({
      participationType,
      setParticipationType,
      details,
      setDetails: (patch) => setDetailsState((d) => ({ ...d, ...patch })),
      reference,
      feeKes: active.kes,
      feeUsd: active.usd,
      feeLabel: active.label,
      feeUntil: active.until,
      feeLabelKey: active.label,
      earlyBird: {
        label: fees.earlyBird.label,
        until: fees.earlyBird.until,
        kes: fees.earlyBird.kes,
        usd: fees.earlyBird.usd,
      },
      late: {
        label: fees.late.label,
        until: fees.late.until,
        kes: fees.late.kes,
        usd: fees.late.usd,
      },
    }),
    [participationType, details, reference, active, fees],
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
