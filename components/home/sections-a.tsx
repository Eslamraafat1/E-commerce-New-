"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { DESKTOP, useGsapScope } from "@/components/motion/gsap";
import { ImageReveal, Magnetic, Marquee } from "@/components/motion/primitives";
import { ScrollText, SpinBadge } from "@/components/motion/creative";
import { LocLink, useI18n } from "@/components/providers/i18n";
import { Price } from "@/components/shop/variant";
import { ProductCard } from "@/components/shop/product-card";
import { SmartImage } from "@/components/ui/smart-image";
import type { Category, Product } from "@/lib/api/types";
import { ImageAccordion } from "./accordion";
import { SectionHead } from "./section-bits";

/* ─────────── 4. Brand marquee — skews with scroll velocity ─────────── */
export function BrandMarquee() {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);
  const words = [t("marquee.1"), t("marquee.2"), t("marquee.3"), t("marquee.4"), t("marquee.5"), t("marquee.6")];
  useGsapScope(root, ({ gsap, ScrollTrigger, mm }) => {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const skew = gsap.quickTo("[data-skew]", "skewX", { duration: 0.5, ease: "power3.out" });
      const st = ScrollTrigger.create({ onUpdate: (self) => { skew(Math.max(-12, Math.min(12, self.getVelocity() / -120))); } });
      return () => st.kill();
    });
  });
  return (
    <section ref={root} id="after-hero" data-section="marquee" aria-label={t("marquee.label")} className="overflow-hidden border-y border-line bg-fg py-5 text-bg">
      <div data-skew>
        <Marquee speed={42} items={words.map((w, i) => (
          <span key={i} className="flex items-center gap-8 pe-8">
            <span className={`display text-[clamp(1.8rem,4vw,3.4rem)] ${i % 2 ? "[-webkit-text-stroke:1.5px_var(--bg)] text-transparent" : ""}`}>{w}</span>
            <span aria-hidden className="grid size-8 place-items-center rounded-full bg-accent text-on-accent">✦</span>
          </span>
        ))} />
      </div>
    </section>
  );
}

/* ─────────── 5. Category universe — expanding image panels ─────────── */
export function CategoryUniverse({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const { t, l } = useI18n();
  return (
    <section data-section="categories" aria-labelledby="cat-title" className="section">
      <div className="container-x">
        <SectionHead id="cat-title" eyebrow={t("cat.eyebrow")} title={t("cat.title")} link={{ href: "/categories", label: t("cat.all") }}>{t("cat.sub")}</SectionHead>
        <ImageAccordion label={t("nav.categories")} items={categories.map((c) => ({ id: c.id, href: `/categories/${c.slug}`, name: l(c.name), blurb: l(c.blurb), image: c.image, accent: c.accent, meta: String(counts[c.id] ?? 0) }))} />
        <p className="mt-6 text-sm text-muted">{t("cat.configurable")}</p>
      </div>
    </section>
  );
}

/* ─────────── 6. Featured product story ─────────── */
export function FeaturedStory({ product: p }: { product: Product }) {
  const { t, l } = useI18n();
  const root = useRef<HTMLElement>(null);
  useGsapScope(root, ({ gsap, mm }) => {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to("[data-layer=word]", { xPercent: -18, ease: "none", scrollTrigger: { trigger: root.current!, start: "top bottom", end: "bottom top", scrub: 1 } });
      gsap.to("[data-layer=badge]", { rotate: 160, y: -60, ease: "none", scrollTrigger: { trigger: root.current!, start: "top bottom", end: "bottom top", scrub: 1 } });
      gsap.fromTo("[data-layer=small]", { yPercent: 25 }, { yPercent: -25, ease: "none", scrollTrigger: { trigger: root.current!, start: "top bottom", end: "bottom top", scrub: 1 } });
    });
  });
  const second = p.images[1];
  return (
    <section ref={root} data-section="story" aria-labelledby="story-title" className="section overflow-hidden">
      <p data-layer="word" aria-hidden className="display pointer-events-none absolute inset-x-0 top-[8%] whitespace-nowrap text-[22vw] leading-none stroke-text opacity-[0.12] rtl:hidden">{l(p.title).split(" ")[0]}</p>
      <div className="container-x relative grid items-center gap-10 lg:grid-cols-12 lg:gap-6">
        <div className="relative lg:col-span-7">
          <ImageReveal parallax={-8} className="aspect-[4/4.6] rounded-[var(--radius)] sm:aspect-[5/5]">
            <SmartImage src={p.images[0].src} alt={l(p.images[0].alt)} fill sizes="(max-width:1024px) 100vw, 58vw" className="object-cover" />
          </ImageReveal>
          {second && <div data-layer="small" className="img-wrap absolute -bottom-10 -end-4 hidden aspect-[3/4] w-[32%] rounded-2xl border-4 border-bg shadow-2xl sm:block"><SmartImage src={second.src} alt="" fill sizes="20vw" className="object-cover" /></div>}
          <SpinBadge data-layer="badge" text={t("story.eyebrow")} className="absolute -start-4 -top-6 size-24 text-fg sm:size-32" />
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

/* ─────────── 7. Trending — staggered reveal ─────────── */
export function Trending({ products }: { products: Product[] }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const lead = products.find((x) => x.slug === "court-low-sneaker") ?? products[0];
  const [first, ...rest] = [lead, ...products.filter((x) => x !== lead)];
  useGsapScope(ref, ({ gsap, ScrollTrigger, mm }) => {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set("[data-card]", { opacity: 0, y: 70 });
      ScrollTrigger.batch("[data-card]", { start: "top 92%", once: true, onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, stagger: 0.09, duration: 1, ease: "expo.out" }) });
    });
  });
  return (
    <>
      <ScrollText text={t("trend.title")} />
      <section data-section="trending" aria-labelledby="trend-title" className="section !pt-8">
        <div className="container-x">
          <SectionHead id="trend-title" eyebrow={t("trend.eyebrow")} title={t("trend.title")} link={{ href: "/shop?sort=best", label: t("common.viewAll") }} />
          <div ref={ref} className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
            {first && <div data-card className="col-span-2 lg:row-span-2"><ProductCard product={first} variant="classic" priority sizes="(max-width:1024px) 100vw, 50vw" /></div>}
            {rest.slice(0, 6).map((p, i) => <div data-card key={p.id} className={i % 3 === 1 ? "lg:mt-10" : ""}><ProductCard product={p} variant={i === 3 ? "tall" : "classic"} /></div>)}
          </div>
        </div>
      </section>
    </>
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
      const tween = gsap.to(el, {
        x: () => dir * dist(), ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (self) => { if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`; } },
      });
      // per-card tilt + image drift, linked to the horizontal motion
      gsap.utils.toArray<HTMLElement>("[data-sc]").forEach((c) => {
        gsap.fromTo(c, { rotate: 5, yPercent: 8 }, { rotate: -5, yPercent: -8, ease: "none", scrollTrigger: { trigger: c, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
        const im = c.querySelector("[data-sci]");
        if (im) gsap.fromTo(im, { xPercent: -10 }, { xPercent: 10, ease: "none", scrollTrigger: { trigger: c, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
      });
    });
  });

  return (
    <section ref={root} data-section="showcase" aria-labelledby="show-title" className="relative overflow-hidden bg-bg2/60 py-16 lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:py-0">
      <div className="container-x">
        <SectionHead id="show-title" eyebrow={t("show.eyebrow")} title={t("show.title")} link={{ href: "/shop?featured=1", label: t("common.viewAll") }} />
      </div>
      <div className="max-lg:snap-x max-lg:snap-mandatory max-lg:overflow-x-auto max-lg:no-scrollbar">
        <div ref={track} className="flex w-max gap-5 px-[var(--gutter)] lg:gap-10">
          {products.map((p, i) => (
            <LocLink key={p.id} href={`/products/${p.slug}`} data-cursor={t("cursor.view")} className="group relative block w-[72vw] shrink-0 snap-center sm:w-[44vw] lg:w-[24vw] xl:w-[21vw]">
              <div data-sc>
                <div className="img-wrap aspect-[4/5] rounded-[var(--radius)] shadow-xl">
                  <div data-sci className="absolute -inset-x-[12%] inset-y-0"><SmartImage src={p.images[0].src} alt={l(p.images[0].alt)} fill sizes="(max-width:640px) 85vw, 30vw" className="object-cover transition-transform duration-700 group-hover:scale-105" /></div>
                  <span className="display absolute start-4 top-3 text-6xl text-white mix-blend-difference">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div><h3 className="font-medium">{l(p.title)}</h3><Price price={p.price} size="sm" /></div>
                  <span className="grid size-10 place-items-center rounded-full border border-line transition group-hover:bg-accent group-hover:text-on-accent"><ArrowUpRight size={16} className="rtl:-scale-x-100" /></span>
                </div>
              </div>
            </LocLink>
          ))}
          <LocLink href="/shop" className="grid w-[60vw] shrink-0 snap-center place-items-center rounded-[var(--radius)] border border-dashed border-line p-8 text-center sm:w-[30vw] lg:w-[20vw]">
            <span><span className="display block text-4xl">{t("show.more")}</span><ArrowRight className="mx-auto mt-4 rtl:rotate-180" /></span>
          </LocLink>
        </div>
      </div>
      <div className="container-x mt-10 hidden lg:block" aria-hidden>
        <div className="h-px w-full bg-line"><span ref={bar} className="block h-px origin-[var(--o,left)] scale-x-0 bg-fg rtl:[--o:right]" /></div>
      </div>
    </section>
  );
}
