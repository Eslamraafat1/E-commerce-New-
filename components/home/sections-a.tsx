"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useRef, useState } from "react";
import { DESKTOP, useGsapScope } from "@/components/motion/gsap";
import { ImageReveal, Magnetic, Marquee } from "@/components/motion/primitives";
import { LocLink, useI18n } from "@/components/providers/i18n";
import { Price } from "@/components/shop/variant";
import { ProductCard } from "@/components/shop/product-card";
import { SmartImage } from "@/components/ui/smart-image";
import type { Category, Product } from "@/lib/api/types";
import { SectionHead } from "./section-bits";

/* ─────────── 4. Brand marquee ─────────── */
export function BrandMarquee() {
  const { t } = useI18n();
  const words = [t("marquee.1"), t("marquee.2"), t("marquee.3"), t("marquee.4"), t("marquee.5"), t("marquee.6")];
  return (
    <section id="after-hero" data-section="marquee" aria-label={t("marquee.label")} className="border-y border-line bg-bg2/50 py-5">
      <Marquee speed={46} items={words.map((w, i) => (
        <span key={i} className="flex items-center gap-8 pe-8">
          <span className={`display text-[clamp(1.6rem,3.6vw,3rem)] ${i % 2 ? "stroke-text" : ""}`}>{w}</span>
          <span aria-hidden className="size-2.5 rounded-full bg-accent" />
        </span>
      ))} />
    </section>
  );
}

/* ─────────── 5. Interactive category universe ─────────── */
export function CategoryUniverse({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const { t, l, num } = useI18n();
  const [i, setI] = useState(0);
  const c = categories[i];
  return (
    <section data-section="categories" aria-labelledby="cat-title" className="section">
      <div className="container-x">
        <SectionHead id="cat-title" eyebrow={t("cat.eyebrow")} title={t("cat.title")} link={{ href: "/categories", label: t("cat.all") }}>{t("cat.sub")}</SectionHead>
        <div className="grid items-stretch gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <ul className="flex min-w-0 gap-2 overflow-x-auto no-scrollbar max-lg:-mx-[var(--gutter)] max-lg:px-[var(--gutter)] lg:flex-col lg:gap-0 lg:overflow-visible" role="tablist" aria-orientation="vertical" aria-label={t("nav.categories")}>
            {categories.map((x, k) => (
              <li key={x.id} className="shrink-0 lg:border-t lg:border-line lg:last:border-b">
                <button
                  role="tab" aria-selected={k === i} id={`cu-${x.id}`} aria-controls="cu-panel"
                  onMouseEnter={() => matchMedia("(hover:hover)").matches && setI(k)} onFocus={() => setI(k)} onClick={() => setI(k)}
                  className={`group flex w-full items-center justify-between gap-6 rounded-full border px-5 py-2.5 text-start transition max-lg:border-line lg:rounded-none lg:border-0 lg:px-0 lg:py-4 ${k === i ? "max-lg:bg-fg max-lg:text-bg" : "text-fg/60 hover:text-fg"}`}
                >
                  <span className="flex items-baseline gap-4">
                    <span className="eyebrow hidden tabular lg:inline">{String(k + 1).padStart(2, "0")}</span>
                    <span className={`display whitespace-nowrap text-xl transition-all duration-500 lg:text-[clamp(2rem,4.4vw,4.2rem)] ${k === i ? "lg:translate-x-3 rtl:lg:-translate-x-3 lg:text-fg" : ""}`}>{l(x.name)}</span>
                  </span>
                  <span className="hidden items-center gap-3 lg:flex"><span className="eyebrow tabular">{num(counts[x.id] ?? 0)}</span><ArrowUpRight size={22} className={`transition ${k === i ? "opacity-100" : "opacity-0"} rtl:-scale-x-100`} /></span>
                </button>
              </li>
            ))}
          </ul>
          <div id="cu-panel" role="tabpanel" aria-labelledby={`cu-${c.id}`} className="relative min-w-0">
            <LocLink href={`/categories/${c.slug}`} className="group relative block aspect-[4/3.4] overflow-hidden rounded-[var(--radius)] sm:aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[480px]" aria-label={l(c.name)}>
              <AnimatePresence mode="popLayout">
                <motion.div key={c.id} className="absolute inset-0" initial={{ clipPath: "inset(0 0 100% 0)", scale: 1.15 }} animate={{ clipPath: "inset(0 0 0% 0)", scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}>
                  <SmartImage src={c.image} alt="" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
                </motion.div>
              </AnimatePresence>
              <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <span className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4 text-white">
                <span className="max-w-xs text-sm text-white/85">{l(c.blurb)}</span>
                <span className="grid size-14 shrink-0 place-items-center rounded-full" style={{ background: c.accent, color: "#0e0e10" }}><ArrowUpRight size={22} className="rtl:-scale-x-100" /></span>
              </span>
            </LocLink>
          </div>
        </div>
        <p className="mt-6 text-sm text-muted">{t("cat.configurable")}</p>
      </div>
    </section>
  );
}

/* ─────────── 6. Featured product story ─────────── */
export function FeaturedStory({ product: p }: { product: Product }) {
  const { t, l } = useI18n();
  return (
    <section data-section="story" aria-labelledby="story-title" className="section overflow-hidden">
      <div className="container-x grid items-center gap-10 lg:grid-cols-12 lg:gap-6">
        <div className="relative lg:col-span-7">
          <ImageReveal parallax={-8} className="aspect-[4/4.6] rounded-[var(--radius)] sm:aspect-[5/5]">
            <SmartImage src={p.images[0].src} alt={l(p.images[0].alt)} fill sizes="(max-width:1024px) 100vw, 58vw" className="object-cover" />
          </ImageReveal>
          <p aria-hidden className="display pointer-events-none absolute -bottom-6 start-[-2%] select-none text-[clamp(5rem,18vw,16rem)] leading-none text-fg/[0.07] rtl:hidden">01</p>
        </div>
        <div className="lg:col-span-5 lg:ps-10">
          <p className="eyebrow mb-5 flex items-center gap-3"><span className="h-px w-8 bg-fg/40" />{t("story.eyebrow")}</p>
          <h2 id="story-title" className="display h-md">{l(p.title)}</h2>
          <p className="lead mt-6">{l(p.description)}</p>
          <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-line pt-6">
            {p.specs.slice(0, 2).map((s, i) => <div key={i}><dt className="eyebrow">{l(s.label)}</dt><dd className="mt-1 text-lg font-medium">{l(s.value)}</dd></div>)}
          </dl>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Price price={p.price} size="lg" />
            <Magnetic><LocLink href={`/products/${p.slug}`} className="btn btn-primary">{t("story.cta")} <ArrowRight size={18} className="rtl:rotate-180" /></LocLink></Magnetic>
          </div>
          <p className="mt-6 text-xs text-muted">{t("story.demo")}</p>
        </div>
      </div>
    </section>
  );
}

/* ─────────── 7. Trending ─────────── */
export function Trending({ products }: { products: Product[] }) {
  const { t } = useI18n();
  const [first, ...rest] = products;
  return (
    <section data-section="trending" aria-labelledby="trend-title" className="section">
      <div className="container-x">
        <SectionHead id="trend-title" eyebrow={t("trend.eyebrow")} title={t("trend.title")} link={{ href: "/shop?sort=best", label: t("common.viewAll") }} />
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
          {first && <div className="col-span-2 lg:row-span-2"><ProductCard product={first} variant="classic" priority sizes="(max-width:1024px) 100vw, 50vw" /></div>}
          {rest.slice(0, 6).map((p, i) => <ProductCard key={p.id} product={p} variant={i === 3 ? "tall" : "classic"} />)}
        </div>
      </div>
    </section>
  );
}

/* ─────────── 8. Horizontal product showcase (GSAP pinned on desktop, native swipe elsewhere) ─────────── */
export function HorizontalShowcase({ products }: { products: Product[] }) {
  const { t, l, isRtl } = useI18n();
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useGsapScope(root, ({ gsap, mm }) => {
    mm.add(`${DESKTOP} and (prefers-reduced-motion: no-preference)`, () => {
      const el = track.current!;
      const dist = () => el.scrollWidth - window.innerWidth + 120;
      const dir = isRtl ? 1 : -1;
      gsap.to(el, {
        x: () => dir * dist(), ease: "none",
        scrollTrigger: {
          trigger: root.current, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (self) => { if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`; },
        },
      });
    });
  });

  return (
    <section ref={root} data-section="showcase" aria-labelledby="show-title" className="relative overflow-hidden bg-bg2/60 py-16 lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:py-0">
      <div className="container-x">
        <SectionHead id="show-title" eyebrow={t("show.eyebrow")} title={t("show.title")} link={{ href: "/shop?featured=1", label: t("common.viewAll") }} />
      </div>
      <div className="max-lg:overflow-x-auto max-lg:snap-x max-lg:snap-mandatory max-lg:no-scrollbar">
        <div ref={track} className="flex w-max gap-5 px-[var(--gutter)] lg:gap-8">
          {products.map((p, i) => (
            <LocLink key={p.id} href={`/products/${p.slug}`} className="group relative block w-[72vw] shrink-0 snap-center sm:w-[44vw] lg:w-[26vw] xl:w-[22vw]">
              <div className="img-wrap aspect-[4/5] rounded-[var(--radius)]">
                <SmartImage src={p.images[0].src} alt={l(p.images[0].alt)} fill sizes="(max-width:640px) 72vw, 26vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute start-4 top-4 display text-5xl text-white/90 mix-blend-difference">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div><h3 className="font-medium">{l(p.title)}</h3><Price price={p.price} size="sm" /></div>
                <span className="grid size-10 place-items-center rounded-full border border-line transition group-hover:bg-accent group-hover:text-on-accent"><ArrowUpRight size={16} className="rtl:-scale-x-100" /></span>
              </div>
            </LocLink>
          ))}
          <LocLink href="/shop" className="grid w-[60vw] shrink-0 snap-center place-items-center rounded-[var(--radius)] border border-dashed border-line p-8 text-center sm:w-[30vw] lg:w-[20vw]">
            <span><span className="display block text-4xl">{t("show.more")}</span><ArrowRight className="mx-auto mt-4 rtl:rotate-180" /></span>
          </LocLink>
        </div>
      </div>
      <div className="container-x mt-10 hidden lg:block" aria-hidden>
        <div className="h-px w-full origin-left bg-line"><span ref={bar} className="block h-px origin-[var(--o,left)] scale-x-0 bg-fg rtl:[--o:right]" /></div>
      </div>
    </section>
  );
}
