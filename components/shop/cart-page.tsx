"use client";

import { ShoppingBag } from "lucide-react";
import { LocLink, useI18n } from "@/components/providers/i18n";
import { EmptyState } from "./rails";
import { CartLines, DiscountBox, FreeShippingBar, Totals, useCartTotals } from "./cart-parts";

export function CartPage() {
  const { t, num } = useI18n();
  const { lines, subtotal, count } = useCartTotals();
  if (!lines.length) return <EmptyState icon={<ShoppingBag size={30} />} title={t("cart.emptyTitle")} text={t("cart.emptyText")} />;
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_28rem]">
      <section aria-label={t("nav.cart")}>
        <p className="mb-2 text-sm text-muted">{t("cart.items", { n: num(count) })}</p>
        <CartLines />
        <LocLink href="/shop" className="mt-6 inline-block text-sm font-semibold underline underline-offset-4">{t("cart.continue")}</LocLink>
      </section>
      <aside className="h-fit space-y-5 rounded-[var(--radius)] border border-line bg-surface p-6 lg:sticky lg:top-28" aria-label={t("cart.summary")}>
        <h2 className="display text-2xl">{t("cart.summary")}</h2>
        <FreeShippingBar subtotal={subtotal} />
        <DiscountBox />
        <Totals />
        <LocLink href="/checkout" className="btn btn-primary w-full">{t("cart.checkout")}</LocLink>
        <p className="text-xs text-muted">{t("cart.demoNote")}</p>
      </aside>
    </div>
  );
}
