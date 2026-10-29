import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import "../globals.css";
import { localeMeta, locales, store } from "@/config/store";
import { getDict, hasLocale } from "@/lib/i18n";
import { I18nProvider } from "@/components/providers/i18n";
import { UIProvider } from "@/components/providers/ui";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageCurtain } from "@/components/motion/page-curtain";
import { CursorBubble } from "@/components/motion/creative";
import { BackToTop, ScrollProgress } from "@/components/motion/primitives";
import { getCategories } from "@/lib/api/categories";
import { getCollections } from "@/lib/api/collections";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display-latin", display: "swap" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });
const arabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["300", "400", "500", "600", "700"], variable: "--font-arabic", display: "swap" });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const dict = getDict(locale);
  return {
    metadataBase: new URL(store.siteUrl),
    title: { default: `${store.name} — ${store.tagline[locale]}`, template: `%s · ${store.name}` },
    description: dict["meta.description"],
    alternates: { languages: { en: "/en", ar: "/ar" } },
    openGraph: { type: "website", siteName: store.name, locale: localeMeta[locale].intl.replace("-", "_"), title: `${store.name} — ${store.tagline[locale]}`, description: dict["meta.description"] },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f3f0e8" }, { media: "(prefers-color-scheme: dark)", color: "#0a0a0c" }],
};

/** Runs before first paint so the correct theme is applied with no flash. */
const themeScript = `(function(){try{var t=localStorage.getItem('vanta-theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}var d=document.documentElement;d.dataset.theme=t;d.style.colorScheme=t;var m=localStorage.getItem('vanta-motion');if(m==='full'||m==='reduced'){d.dataset.motion=m;var o=window.matchMedia.bind(window);window.matchMedia=function(q){var r=o(q);if(/prefers-reduced-motion/.test(q)){var want=/reduce/.test(q)?(m==='reduced'):(m==='full');var f=Object.create(r);Object.defineProperty(f,'matches',{value:want});f.addEventListener=function(){};f.removeEventListener=function(){};f.addListener=function(){};f.removeListener=function(){};return f}return r}}}catch(e){}})();`;

export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = getDict(locale);
  const { dir } = localeMeta[locale];
  const [categories, collections] = await Promise.all([getCategories(), getCollections()]);

  return (
    <html
      lang={locale}
      dir={dir}
      data-theme="dark"
      suppressHydrationWarning
      className={`${display.variable} ${geist.variable} ${mono.variable} ${arabic.variable} h-full antialiased`}
      style={{
        ["--font-body" as string]: locale === "ar" ? "var(--font-arabic)" : "var(--font-geist-sans)",
        ["--font-heading" as string]: locale === "ar" ? "var(--font-arabic)" : "var(--font-display-latin)",
      }}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <I18nProvider locale={locale} dict={dict}>
          <UIProvider>
            <SmoothScroll />
            <a href="#main" className="skip-link">{dict["a11y.skip"]}</a>
            <ScrollProgress />
            <Suspense fallback={<div aria-hidden className="h-[var(--header-h)]" />}>
              <Header categories={categories} collections={collections} />
            </Suspense>
            <main id="main" tabIndex={-1} className="min-h-[70dvh] outline-none">{children}</main>
            <Footer categories={categories} />
            <BackToTop />
            <CursorBubble />
            <Suspense fallback={null}><PageCurtain /></Suspense>
          </UIProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
