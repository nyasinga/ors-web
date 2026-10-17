import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ParticipationType } from "../data/registration";
import { useEventCopy, useRegistrationFees } from "../i18n/useEventCopy";
import type { PublicSponsorPackage } from "../lib/publicEvent";

export const IMAGE_KEY = 'avatar.jpg';
export const PERSIST_KEY = 'isippe-registration-details';
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

type RegistrationContextValue = {
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
  
  /** Set when a sponsorship package has been chosen. */
  selectedSponsorPackage: SelectedSponsorPackage | null;
  /** Where the package was chosen from — drives Back navigation. */
  sponsorEntrySource: "sponsorship" | "register" | null;
  selectSponsorPackage: (
    pkg: PublicSponsorPackage,
    source?: "sponsorship" | "register",
  ) => void;
  clearSponsorPackage: () => void;
  /** True when a sponsorship package is active for this registration. */
  fromSponsorship: boolean;
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

function parsePackageAmounts(price?: string | number) {
  if (typeof price === "number" && Number.isFinite(price)) {
    return { kes: price, usd: 0 };
  }
  const text = String(price || "");
  const kesMatch = text.match(/KES\s*([\d,]+)/i);
  const usdMatch = text.match(/USD\s*([\d,]+)/i);
  const bare = text.match(/([\d,]+)/);
  return {
    kes: kesMatch
      ? Number(kesMatch[1].replace(/,/g, ""))
      : bare && !/usd/i.test(text)
        ? Number(bare[1].replace(/,/g, ""))
        : 0,
    usd: usdMatch ? Number(usdMatch[1].replace(/,/g, "")) : 0,
  };
}

const RegistrationContext = createContext<RegistrationContextValue | null>(null);

export function RegistrationProvider({ children }: { children: ReactNode }) {
  
  const [files, setFiles] = useState<File[]>([]);
  const [profilePicturePreview, setProfilePicturePreview] = useState("");
  const [pictureLoaded, setPictureLoaded] = useState(false);
  const [detailsLoaded, setDetailsLoaded] = useState(false);

  const event = useEventCopy();
  const fees = useRegistrationFees();

  const [participationType, setParticipationTypeState] = useState<ParticipationType>("delegate");
  const [details, setDetailsState] = useState<RegistrationDetails>(defaultDetails);
  const [selectedSponsorPackage, setSelectedSponsorPackage] = useState<SelectedSponsorPackage | null>(null);
  const [sponsorEntrySource, setSponsorEntrySource] = useState<"sponsorship" | "register" | null>(null);
  const [referenceSuffix] = useState(() => Math.floor(100000 + Math.random() * 900000));
  const reference = `${event.referencePrefix}-${referenceSuffix}`;

  const clearSponsorPackage = useCallback(() => {
    setSelectedSponsorPackage(null);
    setSponsorEntrySource(null);
  }, []);

  const selectSponsorPackage = useCallback(
    (pkg: PublicSponsorPackage, source: "sponsorship" | "register" = "register") => {
      const amounts = parsePackageAmounts(pkg.price);
      setParticipationTypeState("sponsor");
      setSponsorEntrySource(source);
      setSelectedSponsorPackage({
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        description: pkg.description,
        benefits: pkg.benefits,
        medal: pkg.medal,
        kes: amounts.kes,
        usd: amounts.usd,
      });
    },
    [],
  );

  const setParticipationType = useCallback(
    (t: ParticipationType) => {
      setParticipationTypeState(t);
      if (t !== "sponsor") clearSponsorPackage();
    },
    [clearSponsorPackage],
  );

  const clearDetails = useCallback(() => {
    setDetailsState(defaultDetails);
    setParticipationTypeState("delegate");
    setFiles([]);
    setProfilePicturePreview("");
    clearSponsorPackage();
  
    localStorage.removeItem(PERSIST_KEY);
    localStorage.removeItem(IMAGE_PERSIST_KEY);
  }, [clearSponsorPackage]);


  /* Restore profile picture */
  useEffect(() => {
    const restoreImage = async () => {
      try {
        const saved = localStorage.getItem(IMAGE_PERSIST_KEY);
        if (!saved) return;

        const image: PersistedImage = JSON.parse(saved);
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], image.name, {
          type: image.type,
          lastModified: image.lastModified,
        });

        setFiles((prev) => [
          ...prev.filter((f) => f.name !== IMAGE_KEY),
          file,
        ]);
        setProfilePicturePreview(image.dataUrl);
      } catch (error) {
        console.error("Failed to restore profile picture:", error);
      } finally {
        setPictureLoaded(true);
      }
    };

    void restoreImage();
  }, []);

  /* Persist profile picture */
  useEffect(() => {
    if (!pictureLoaded) return;
    const file = files.find((f) => f.name === IMAGE_KEY);

    if (!file) {
      localStorage.removeItem(IMAGE_PERSIST_KEY);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image: PersistedImage = {
        dataUrl: reader.result as string,
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
      };

      try {
        localStorage.setItem(IMAGE_PERSIST_KEY, JSON.stringify(image));
      } catch (error) {
        console.error("Failed to persist profile picture:", error);
      }
    };

    reader.readAsDataURL(file);
  }, [files, pictureLoaded]);

  /* Restore registration details */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PERSIST_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setDetailsState(parsed.details ?? parsed);
        if (parsed.participationType) {
          setParticipationTypeState(parsed.participationType);
        }
        if (parsed.selectedSponsorPackage) {
          setSelectedSponsorPackage(parsed.selectedSponsorPackage);
        }
        if (parsed.sponsorEntrySource === "sponsorship" || parsed.sponsorEntrySource === "register") {
          setSponsorEntrySource(parsed.sponsorEntrySource);
        }
      }
    } catch (error) {
      console.error("Failed to restore registration details:", error);
    } finally {
      setDetailsLoaded(true);
    }
  }, []);

  /* Persist registration details */
  useEffect(() => {
    if (!detailsLoaded) return;
    localStorage.setItem(
      PERSIST_KEY,
      JSON.stringify({
        details,
        participationType,
        selectedSponsorPackage,
        sponsorEntrySource,
      }),
    );
  }, [details, detailsLoaded, participationType, selectedSponsorPackage, sponsorEntrySource]);

  const active = fees[fees.active];
  /** Sponsors pay package price — never fall back to delegate ticket tiers. */
  const usingSponsor = participationType === "sponsor" || Boolean(selectedSponsorPackage);
  const feeKes = usingSponsor ? selectedSponsorPackage?.kes ?? 0 : active.kes;
  const feeUsd = usingSponsor ? selectedSponsorPackage?.usd ?? 0 : active.usd;
  const feeLabel = usingSponsor
    ? selectedSponsorPackage?.name || "Sponsorship package"
    : active.label;
  const feeUntil = usingSponsor
    ? selectedSponsorPackage?.description || "—"
    : active.until;

  const value = useMemo<RegistrationContextValue>(
    () => ({
      participationType,
      setParticipationType,
      details,
      setDetails: (patch) => setDetailsState((d) => ({ ...d, ...patch })),
      reference,
      feeKes,
      feeUsd,
      feeLabel,
      feeUntil,
      feeLabelKey: feeLabel,
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
      selectedSponsorPackage,
      sponsorEntrySource,
      selectSponsorPackage,
      clearSponsorPackage,
      fromSponsorship: usingSponsor,
      files,
      setFiles,
      profilePicturePreview,
      setProfilePicturePreview,
      clearDetails,
    }),
    [
      participationType,
      setParticipationType,
      details,
      reference,
      feeKes,
      feeUsd,
      feeLabel,
      feeUntil,
      fees,
      selectedSponsorPackage,
      sponsorEntrySource,
      selectSponsorPackage,
      clearSponsorPackage,
      usingSponsor,
      files,
      clearDetails,
    ],
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
