"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useMemo, type ComponentProps } from "react";
import { localeMeta, type Locale } from "@/config/store";
import { formatDate, formatNumber, formatPrice, L, type Localized } from "@/lib/format";
import { localePath, translate, type Dict, type DictKey } from "@/lib/i18n";

interface Ctx { locale: Locale; dir: "ltr" | "rtl"; dict: Dict }
const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ locale, dict, children }: { locale: Locale; dict: Dict; children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, dir: localeMeta[locale].dir, dict }), [locale, dict]);
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const c = useContext(I18nCtx);
  if (!c) throw new Error("useI18n must be used inside I18nProvider");
  const { locale, dict, dir } = c;
  const t = useCallback((key: DictKey, vars?: Record<string, string | number>) => translate(dict, key, vars), [dict]);
  return useMemo(
    () => ({
      locale, dir, t, isRtl: dir === "rtl",
      l: (v: Localized | string | undefined) => L(v, locale),
      price: (minor: number, currency?: string) => formatPrice(minor, locale, currency),
      num: (n: number, d?: number) => formatNumber(n, locale, d),
      date: (iso: string) => formatDate(iso, locale),
      path: (p: string) => localePath(locale, p),
    }),
    [locale, dir, t],
  );
}

/** next/link that automatically prefixes the active locale. */
export function LocLink({ href, ...props }: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  const { path } = useI18n();
  return <Link href={path(href)} {...props} />;
}
