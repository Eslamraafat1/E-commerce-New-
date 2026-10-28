"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote, Check, CreditCard, Loader2, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { useForm, type FieldPath, type UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { LocLink, useI18n } from "@/components/providers/i18n";
import { DemoNotice } from "@/components/ui/page-header";
import { SmartImage } from "@/components/ui/smart-image";
import { store, type ShippingMethodId } from "@/config/store";
import { createOrder } from "@/lib/api/orders";
import { shippingCost } from "@/lib/api/cart";
import { ApiError } from "@/lib/api/errors";
import { clearCart, deliveryStore, discountStore, ordersStore } from "@/lib/stores";
import { EmptyState } from "./rails";
import { Totals, useCartTotals } from "./cart-parts";
import { ShoppingBag } from "lucide-react";

const COUNTRIES = ["United States", "United Kingdom", "Canada", "Germany", "France", "United Arab Emirates", "Saudi Arabia", "Egypt", "Jordan", "Kuwait", "Qatar"];

type Values = {
  email: string; firstName: string; lastName: string; phone?: string;
  address1: string; address2?: string; city: string; region?: string; postalCode: string; country: string;
  delivery: ShippingMethodId; payment: "card" | "cod" | "wallet";
};

const STEPS = [
  { id: "customer", fields: ["email", "firstName", "lastName", "phone"] },
  { id: "shipping", fields: ["address1", "address2", "city", "region", "postalCode", "country"] },
  { id: "delivery", fields: ["delivery"] },
  { id: "payment", fields: ["payment"] },
  { id: "review", fields: [] },
] as const;


function Field({ form, name, label, type = "text", auto, span, req = true, inputMode }: { form: UseFormReturn<Values>; name: FieldPath<Values>; label: string; type?: string; auto?: string; span?: boolean; req?: boolean; inputMode?: "numeric" | "email" | "tel" }) {
  const { t } = useI18n();
  const err = form.formState.errors[name];
  return (
    <div className={span ? "sm:col-span-2" : ""}>
      <label htmlFor={`f-${name}`} className="label">{label}{!req && <span className="font-normal text-muted"> ({t("form.optional")})</span>}</label>
      <input id={`f-${name}`} type={type} autoComplete={auto} inputMode={inputMode} className="field" aria-invalid={!!err} aria-describedby={err ? `e-${name}` : undefined} aria-required={req} {...form.register(name)} />
      {err && <p id={`e-${name}`} className="err" role="alert">{err.message as string}</p>}
    </div>
  );
}

function Section({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section aria-labelledby="step-title" className="space-y-6">
      <h2 id="step-title" tabIndex={-1} className="display text-3xl">{title}</h2>
      {children}
    </section>
  );
}

export function Checkout() {
  const { t, l, price, num, path } = useI18n();
  const router = useRouter();
  const { lines, code } = useCartTotals();
  const delivery = deliveryStore.use();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const schema = useMemo(() => z.object({
    email: z.string().min(1, t("form.required")).email(t("form.email")),
    firstName: z.string().trim().min(1, t("form.required")).max(60),
    lastName: z.string().trim().min(1, t("form.required")).max(60),
    phone: z.string().trim().max(30).regex(/^[+\d\s()-]*$/, t("form.phone")).optional().or(z.literal("")),
    address1: z.string().trim().min(3, t("form.addressShort")).max(120),
    address2: z.string().max(120).optional(),
    city: z.string().trim().min(1, t("form.required")).max(80),
    region: z.string().max(80).optional(),
    postalCode: z.string().trim().min(2, t("form.required")).max(12),
    country: z.string().min(2, t("form.required")),
    delivery: z.enum(["standard", "express", "pickup"]),
    payment: z.enum(["card", "cod", "wallet"]),
  }), [t]);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { email: "", firstName: "", lastName: "", phone: "", address1: "", address2: "", city: "", region: "", postalCode: "", country: "United States", delivery, payment: "card" },
  });
  const { register, trigger, getValues, watch } = form;
  const v = watch();

  if (!lines.length && !submitting) return <EmptyState icon={<ShoppingBag size={30} />} title={t("cart.emptyTitle")} text={t("cart.emptyText")} />;

  const next = async () => {
    const ok = await trigger(STEPS[step].fields as unknown as FieldPath<Values>[]);
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const place = async () => {
    setSubmitting(true); setError(null);
    const d = getValues();
    try {
      const order = await createOrder({
        customer: { email: d.email, firstName: d.firstName, lastName: d.lastName, phone: d.phone || undefined },
        shipping: { address1: d.address1, address2: d.address2 || undefined, city: d.city, region: d.region || undefined, postalCode: d.postalCode, country: d.country },
        delivery: d.delivery, payment: d.payment, discountCode: code || undefined,
        lines: lines.map((x) => ({ productId: x.productId, variantId: x.variantId, qty: x.qty })),
      });
      ordersStore.set((p) => [order, ...p].slice(0, 20));
      clearCart(); discountStore.set("");
      router.push(path(`/order-confirmation?id=${encodeURIComponent(order.id)}`));
    } catch (e) {
      setSubmitting(false);
      setError(e instanceof ApiError ? (e.status === 0 ? t("error.network") : e.message) : t("error.generic"));
    }
  };

  const labels = [t("checkout.customer"), t("checkout.shipping"), t("checkout.delivery"), t("checkout.payment"), t("checkout.review")];
  const methods: { id: ShippingMethodId; label: string; eta: string }[] = [
    { id: "standard", label: t("ship.standard"), eta: `${num(store.policy.shipping.standard.etaDays[0])}–${num(store.policy.shipping.standard.etaDays[1])} ${t("ship.days")}` },
    { id: "express", label: t("ship.express"), eta: `${num(store.policy.shipping.express.etaDays[0])}–${num(store.policy.shipping.express.etaDays[1])} ${t("ship.days")}` },
    { id: "pickup", label: t("ship.pickup"), eta: t("ship.pickupEta") },
  ];
  const pays = [
    { id: "card" as const, label: t("pay.card"), icon: <CreditCard size={20} />, text: t("pay.cardText") },
    { id: "cod" as const, label: t("pay.cod"), icon: <Banknote size={20} />, text: t("pay.codText") },
    { id: "wallet" as const, label: t("pay.wallet"), icon: <Wallet size={20} />, text: t("pay.walletText") },
  ];

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_26rem] xl:gap-16">
      <div>
        <DemoNotice>{t("checkout.demoBanner")}</DemoNotice>
        <ol className="my-8 flex items-center gap-2 overflow-x-auto no-scrollbar" aria-label={t("checkout.steps")}>
          {labels.map((x, i) => (
            <li key={x} className="flex shrink-0 items-center gap-2" aria-current={i === step ? "step" : undefined}>
              <button type="button" disabled={i > step} onClick={() => setStep(i)} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${i === step ? "border-fg bg-fg text-bg" : i < step ? "border-line" : "border-line text-muted"}`}>
                <span className={`grid size-5 place-items-center rounded-full text-[0.7rem] ${i < step ? "bg-accent text-on-accent" : "bg-bg2 text-fg"}`}>{i < step ? <Check size={12} /> : num(i + 1)}</span>{x}
              </button>
              {i < labels.length - 1 && <span className="h-px w-4 bg-line" />}
            </li>
          ))}
        </ol>

        <form noValidate onSubmit={(e) => { e.preventDefault(); if (step < 4) next(); else place(); }}>
          {step === 0 && (
            <Section title={t("checkout.customer")}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field form={form} name="email" label={t("form.email.label")} type="email" auto="email" span inputMode="email" />
                <Field form={form} name="firstName" label={t("form.firstName")} auto="given-name" />
                <Field form={form} name="lastName" label={t("form.lastName")} auto="family-name" />
                <Field form={form} name="phone" label={t("form.phone.label")} type="tel" auto="tel" span req={false} inputMode="tel" />
              </div>
            </Section>
          )}
          {step === 1 && (
            <Section title={t("checkout.shipping")}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field form={form} name="address1" label={t("form.address1")} auto="address-line1" span />
                <Field form={form} name="address2" label={t("form.address2")} auto="address-line2" span req={false} />
                <Field form={form} name="city" label={t("form.city")} auto="address-level2" />
                <Field form={form} name="region" label={t("form.region")} auto="address-level1" req={false} />
                <Field form={form} name="postalCode" label={t("form.postal")} auto="postal-code" />
                <div>
                  <label htmlFor="f-country" className="label">{t("form.country")}</label>
                  <select id="f-country" className="field" autoComplete="country-name" {...register("country")}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select>
                </div>
              </div>
            </Section>
          )}
          {step === 2 && (
            <Section title={t("checkout.delivery")}>
              <fieldset className="space-y-3"><legend className="sr-only">{t("checkout.delivery")}</legend>
                {methods.map((m) => {
                  const cost = shippingCost(lines.reduce((a, x) => a + x.unitPrice * x.qty, 0), m.id);
                  return (
                    <label key={m.id} className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${v.delivery === m.id ? "border-fg bg-surface" : "border-line"}`}>
                      <input type="radio" value={m.id} className="size-5 accent-[var(--accent-ink)]" {...register("delivery", { onChange: (e) => deliveryStore.set(e.target.value) })} />
                      <span className="flex-1"><span className="block font-semibold">{m.label}</span><span className="text-sm text-muted">{m.eta}</span></span>
                      <span className="font-semibold tabular">{cost === 0 ? t("cart.free") : price(cost)}</span>
                    </label>
                  );
                })}
              </fieldset>
            </Section>
          )}
          {step === 3 && (
            <Section title={t("checkout.payment")}>
              <fieldset className="space-y-3"><legend className="sr-only">{t("checkout.payment")}</legend>
                {pays.map((m) => (
                  <label key={m.id} className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition ${v.payment === m.id ? "border-fg bg-surface" : "border-line"}`}>
                    <input type="radio" value={m.id} className="mt-1 size-5 accent-[var(--accent-ink)]" {...register("payment")} />
                    <span className="mt-0.5">{m.icon}</span>
                    <span><span className="block font-semibold">{m.label}</span><span className="text-sm text-muted">{m.text}</span></span>
                  </label>
                ))}
              </fieldset>
              <DemoNotice>{t("checkout.noCards")}</DemoNotice>
            </Section>
          )}
          {step === 4 && (
            <Section title={t("checkout.review")}>
              <dl className="divide-y divide-line rounded-2xl border border-line">
                {[
                  [t("checkout.customer"), `${v.firstName} ${v.lastName} · ${v.email}`, 0],
                  [t("checkout.shipping"), `${v.address1}${v.address2 ? `, ${v.address2}` : ""}, ${v.city} ${v.postalCode}, ${v.country}`, 1],
                  [t("checkout.delivery"), methods.find((m) => m.id === v.delivery)?.label ?? "", 2],
                  [t("checkout.payment"), pays.find((m) => m.id === v.payment)?.label ?? "", 3],
                ].map(([k, val, s]) => (
                  <div key={k as string} className="flex items-start justify-between gap-4 p-4">
                    <div className="min-w-0"><dt className="text-sm text-muted">{k}</dt><dd className="break-words font-medium">{val}</dd></div>
                    <button type="button" className="shrink-0 text-sm underline underline-offset-4" onClick={() => setStep(s as number)}>{t("common.edit")}</button>
                  </div>
                ))}
              </dl>
              <p className="text-sm text-muted">{t("checkout.editCart")} <LocLink href="/cart" className="underline">{t("nav.cart")}</LocLink></p>
              {error && <p role="alert" className="rounded-xl border border-danger p-3 text-danger">{error}</p>}
            </Section>
          )}

          <div className="mt-10 flex items-center justify-between gap-3">
            <button type="button" className="btn btn-ghost" disabled={step === 0 || submitting} onClick={() => setStep((s) => s - 1)}>{t("common.back")}</button>
            {step < 4 ? (
              <button className="btn btn-primary min-w-40">{t("common.continue")}</button>
            ) : (
              <button className="btn btn-primary min-w-56" disabled={submitting}>{submitting ? <><Loader2 size={18} className="animate-spin" />{t("checkout.placing")}</> : t("checkout.place")}</button>
            )}
          </div>
        </form>
      </div>

      <aside className="h-fit space-y-5 rounded-[var(--radius)] border border-line bg-surface p-5 lg:sticky lg:top-28" aria-label={t("cart.summary")}>
        <div className="flex items-center justify-between"><h2 className="display text-2xl">{t("cart.summary")}</h2><LocLink href="/cart" className="text-sm underline underline-offset-4">{t("common.edit")}</LocLink></div>
        <ul className="max-h-72 space-y-3 overflow-y-auto" data-lenis-prevent>
          {lines.map((ln) => (
            <li key={ln.key} className="flex gap-3">
              <span className="img-wrap relative block aspect-[4/5] w-14 shrink-0 rounded-lg"><SmartImage src={ln.image} alt="" fill sizes="56px" className="object-cover" /><span className="absolute -end-1 -top-1 grid size-5 place-items-center rounded-full bg-fg text-[0.65rem] text-bg">{num(ln.qty)}</span></span>
              <span className="min-w-0 flex-1 text-sm"><span className="block truncate font-medium">{l(ln.title)}</span>{ln.variantLabel && <span className="text-muted">{l(ln.variantLabel)}</span>}</span>
              <span className="text-sm tabular">{price(ln.unitPrice * ln.qty)}</span>
            </li>
          ))}
        </ul>
        <Totals method={v.delivery} showEstimate={false} />
      </aside>
    </div>
  );
}
