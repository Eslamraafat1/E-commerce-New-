import { defaultLocale, locales, type Locale } from "@/config/store";
import { en } from "./en";
import { ar } from "./ar";

export type DictKey = keyof typeof en;
export type Dict = Record<DictKey, string>;

const dicts: Record<Locale, Dict> = { en, ar };

export const hasLocale = (v: string): v is Locale => (locales as readonly string[]).includes(v);
export const getDict = (locale: Locale): Dict => dicts[locale] ?? dicts[defaultLocale];

export function translate(dict: Dict, key: DictKey, vars?: Record<string, string | number>) {
  let s: string = dict[key] ?? en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

/** Prefix an internal path with the locale ("/shop" → "/en/shop"). */
export const localePath = (locale: Locale, path: string) => {
  if (/^(https?:|mailto:|#)/.test(path)) return path;
  return `/${locale}${path === "/" ? "" : path.startsWith("/") ? path : `/${path}`}`;
};
