import i18n from "./index";

/** Locale-aware date formatting. Pass a Date or ISO-like string. */
export function formatDate(
  value: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  },
): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(i18n.language, options).format(date);
}

/** Locale-aware currency (KES / USD amounts stay numeric; labels stay in catalogs). */
export function formatMoney(
  amount: number,
  currency: "KES" | "USD",
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(i18n.language, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "KES" ? 0 : 2,
    ...options,
  }).format(amount);
}

export function formatNumber(amount: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(i18n.language, options).format(amount);
}
