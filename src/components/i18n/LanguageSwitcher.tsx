import { useTranslation } from "react-i18next";
import { supportedLngs, type AppLanguage } from "../../i18n";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { t, i18n } = useTranslation("common");
  const active = (i18n.resolvedLanguage ?? i18n.language).split("-")[0] as AppLanguage;

  return (
    <div
      className={`inline-flex items-center rounded-lg border border-slate-200 p-0.5 text-xs font-semibold ${className}`}
      role="group"
      aria-label={t("language.label")}
    >
      {supportedLngs.map((lng) => {
        const selected = active === lng;
        return (
          <button
            key={lng}
            type="button"
            className={[
              "rounded-md px-2 py-1 transition-colors",
              selected ? "bg-blue text-white" : "text-mute hover:text-ink",
            ].join(" ")}
            aria-pressed={selected}
            onClick={() => {
              void i18n.changeLanguage(lng);
            }}
          >
            {t(`language.${lng}`)}
          </button>
        );
      })}
    </div>
  );
}
