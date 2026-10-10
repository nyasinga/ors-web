import { useTranslation } from "react-i18next";
import { eventInfo } from "../data/event";

/** Translated event copy for UI; brand codes/contact stay on `eventInfo`. */
export function useEventCopy() {
  const { t } = useTranslation("common");

  return {
    name: eventInfo.name,
    supportEmail: eventInfo.supportEmail,
    supportPhone: eventInfo.supportPhone,
    fullName: t("event.fullName", { number: '3rd'}),
    edition: t("event.edition"),
    dates: t("event.dates"),
    datesShort: t("event.datesShort"),
    city: t("event.city"),
    venue: t("event.venue"),
    venueShort: t("event.venueShort"),
    tagline: t("event.tagline"),
  };
}
