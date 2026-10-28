"use client";

import { Check } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useI18n } from "@/components/providers/i18n";
import { findVariant, variantCompareAt, variantPrice } from "@/lib/api/cart";
import type { Product, Variant } from "@/lib/api/types";

/** Variant selection state. Invalid combinations are never selectable; the exact Variant is derived, not simulated. */
export function useVariantSelection(p: Product) {
  const firstColor = useMemo(() => p.colors?.find((c) => p.variants.some((v) => v.color === c.id && v.stock > 0))?.id ?? p.colors?.[0]?.id, [p]);
  const [color, setColorRaw] = useState<string | undefined>(firstColor);
  const [size, setSize] = useState<string | undefined>(p.sizes?.length === 1 ? p.sizes[0] : undefined);

  const sizeState = useCallback((s: string, c = color) => {
    const v = findVariant(p, { color: c, size: s });
    return !v ? "missing" : v.stock <= 0 ? "soldout" : "ok";
  }, [p, color]);
  const colorState = useCallback((c: string) => {
    const vs = p.variants.filter((v) => v.color === c && (size ? v.size === size : true));
    return vs.length === 0 ? "missing" : vs.every((v) => v.stock <= 0) ? "soldout" : "ok";
  }, [p, size]);

  const setColor = (c: string) => {
    setColorRaw(c);
    if (size && !(() => { const v = findVariant(p, { color: c, size }); return v && v.stock > 0; })()) setSize(p.sizes?.length === 1 ? p.sizes[0] : undefined);
  };

  const needsSize = !!p.sizes?.length;
  const variant: Variant | undefined = !needsSize || size ? findVariant(p, { color, size }) : undefined;
  const price = variantPrice(p, variant);
  const compareAt = variantCompareAt(p, variant);
  const prices = p.variants.map((v) => v.price ?? p.price);
  const varies = !variant && Math.min(...prices) !== Math.max(...prices);
  const minPrice = Math.min(...prices);
  const needsChoice = needsSize && !size;
  const canAdd = !!variant && variant.stock > 0;
  return { color, size, setColor, setSize, sizeState, colorState, variant, price: varies ? minPrice : price, compareAt, varies, needsChoice, canAdd, needsSize };
}
export type VariantSel = ReturnType<typeof useVariantSelection>;

export function Price({ price, compareAt, from, className = "", size = "md" }: { price: number; compareAt?: number; from?: boolean; className?: string; size?: "sm" | "md" | "lg" }) {
  const { price: fmt, t } = useI18n();
  const cls = size === "lg" ? "text-3xl" : size === "md" ? "text-lg" : "text-base";
  return (
    <p className={`flex flex-wrap items-baseline gap-x-2 tabular ${className}`}>
      {from && <span className="text-sm text-muted">{t("product.from")}</span>}
      <span className={`${cls} font-semibold`}>{fmt(price)}</span>
      {compareAt && (
        <>
          <s className="text-sm text-muted" aria-label={t("product.wasPrice", { price: fmt(compareAt) })}>{fmt(compareAt)}</s>
          <span className="badge badge-sale">−{Math.round((1 - price / compareAt) * 100)}%</span>
        </>
      )}
    </p>
  );
}

export function StockLabel({ variant, needsChoice, className = "" }: { variant?: Variant; needsChoice: boolean; className?: string }) {
  const { t, num } = useI18n();
  let tone = "text-muted", text = t("product.selectOptions");
  if (variant) {
    if (variant.stock <= 0) { tone = "text-danger"; text = t("product.soldOut"); }
    else if (variant.stock <= 5) { tone = "text-accent2"; text = t("product.onlyLeft", { n: num(variant.stock) }); }
    else { tone = "text-ok"; text = t("product.inStock"); }
  } else if (!needsChoice) { tone = "text-danger"; text = t("product.unavailable"); }
  return <p className={`flex items-center gap-2 text-sm font-medium ${tone} ${className}`} role="status" aria-live="polite"><span className="size-2 rounded-full bg-current" />{text}{variant && <span className="text-muted font-normal" dir="ltr">· SKU {variant.sku}</span>}</p>;
}

export function VariantSelectors({ p, sel, idPrefix = "v" }: { p: Product; sel: VariantSel; idPrefix?: string }) {
  const { l, t } = useI18n();
  return (
    <div className="space-y-5">
      {p.colors && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">
            {t("product.color")}: <span className="font-normal text-muted">{l(p.colors.find((c) => c.id === sel.color)?.name)}</span>
          </legend>
          <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label={t("product.color")}>
            {p.colors.map((c) => {
              const st = sel.colorState(c.id);
              const on = sel.color === c.id;
              return (
                <button
                  key={c.id} type="button" role="radio" aria-checked={on} aria-disabled={st !== "ok"}
                  aria-label={`${l(c.name)}${st === "soldout" ? ` — ${t("product.soldOut")}` : st === "missing" ? ` — ${t("product.unavailable")}` : ""}`}
                  title={l(c.name)}
                  onClick={() => st === "ok" && sel.setColor(c.id)}
                  className={`relative grid size-11 place-items-center rounded-full border-2 transition-all ${on ? "border-fg" : "border-transparent hover:border-line"} ${st !== "ok" ? "opacity-35" : ""}`}
                >
                  <span className="size-8 rounded-full border border-line" style={{ background: c.hex }} />
                  {on && <Check size={14} className="absolute" style={{ color: isLight(c.hex) ? "#000" : "#fff" }} />}
                  {st !== "ok" && <span className="absolute h-px w-8 -rotate-45 bg-fg" />}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
      {p.sizes && p.sizes.length > 1 && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">
            {l(p.sizeLabel)}: <span className="font-normal text-muted">{sel.size ?? t("product.choose")}</span>
          </legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={l(p.sizeLabel)}>
            {p.sizes.map((s) => {
              const st = sel.sizeState(s);
              return (
                <button
                  key={s} id={`${idPrefix}-${s}`} type="button" role="radio" aria-checked={sel.size === s} aria-disabled={st !== "ok"}
                  title={st === "soldout" ? t("product.soldOut") : st === "missing" ? t("product.unavailable") : undefined}
                  onClick={() => st === "ok" && sel.setSize(s)}
                  className="chip min-w-12 justify-center" style={{ minHeight: 44 }}
                >{s}</button>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
}

function isLight(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 150;
}

export function QuantityInput({ value, max, onChange }: { value: number; max: number; onChange: (n: number) => void }) {
  const { t, num } = useI18n();
  const btn = "grid size-11 place-items-center text-lg hover:bg-bg2 disabled:opacity-40";
  return (
    <div className="inline-flex items-center rounded-full border border-line" role="group" aria-label={t("product.quantity")}>
      <button type="button" className={`${btn} rounded-s-full`} aria-label={t("cart.decrease")} onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1}>−</button>
      <output className="min-w-8 text-center font-semibold tabular" aria-live="polite">{num(value)}</output>
      <button type="button" className={`${btn} rounded-e-full`} aria-label={t("cart.increase")} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>+</button>
    </div>
  );
}
