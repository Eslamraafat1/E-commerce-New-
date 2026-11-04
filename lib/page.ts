import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Locale } from "@/config/store";
import { getDict, hasLocale, type DictKey } from "@/lib/i18n";
import { defaultShareImage, ogBase } from "@/lib/seo";

export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  return locale;
}

/** Page metadata with a canonical URL and hreflang alternates for the given locale-less path. */
export function pageMeta(locale: Locale, title: string, path: string, description?: string, noindex = false): Metadata {
  const desc = description ?? getDict(locale)["meta.description"];
  return {
    title,
    description: desc,
    alternates: { canonical: `/${locale}${path}`, languages: { en: `/en${path}`, ar: `/ar${path}`, "x-default": `/en${path}` } },
    openGraph: { ...ogBase(locale), title, description: desc, url: `/${locale}${path}`, images: [defaultShareImage(locale)] },
    twitter: { card: "summary_large_image", title, description: desc, images: [defaultShareImage(locale)] },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

export const dictTitle = (locale: Locale, key: DictKey) => getDict(locale)[key];
