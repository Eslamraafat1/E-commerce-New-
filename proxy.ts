import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/config/store";
import { useDemoApi } from "@/lib/api/config";
import { categories, collections } from "@/data/demo/categories";
import { articles } from "@/data/demo/journal";
import { products } from "@/data/demo/products";

/**
 * Known slugs per dynamic route. Pages call notFound() for unknown slugs, but `app/[locale]/loading.tsx`
 * starts streaming first, which turns that into a 200 "soft 404" (with noindex). Checking here, before
 * rendering, returns a real HTTP 404. Only the demo catalog is known locally; with a real backend the
 * pages' notFound() + automatic noindex still apply.
 */
const knownSlugs: Record<string, Set<string>> | null = useDemoApi
  ? {
      products: new Set(products.map((p) => p.slug)),
      categories: new Set(categories.map((c) => c.slug)),
      collections: new Set(collections.map((c) => c.slug)),
      journal: new Set(articles.map((a) => a.slug)),
      policies: new Set(["shipping", "returns", "privacy", "terms"]),
    }
  : null;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));

  if (locale) {
    const [, , section, slug] = pathname.split("/");
    const known = knownSlugs?.[section];
    if (known && slug && !known.has(decodeURIComponent(slug))) {
      // Rewrite to a path handled by the [...rest] catch-all, which renders the localized 404 page.
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/not-found/${section}`;
      return NextResponse.rewrite(url, { status: 404 });
    }
    return;
  }

  // Redirect locale-less URLs (/shop) to the preferred locale (/en/shop or /ar/shop).
  const cookie = request.cookies.get("vanta-locale")?.value;
  const accept = request.headers.get("accept-language")?.toLowerCase() ?? "";
  const preferred = locales.find((l) => l === cookie) ?? (accept.startsWith("ar") || /(^|,)\s*ar\b/.test(accept) ? "ar" : defaultLocale);

  const url = request.nextUrl.clone();
  url.pathname = `/${preferred}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
