"use client";

import { Minus, Plus, Trash2, Truck } from "lucide-react";
import { useState } from "react";
import { LocLink, useI18n } from "@/components/providers/i18n";
import { SmartImage } from "@/components/ui/smart-image";
import { discountCodes, store, type ShippingMethodId } from "@/config/store";
import { computeTotals, evaluateDiscount } from "@/lib/api/cart";
import { cartStore, deliveryStore, discountStore, removeFromCart, setCartQty } from "@/lib/stores";

export function useCartTotals(method?: ShippingMethodId) {
  const lines = cartStore.use();
  const code = discountStore.use();
  const stored = deliveryStore.use();
  const totals = computeTotals(lines, method ?? stored, code);
  return { lines, code, ...totals, count: lines.reduce((a, l) => a + l.qty, 0) };
}

export function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const { t, price } = useI18n();
  const goal = store.policy.shipping.freeOver;
  const left = goal - subtotal;
  if (subtotal === 0) return null;
  return (
    <div className="rounded-2xl border border-line p-3 text-sm">
      <p className="flex items-center gap-2"><Truck size={16} />{left > 0 ? t("cart.freeShipLeft", { amount: price(left) }) : t("cart.freeShipDone")}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg2" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.round((subtotal / goal) * 100))}>
        <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${Math.min(100, (subtotal / goal) * 100)}%` }} />
      </div>
    </div>
  );
}

export function CartLines({ compact = false, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const { t, l, price, num } = useI18n();
  const lines = cartStore.use();
  return (
    <ul className="divide-y divide-line">
      {lines.map((ln) => (
        <li key={ln.key} className="flex gap-4 py-4">
          <LocLink href={`/products/${ln.slug}`} onClick={onNavigate} className="img-wrap relative block aspect-[4/5] w-20 shrink-0 rounded-xl sm:w-24">
            <SmartImage src={ln.image} alt="" fill sizes="96px" className="object-cover" />
          </LocLink>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between gap-3">
              <div className="min-w-0">
                <LocLink href={`/products/${ln.slug}`} onClick={onNavigate} className="font-medium hover:underline">{l(ln.title)}</LocLink>
                {ln.variantLabel && <p className="text-sm text-muted">{l(ln.variantLabel)}</p>}
                {!compact && <p className="text-xs text-muted" dir="ltr">SKU {ln.sku}</p>}
              </div>
              <p className="font-semibold tabular">{price(ln.unitPrice * ln.qty)}</p>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="inline-flex items-center rounded-full border border-line" role="group" aria-label={t("product.quantity")}>
                <button className="grid size-10 place-items-center disabled:opacity-40" aria-label={t("cart.decrease")} disabled={ln.qty <= 1} onClick={() => setCartQty(ln.key, ln.qty - 1)}><Minus size={15} /></button>
                <output className="min-w-7 text-center text-sm font-semibold tabular">{num(ln.qty)}</output>
                <button className="grid size-10 place-items-center disabled:opacity-40" aria-label={t("cart.increase")} disabled={ln.qty >= ln.maxQty} onClick={() => setCartQty(ln.key, ln.qty + 1)}><Plus size={15} /></button>
              </div>
              <button className="inline-flex items-center gap-1.5 p-2 text-sm text-muted hover:text-danger" onClick={() => removeFromCart(ln.key)} aria-label={`${t("cart.remove")}: ${l(ln.title)}`}>
                <Trash2 size={15} /> <span className="hidden sm:inline">{t("cart.remove")}</span>
              </button>
            </div>
            {ln.qty >= ln.maxQty && <p className="mt-1 text-xs text-accent2">{t("cart.maxReached", { max: num(ln.maxQty) })}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DiscountBox() {
  const { t, price } = useI18n();
  const { subtotal } = useCartTotals();
  const applied = discountStore.use();
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const res = evaluateDiscount(applied, subtotal);

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    const r = evaluateDiscount(input, subtotal);
    if (!r) return;
    if (!r.ok) setMsg({ ok: false, text: r.reason === "unknown" ? t("cart.codeInvalid") : t("cart.codeMin", { amount: price(discountCodes[input.trim().toUpperCase() as keyof typeof discountCodes].minSubtotal) }) });
    else { discountStore.set(r.code); setMsg({ ok: true, text: t("cart.codeApplied", { code: r.code }) }); setInput(""); }
  };

  return (
    <div>
      {applied ? (
        <p className="flex items-center justify-between rounded-xl border border-line bg-bg2 px-3 py-2 text-sm">
          <span><b>{applied}</b> {res?.ok ? "✓" : `— ${t("cart.codeMin", { amount: price(discountCodes[applied as keyof typeof discountCodes]?.minSubtotal ?? 0) })}`}</span>
          <button className="underline" onClick={() => { discountStore.set(""); setMsg(null); }}>{t("cart.codeRemove")}</button>
        </p>
      ) : (
        <form onSubmit={apply} className="flex gap-2" noValidate>
          <label htmlFor="discount" className="sr-only">{t("cart.code")}</label>
          <input id="discount" className="field !min-h-11 flex-1 uppercase" placeholder={t("cart.code")} value={input} onChange={(e) => setInput(e.target.value)} autoCapitalize="characters" autoComplete="off" />
          <button className="btn btn-ghost btn-sm" disabled={!input.trim()}>{t("cart.apply")}</button>
        </form>
      )}
      {msg && <p role="status" className={`mt-2 text-sm ${msg.ok ? "text-ok" : "text-danger"}`}>{msg.text}</p>}
      <details className="mt-2 text-xs text-muted">
        <summary className="cursor-pointer">{t("cart.codeRules")}</summary>
        <ul className="mt-1 list-disc ps-5">
          <li><b>VANTA10</b> — {t("cart.rule.VANTA10")}</li>
          <li><b>WELCOME15</b> — {t("cart.rule.WELCOME15", { amount: price(discountCodes.WELCOME15.minSubtotal) })}</li>
          <li><b>FREESHIP</b> — {t("cart.rule.FREESHIP")}</li>
        </ul>
      </details>
    </div>
  );
}

export function Totals({ method, showEstimate = true }: { method?: ShippingMethodId; showEstimate?: boolean }) {
  const { t, price } = useI18n();
  const { subtotal, discount, shipping, total, discountResult } = useCartTotals(method);
  const row = "flex justify-between";
  return (
    <dl className="space-y-2 text-sm">
      <div className={row}><dt className="text-muted">{t("cart.subtotal")}</dt><dd className="tabular">{price(subtotal)}</dd></div>
      {discount > 0 && discountResult?.ok && <div className={`${row} text-ok`}><dt>{t("cart.discount")} ({discountResult.code})</dt><dd className="tabular">−{price(discount)}</dd></div>}
      <div className={row}><dt className="text-muted">{showEstimate ? t("cart.shippingEst") : t("cart.shipping")}</dt><dd className="tabular">{shipping === 0 ? t("cart.free") : price(shipping)}</dd></div>
      <div className={`${row} border-t border-line pt-3 text-lg font-semibold`}><dt>{t("cart.total")}</dt><dd className="tabular">{price(total)}</dd></div>
    </dl>
  );
}
