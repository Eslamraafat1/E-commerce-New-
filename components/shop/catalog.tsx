"use client";

import { LayoutGrid, List, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/components/providers/i18n";
import { Dialog } from "@/components/ui/dialog";
import { getCategories } from "@/lib/api/categories";
import { listProducts, parseQuery, queryParams } from "@/lib/api/products";
import type { Category, ProductListResult, ProductQuery, SortKey } from "@/lib/api/types";
import { useCardReveal } from "@/components/motion/creative";
import { Marquee } from "@/components/motion/primitives";
import { LocLink } from "@/components/providers/i18n";
import { store } from "@/config/store";
import { ProductCard } from "./product-card";

const PAGE = 12;
const SORTS: SortKey[] = ["featured", "newest", "best", "price-asc", "price-desc", "rating"];

export function CatalogSkeleton({ n = 8 }: { n?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true">
      {Array.from({ length: n }, (_, i) => (
        <div key={i}><div className="skeleton aspect-[4/5] rounded-[var(--radius)]" /><div className="skeleton mt-3 h-4 w-3/4" /><div className="skeleton mt-2 h-4 w-1/3" /></div>
      ))}
    </div>
  );
}

interface Props {
  /** Fixed filters for the page (category page, collection page, new arrivals…) — not user-editable. */
  base?: ProductQuery;
  defaultSort?: SortKey;
  showSearch?: boolean;
  hideCategoryFilter?: boolean;
}

export function Catalog({ base = {}, defaultSort, showSearch = true, hideCategoryFilter }: Props) {
  const { t, l, price, num } = useI18n();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [data, setData] = useState<ProductListResult | null>(null);
  const [error, setError] = useState(false);
  const [cats, setCats] = useState<Category[]>([]);
  const [drawer, setDrawer] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const urlQ = sp.get("q") ?? "";
  const [qText, setQText] = useState(urlQ);
  const [seenUrlQ, setSeenUrlQ] = useState(urlQ);
  // Keep the input in sync when the URL changes elsewhere (back/forward, clear filters) — adjusted during render.
  if (seenUrlQ !== urlQ) { setSeenUrlQ(urlQ); setQText(urlQ); }
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const view = sp.get("view") === "list" ? "list" : "grid";
  const resultsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const user = useMemo(() => parseQuery(sp), [sp]);
  const baseKey = JSON.stringify(base);
  const query = useMemo<ProductQuery>(() => ({ ...user, ...base, category: base.category ?? user.category, q: user.q ?? base.q, sort: user.sort ?? defaultSort, pageSize: PAGE }), [user, baseKey, defaultSort]); // eslint-disable-line react-hooks/exhaustive-deps
  const qKey = JSON.stringify(query) + attempt;
  const loading = loadedKey !== qKey;

  useEffect(() => { getCategories().then(setCats).catch(() => {}); }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    listProducts(query, ctrl.signal)
      .then((r) => { setData(r); setError(false); setLoadedKey(qKey); })
      .catch((e) => { if (e?.name !== "AbortError") { setError(true); setLoadedKey(qKey); } });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qKey, attempt]);

  useCardReveal(gridRef, data?.items.length);

  const update = useCallback((patch: Record<string, string | undefined>, resetPage = true) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) { if (v === undefined || v === "") next.delete(k); else next.set(k, v); }
    if (resetPage) next.delete("page");
    const s = next.toString();
    // Client-only URL state: history.replaceState is integrated with useSearchParams by Next.js, with no server round-trip.
    window.history.replaceState(null, "", s ? `${pathname}?${s}` : pathname);
  }, [sp, pathname]);

  const toggleIn = (key: "category" | "color" | "size" | "tag", id: string) => {
    const cur = (user[key] as string[] | undefined) ?? [];
    const nx = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    update({ [key === "category" ? "category" : key]: nx.join(",") || undefined });
  };

  // Debounced text search → URL
  useEffect(() => {
    if ((sp.get("q") ?? "") === qText.trim()) return;
    const id = setTimeout(() => update({ q: qText.trim() || undefined }), 350);
    return () => clearTimeout(id);
  }, [qText]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeCount = (user.category?.length && !base.category ? 1 : 0) + (user.color?.length ?? 0) + (user.size?.length ?? 0) + (user.tag?.length ?? 0)
    + (user.minPrice !== undefined || user.maxPrice !== undefined ? 1 : 0) + (user.availability ? 1 : 0) + (user.minRating ? 1 : 0) + (user.q && showSearch ? 1 : 0);
  const clearAll = () => { setQText(""); window.history.replaceState(null, "", pathname); };

  const f = data?.facets;
  const FilterPanel = (
    <div className="space-y-7">
      {!hideCategoryFilter && !base.category && (
        <Group title={t("filter.category")}>
          {f?.categories.map((c) => {
            const cat = cats.find((x) => x.id === c.id);
            return <Check key={c.id} checked={!!user.category?.includes(c.id)} onChange={() => toggleIn("category", c.id)} label={cat ? l(cat.name) : c.id} count={num(c.count)} />;
          })}
        </Group>
      )}
      <Group title={t("filter.price")}>
        <div className="flex items-center gap-2">
          <PriceInput key={`min-${user.minPrice}`} label={t("filter.min")} value={user.minPrice} placeholder={f ? String(Math.floor(f.priceMin / 100)) : ""} onCommit={(v) => update({ min: v === undefined ? undefined : String(v * 100) })} />
          <span aria-hidden>–</span>
          <PriceInput key={`max-${user.maxPrice}`} label={t("filter.max")} value={user.maxPrice} placeholder={f ? String(Math.ceil(f.priceMax / 100)) : ""} onCommit={(v) => update({ max: v === undefined ? undefined : String(v * 100) })} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[[0, 10000], [10000, 25000], [25000, 60000], [60000, undefined]].map(([a, b]) => (
            <button key={`${a}-${b}`} className="chip" aria-pressed={user.minPrice === a && user.maxPrice === b} onClick={() => update({ min: a ? String(a) : undefined, max: b ? String(b) : undefined })}>
              {b ? `${price(a as number)} – ${price(b)}` : `${price(a as number)}+`}
            </button>
          ))}
        </div>
      </Group>
      <Group title={t("filter.availability")}>
        <Check checked={!!user.availability} onChange={() => update({ stock: user.availability ? undefined : "in" })} label={t("filter.inStock")} />
      </Group>
      <Group title={t("filter.rating")}>
        {[4.5, 4].map((r) => <Check key={r} type="radio" name="rating" checked={user.minRating === r} onChange={() => update({ rating: user.minRating === r ? undefined : String(r) })} label={`${num(r, 1)}★ ${t("filter.andUp")}`} />)}
      </Group>
      {!!f?.colors.length && (
        <Group title={t("filter.color")}>
          <div className="flex flex-wrap gap-2">
            {f.colors.map((c) => (
              <button key={c.id} aria-pressed={!!user.color?.includes(c.id)} onClick={() => toggleIn("color", c.id)} className="chip gap-2">
                <span className="size-4 rounded-full border border-line" style={{ background: c.hex }} />{l(c.name)}
              </button>
            ))}
          </div>
        </Group>
      )}
      {!!f?.sizes.length && (
        <Group title={t("filter.size")}>
          <div className="flex flex-wrap gap-2">
            {f.sizes.filter((s) => s.id !== "One size").map((s) => <button key={s.id} className="chip" aria-pressed={!!user.size?.includes(s.id)} onClick={() => toggleIn("size", s.id)}>{s.id}</button>)}
          </div>
        </Group>
      )}
      {!!f?.tags.length && (
        <Group title={t("filter.type")}>
          <div className="flex flex-wrap gap-2">
            {f.tags.slice(0, 12).map((x) => <button key={x.id} className="chip capitalize" aria-pressed={!!user.tag?.includes(x.id)} onClick={() => toggleIn("tag", x.id)}>{x.id}</button>)}
          </div>
        </Group>
      )}
    </div>
  );

  const loadMore = () => update({ page: String((data?.page ?? 1) + 1) }, false);

  return (
    <div>
      <div className="sticky top-[62px] z-30 -mx-[var(--gutter)] border-y border-line bg-[color-mix(in_srgb,var(--bg)_90%,transparent)] px-[var(--gutter)] py-3 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {showSearch && (
            <div className="relative min-w-0 flex-1 basis-56">
              <Search size={17} className="pointer-events-none absolute inset-y-0 start-4 my-auto text-muted" />
              <label htmlFor="cat-search" className="sr-only">{t("catalog.searchLabel")}</label>
              <input id="cat-search" type="search" value={qText} onChange={(e) => setQText(e.target.value)} placeholder={t("catalog.searchPlaceholder")} className="field !min-h-11 ps-11" />
            </div>
          )}
          <button className="btn btn-ghost btn-sm lg:hidden" onClick={() => setDrawer(true)}>
            <SlidersHorizontal size={16} /> {t("filter.title")}{activeCount ? ` (${num(activeCount)})` : ""}
          </button>
          <label className="flex items-center gap-2 text-sm">
            <span className="hidden text-muted sm:inline">{t("sort.label")}</span>
            <select className="field !min-h-11 !w-auto !py-1 pe-8" value={query.sort ?? "featured"} onChange={(e) => update({ sort: e.target.value === (defaultSort ?? "featured") ? undefined : e.target.value })}>
              {SORTS.map((s) => <option key={s} value={s}>{t(`sort.${s}` as never)}</option>)}
            </select>
          </label>
          <div className="hidden rounded-full border border-line p-0.5 sm:flex" role="group" aria-label={t("catalog.view")}>
            <button className={`grid size-10 place-items-center rounded-full ${view === "grid" ? "bg-fg text-bg" : ""}`} aria-pressed={view === "grid"} aria-label={t("catalog.grid")} onClick={() => update({ view: undefined }, false)}><LayoutGrid size={16} /></button>
            <button className={`grid size-10 place-items-center rounded-full ${view === "list" ? "bg-fg text-bg" : ""}`} aria-pressed={view === "list"} aria-label={t("catalog.list")} onClick={() => update({ view: "list" }, false)}><List size={16} /></button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[17rem_1fr]">
        <aside className="hidden lg:block" aria-label={t("filter.title")}>
          <div className="sticky top-32 max-h-[calc(100dvh-9rem)] overflow-y-auto pe-2" data-lenis-prevent>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold">{t("filter.title")}</h2>
              {activeCount > 0 && <button onClick={clearAll} className="inline-flex items-center gap-1 text-sm underline underline-offset-4"><RotateCcw size={13} />{t("filter.clear")}</button>}
            </div>
            {FilterPanel}
          </div>
        </aside>

        <div ref={resultsRef} aria-live="polite" aria-busy={loading}>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted" role="status">{data ? t("catalog.results", { n: num(data.total) }) : " "}</p>
            {activeCount > 0 && (
              <>
                {user.q && showSearch && <Pill label={`“${user.q}”`} onRemove={() => { setQText(""); update({ q: undefined }); }} />}
                {user.category?.map((c) => !base.category && <Pill key={c} label={l(cats.find((x) => x.id === c)?.name) || c} onRemove={() => toggleIn("category", c)} />)}
                {user.color?.map((c) => <Pill key={c} label={l(f?.colors.find((x) => x.id === c)?.name) || c} onRemove={() => toggleIn("color", c)} />)}
                {user.size?.map((c) => <Pill key={c} label={c} onRemove={() => toggleIn("size", c)} />)}
                {user.tag?.map((c) => <Pill key={c} label={c} onRemove={() => toggleIn("tag", c)} />)}
                {(user.minPrice !== undefined || user.maxPrice !== undefined) && <Pill label={`${price(user.minPrice ?? 0)} – ${user.maxPrice !== undefined ? price(user.maxPrice) : "∞"}`} onRemove={() => update({ min: undefined, max: undefined })} />}
                {user.availability && <Pill label={t("filter.inStock")} onRemove={() => update({ stock: undefined })} />}
                {user.minRating && <Pill label={`${num(user.minRating, 1)}★+`} onRemove={() => update({ rating: undefined })} />}
                <button onClick={clearAll} className="text-sm underline underline-offset-4">{t("filter.clear")}</button>
              </>
            )}
          </div>

          {error ? (
            <div className="rounded-[var(--radius)] border border-line p-10 text-center" role="alert">
              <p className="display text-3xl">{t("error.title")}</p>
              <p className="mt-2 text-muted">{t("error.catalog")}</p>
              <button className="btn btn-dark mt-6" onClick={() => setAttempt((a) => a + 1)}>{t("common.retry")}</button>
            </div>
          ) : !data || (loading && !data.items.length) ? (
            <CatalogSkeleton />
          ) : data.items.length === 0 ? (
            <div className="rounded-[var(--radius)] border border-dashed border-line p-10 text-center">
              <Search size={32} className="mx-auto text-muted" />
              <p className="display mt-4 text-3xl">{t("catalog.emptyTitle")}</p>
              <p className="mx-auto mt-2 max-w-md text-muted">{t("catalog.emptyText")}</p>
              <button className="btn btn-dark mt-6" onClick={clearAll}>{t("filter.clear")}</button>
            </div>
          ) : (
            <>
              <div ref={gridRef} className={`${view === "list" ? "flex flex-col gap-8" : "grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4"} transition-opacity ${loading ? "opacity-60" : ""}`}>
                {data.items.map((p, i) => (
                  <Fragment key={p.id}>
                    <div data-card className={view === "grid" && i % 7 === 3 ? "lg:mt-10" : ""}><ProductCard product={p} variant={view === "list" ? "wide" : "classic"} priority={i < 4} /></div>
                    {i === 7 && <PromoTile />}
                  </Fragment>
                ))}
              </div>
              <div className="mt-14 text-center">
                <p className="mb-3 text-sm text-muted">{t("catalog.showing", { shown: num(data.items.length), total: num(data.total) })}</p>
                <div className="mx-auto mb-5 h-1 w-48 overflow-hidden rounded-full bg-bg2"><div className="h-full bg-accent" style={{ width: `${(data.items.length / data.total) * 100}%` }} /></div>
                {data.items.length < data.total && <button className="btn btn-ghost" onClick={loadMore} disabled={loading}>{loading ? t("common.loading") : t("catalog.loadMore")}</button>}
              </div>
              <p className="mt-8 text-center text-xs text-muted">{t("catalog.sampleNote")}</p>
            </>
          )}
        </div>
      </div>

      <Dialog open={drawer} onClose={() => setDrawer(false)} title={t("filter.title")} side="bottom">
        <div className="flex-1 overflow-y-auto p-5" data-lenis-prevent>{FilterPanel}</div>
        <div className="grid grid-cols-2 gap-2 border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button className="btn btn-ghost" onClick={clearAll}>{t("filter.clear")}</button>
          <button className="btn btn-primary" onClick={() => setDrawer(false)}>{t("filter.show", { n: num(data?.total ?? 0) })}</button>
        </div>
      </Dialog>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}
function Check({ checked, onChange, label, count, type = "checkbox", name }: { checked: boolean; onChange: () => void; label: string; count?: string; type?: "checkbox" | "radio"; name?: string }) {
  return (
    <label className="flex min-h-9 cursor-pointer items-center gap-3 text-sm">
      <input type={type} name={name} checked={checked} onChange={onChange} onClick={type === "radio" && checked ? onChange : undefined} className="size-[18px] accent-[var(--accent-ink)]" />
      <span className="flex-1">{label}</span>
      {count && <span className="text-xs text-muted tabular">{count}</span>}
    </label>
  );
}
function Pill({ label, onRemove }: { label: string; onRemove: () => void }) {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-bg2 py-1 ps-3 pe-1 text-sm">
      {label}
      <button onClick={onRemove} aria-label={`${t("filter.remove")}: ${label}`} className="grid size-6 place-items-center rounded-full hover:bg-line"><X size={13} /></button>
    </span>
  );
}
function PriceInput({ label, value, placeholder, onCommit }: { label: string; value?: number; placeholder: string; onCommit: (v?: number) => void }) {
  const [v, setV] = useState(value === undefined ? "" : String(value / 100));
  const commit = () => { const n = v.trim() === "" ? undefined : Math.max(0, Math.round(Number(v))); onCommit(n !== undefined && Number.isFinite(n) ? n : undefined); };
  return (
    <label className="flex-1">
      <span className="sr-only">{label}</span>
      <input inputMode="numeric" className="field !min-h-11 text-center" placeholder={placeholder} value={v} onChange={(e) => setV(e.target.value.replace(/[^\d]/g, ""))} onBlur={commit} onKeyDown={(e) => e.key === "Enter" && commit()} />
    </label>
  );
}

export { queryParams };

function PromoTile() {
  const { t, price } = useI18n();
  return (
    <div data-card className="relative col-span-2 overflow-hidden rounded-[var(--radius)] bg-accent p-6 text-on-accent sm:p-10 lg:col-span-3 xl:col-span-4">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-2 opacity-15"><Marquee speed={50} items={Array.from({ length: 4 }, (_, i) => <span key={i} className="display pe-8 text-[8rem] leading-none">VANTA ✦</span>)} /></div>
      <div className="relative flex flex-wrap items-end justify-between gap-6">
        <div><p className="display text-[clamp(2rem,5vw,4rem)] !leading-[0.95]">{t("shop.promoTitle")}</p><p className="mt-3 max-w-md">{t("shop.promoText", { amount: price(store.policy.shipping.freeOver) })}</p></div>
        <LocLink href="/cart" className="btn btn-dark">{t("shop.promoCta")} <code className="rounded bg-white/15 px-2 py-0.5 font-mono text-xs">VANTA10</code></LocLink>
      </div>
    </div>
  );
}
