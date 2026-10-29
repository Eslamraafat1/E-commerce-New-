"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, CreditCard, Headphones, PackageCheck, RotateCcw, Search, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useGsapScope } from "@/components/motion/gsap";
import { ImageReveal, Magnetic, Marquee, Reveal } from "@/components/motion/primitives";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { LocLink, useI18n } from "@/components/providers/i18n";
import { FaqList } from "@/components/ui/faq";
import { SmartImage } from "@/components/ui/smart-image";
import { store } from "@/config/store";
import type { Article, Category, Collection, Lifestyle, Product } from "@/lib/api/types";
import { ImageAccordion } from "./accordion";
import { SectionHead } from "./section-bits";

/* ─────────── 13. Product discovery + floating gallery (experience #3) ─────────── */
export function Discovery({ products, categories, collections, terms }: { products: Product[]; categories: Category[]; collections: Collection[]; terms: string[] }) {
  const { t, l, path } = useI18n();
  const router = useRouter();
  const [q, setQ] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const go = (term: string) => router.push(path(`/search?q=${encodeURIComponent(term)}`));
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !box.current) return;
    const r = box.current.getBoundingClientRect();
    box.current.style.setProperty("--px", String((e.clientX - r.left) / r.width - 0.5));
    box.current.style.setProperty("--py", String((e.clientY - r.top) / r.height - 0.5));
  };
  const layout = [
    "start-[2%] top-[4%] w-[46%] aspect-[3/4] z-[1]",
    "end-[2%] top-0 w-[38%] aspect-square z-[2]",
    "start-[30%] top-[40%] w-[34%] aspect-[4/5] z-[3]",
    "end-[4%] bottom-[2%] w-[40%] aspect-[3/4] z-[1]",
  ];
  const depth = [24, -36, 54, -18];
  return (
    <section data-section="discovery" aria-labelledby="disc-title" className="section overflow-hidden bg-bg2/50">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-4 flex items-center gap-3"><span className="h-px w-8 bg-fg/40" />{t("disc.eyebrow")}</p>
          <h2 id="disc-title" className="display h-lg">{t("disc.title")}</h2>
          <form className="mt-8" onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(q.trim()); }} role="search">
            <div className="flex items-center gap-2 rounded-full border border-line bg-surface-2 p-1.5 ps-5 focus-within:border-[var(--focus)]">
              <Search size={18} className="text-muted" />
              <label htmlFor="disc-q" className="sr-only">{t("search.placeholderShort")}</label>
              <input id="disc-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("disc.placeholder")} className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none" autoComplete="off" />
              <button className="btn btn-primary btn-sm">{t("search.go")}</button>
            </div>
          </form>
          <p className="eyebrow mb-3 mt-8">{t("disc.trending")}</p>
          <ul className="flex flex-wrap gap-2">{terms.map((x) => <li key={x}><button className="chip" onClick={() => go(x)}>{x}</button></li>)}</ul>
          <p className="eyebrow mb-3 mt-8">{t("nav.categories")}</p>
          <ul className="flex flex-wrap gap-2">{categories.map((c) => <li key={c.id}><LocLink href={`/categories/${c.slug}`} className="chip">{l(c.name)}</LocLink></li>)}</ul>
          <p className="eyebrow mb-3 mt-8">{t("nav.collections")}</p>
          <ul className="grid gap-2 sm:grid-cols-2">{collections.map((c) => <li key={c.id}><LocLink href={`/collections/${c.slug}`} className="flex items-center justify-between rounded-2xl border border-line px-4 py-3 font-medium transition hover:bg-surface">{l(c.name)}<ArrowUpRight size={16} className="rtl:-scale-x-100" /></LocLink></li>)}</ul>
        </div>
        {/* Floating gallery: layered, asymmetric, gently drifting */}
        <div ref={box} onPointerMove={onMove} className="relative mx-auto aspect-[4/4.4] w-full max-w-[560px]" style={{ ["--px" as string]: 0, ["--py" as string]: 0 }}>
          {products.slice(0, 4).map((p, i) => (
            <LocLink key={p.id} href={`/products/${p.slug}`} aria-label={l(p.title)} className={`absolute ${layout[i]} transition-transform duration-700 ease-out`} style={{ transform: `translate3d(calc(var(--px) * ${depth[i]}px), calc(var(--py) * ${depth[i]}px), 0)` }}>
              <span className="block size-full overflow-hidden rounded-[22px] border border-line shadow-2xl" style={{ animation: `float-y ${7 + i}s ease-in-out ${i * -2}s infinite` }}>
                <span className="relative block size-full"><SmartImage src={p.images[0].src} alt="" fill sizes="260px" className="object-cover" /></span>
              </span>
            </LocLink>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── 14. Shop by lifestyle ─────────── */
export function Lifestyles({ items }: { items: Lifestyle[] }) {
  const { t, l } = useI18n();
  return (
    <section data-section="lifestyle" aria-labelledby="life-title" className="section">
      <div className="container-x">
        <SectionHead id="life-title" eyebrow={t("life.eyebrow")} title={t("life.title")} />
        <ImageAccordion label={t("life.title")} items={items.map((x, i) => ({ id: x.id, href: `/shop?lifestyle=${x.id}`, name: l(x.name), blurb: l(x.blurb), image: x.image, accent: ["#d4ff3a", "#5bd1ff", "#3affb0", "#ffb23a", "#ff7fb0"][i % 5] }))} />
      </div>
    </section>
  );
}

/* ─────────── 15. Premium collections ─────────── */
export function Collections({ items }: { items: Collection[] }) {
  const { t, l } = useI18n();
  return (
    <section data-section="collections" aria-labelledby="col-title" className="section bg-bg2/50">
      <div className="container-x">
        <SectionHead id="col-title" eyebrow={t("col.eyebrow")} title={t("col.title")} link={{ href: "/collections", label: t("common.viewAll") }} />
        <div className="grid gap-6 md:grid-cols-2">
          {items.slice(0, 4).map((c, i) => (
            <Reveal key={c.id} className={i % 2 ? "md:mt-20" : ""}>
              <LocLink href={`/collections/${c.slug}`} className="group block">
                <ImageReveal className="aspect-[4/4.2] rounded-[var(--radius)] sm:aspect-[4/3.4]" parallax={-6}>
                  <SmartImage src={c.image} alt="" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
                </ImageReveal>
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div><p className="eyebrow">{t("col.campaign")} {String(i + 1).padStart(2, "0")}</p><h3 className="display mt-2 text-4xl">{l(c.name)}</h3><p className="mt-1 text-muted">{l(c.blurb)}</p></div>
                  <span className="grid size-12 shrink-0 place-items-center rounded-full border border-line transition group-hover:bg-accent group-hover:text-on-accent"><ArrowUpRight size={18} className="rtl:-scale-x-100" /></span>
                </div>
              </LocLink>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── 16. Brand story (scroll-scrubbed word reveal) ─────────── */
export function BrandStory({ images }: { images: string[] }) {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);
  const words = t("story2.text").split(" ");
  useGsapScope(root, ({ gsap, mm }) => {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo("[data-w]", { opacity: 0.14 }, { opacity: 1, stagger: 0.08, ease: "none", scrollTrigger: { trigger: "[data-words]", start: "top 80%", end: "bottom 45%", scrub: true } });
      gsap.fromTo("[data-strip]", { xPercent: 6 }, { xPercent: -6, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
    });
  });
  return (
    <section ref={root} data-section="brand" aria-labelledby="brand-title" className="section overflow-hidden">
      <div className="container-x">
        <p className="eyebrow mb-6 flex items-center gap-3"><span className="h-px w-8 bg-fg/40" />{t("story2.eyebrow")}</p>
        <h2 id="brand-title" className="sr-only">{t("story2.eyebrow")}</h2>
        <p data-words className="display text-[clamp(2rem,5.6vw,5.4rem)] !leading-[1.05] rtl:!leading-[1.3]">
          {words.map((w, i) => <span key={i} data-w className="inline-block pe-[0.28em]">{w}</span>)}
        </p>
      </div>
      <div data-strip className="mt-16 flex w-[112%] -ms-[6%] gap-4 px-4 sm:mt-24">
        {images.slice(0, 4).map((src, i) => (
          <div key={i} className="img-wrap relative aspect-[16/10] min-w-[60vw] flex-1 rounded-[var(--radius)] sm:min-w-0">
            <SmartImage src={src} alt="" fill sizes="40vw" className="object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────── 17. Shopping benefits — only what the store policy supports ─────────── */
export function Benefits() {
  const { t, l, price, num } = useI18n();
  const p = store.policy;
  const items = [
    p.shipping.freeOver > 0 && { icon: <Truck />, title: t("ben.ship"), text: t("ben.shipText", { amount: price(p.shipping.freeOver) }) },
    p.returnsDays > 0 && { icon: <RotateCcw />, title: t("ben.returns"), text: t("ben.returnsText", { days: num(p.returnsDays) }) },
    p.supportHours && { icon: <Headphones />, title: t("ben.support"), text: t("ben.supportText", { hours: l(p.supportHours) }) },
    p.paymentMethods.length > 0 && { icon: <CreditCard />, title: t("ben.pay"), text: t("ben.payText") },
    { icon: <PackageCheck />, title: t("ben.track"), text: t("ben.trackText") },
  ].filter(Boolean) as { icon: React.ReactNode; title: string; text: string }[];
  return (
    <section data-section="benefits" aria-labelledby="ben-title" className="border-y border-line py-14">
      <div className="container-x">
        <h2 id="ben-title" className="sr-only">{t("ben.title")}</h2>
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 4).map((b, i) => (
            <li key={i} className="flex gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-on-accent [&_svg]:size-5">{b.icon}</span>
              <div><h3 className="font-semibold">{b.title}</h3><p className="mt-1 text-sm text-muted">{b.text}</p></div>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-muted">{t("ben.demo")}</p>
      </div>
    </section>
  );
}

/* ─────────── 18. Journal ─────────── */
export function JournalSection({ articles }: { articles: Article[] }) {
  const { t, l, date } = useI18n();
  const [a, ...rest] = articles;
  return (
    <section data-section="journal" aria-labelledby="jr-title" className="section">
      <div className="container-x">
        <SectionHead id="jr-title" eyebrow={t("jr.eyebrow")} title={t("jr.title")} link={{ href: "/journal", label: t("common.viewAll") }} />
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <LocLink href={`/journal/${a.slug}`} className="group block">
            <div className="img-wrap relative aspect-[16/10] rounded-[var(--radius)]"><SmartImage src={a.image} alt="" fill sizes="(max-width:1024px) 100vw, 55vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" /></div>
            <p className="eyebrow mt-5">{l(a.category)} · {date(a.date)} · {t("jr.read", { n: a.readMinutes })}</p>
            <h3 className="display mt-3 text-[clamp(1.6rem,3vw,2.8rem)] group-hover:underline underline-offset-8">{l(a.title)}</h3>
            <p className="mt-3 max-w-xl text-muted">{l(a.excerpt)}</p>
          </LocLink>
          <ul className="flex flex-col gap-6">
            {rest.slice(0, 3).map((x) => (
              <li key={x.slug}>
                <LocLink href={`/journal/${x.slug}`} className="group grid grid-cols-[7rem_1fr] items-center gap-4 border-t border-line pt-6">
                  <span className="img-wrap relative block aspect-square rounded-2xl"><SmartImage src={x.image} alt="" fill sizes="112px" className="object-cover transition-transform duration-700 group-hover:scale-110" /></span>
                  <span><span className="eyebrow">{l(x.category)}</span><span className="mt-1 block text-lg font-medium leading-snug group-hover:underline">{l(x.title)}</span></span>
                </LocLink>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-8 text-xs text-muted">{t("jr.demo")}</p>
      </div>
    </section>
  );
}

/* ─────────── 19. Testimonials (clearly sample content) ─────────── */
export function Testimonials({ items }: { items: { id: string; name: { en: string; ar: string }; text: { en: string; ar: string }; product: { en: string; ar: string } }[] }) {
  const { t, l, num } = useI18n();
  const [i, setI] = useState(0);
  const cur = items[i];
  const step = (d: number) => setI((x) => (x + d + items.length) % items.length);
  return (
    <section data-section="testimonials" aria-labelledby="tm-title" className="section bg-bg2/50">
      <div className="container-x">
        <SectionHead id="tm-title" eyebrow={t("tm.eyebrow")} title={t("tm.title")} />
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]" role="group" aria-roledescription="carousel" aria-label={t("tm.title")}>
          <div className="min-h-[14rem]" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.figure key={cur.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }}>
                <blockquote className="display text-[clamp(1.6rem,3.8vw,3.6rem)] !leading-[1.1] rtl:!leading-[1.35]">“{l(cur.text)}”</blockquote>
                <figcaption className="mt-6 flex flex-wrap items-center gap-3 text-sm"><span className="font-semibold">{l(cur.name)}</span><span className="text-muted">· {l(cur.product)}</span><span className="badge">{t("tm.sample")}</span></figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm tabular text-muted">{num(i + 1)} / {num(items.length)}</span>
            <button className="btn-icon" onClick={() => step(-1)} aria-label={t("common.prev")}><ChevronLeft size={18} className="m-auto rtl:rotate-180" /></button>
            <button className="btn-icon" onClick={() => step(1)} aria-label={t("common.next")}><ChevronRight size={18} className="m-auto rtl:rotate-180" /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── 20. Newsletter ─────────── */
export function NewsletterSection() {
  const { t } = useI18n();
  return (
    <section data-section="newsletter" aria-labelledby="nl-title" className="section">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[calc(var(--radius)*1.4)] bg-fg p-8 text-bg sm:p-14 lg:p-20">
          <div aria-hidden className="absolute -end-20 -top-20 size-72 rounded-full bg-accent/90 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-end">
            <div><p className="eyebrow !text-bg/60">{t("newsletter.eyebrow")}</p><h2 id="nl-title" className="display h-md mt-4">{t("newsletter.title")}</h2><p className="mt-4 max-w-md text-bg/70">{t("newsletter.text")}</p></div>
            <div className="text-fg [&_.err]:text-[var(--accent-2)] [&_p.text-xs]:!text-bg/60"><NewsletterForm id="home-nl" /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── 21. FAQ ─────────── */
export function FaqSection() {
  const { t } = useI18n();
  return (
    <section data-section="faq" aria-labelledby="faq-title" className="section">
      <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <div><p className="eyebrow mb-4">{t("faq.eyebrow")}</p><h2 id="faq-title" className="display h-md">{t("faq.title")}</h2><LocLink href="/faq" className="mt-6 inline-flex items-center gap-2 font-semibold underline underline-offset-4">{t("common.viewAll")} <ArrowRight size={16} className="rtl:rotate-180" /></LocLink></div>
        <FaqList limit={5} />
      </div>
    </section>
  );
}

/* ─────────── 22. Final campaign CTA ─────────── */
export function FinalCta({ image }: { image: string }) {
  const { t } = useI18n();
  return (
    <section data-section="cta" aria-labelledby="cta-title" className="relative isolate overflow-hidden py-28 sm:py-40">
      <SmartImage src={image} alt="" fill sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[color-mix(in_srgb,var(--bg)_78%,transparent)]" />
      <div aria-hidden className="absolute inset-x-0 top-8 -z-10 opacity-20"><Marquee speed={60} items={Array.from({ length: 4 }, (_, i) => <span key={i} className="display stroke-text pe-10 text-[clamp(4rem,14vw,12rem)]">{store.name} ·</span>)} /></div>
      <div className="container-x text-center">
        <p className="eyebrow">{t("cta.eyebrow")}</p>
        <h2 id="cta-title" className="display h-xl mx-auto mt-5 max-w-[14ch]">{t("cta.title")}</h2>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Magnetic><LocLink href="/shop" className="btn btn-primary !min-h-14 !px-8 text-base">{t("cta.primary")} <ArrowRight size={18} className="rtl:rotate-180" /></LocLink></Magnetic>
          <Magnetic><LocLink href="/new-arrivals" className="btn btn-ghost !min-h-14 !px-8 text-base">{t("nav.new")}</LocLink></Magnetic>
        </div>
      </div>
    </section>
  );
}
