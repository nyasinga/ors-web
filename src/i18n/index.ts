import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "../locales/en/common.json";
import enHome from "../locales/en/home.json";
import swCommon from "../locales/sw/common.json";
import swHome from "../locales/sw/home.json";

export const supportedLngs = ["en", "sw"] as const;
export type AppLanguage = (typeof supportedLngs)[number];

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, home: enHome },
      sw: { common: swCommon, home: swHome },
    },
    fallbackLng: "en",
    supportedLngs: [...supportedLngs],
    defaultNS: "common",
    ns: ["common", "home"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["querystring", "localStorage", "navigator"],
      lookupQuerystring: "lang",
      caches: ["localStorage"],
    },
  });

const syncDocumentLang = (lng: string) => {
  const base = lng.split("-")[0] ?? "en";
  document.documentElement.lang = base;
};

syncDocumentLang(i18n.resolvedLanguage ?? i18n.language);
i18n.on("languageChanged", syncDocumentLang);

export default i18n;
