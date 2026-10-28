"use client";

import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { LocLink, useI18n } from "@/components/providers/i18n";
import { useUI } from "@/components/providers/ui";
import { Dialog } from "@/components/ui/dialog";
import { SmartImage } from "@/components/ui/smart-image";
import { useAddToCart, WishlistButton } from "./actions";
import { Price, QuantityInput, StockLabel, useVariantSelection, VariantSelectors } from "./variant";
import type { Product } from "@/lib/api/types";

export function QuickView() {
  const { quickView, closeQuickView } = useUI();
  // Keep the last product while the exit animation plays.
  const [last, setLast] = useState<Product | null>(quickView);
  if (quickView && quickView !== last) setLast(quickView);
  const { t } = useI18n();
  const p = quickView ?? last;
  if (!p) return null;
  return (
    <Dialog open={!!quickView} onClose={closeQuickView} title={t("product.quickView")} hideTitle>
      <Body key={p.id} p={p} onClose={closeQuickView} />
    </Dialog>
  );
}

function Body({ p, onClose }: { p: Product; onClose: () => void }) {
  const { t, l } = useI18n();
  const sel = useVariantSelection(p);
  const add = useAddToCart();
  const [qty, setQty] = useState(1);
  const [idx, setIdx] = useState(0);
  const imgRef = useRef<HTMLDivElement>(null);
  const colorIdx = sel.color ? p.images.findIndex((i) => i.color === sel.color) : -1;
  const shown = colorIdx >= 0 ? colorIdx : idx;
  const max = sel.variant ? Math.min(sel.variant.stock, 10) : 10;

  return (
    <div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-2" data-lenis-prevent>
      <div className="p-3 md:p-4">
        <div ref={imgRef} className="img-wrap relative aspect-[4/5] rounded-2xl">
          <SmartImage key={shown} src={p.images[shown]?.src ?? p.images[0].src} alt={l((p.images[shown] ?? p.images[0]).alt)} fill sizes="(max-width:768px) 100vw, 480px" className="object-cover" />
        </div>
        {p.images.length > 1 && (
          <ul className="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
            {p.images.map((im, i) => (
              <li key={im.src} className="shrink-0">
                <button type="button" onClick={() => setIdx(i)} aria-label={`${t("product.image")} ${i + 1}`} aria-current={i === shown} className={`relative block size-16 overflow-hidden rounded-lg border-2 ${i === shown ? "border-fg" : "border-transparent"}`}>
                  <SmartImage src={im.src} alt="" fill sizes="64px" className="object-cover" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex flex-col gap-5 p-5 md:pt-14">
        <div>
          <p className="eyebrow">{t("product.quickView")}</p>
          <h3 className="display mt-2 text-3xl">{l(p.title)}</h3>
          <Price price={sel.price} compareAt={sel.compareAt ?? (sel.varies ? undefined : p.compareAtPrice)} from={sel.varies} size="lg" className="mt-3" />
          <p className="mt-3 text-sm text-muted">{l(p.description)}</p>
        </div>
        <VariantSelectors p={p} sel={sel} idPrefix={`qv-${p.id}`} />
        <StockLabel variant={sel.variant} needsChoice={sel.needsChoice} />
        <div className="flex flex-wrap items-center gap-3">
          <QuantityInput value={qty} max={max} onChange={setQty} />
          <button
            type="button" className="btn btn-primary flex-1" disabled={!sel.canAdd || p.stockStatus === "out_of_stock"}
            onClick={() => { if (sel.variant && add(p, sel.variant, qty, imgRef.current?.getBoundingClientRect())) onClose(); }}
          >
            {p.stockStatus === "out_of_stock" ? t("product.soldOut") : sel.needsChoice ? t("product.selectSize") : t("product.addToCart")}
          </button>
          <WishlistButton product={p} />
        </div>
        <LocLink href={`/products/${p.slug}`} onClick={onClose} className="mt-auto inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4">
          {t("product.viewDetails")} <ArrowRight size={16} className="rtl:rotate-180" />
        </LocLink>
      </div>
    </div>
  );
}
