"use client";

import { ShoppingBag } from "lucide-react";
import { LocLink, useI18n } from "@/components/providers/i18n";
import { useUI } from "@/components/providers/ui";
import { Dialog } from "@/components/ui/dialog";
import { cartStore } from "@/lib/stores";
import { CartLines, DiscountBox, FreeShippingBar, Totals, useCartTotals } from "./cart-parts";

export function CartDrawer() {
  const { cartOpen, setCartOpen } = useUI();
  const { t, num } = useI18n();
  const lines = cartStore.use();
  const { subtotal, count } = useCartTotals();
  const close = () => setCartOpen(false);

  return (
    <Dialog open={cartOpen} onClose={close} side="end" title={`${t("nav.cart")} (${num(count)})`}>
      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-bg2"><ShoppingBag size={30} /></span>
          <p className="display text-3xl">{t("cart.emptyTitle")}</p>
          <p className="text-muted">{t("cart.emptyText")}</p>
          <LocLink href="/shop" onClick={close} className="btn btn-primary">{t("cart.continue")}</LocLink>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-5" data-lenis-prevent>
            <div className="py-2"><FreeShippingBar subtotal={subtotal} /></div>
            <CartLines compact onNavigate={close} />
          </div>
          <div className="space-y-4 border-t border-line bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <DiscountBox />
            <Totals />
            <div className="grid grid-cols-2 gap-2">
              <LocLink href="/cart" onClick={close} className="btn btn-ghost">{t("cart.viewCart")}</LocLink>
              <LocLink href="/checkout" onClick={close} className="btn btn-primary">{t("cart.checkout")}</LocLink>
            </div>
            <button onClick={close} className="w-full text-center text-sm text-muted underline underline-offset-4">{t("cart.continue")}</button>
          </div>
        </>
      )}
    </Dialog>
  );
}
