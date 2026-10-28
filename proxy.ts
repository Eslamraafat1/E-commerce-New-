import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/config/store";

/** Redirects locale-less URLs (/shop) to the preferred locale (/en/shop or /ar/shop). */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;

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
