"use client";

import { Boxes, FolderTree, LayoutDashboard, Layers, Pencil, Plus, Receipt, Settings, ShieldAlert, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LocLink, useI18n } from "@/components/providers/i18n";
import { useUI } from "@/components/providers/ui";
import { Dialog } from "@/components/ui/dialog";
import { SmartImage } from "@/components/ui/smart-image";
import { store } from "@/config/store";
import { getCategories } from "@/lib/api/categories";
import { getCollections } from "@/lib/api/collections";
import { listProducts } from "@/lib/api/products";
import type { Category, Collection, Product } from "@/lib/api/types";
import { ordersStore } from "@/lib/stores";

export function AdminNav() {
  const { t, path } = useI18n();
  const pathname = usePathname();
  const items = [
    { href: "/admin", label: t("admin.overview"), icon: <LayoutDashboard size={17} />, exact: true },
    { href: "/admin/products", label: t("admin.products"), icon: <Boxes size={17} /> },
    { href: "/admin/categories", label: t("admin.categories"), icon: <FolderTree size={17} /> },
    { href: "/admin/collections", label: t("admin.collections"), icon: <Layers size={17} /> },
    { href: "/admin/orders", label: t("admin.orders"), icon: <Receipt size={17} /> },
    { href: "/admin/settings", label: t("admin.settings"), icon: <Settings size={17} /> },
  ];
  return (
    <nav aria-label={t("nav.admin")}>
      <ul className="flex gap-2 overflow-x-auto no-scrollbar lg:flex-col">
        {items.map((i) => {
          const on = i.exact ? pathname === path(i.href) : pathname.startsWith(path(i.href));
          return <li key={i.href} className="shrink-0"><LocLink href={i.href} aria-current={on ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-full px-4 text-sm font-medium lg:rounded-xl ${on ? "bg-fg text-bg" : "border border-line hover:bg-bg2 lg:border-transparent"}`}>{i.icon}{i.label}</LocLink></li>;
        })}
      </ul>
    </nav>
  );
}

export function AdminBanner() {
  const { t } = useI18n();
  return (
    <div role="alert" className="flex gap-3 rounded-2xl border border-accent2 bg-[color-mix(in_srgb,var(--accent-2)_10%,transparent)] p-4 text-sm">
      <ShieldAlert className="mt-0.5 shrink-0 text-accent2" size={20} />
      <p><b>{t("admin.demoTitle")}</b> {t("admin.demoText")}</p>
    </div>
  );
}

function useData<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [err, setErr] = useState(false);
  const [n, setN] = useState(0);
  useEffect(() => { load().then(setData).catch(() => setErr(true)); }, [n]);
  return { data, setData, err, retry: () => { setErr(false); setN((x) => x + 1); } };
}

function Table({ head, children, caption }: { head: string[]; children: ReactNode; caption: string }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[640px] text-start text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-bg2 text-muted"><tr>{head.map((h) => <th key={h} scope="col" className="px-4 py-3 text-start font-medium">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}
const Err = ({ retry }: { retry: () => void }) => { const { t } = useI18n(); return <p role="alert" className="text-danger">{t("error.generic")} <button className="underline" onClick={retry}>{t("common.retry")}</button></p>; };

export function Overview() {
  const { t, num, price } = useI18n();
  const prods = useData(() => listProducts({ pageSize: 60 }));
  const cats = useData(getCategories);
  const cols = useData(getCollections);
  const orders = ordersStore.use();
  const stat = (k: string, v: string) => <li className="card p-5"><span className="eyebrow">{k}</span><span className="display mt-2 block text-5xl">{v}</span></li>;
  const items = prods.data?.items ?? [];
  const low = items.filter((p) => p.stockStatus !== "in_stock");
  return (
    <div className="space-y-8">
      <h1 className="display h-md">{t("admin.overview")}</h1>
      <AdminBanner />
      {prods.err ? <Err retry={prods.retry} /> : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stat(t("admin.products"), prods.data ? num(prods.data.total) : "…")}
          {stat(t("admin.categories"), cats.data ? num(cats.data.length) : "…")}
          {stat(t("admin.collections"), cols.data ? num(cols.data.length) : "…")}
          {stat(t("admin.demoOrders"), num(orders.length))}
        </ul>
      )}
      <section>
        <h2 className="mb-3 font-semibold">{t("admin.attention")}</h2>
        <Table caption={t("admin.attention")} head={[t("admin.name"), t("admin.stock"), t("admin.price")]}>
          {low.map((p) => <tr key={p.id}><td className="px-4 py-3">{p.title.en}</td><td className="px-4 py-3">{t(p.stockStatus === "out_of_stock" ? "product.soldOut" : "product.lowStock")}</td><td className="px-4 py-3 tabular">{price(p.price)}</td></tr>)}
        </Table>
      </section>
    </div>
  );
}

export function ProductsAdmin() {
  const { t, price, l } = useI18n();
  const { toast } = useUI();
  const { data, setData, err, retry } = useData(() => listProducts({ pageSize: 60 }).then((r) => r.items));
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<{ p: Product | null; title: string; price: string; active: boolean } | null>(null);
  const [inactive, setInactive] = useState<Set<string>>(new Set());
  const titleRef = useRef<HTMLInputElement>(null);
  const rows = (data ?? []).filter((p) => p.title.en.toLowerCase().includes(q.toLowerCase()) || p.title.ar.includes(q));

  const save = () => {
    if (!edit || !data) return;
    const cents = Math.round(Number(edit.price) * 100);
    if (!edit.title.trim() || !Number.isFinite(cents) || cents <= 0) { toast(t("form.required"), { kind: "error" }); return; }
    if (edit.p) {
      const id = edit.p.id;
      setData(data.map((p) => (p.id === id ? { ...p, title: { en: edit.title, ar: edit.title }, price: cents } : p)));
      setInactive((s) => { const n = new Set(s); if (edit.active) n.delete(id); else n.add(id); return n; });
    } else {
      const np = { ...data[0], id: `new-${Date.now()}`, slug: `new-${Date.now()}`, title: { en: edit.title, ar: edit.title }, price: cents } as Product;
      setData([np, ...data]);
    }
    setEdit(null); toast(t("admin.localOnly"), { kind: "info" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="display h-md">{t("admin.products")}</h1><button className="btn btn-dark btn-sm" onClick={() => setEdit({ p: null, title: "", price: "", active: true })}><Plus size={16} />{t("admin.new")}</button></div>
      <AdminBanner />
      <label className="block max-w-sm"><span className="sr-only">{t("catalog.searchLabel")}</span><input className="field !min-h-11" placeholder={t("catalog.searchPlaceholder")} value={q} onChange={(e) => setQ(e.target.value)} /></label>
      {err ? <Err retry={retry} /> : !data ? <div className="skeleton h-64" /> : (
        <Table caption={t("admin.products")} head={[t("admin.name"), t("filter.category"), t("admin.price"), t("admin.stock"), t("admin.status"), ""]}>
          {rows.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3"><span className="flex items-center gap-3"><span className="img-wrap relative block size-10 shrink-0 rounded-lg"><SmartImage src={p.images[0].src} alt="" fill sizes="40px" className="object-cover" /></span>{l(p.title)}</span></td>
              <td className="px-4 py-3 capitalize">{p.categoryId}</td>
              <td className="px-4 py-3 tabular">{price(p.price)}</td>
              <td className="px-4 py-3">{t(p.stockStatus === "in_stock" ? "product.inStock" : p.stockStatus === "low_stock" ? "product.lowStock" : "product.soldOut")}</td>
              <td className="px-4 py-3"><span className="badge">{inactive.has(p.id) ? t("admin.draft") : t("admin.active")}</span></td>
              <td className="px-4 py-3 text-end"><button className="btn-icon" aria-label={`${t("common.edit")}: ${l(p.title)}`} onClick={() => setEdit({ p, title: l(p.title), price: String(p.price / 100), active: !inactive.has(p.id) })}><Pencil size={15} className="m-auto" /></button></td>
            </tr>
          ))}
        </Table>
      )}
      <Dialog open={!!edit} onClose={() => setEdit(null)} title={edit?.p ? t("common.edit") : t("admin.new")} initialFocus={titleRef}>
        {edit && (
          <form className="space-y-4 overflow-y-auto p-5" onSubmit={(e) => { e.preventDefault(); save(); }}>
            <div><label className="label" htmlFor="ap-title">{t("admin.name")}</label><input id="ap-title" ref={titleRef} className="field" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></div>
            <div><label className="label" htmlFor="ap-price">{t("admin.price")} ({store.currency})</label><input id="ap-price" inputMode="decimal" className="field" value={edit.price} onChange={(e) => setEdit({ ...edit, price: e.target.value })} /></div>
            <label className="flex items-center gap-3"><input type="checkbox" className="size-5 accent-[var(--accent-ink)]" checked={edit.active} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} />{t("admin.active")}</label>
            <p className="text-sm text-muted">{t("admin.localOnly")}</p>
            <div className="flex justify-end gap-2"><button type="button" className="btn btn-ghost" onClick={() => setEdit(null)}>{t("common.cancel")}</button><button className="btn btn-primary">{t("common.save")}</button></div>
          </form>
        )}
      </Dialog>
    </div>
  );
}

function SimpleAdmin<T extends Category | Collection>({ titleKey, load }: { titleKey: "admin.categories" | "admin.collections"; load: () => Promise<T[]> }) {
  const { t, l } = useI18n();
  const { toast } = useUI();
  const { data, setData, err, retry } = useData(load);
  const [name, setName] = useState("");
  const add = () => {
    if (!name.trim() || !data) return;
    setData([...data, { ...data[0], id: `new-${Date.now()}`, slug: name.toLowerCase().replace(/\s+/g, "-"), name: { en: name, ar: name } }]);
    setName(""); toast(t("admin.localOnly"), { kind: "info" });
  };
  return (
    <div className="space-y-6">
      <h1 className="display h-md">{t(titleKey)}</h1>
      <AdminBanner />
      <form className="flex max-w-md gap-2" onSubmit={(e) => { e.preventDefault(); add(); }}>
        <label className="sr-only" htmlFor="adm-name">{t("admin.name")}</label>
        <input id="adm-name" className="field !min-h-11" placeholder={t("admin.name")} value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn btn-dark btn-sm"><Plus size={16} />{t("admin.new")}</button>
      </form>
      {err ? <Err retry={retry} /> : !data ? <div className="skeleton h-48" /> : (
        <Table caption={t(titleKey)} head={[t("admin.name"), "Slug", ""]}>
          {data.map((c) => (
            <tr key={c.id}><td className="px-4 py-3 font-medium">{l(c.name)}</td><td className="px-4 py-3 font-mono" dir="ltr">{c.slug}</td>
              <td className="px-4 py-3 text-end"><button className="btn-icon" aria-label={`${t("cart.remove")}: ${l(c.name)}`} onClick={() => setData(data.filter((x) => x.id !== c.id))}><Trash2 size={15} className="m-auto" /></button></td></tr>
          ))}
        </Table>
      )}
    </div>
  );
}
export const CategoriesAdmin = () => <SimpleAdmin titleKey="admin.categories" load={getCategories} />;
export const CollectionsAdmin = () => <SimpleAdmin titleKey="admin.collections" load={getCollections} />;

export function OrdersAdmin() {
  const { t, price, date } = useI18n();
  const orders = ordersStore.use();
  const [status, setStatus] = useState<Record<string, string>>({});
  const opts = ["pending", "paid", "shipped", "delivered"] as const;
  return (
    <div className="space-y-6">
      <h1 className="display h-md">{t("admin.orders")}</h1>
      <AdminBanner />
      <p className="text-sm text-muted">{t("admin.ordersNote")}</p>
      {orders.length === 0 ? <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">{t("account.noOrders")}</p> : (
        <Table caption={t("admin.orders")} head={["#", t("admin.date"), t("admin.customer"), t("admin.total"), t("admin.status")]}>
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="px-4 py-3 font-mono" dir="ltr">{o.id}</td><td className="px-4 py-3">{date(o.createdAt)}</td>
              <td className="px-4 py-3">{o.input.customer.firstName} {o.input.customer.lastName}</td><td className="px-4 py-3 tabular">{price(o.totals.total)}</td>
              <td className="px-4 py-3"><label className="sr-only" htmlFor={`st-${o.id}`}>{t("admin.status")}</label>
                <select id={`st-${o.id}`} className="field !min-h-10 !w-auto !py-1" value={status[o.id] ?? "pending"} onChange={(e) => setStatus({ ...status, [o.id]: e.target.value })}>{opts.map((s) => <option key={s} value={s}>{t(`admin.st.${s}` as never)}</option>)}</select></td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}

export function SettingsAdmin() {
  const { t, price } = useI18n();
  const { toast } = useUI();
  const [v, setV] = useState({ name: store.name, currency: store.currency, freeOver: String(store.policy.shipping.freeOver / 100), returns: String(store.policy.returnsDays), email: store.contact.email });
  const fields: [keyof typeof v, string][] = [["name", t("admin.storeName")], ["currency", t("admin.currency")], ["freeOver", t("admin.freeOver")], ["returns", t("admin.returnsDays")], ["email", t("form.email.label")]];
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="display h-md">{t("admin.settings")}</h1>
      <AdminBanner />
      <p className="text-sm text-muted">{t("admin.settingsNote")} <code className="rounded bg-bg2 px-1">config/store.ts</code></p>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast(t("admin.localOnly"), { kind: "info" }); }}>
        {fields.map(([k, label]) => <div key={k}><label className="label" htmlFor={`s-${k}`}>{label}</label><input id={`s-${k}`} className="field" value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} /></div>)}
        <p className="text-sm text-muted">{t("admin.preview")}: <b>{price(Math.round(Number(v.freeOver || 0) * 100))}</b></p>
        <button className="btn btn-primary">{t("common.save")}</button>
      </form>
    </div>
  );
}
