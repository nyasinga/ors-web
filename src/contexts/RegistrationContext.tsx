import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ParticipationType } from "../data/registration";
import { useEventCopy, useRegistrationFees } from "../i18n/useEventCopy";
import type { PublicSponsorPackage } from "../lib/publicEvent";
import {
  IMAGE_KEY,
  IMAGE_PERSIST_KEY,
  PERSIST_KEY,
  RegistrationContext,
  type PersistedImage,
  type RegistrationContextValue,
  type RegistrationDetails,
  type RegistrationInvoice,
  type SelectedSponsorPackage,
} from "./registrationShared";

const INVOICE_PERSIST_KEY = `${PERSIST_KEY}-invoice`;

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

/** Registration draft provider — component-only export for Fast Refresh. */
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
  const [invoice, setInvoiceState] = useState<RegistrationInvoice | null>(() => {
    try {
      const raw = sessionStorage.getItem(INVOICE_PERSIST_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as RegistrationInvoice;
      return parsed?.reference ? parsed : null;
    } catch {
      return null;
    }
  });
  const [paymentPhase, setPaymentPhase] = useState<"invoice" | "bank">("invoice");
  const [paymentProofFiles, setPaymentProofFiles] = useState<File[]>([]);
  const [referenceSuffix] = useState(() => Math.floor(100000 + Math.random() * 900000));
  const reference = `${event.referencePrefix}-${referenceSuffix}`;

  const setInvoice = useCallback((next: RegistrationInvoice | null) => {
    setInvoiceState((prev) => {
      if (prev?.isBlobUrl && prev.url) {
        try {
          URL.revokeObjectURL(prev.url);
        } catch {
          /* ignore */
        }
      }
      return next;
    });
    if (next) {
      // Persist metadata only — blob: URLs are not durable across reloads.
      try {
        const { url, isBlobUrl, ...meta } = next;
        sessionStorage.setItem(
          INVOICE_PERSIST_KEY,
          JSON.stringify({
            ...meta,
            url: isBlobUrl ? "" : url,
            isBlobUrl: false,
          }),
        );
      } catch {
        /* ignore quota */
      }
      setPaymentPhase("invoice");
    } else {
      sessionStorage.removeItem(INVOICE_PERSIST_KEY);
      setPaymentPhase("invoice");
    }
  }, []);

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
    setPaymentProofFiles([]);
    setInvoice(null);
    clearSponsorPackage();

    localStorage.removeItem(PERSIST_KEY);
    localStorage.removeItem(IMAGE_PERSIST_KEY);
  }, [clearSponsorPackage, setInvoice]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = sessionStorage.getItem(INVOICE_PERSIST_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as RegistrationInvoice;
        if (!parsed?.reference) return;

        if (parsed.url) {
          if (!cancelled) setInvoiceState(parsed);
          return;
        }

        // Re-fetch PDF invoice after reload when we only persisted ticketID.
        if (parsed.ticketID) {
          const { fetchTicketInvoice } = await import("../lib/pesaflow");
          const invoice = await fetchTicketInvoice(parsed.ticketID, parsed.token);
          if (cancelled) {
            if (invoice.isBlobUrl) URL.revokeObjectURL(invoice.url);
            return;
          }
          setInvoiceState({
            ...parsed,
            url: invoice.url,
            isBlobUrl: invoice.isBlobUrl,
          });
        }
      } catch {
        /* ignore restore failures */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

        setFiles((prev) => [...prev.filter((f) => f.name !== IMAGE_KEY), file]);
        setProfilePicturePreview(image.dataUrl);
      } catch (error) {
        console.error("Failed to restore profile picture:", error);
      } finally {
        setPictureLoaded(true);
      }
    };

    void restoreImage();
  }, []);

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
      invoice,
      setInvoice,
      paymentPhase,
      setPaymentPhase,
      paymentProofFiles,
      setPaymentProofFiles,
      registrationHydrated: detailsLoaded && pictureLoaded,
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
      profilePicturePreview,
      invoice,
      setInvoice,
      paymentPhase,
      paymentProofFiles,
      detailsLoaded,
      pictureLoaded,
    ],
  );

  return (
    <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>
  );
}
