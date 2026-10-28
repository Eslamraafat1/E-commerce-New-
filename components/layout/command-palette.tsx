"use client";

import { ArrowRight, CornerDownLeft, Heart, Languages, LayoutGrid, Moon, Search, ShoppingBag, Sparkles, Tag, Flame } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useI18n } from "@/components/providers/i18n";
import { useUI } from "@/components/providers/ui";
import { Dialog } from "@/components/ui/dialog";
import { SmartImage } from "@/components/ui/smart-image";
import { localeMeta, locales } from "@/config/store";
import { getCategories } from "@/lib/api/categories";
import { suggest, type Suggestions } from "@/lib/api/products";
import type { Category } from "@/lib/api/types";

interface Item { id: string; label: string; hint?: string; icon?: ReactNode; image?: string; run: () => void; group: string }

/** Ctrl/Cmd + K: global search with live suggestions, plus navigation and quick actions. */
export function CommandPalette() {
  const { paletteOpen, setPaletteOpen, setCartOpen } = useUI();
  const { t, l, price, path, locale } = useI18n();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [res, setRes] = useState<{ q: string; data?: Suggestions; error?: boolean } | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const close = () => setPaletteOpen(false);

  useEffect(() => { getCategories().then(setCats).catch(() => {}); }, []);

  useEffect(() => {
    const term = q.trim();
    if (!term) return;
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      suggest(term, ctrl.signal).then((r) => setRes({ q: term, data: r })).catch((e) => { if (e.name !== "AbortError") setRes({ q: term, error: true }); });
    }, 160);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [q]);

  const term0 = q.trim();
  const fresh = term0 && res && res.q === term0 ? res : null;
  const data = term0 ? (res?.data ?? null) : null;
  const error = !!fresh?.error;
  const loading = !!term0 && !fresh;
  const go = (href: string) => { close(); router.push(path(href)); };

  const items = useMemo<Item[]>(() => {
    const out: Item[] = [];
    const term = q.trim();
    if (term) {
      if (data) {
        data.products.forEach((p) => out.push({ id: `p-${p.id}`, group: t("search.products"), label: l(p.title), hint: price(p.price), image: p.images[0].src, run: () => go(`/products/${p.slug}`) }));
        data.categories.forEach((id) => { const c = cats.find((x) => x.id === id); if (c) out.push({ id: `c-${id}`, group: t("nav.categories"), label: l(c.name), icon: <LayoutGrid size={16} />, run: () => go(`/categories/${c.slug}`) }); });
        data.terms.forEach((x) => out.push({ id: `t-${x}`, group: t("search.suggestions"), label: x, icon: <Tag size={16} />, run: () => go(`/search?q=${encodeURIComponent(x)}`) }));
      }
      out.push({ id: "all", group: t("search.all"), label: t("search.seeAll", { q: term }), icon: <Search size={16} />, run: () => go(`/search?q=${encodeURIComponent(term)}`) });
      return out;
    }
    const nav = t("search.go");
    out.push(
      { id: "n-shop", group: nav, label: t("nav.shopAll"), icon: <LayoutGrid size={16} />, run: () => go("/shop") },
      { id: "n-new", group: nav, label: t("nav.new"), icon: <Sparkles size={16} />, run: () => go("/new-arrivals") },
      { id: "n-best", group: nav, label: t("nav.best"), icon: <Flame size={16} />, run: () => go("/best-sellers") },
      { id: "n-wish", group: nav, label: t("nav.wishlist"), icon: <Heart size={16} />, run: () => go("/wishlist") },
    );
    cats.forEach((c) => out.push({ id: `c-${c.id}`, group: t("nav.categories"), label: l(c.name), icon: <ArrowRight size={16} className="rtl:rotate-180" />, run: () => go(`/categories/${c.slug}`) }));
    const other = locales.find((x) => x !== locale)!;
    out.push(
      { id: "a-cart", group: t("search.actions"), label: t("search.openCart"), icon: <ShoppingBag size={16} />, run: () => { close(); setCartOpen(true); } },
      { id: "a-theme", group: t("search.actions"), label: t("a11y.toggleTheme"), icon: <Moon size={16} />, run: () => { const d = document.documentElement; const n = d.dataset.theme === "dark" ? "light" : "dark"; d.dataset.theme = n; d.style.colorScheme = n; try { localStorage.setItem("vanta-theme", n); } catch {} close(); } },
      { id: "a-lang", group: t("search.actions"), label: localeMeta[other].label, icon: <Languages size={16} />, run: () => { document.cookie = `vanta-locale=${other}; path=/; max-age=31536000; samesite=lax`; close(); router.push(window.location.pathname.replace(/^\/(en|ar)/, `/${other}`)); } },
    );
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, data, cats, locale]);


  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); items[active]?.run(); }
  };
  useEffect(() => { document.getElementById(`pal-${active}`)?.scrollIntoView({ block: "nearest" }); }, [active]);

  let lastGroup = "";
  return (
    <Dialog open={paletteOpen} onClose={close} title={t("search.open")} hideTitle noClose initialFocus={inputRef} className="!m-0 !mx-auto !mt-[8vh] !h-fit !w-[min(100%-1.5rem,40rem)]">
      <div className="flex items-center gap-3 border-b border-line px-4">
        <Search size={18} className="text-muted" />
        <input
          ref={inputRef} value={q} onChange={(e) => { setQ(e.target.value); setActive(0); }} onKeyDown={onKey}
          role="combobox" aria-expanded="true" aria-controls="pal-list" aria-activedescendant={`pal-${active}`} aria-autocomplete="list"
          placeholder={t("search.placeholder")} className="min-h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted" autoComplete="off" spellCheck={false}
        />
        <kbd className="rounded border border-line px-1.5 py-0.5 text-[0.65rem] text-muted">Esc</kbd>
      </div>
      <ul id="pal-list" role="listbox" aria-label={t("search.results")} className="max-h-[min(60dvh,28rem)] overflow-y-auto p-2" data-lenis-prevent>
        {error && <li className="p-4 text-sm text-danger" role="alert">{t("error.generic")} <button className="underline" onClick={() => setQ(q + " ")}>{t("common.retry")}</button></li>}
        {loading && !items.length && <li className="p-4 text-sm text-muted">{t("common.loading")}</li>}
        {items.map((it, i) => {
          const header = it.group !== lastGroup ? (lastGroup = it.group) : null;
          return (
            <li key={it.id} role="presentation">
              {header && <p className="eyebrow px-3 pb-1 pt-3">{header}</p>}
              <button
                id={`pal-${i}`} role="option" aria-selected={i === active} onMouseMove={() => setActive(i)} onClick={it.run}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start ${i === active ? "bg-bg2" : ""}`}
              >
                {it.image ? <span className="relative size-10 shrink-0 overflow-hidden rounded-lg"><SmartImage src={it.image} alt="" fill sizes="40px" className="object-cover" /></span> : <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-line">{it.icon}</span>}
                <span className="min-w-0 flex-1 truncate font-medium">{it.label}</span>
                {it.hint && <span className="text-sm text-muted tabular">{it.hint}</span>}
                {i === active && <CornerDownLeft size={14} className="text-muted" />}
              </button>
            </li>
          );
        })}
      </ul>
    </Dialog>
  );
}
