import { localeMeta, store, type Locale } from "@/config/store";

/** Prices are stored as integer minor units (cents). */
export function formatPrice(minor: number, locale: Locale, currency: string = store.currency) {
  return new Intl.NumberFormat(localeMeta[locale].intl, {
    style: "currency",
    currencyDisplay: "narrowSymbol",
    currency,
    minimumFractionDigits: minor % 100 === 0 ? 0 : 2,
  }).format(minor / 100);
}

export function formatNumber(n: number, locale: Locale, digits = 0) {
  return new Intl.NumberFormat(localeMeta[locale].intl, { maximumFractionDigits: digits }).format(n);
}

export function formatDate(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(localeMeta[locale].intl, { dateStyle: "medium" }).format(new Date(iso));
}

export type Localized = { en: string; ar: string };
export const L = (v: Localized | string | undefined, locale: Locale) =>
  v === undefined ? "" : typeof v === "string" ? v : v[locale];
