"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LocLink, useI18n } from "@/components/providers/i18n";
import { DemoNotice } from "@/components/ui/page-header";
import { SmartImage } from "@/components/ui/smart-image";
import { store } from "@/config/store";
import { ApiError } from "@/lib/api/errors";
import { sendContact } from "@/lib/api/orders";
import type { Article } from "@/lib/api/types";
import type { DictKey } from "@/lib/i18n";

export function PolicyBody({ slug }: { slug: "shipping" | "returns" | "privacy" | "terms" }) {
  const { t, price, num } = useI18n();
  const s = store.policy.shipping;
  const vars = {
    freeOver: price(s.freeOver), standard: price(s.standard.price), express: price(s.express.price), days: num(store.policy.returnsDays),
    sEta: `${num(s.standard.etaDays[0])}–${num(s.standard.etaDays[1])}`, xEta: `${num(s.express.etaDays[0])}–${num(s.express.etaDays[1])}`,
  };
  return (
    <div className="space-y-5">
      <DemoNotice>{t("policy.demo")}</DemoNotice>
      {[1, 2, 3, 4].map((n) => {
        const key = `policy.${slug}.p${n}` as DictKey;
        return <p key={n} className="max-w-prose text-lg leading-relaxed">{t(key, vars)}</p>;
      })}
    </div>
  );
}

export function ContactForm() {
  const { t } = useI18n();
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const schema = useMemo(() => z.object({ name: z.string().trim().min(2, t("form.required")), email: z.string().min(1, t("form.required")).email(t("form.email")), message: z.string().trim().min(10, t("form.messageShort")).max(2000) }), [t]);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  const submit = handleSubmit(async (v) => {
    setError(null);
    try { await sendContact(v); setDone(t("contact.demoDone")); reset(); }
    catch (e) { setError(e instanceof ApiError && e.status === 0 ? t("error.network") : t("error.generic")); }
  });
  const field = (k: "name" | "email" | "message", label: string, type = "text") => (
    <div>
      <label htmlFor={`c-${k}`} className="label">{label}</label>
      {k === "message" ? <textarea id={`c-${k}`} rows={6} className="field" aria-invalid={!!errors[k]} {...register(k)} /> : <input id={`c-${k}`} type={type} className="field" autoComplete={k === "name" ? "name" : "email"} aria-invalid={!!errors[k]} {...register(k)} />}
      {errors[k] && <p className="err" role="alert">{errors[k]?.message}</p>}
    </div>
  );
  return (
    <form noValidate onSubmit={submit} className="space-y-4">
      <DemoNotice>{t("contact.demoNote")}</DemoNotice>
      {field("name", t("form.name"))}
      {field("email", t("form.email.label"), "email")}
      {field("message", t("form.message"))}
      {error && <p role="alert" className="text-danger">{error}</p>}
      {done && <p role="status" className="flex gap-2 rounded-xl border border-line bg-surface p-3 text-sm"><Check size={18} className="shrink-0 text-accent-ink" />{done}</p>}
      <button className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? <Loader2 size={18} className="animate-spin" /> : t("contact.send")}</button>
    </form>
  );
}

export function ArticleGrid({ items }: { items: Article[] }) {
  const { l, t, date } = useI18n();
  return (
    <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((a, i) => (
        <li key={a.slug} className={i === 0 ? "sm:col-span-2 lg:col-span-2" : ""}>
          <LocLink href={`/journal/${a.slug}`} className="group block">
            <div className={`img-wrap relative rounded-[var(--radius)] ${i === 0 ? "aspect-[16/9]" : "aspect-[4/3]"}`}><SmartImage src={a.image} alt="" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" /></div>
            <p className="eyebrow mt-4">{l(a.category)} · {date(a.date)} · {t("jr.read", { n: a.readMinutes })}</p>
            <h2 className={`display mt-2 ${i === 0 ? "h-md" : "text-2xl"} group-hover:underline underline-offset-8`}>{l(a.title)}</h2>
            <p className="mt-2 text-muted">{l(a.excerpt)}</p>
          </LocLink>
        </li>
      ))}
    </ul>
  );
}

export function ArticleBody({ a, more }: { a: Article; more: Article[] }) {
  const { l, t, date } = useI18n();
  return (
    <article className="container-x pb-24">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">{l(a.category)} · {date(a.date)} · {t("jr.read", { n: a.readMinutes })}</p>
        <h1 className="display h-lg mt-3">{l(a.title)}</h1>
        <p className="lead mt-5">{l(a.excerpt)}</p>
      </div>
      <div className="img-wrap relative mx-auto mt-10 aspect-[16/9] max-w-5xl rounded-[var(--radius)]"><SmartImage src={a.image} alt="" fill priority sizes="(max-width:1024px) 100vw, 1000px" className="object-cover" /></div>
      <div className="mx-auto mt-12 max-w-2xl space-y-6 text-lg leading-relaxed">
        {a.body.map((p, i) => <p key={i}>{l(p)}</p>)}
        <DemoNotice>{t("jr.demo")}</DemoNotice>
      </div>
      <aside className="mx-auto mt-20 max-w-5xl" aria-label={t("jr.more")}>
        <h2 className="display h-sm mb-6">{t("jr.more")}</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {more.map((x) => <li key={x.slug}><LocLink href={`/journal/${x.slug}`} className="card flex items-center justify-between gap-3 p-4 font-medium hover:bg-bg2">{l(x.title)}<ArrowRight size={16} className="shrink-0 rtl:rotate-180" /></LocLink></li>)}
        </ul>
      </aside>
    </article>
  );
}

export function AboutBody() {
  const { t } = useI18n();
  return (
    <div className="container-x pb-24">
      <div className="grid gap-10 lg:grid-cols-2">
        <p className="display text-[clamp(1.8rem,3.6vw,3.2rem)] !leading-[1.1] rtl:!leading-[1.35]">{t("about.lead")}</p>
        <div className="space-y-5 text-lg text-muted"><p>{t("about.p1")}</p><p>{t("about.p2")}</p></div>
      </div>
      <ul className="mt-16 grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((n) => <li key={n} className="card p-6"><p className="eyebrow">0{n}</p><h2 className="display mt-3 text-3xl">{t(`about.v${n}` as DictKey)}</h2><p className="mt-3 text-muted">{t(`about.v${n}t` as DictKey)}</p></li>)}
      </ul>
      <div className="mt-10"><DemoNotice>{t("about.demo")}</DemoNotice></div>
    </div>
  );
}
