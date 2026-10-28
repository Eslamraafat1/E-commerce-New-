"use client";

import { Heart } from "lucide-react";
import { useCallback } from "react";
import { useI18n } from "@/components/providers/i18n";
import { useUI } from "@/components/providers/ui";
import { buildLine } from "@/lib/api/cart";
import type { Product, Variant } from "@/lib/api/types";
import { addToCart, toggleWishlist, wishlistStore } from "@/lib/stores";

/** Adds an exact variant to the cart, with toast + fly-to-cart + counter bump feedback. */
export function useAddToCart() {
  const { t, l } = useI18n();
  const { toast, flyToCart, setCartOpen } = useUI();
  return useCallback((p: Product, v: Variant, qty = 1, from?: DOMRect | null) => {
    const line = buildLine(p, v, qty);
    const res = addToCart(line);
    if (res === "unavailable") {
      toast(t("cart.unavailable"), { kind: "error" });
      return false;
    }
    flyToCart(line.image, from ?? null);
    toast(res === "clamped" ? t("cart.addedClamped", { max: line.maxQty }) : t("cart.added", { name: l(p.title) }), {
      kind: res === "clamped" ? "info" : "success",
      action: { label: t("cart.view"), onClick: () => setCartOpen(true) },
    });
    return true;
  }, [t, l, toast, flyToCart, setCartOpen]);
}

export function WishlistButton({ product, className = "" }: { product: Product; className?: string }) {
  const { t, l } = useI18n();
  const { toast } = useUI();
  const on = wishlistStore.use().includes(product.id);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={`${on ? t("wishlist.remove") : t("wishlist.add")}: ${l(product.title)}`}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); toast(on ? t("wishlist.removed") : t("wishlist.added"), { kind: "info" }); }}
      className={`grid size-11 place-items-center rounded-full border border-line bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] backdrop-blur transition hover:scale-105 ${className}`}
    >
      <Heart size={18} className={on ? "fill-accent2 stroke-accent2" : ""} />
    </button>
  );
}
