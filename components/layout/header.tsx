"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LocLink, useI18n } from "@/components/providers/i18n";
import { useUI } from "@/components/providers/ui";
import { Dialog } from "@/components/ui/dialog";
import { SmartImage } from "@/components/ui/smart-image";
import type { Category, Collection } from "@/lib/api/types";
import { cartStore, wishlistStore } from "@/lib/stores";
import { LanguageSwitcher, ThemeToggle } from "./header-controls";
import { Logo } from "./logo";

export function Header({ categories, collections }: { categories: Category[]; collections: Collection[] }) {
  const { t, l, path, num } = useI18n();
  const { setCartOpen, setPaletteOpen, bumpKey } = useUI();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // Menus are open for a specific path, so they close automatically on navigation (no effect needed).
  const [megaFor, setMegaFor] = useState<string | null>(null);
  const [mobileFor, setMobileFor] = useState<string | null>(null);
  const mega = megaFor === pathname;
  const mobile = mobileFor === pathname;
  const setMega = (v: boolean | ((x: boolean) => boolean)) => setMegaFor((cur) => ((typeof v === "function" ? v(cur === pathname) : v) ? pathname : null));
  const setMobile = (v: boolean) => setMobileFor(v ? pathname : null);
  const wrapRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const cartCount = cartStore.use().reduce((a, x) => a + x.qty, 0);
  const wishCount = wishlistStore.use().length;

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    if (!mega) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMega(false);
    const onDown = (e: PointerEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setMega(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown); };
  }, [mega]);

  const links = [
    { href: "/collections", label: t("nav.collections") },
    { href: "/new-arrivals", label: t("nav.new") },
    { href: "/best-sellers", label: t("nav.best") },
    { href: "/journal", label: t("nav.journal") },
  ];
  const active = (href: string) => pathname === path(href) || pathname.startsWith(path(href) + "/");
  const linkCls = (a: boolean) => `relative px-3 py-2 text-sm font-medium transition-colors hover:text-fg ${a ? "text-fg" : "text-muted"} after:absolute after:inset-x-3 after:-bottom-0.5 after:h-px after:origin-[var(--o,left)] after:bg-current after:transition-transform ${a ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"} rtl:[--o:right]`;

  return (
    <header
      ref={wrapRef}
      className={`sticky top-0 z-[60] transition-[background-color,box-shadow,backdrop-filter] duration-300 ${scrolled || mega ? "border-b border-line bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] backdrop-blur-xl" : "border-b border-transparent bg-transparent"}`}
      onMouseLeave={() => { closeTimer.current = setTimeout(() => setMega(false), 160); }}
      onMouseEnter={() => clearTimeout(closeTimer.current)}
    >
      <div className={`container-x flex items-center gap-3 transition-[height] duration-300 ease-[var(--ease)] ${scrolled ? "h-[62px]" : "h-[var(--header-h)]"}`}>
        <button className="btn-icon lg:hidden" aria-label={t("a11y.openMenu")} onClick={() => setMobile(true)}><Menu size={20} /></button>
        <Logo />

        <nav aria-label={t("a11y.mainNav")} className="ms-6 hidden items-center lg:flex">
          <button
            className={`${linkCls(active("/shop") || active("/categories"))} inline-flex items-center gap-1`}
            aria-expanded={mega}
            aria-controls="mega-menu"
            onClick={() => setMega((v) => !v)}
            onMouseEnter={() => setMega(true)}
          >
            {t("nav.shop")} <ChevronDown size={14} className={`transition-transform ${mega ? "rotate-180" : ""}`} />
          </button>
          {links.map((x) => (
            <LocLink key={x.href} href={x.href} className={linkCls(active(x.href))} aria-current={active(x.href) ? "page" : undefined}>{x.label}</LocLink>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-1.5">
          <button className="btn-icon !w-auto gap-2 whitespace-nowrap px-3 max-sm:!w-11 max-sm:px-0 sm:min-w-44 sm:justify-between" onClick={() => setPaletteOpen(true)} aria-label={t("search.open")}>
            <span className="flex items-center gap-2 text-sm text-muted"><Search size={18} className="text-fg" /><span className="hidden sm:inline">{t("search.placeholderShort")}</span></span>
            <kbd className="hidden rounded border border-line px-1.5 text-[0.65rem] text-muted xl:inline">Ctrl K</kbd>
          </button>
          <div className="hidden items-center gap-1.5 md:flex">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <LocLink href="/account" className="btn-icon hidden sm:inline-flex" aria-label={t("nav.account")}><User size={18} className="m-auto" /></LocLink>
          <LocLink href="/wishlist" className="btn-icon relative hidden sm:inline-flex" aria-label={`${t("nav.wishlist")} (${wishCount})`}>
            <Heart size={18} className="m-auto" />
            {wishCount > 0 && <span className="absolute -end-1 -top-1 grid min-w-[18px] place-items-center rounded-full bg-accent2 px-1 text-[0.65rem] font-bold text-white">{num(wishCount)}</span>}
          </LocLink>
          <button id="cart-button" className="btn-icon relative" onClick={() => setCartOpen(true)} aria-label={`${t("nav.cart")} (${cartCount})`}>
            <ShoppingBag size={18} className="m-auto" />
            <span key={bumpKey} className={`absolute -end-1 -top-1 grid min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[0.65rem] font-bold text-on-accent ${bumpKey ? "bump" : ""} ${cartCount ? "" : "hidden"}`} aria-hidden>{num(cartCount)}</span>
          </button>
        </div>
      </div>

      {/* Mega menu */}
      <AnimatePresence>
        {mega && (
          <motion.div
            id="mega-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-full hidden border-b border-line bg-bg shadow-2xl lg:block"
          >
            <div className="container-x grid grid-cols-12 gap-8 py-8">
              <div className="col-span-3">
                <p className="eyebrow mb-4">{t("nav.categories")}</p>
                <ul className="space-y-1">
                  {categories.map((c) => (
                    <li key={c.id}>
                      <LocLink href={`/categories/${c.slug}`} className="group flex items-center justify-between rounded-lg px-2 py-1.5 text-lg font-medium hover:bg-bg2">
                        {l(c.name)} <span className="h-2 w-2 rounded-full opacity-0 transition-opacity group-hover:opacity-100" style={{ background: c.accent }} />
                      </LocLink>
                    </li>
                  ))}
                  <li><LocLink href="/shop" className="mt-2 inline-block px-2 text-sm font-semibold underline underline-offset-4">{t("nav.shopAll")}</LocLink></li>
                </ul>
              </div>
              <div className="col-span-5 grid grid-cols-3 gap-3">
                {categories.slice(0, 3).map((c) => (
                  <LocLink key={c.id} href={`/categories/${c.slug}`} className="group relative aspect-[3/4] overflow-hidden rounded-2xl">
                    <SmartImage src={c.image} alt="" fill sizes="220px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className="absolute inset-x-3 bottom-3 text-sm font-semibold text-white">{l(c.name)}</span>
                  </LocLink>
                ))}
              </div>
              <div className="col-span-4">
                <p className="eyebrow mb-4">{t("nav.collections")}</p>
                <ul className="space-y-3">
                  {collections.map((c) => (
                    <li key={c.id}>
                      <LocLink href={`/collections/${c.slug}`} className="group flex items-center gap-3">
                        <span className="relative size-14 shrink-0 overflow-hidden rounded-xl"><SmartImage src={c.image} alt="" fill sizes="56px" className="object-cover" /></span>
                        <span><span className="block font-semibold group-hover:underline">{l(c.name)}</span><span className="line-clamp-1 text-sm text-muted">{l(c.blurb)}</span></span>
                      </LocLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile navigation */}
      <Dialog open={mobile} onClose={() => setMobile(false)} title={t("a11y.menu")} side="start" hideTitle>
        <div className="flex h-full flex-col overflow-y-auto p-5 pt-16" data-lenis-prevent>
          <nav aria-label={t("a11y.mainNav")}>
            <ul className="space-y-1">
              <li><LocLink href="/shop" className="display block py-2 text-3xl">{t("nav.shop")}</LocLink></li>
              {links.map((x) => <li key={x.href}><LocLink href={x.href} className="display block py-2 text-3xl">{x.label}</LocLink></li>)}
            </ul>
            <p className="eyebrow mb-3 mt-8">{t("nav.categories")}</p>
            <ul className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <li key={c.id}><LocLink href={`/categories/${c.slug}`} className="flex min-h-12 items-center rounded-xl border border-line px-3 text-sm font-medium">{l(c.name)}</LocLink></li>
              ))}
            </ul>
          </nav>
          <div className="mt-8 grid grid-cols-2 gap-2">
            <LocLink href="/account" className="btn btn-ghost">{t("nav.account")}</LocLink>
            <LocLink href="/wishlist" className="btn btn-ghost">{t("nav.wishlist")}{wishCount ? ` (${num(wishCount)})` : ""}</LocLink>
          </div>
          <div className="mt-auto flex items-center justify-between pt-8">
            <LanguageSwitcher compact />
            <ThemeToggle />
          </div>
        </div>
      </Dialog>
    </header>
  );
}
