import { discountCodes, store, type DiscountCode, type ShippingMethodId } from "@/config/store";
import type { CartLineSnapshot, Product, Variant } from "./types";

/** Resolve the variant matching the selected options (undefined if the combination does not exist). */
export function findVariant(p: Product, sel: { color?: string; size?: string }): Variant | undefined {
  return p.variants.find((v) => v.color === sel.color && v.size === sel.size);
}
export const variantPrice = (p: Product, v?: Variant) => v?.price ?? p.price;
export function variantCompareAt(p: Product, v?: Variant) {
  const price = variantPrice(p, v);
  const c = v?.compareAtPrice ?? (v?.price === undefined ? p.compareAtPrice : undefined);
  return c && c > price ? c : undefined;
}

/** Builds the immutable cart snapshot for an exact product + variant. */
export function buildLine(p: Product, v: Variant, qty: number): CartLineSnapshot {
  const color = p.colors?.find((c) => c.id === v.color);
  const parts = [color?.name, v.size ? { en: v.size, ar: v.size } : undefined].filter(Boolean) as { en: string; ar: string }[];
  const image = (v.color && p.images.find((i) => i.color === v.color)?.src) || p.images[0].src;
  return {
    key: `${p.id}::${v.id}`, productId: p.id, variantId: v.id, slug: p.slug, title: p.title, image,
    variantLabel: parts.length ? { en: parts.map((x) => x.en).join(" / "), ar: parts.map((x) => x.ar).join(" / ") } : null,
    sku: v.sku, unitPrice: variantPrice(p, v), qty, maxQty: Math.min(v.stock, 10),
  };
}

export type DiscountResult =
  | { ok: true; code: DiscountCode; amount: number; freeShipping: boolean }
  | { ok: false; reason: "unknown" | "min_subtotal" };

export function evaluateDiscount(raw: string | undefined, subtotal: number): DiscountResult | null {
  if (!raw) return null;
  const code = raw.trim().toUpperCase() as DiscountCode;
  const rule = discountCodes[code];
  if (!rule) return { ok: false, reason: "unknown" };
  if (subtotal < rule.minSubtotal) return { ok: false, reason: "min_subtotal" };
  if (rule.type === "percent") return { ok: true, code, amount: Math.round((subtotal * rule.value) / 100), freeShipping: false };
  return { ok: true, code, amount: 0, freeShipping: true };
}

export function shippingCost(subtotal: number, method: ShippingMethodId, freeShipping = false) {
  if (subtotal === 0) return 0;
  const m = store.policy.shipping[method];
  if (freeShipping) return 0;
  if (method === "standard" && subtotal >= store.policy.shipping.freeOver) return 0;
  return m.price;
}

export function computeTotals(lines: { unitPrice: number; qty: number }[], method: ShippingMethodId, code?: string) {
  const subtotal = lines.reduce((a, l) => a + l.unitPrice * l.qty, 0);
  const d = evaluateDiscount(code, subtotal);
  const discount = d?.ok ? d.amount : 0;
  const shipping = shippingCost(subtotal, method, d?.ok && d.freeShipping);
  return { subtotal, discount, shipping, total: subtotal - discount + shipping, discountResult: d };
}
