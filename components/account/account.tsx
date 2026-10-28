"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, History, MapPin, Package, Trash2, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LocLink, useI18n } from "@/components/providers/i18n";
import { useUI } from "@/components/providers/ui";
import { DemoNotice } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shop/rails";
import { addressStore, ordersStore, profileStore, recentStore, wishlistStore } from "@/lib/stores";

export function AccountNav() {
  const { t, path } = useI18n();
  const pathname = usePathname();
  const items = [
    { href: "/account", label: t("account.dashboard"), icon: <User size={17} />, exact: true },
    { href: "/account/orders", label: t("account.orders"), icon: <Package size={17} /> },
    { href: "/account/profile", label: t("account.profile"), icon: <User size={17} /> },
    { href: "/account/addresses", label: t("account.addresses"), icon: <MapPin size={17} /> },
    { href: "/wishlist", label: t("nav.wishlist"), icon: <Heart size={17} /> },
    { href: "/recently-viewed", label: t("recent.title"), icon: <History size={17} /> },
  ];
  return (
    <nav aria-label={t("account.nav")}>
      <ul className="flex gap-2 overflow-x-auto no-scrollbar lg:flex-col">
        {items.map((i) => {
          const on = i.exact ? pathname === path(i.href) : pathname.startsWith(path(i.href));
          return (
            <li key={i.href} className="shrink-0">
              <LocLink href={i.href} aria-current={on ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-full px-4 text-sm font-medium transition lg:rounded-xl ${on ? "bg-fg text-bg" : "border border-line hover:bg-bg2 lg:border-transparent"}`}>{i.icon}{i.label}</LocLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Dashboard() {
  const { t, price, num } = useI18n();
  const profile = profileStore.use();
  const orders = ordersStore.use();
  const wish = wishlistStore.use();
  const recent = recentStore.use();
  const stats = [
    { k: t("account.orders"), v: orders.length, href: "/account/orders" },
    { k: t("nav.wishlist"), v: wish.length, href: "/wishlist" },
    { k: t("recent.title"), v: recent.length, href: "/recently-viewed" },
  ];
  return (
    <div className="space-y-8">
      <DemoNotice>{t("account.demo")}</DemoNotice>
      <div>
        <h1 className="display h-md">{profile ? t("account.hello", { name: profile.name }) : t("account.guest")}</h1>
        {!profile && <p className="mt-3 text-muted">{t("account.guestText")} <LocLink href="/login" className="underline">{t("auth.login.title")}</LocLink></p>}
      </div>
      <ul className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => <li key={s.k}><LocLink href={s.href} className="card block p-5 transition hover:-translate-y-0.5"><span className="eyebrow">{s.k}</span><span className="display mt-2 block text-5xl">{num(s.v)}</span></LocLink></li>)}
      </ul>
      {orders[0] && <p className="text-sm text-muted">{t("account.lastOrder")}: <b className="font-mono text-fg" dir="ltr">{orders[0].id}</b> · {price(orders[0].totals.total)}</p>}
    </div>
  );
}

export function OrdersList() {
  const { t, l, price, date, num } = useI18n();
  const orders = ordersStore.use();
  return (
    <div className="space-y-6">
      <h1 className="display h-md">{t("account.orders")}</h1>
      <DemoNotice>{t("account.ordersDemo")}</DemoNotice>
      {orders.length === 0 ? (
        <EmptyState icon={<Package size={30} />} title={t("account.noOrders")} text={t("account.noOrdersText")} />
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-sm" dir="ltr">{o.id}</p>
                <span className="badge">{t("account.statusDemo")}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{date(o.createdAt)} · {t("cart.items", { n: num(o.lines.reduce((a, x) => a + x.qty, 0)) })}</p>
              <p className="mt-2 text-sm">{o.lines.map((x) => l(x.title)).join(" · ")}</p>
              <p className="mt-3 font-semibold tabular">{price(o.totals.total)}</p>
              <LocLink href={`/order-confirmation?id=${o.id}`} className="mt-2 inline-block text-sm underline underline-offset-4">{t("account.viewOrder")}</LocLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ProfileForm() {
  const { t } = useI18n();
  const { toast } = useUI();
  const profile = profileStore.use();
  const schema = useMemo(() => z.object({ name: z.string().trim().min(2, t("form.required")), email: z.string().email(t("form.email")), phone: z.string().regex(/^[+\d\s()-]*$/, t("form.phone")).optional().or(z.literal("")) }), [t]);
  const { register, handleSubmit, formState: { errors } } = useForm<{ name: string; email: string; phone?: string }>({ resolver: zodResolver(schema), values: profile ?? { name: "", email: "", phone: "" } });
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="display h-md">{t("account.profile")}</h1>
      <DemoNotice>{t("account.profileDemo")}</DemoNotice>
      <form noValidate className="space-y-4" onSubmit={handleSubmit((v) => { profileStore.set({ name: v.name, email: v.email, phone: v.phone ?? "" }); toast(t("account.saved")); })}>
        {(["name", "email", "phone"] as const).map((k) => (
          <div key={k}>
            <label className="label" htmlFor={`p-${k}`}>{k === "name" ? t("form.name") : k === "email" ? t("form.email.label") : t("form.phone.label")}</label>
            <input id={`p-${k}`} className="field" type={k === "email" ? "email" : k === "phone" ? "tel" : "text"} aria-invalid={!!errors[k]} {...register(k)} />
            {errors[k] && <p className="err" role="alert">{errors[k]?.message as string}</p>}
          </div>
        ))}
        <button className="btn btn-primary">{t("common.save")}</button>
      </form>
    </div>
  );
}

export function Addresses() {
  const { t } = useI18n();
  const addrs = addressStore.use();
  const [open, setOpen] = useState(false);
  const schema = useMemo(() => z.object({ label: z.string().trim().min(1, t("form.required")), line1: z.string().trim().min(3, t("form.addressShort")), city: z.string().trim().min(1, t("form.required")), postalCode: z.string().trim().min(2, t("form.required")), country: z.string().trim().min(2, t("form.required")) }), [t]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4"><h1 className="display h-md">{t("account.addresses")}</h1><button className="btn btn-dark btn-sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{t("account.addAddress")}</button></div>
      <DemoNotice>{t("account.addressDemo")}</DemoNotice>
      {open && (
        <form noValidate className="card grid gap-4 p-5 sm:grid-cols-2" onSubmit={handleSubmit((v) => { addressStore.set((p) => [...p, { id: `a${Date.now()}`, ...v }]); reset(); setOpen(false); })}>
          {(["label", "line1", "city", "postalCode", "country"] as const).map((k) => (
            <div key={k} className={k === "line1" ? "sm:col-span-2" : ""}>
              <label className="label" htmlFor={`ad-${k}`}>{t(`address.${k}` as never)}</label>
              <input id={`ad-${k}`} className="field" aria-invalid={!!errors[k]} {...register(k)} />
              {errors[k] && <p className="err" role="alert">{errors[k]?.message}</p>}
            </div>
          ))}
          <div className="sm:col-span-2"><button className="btn btn-primary">{t("common.save")}</button></div>
        </form>
      )}
      {addrs.length === 0 ? <EmptyState icon={<MapPin size={30} />} title={t("account.noAddresses")} text={t("account.noAddressesText")} cta={false} /> : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addrs.map((a) => (
            <li key={a.id} className="card flex items-start justify-between gap-4 p-5">
              <div><p className="font-semibold">{a.label}</p><p className="text-sm text-muted">{a.line1}<br />{a.city} {a.postalCode}<br />{a.country}</p></div>
              <button className="btn-icon" aria-label={t("cart.remove")} onClick={() => addressStore.set((p) => p.filter((x) => x.id !== a.id))}><Trash2 size={16} className="m-auto" /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
