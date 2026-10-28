"use client";

import { CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { LocLink, useI18n } from "@/components/providers/i18n";
import { DemoNotice } from "@/components/ui/page-header";
import { SmartImage } from "@/components/ui/smart-image";
import { ordersStore } from "@/lib/stores";

export function OrderConfirmation() {
  const { t, l, price, num, date } = useI18n();
  const id = useSearchParams().get("id");
  const orders = ordersStore.use();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="display text-4xl">{t("confirm.notFound")}</p>
        <p className="mt-3 text-muted">{t("confirm.notFoundText")}</p>
        <LocLink href="/shop" className="btn btn-dark mt-6">{t("cart.continue")}</LocLink>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <CheckCircle2 size={56} className="mx-auto text-accent-ink" />
        <h1 className="display h-lg mt-5">{t("confirm.title")}</h1>
        <p className="lead mx-auto mt-3">{t("confirm.text", { email: order.input.customer.email })}</p>
        <p className="mt-4 font-mono text-sm" dir="ltr">{t("confirm.number")}: <b>{order.id}</b></p>
      </div>
      <div className="mt-8"><DemoNotice>{t("confirm.demo")}</DemoNotice></div>
      <section className="mt-8 rounded-[var(--radius)] border border-line bg-surface p-6" aria-label={t("cart.summary")}>
        <p className="eyebrow mb-4">{date(order.createdAt)}</p>
        <ul className="divide-y divide-line">
          {order.lines.map((ln) => (
            <li key={ln.key} className="flex items-center gap-4 py-3">
              <span className="img-wrap relative block aspect-[4/5] w-14 shrink-0 rounded-lg"><SmartImage src={ln.image} alt="" fill sizes="56px" className="object-cover" /></span>
              <span className="min-w-0 flex-1"><span className="block font-medium">{l(ln.title)}</span><span className="text-sm text-muted">{ln.variantLabel ? `${l(ln.variantLabel)} · ` : ""}× {num(ln.qty)}</span></span>
              <span className="tabular">{price(ln.unitPrice * ln.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted">{t("cart.subtotal")}</dt><dd className="tabular">{price(order.totals.subtotal)}</dd></div>
          {order.totals.discount > 0 && <div className="flex justify-between text-ok"><dt>{t("cart.discount")}</dt><dd className="tabular">−{price(order.totals.discount)}</dd></div>}
          <div className="flex justify-between"><dt className="text-muted">{t("cart.shipping")}</dt><dd className="tabular">{order.totals.shipping ? price(order.totals.shipping) : t("cart.free")}</dd></div>
          <div className="flex justify-between text-lg font-semibold"><dt>{t("cart.total")}</dt><dd className="tabular">{price(order.totals.total)}</dd></div>
        </dl>
        <p className="mt-4 text-sm text-muted">{order.input.shipping.address1}, {order.input.shipping.city} {order.input.shipping.postalCode}, {order.input.shipping.country}</p>
      </section>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <LocLink href="/shop" className="btn btn-primary">{t("cart.continue")}</LocLink>
        <LocLink href="/account/orders" className="btn btn-ghost">{t("account.orders")}</LocLink>
      </div>
    </div>
  );
}
