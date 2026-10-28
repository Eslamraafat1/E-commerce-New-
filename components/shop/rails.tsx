"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { LocLink, useI18n } from "@/components/providers/i18n";
import { listProducts } from "@/lib/api/products";
import type { Product } from "@/lib/api/types";
import { recentStore, wishlistStore } from "@/lib/stores";
import { CatalogSkeleton } from "./catalog";
import { ProductCard } from "./product-card";

export function ProductRail({ products, titleKey }: { products: Product[]; titleKey: "product.related" }) {
  const { t } = useI18n();
  if (!products.length) return null;
  return (
    <section aria-labelledby="rail-title" className="mt-24">
      <h2 id="rail-title" className="display h-md mb-8">{t(titleKey)}</h2>
      <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}

function useProductsByIds(ids: string[]) {
  const key = ids.join(",");
  const [res, setRes] = useState<{ key: string; items?: Product[]; error?: boolean } | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!key) return;
    const ctrl = new AbortController();
    listProducts({ ids: key.split(","), pageSize: 60 }, ctrl.signal)
      .then((r) => setRes({ key: key + tick, items: r.items }))
      .catch((e) => { if (e.name !== "AbortError") setRes({ key: key + tick, error: true }); });
    return () => ctrl.abort();
  }, [key, tick]);
  if (!key) return { items: [] as Product[], error: false, retry: () => {} };
  const fresh = res && res.key === key + tick ? res : null;
  return { items: fresh?.items ?? null, error: !!fresh?.error, retry: () => setTick((x) => x + 1) };
}

/** Recently viewed products (stored in this browser only). Pass `exclude` to hide the current product. */
export function RecentlyViewed({ exclude, standalone }: { exclude?: string; standalone?: boolean }) {
  const { t } = useI18n();
  const ids = recentStore.use().filter((x) => x !== exclude).slice(0, standalone ? 12 : 4);
  const { items, error, retry } = useProductsByIds(ids);
  if (!standalone && (!ids.length || (items && !items.length))) return null;
  return (
    <section aria-labelledby="recent-title" className={standalone ? "" : "mt-24"}>
      {!standalone && <h2 id="recent-title" className="display h-md mb-8">{t("recent.title")}</h2>}
      {error ? (
        <p role="alert" className="text-danger">{t("error.generic")} <button className="underline" onClick={retry}>{t("common.retry")}</button></p>
      ) : !items ? <CatalogSkeleton n={4} /> : items.length === 0 ? (
        <EmptyState icon={<Heart size={30} />} title={t("recent.emptyTitle")} text={t("recent.emptyText")} />
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      )}
    </section>
  );
}

export function WishlistGrid() {
  const { t } = useI18n();
  const ids = wishlistStore.use();
  const { items, error, retry } = useProductsByIds(ids);
  if (error) return <p role="alert" className="text-danger">{t("error.generic")} <button className="underline" onClick={retry}>{t("common.retry")}</button></p>;
  if (!items) return <CatalogSkeleton n={4} />;
  if (!ids.length || !items.length) return <EmptyState icon={<Heart size={30} />} title={t("wishlist.emptyTitle")} text={t("wishlist.emptyText")} />;
  return <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>;
}

export function EmptyState({ icon, title, text, cta = true }: { icon: React.ReactNode; title: string; text: string; cta?: boolean }) {
  const { t } = useI18n();
  return (
    <div className="rounded-[var(--radius)] border border-dashed border-line px-6 py-16 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-bg2">{icon}</span>
      <p className="display mt-5 text-3xl">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-muted">{text}</p>
      {cta && <LocLink href="/shop" className="btn btn-dark mt-6">{t("cart.continue")}</LocLink>}
    </div>
  );
}
