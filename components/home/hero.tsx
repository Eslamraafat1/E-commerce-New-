"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, type ElementType, useEffect, useRef, useState } from "react";
import { REDUCED, registerGsap } from "@/components/motion/gsap";
import { Magnetic } from "@/components/motion/primitives";
import { SpinBadge } from "@/components/motion/creative";
import { LocLink, useI18n } from "@/components/providers/i18n";
import { Price } from "@/components/shop/variant";
import { SmartImage } from "@/components/ui/smart-image";
import type { Product } from "@/lib/api/types";

const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false });
export interface HeroSlide { product: Product; accent: string; category: string }

const DURATION = 6.5;

function useCan3D() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    if (window.matchMedia(REDUCED).matches || nav.connection?.saveData) return;
    if ((nav.hardwareConcurrency ?? 8) < 4 || (nav.deviceMemory ?? 8) < 4) return;
    try { const c = document.createElement("canvas"); if (!(c.getContext("webgl2") || c.getContext("webgl"))) return; } catch { return; }
    const id = window.setTimeout(() => setOk(true), 700);
    return () => clearTimeout(id);
  }, []);
  return ok;
}

/** Cinematic full-screen hero carousel: masked image wipes, word-by-word titles, colour-tinted stage, autoplay with progress. */
export function Hero({ slides }: { slides: HeroSlide[] }) {
  const { t, l, num, isRtl } = useI18n();
  const root = useRef<HTMLElement>(null);
  const cur = useRef(0);
  const busy = useRef(false);
  const tween = useRef<gsap.core.Tween | null>(null);
  const paused = useRef(false);
  const goRef = useRef<(to: number, dir: number) => void>(() => {});
  const [index, setIndex] = useState(0);
  const can3D = useCan3D();
  const n = slides.length;

  const play = useCallback(() => {
    const el = root.current;
    if (!el || window.matchMedia(REDUCED).matches) return;
    const { gsap } = registerGsap();
    tween.current?.kill();
    const bars = el.querySelectorAll<HTMLElement>("[data-bar]");
    gsap.set(bars, { scaleX: 0 });
    bars.forEach((b, i) => { if (i < cur.current) gsap.set(b, { scaleX: 1 }); });
    const fill = bars[cur.current];
    tween.current = gsap.to(fill, { scaleX: 1, duration: DURATION, ease: "none", paused: paused.current, onComplete: () => goRef.current(cur.current + 1, 1) });
  }, []);

  const goTo = useCallback((to: number, dir: number) => {
    const el = root.current;
    if (!el || busy.current) return;
    const next = (to + n) % n;
    if (next === cur.current) return;
    const { gsap } = registerGsap();
    const items = el.querySelectorAll<HTMLElement>("[data-slide]");
    const out = items[cur.current], inn = items[next];
    const reduced = window.matchMedia(REDUCED).matches;
    busy.current = true;
    tween.current?.kill();
    const done = () => { busy.current = false; cur.current = next; setIndex(next); play(); };
    gsap.set(el, { "--slide": slides[next].accent });
    if (reduced) { gsap.set(out, { autoAlpha: 0 }); gsap.set(inn, { autoAlpha: 1 }); done(); return; }
    const tl = gsap.timeline({ onComplete: done });
    tl.set(inn, { autoAlpha: 1, zIndex: 2 }).set(out, { zIndex: 1 })
      .to(out.querySelectorAll("[data-w]"), { yPercent: -115, stagger: 0.025, duration: 0.55, ease: "power3.in" }, 0)
      .to(out.querySelectorAll("[data-fade]"), { opacity: 0, y: -20, duration: 0.4 }, 0)
      .to(out.querySelector("[data-img]"), { clipPath: `inset(0 0 100% 0)`, duration: 0.9, ease: "power4.inOut" }, 0)
      .to(out.querySelector("[data-img2]"), { y: -60, opacity: 0, duration: 0.6 }, 0)
      .fromTo(inn.querySelector("[data-img]"), { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.2, ease: "power4.inOut" }, 0.35)
      .fromTo(inn.querySelector("[data-img-in]"), { scale: 1.4, xPercent: dir * 6 }, { scale: 1, xPercent: 0, duration: 1.8, ease: "power3.out" }, 0.35)
      .fromTo(inn.querySelectorAll("[data-w]"), { yPercent: 115 }, { yPercent: 0, stagger: 0.07, duration: 1, ease: "power4.out" }, 0.7)
      .fromTo(inn.querySelectorAll("[data-fade]"), { y: 36, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.8, ease: "power3.out" }, 1)
      .fromTo(inn.querySelector("[data-img2]"), { y: 90, opacity: 0, rotate: dir * 8 }, { y: 0, opacity: 1, rotate: 0, duration: 1.1, ease: "expo.out" }, 0.9)
      .set(out, { autoAlpha: 0 });
  }, [n, play, slides]);
  useEffect(() => { goRef.current = goTo; }, [goTo]);

  // intro + autoplay lifecycle + pointer parallax
  useEffect(() => {
    const el = root.current!;
    const { gsap } = registerGsap();
    const reduced = window.matchMedia(REDUCED).matches;
    const items = el.querySelectorAll<HTMLElement>("[data-slide]");
    gsap.set(items, { autoAlpha: 0 });
    gsap.set(items[0], { autoAlpha: 1, zIndex: 2 });
    gsap.set(el, { "--slide": slides[0].accent });
    const ctx = gsap.context(() => {
      if (!reduced) {
        const first = items[0];
        gsap.timeline({ defaults: { ease: "power4.out" } })
          .fromTo(first.querySelector("[data-img]"), { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.5, ease: "power4.inOut" }, 0.1)
          .fromTo(first.querySelector("[data-img-in]"), { scale: 1.4 }, { scale: 1, duration: 2, ease: "power3.out" }, 0.1)
          .fromTo(first.querySelectorAll("[data-w]"), { yPercent: 115 }, { yPercent: 0, stagger: 0.08, duration: 1.2 }, 0.5)
          .fromTo(first.querySelectorAll("[data-fade]"), { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.9 }, 0.9)
          .fromTo(first.querySelector("[data-img2]"), { y: 90, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "expo.out" }, 1)
          .fromTo("[data-hero-ui]", { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.8 }, 1.2);
      }
    }, el);
    play();

    const vis = () => tween.current?.paused(paused.current || document.hidden);
    document.addEventListener("visibilitychange", vis);
    const io = new IntersectionObserver(([e]) => tween.current?.paused(!e.isIntersecting || paused.current), { threshold: 0.2 });
    io.observe(el);

    let off = () => {};
    if (!reduced && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      const move = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
        gsap.to("[data-par]", { x: (_i, t) => nx * Number((t as HTMLElement).dataset.par), y: (_i, t) => ny * Number((t as HTMLElement).dataset.par), duration: 1.2, ease: "power3.out", overwrite: "auto" });
      };
      window.addEventListener("pointermove", move);
      off = () => window.removeEventListener("pointermove", move);
    }
    return () => { off(); io.disconnect(); document.removeEventListener("visibilitychange", vis); tween.current?.kill(); ctx.revert(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPause = (p: boolean) => { paused.current = p; tween.current?.paused(p); };
  const down = useRef(0);
  const prev = () => goTo(cur.current - 1, -1);
  const nextSlide = () => goTo(cur.current + 1, 1);

  return (
    <section
      ref={root} data-section="hero" aria-roledescription="carousel" aria-label={t("hero.carousel")}
      onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)} onFocus={() => setPause(true)} onBlur={() => setPause(false)}
      onKeyDown={(e) => { if (e.key === "ArrowRight") (isRtl ? prev : nextSlide)(); if (e.key === "ArrowLeft") (isRtl ? nextSlide : prev)(); }}
      onPointerDown={(e) => { down.current = e.clientX; }}
      onPointerUp={(e) => { const dx = e.clientX - down.current; if (Math.abs(dx) > 70) (dx < 0 === !isRtl ? nextSlide : prev)(); }}
      className="relative isolate -mt-[var(--header-h)] min-h-[100svh] overflow-hidden [touch-action:pan-y]"
    >
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_75%_40%,color-mix(in_srgb,var(--slide)_32%,transparent),transparent_70%),radial-gradient(50%_50%_at_5%_100%,color-mix(in_srgb,var(--slide)_14%,transparent),transparent_70%)]" />
        {can3D && <div className="absolute inset-y-0 end-0 w-full opacity-40 sm:w-[62%] sm:opacity-70"><HeroScene /></div>}
        <p className="display absolute -bottom-[6vw] start-[-1vw] select-none text-[34vw] leading-none text-fg/[0.045] rtl:hidden" data-par="-30">{String(index + 1).padStart(2, "0")}</p>
      </div>

      <div className="absolute inset-0">
        {slides.map(({ product: p, category }, i) => {
          const second = p.images.find((im, k) => k > 0 && !im.color) ?? p.images[1];
          const words = l(p.title).split(" ");
          const Heading = (i === 0 ? "h1" : "h2") as ElementType;
          return (
            <div key={p.id} data-slide role="group" aria-roledescription="slide" aria-label={t("hero.slide", { n: num(i + 1), total: num(n) })} aria-hidden={i !== index} className="absolute inset-0 flex items-center">
              <div className="container-x grid h-full items-center gap-4 pb-28 pt-[calc(var(--header-h)+1rem)] lg:grid-cols-12 lg:pb-24">
                <div className="relative z-[3] order-2 min-w-0 lg:order-1 lg:col-span-7">
                  <p data-fade className="eyebrow mb-4 flex items-center gap-3"><span className="h-px w-10 bg-fg/40" />{category}{p.badge && <span className="badge badge-accent">{t(`badge.${p.badge}` as never)}</span>}</p>
                  <Heading className={`display text-[clamp(2.6rem,9.2vw,9.5rem)] !leading-[0.92] rtl:!leading-[1.15]`} {...(i === index ? {} : { "aria-hidden": true })}>
                    {words.map((w, k) => <span key={k} className="inline-block overflow-hidden pb-[0.07em] align-bottom"><span data-w className={`inline-block pe-[0.2em] ${k === words.length - 1 ? "text-accent-ink" : ""}`}>{w}</span></span>)}
                  </Heading>
                  <p data-fade className="lead mt-5 line-clamp-2 max-w-md !text-fg/75 max-sm:hidden">{l(p.description)}</p>
                  <div data-fade className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <Price price={Math.min(...p.variants.map((v) => v.price ?? p.price))} compareAt={p.compareAtPrice} size="lg" />
                    <Magnetic><LocLink href={`/products/${p.slug}`} tabIndex={i === index ? 0 : -1} className="btn btn-primary">{t("hero.cta1")} <ArrowRight size={18} className="rtl:rotate-180" /></LocLink></Magnetic>
                    <LocLink href="/shop" tabIndex={i === index ? 0 : -1} className="btn btn-ghost max-sm:hidden">{t("nav.shopAll")}</LocLink>
                  </div>
                </div>
                <div className="relative order-1 mx-auto w-[min(62%,42svh)] lg:order-2 lg:col-span-5 lg:w-full lg:max-w-[30rem] lg:justify-self-center" data-par="40">
                  <LocLink href={`/products/${p.slug}`} tabIndex={-1} aria-label={l(p.title)} data-cursor={t("cursor.view")} className="block">
                    <div data-img className="img-wrap relative aspect-[4/5] rounded-[28px] shadow-2xl">
                      <div data-img-in className="absolute inset-0"><SmartImage src={p.images[0].src} alt={l(p.images[0].alt)} fill priority={i === 0} sizes="(max-width:1024px) 60vw, 32vw" className="object-cover" /></div>
                    </div>
                  </LocLink>
                  {second && <div data-img2 data-par="-70" className="img-wrap absolute -bottom-6 -start-[14%] hidden aspect-square w-[40%] rounded-2xl border-4 border-bg shadow-2xl sm:block"><SmartImage src={second.src} alt="" fill sizes="14vw" className="object-cover" /></div>}
                  <SpinBadge text={p.badge === "sale" ? t("badge.sale") : t("hero.discover")} className="absolute -end-[12%] -top-[8%] size-[26%] min-w-16 text-fg" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* controls */}
      <div className="container-x absolute inset-x-0 bottom-0 z-[5] pb-6 sm:pb-8">
        <div className="flex items-center gap-4">
          <p data-hero-ui className="display text-2xl tabular" aria-hidden>{String(index + 1).padStart(2, "0")}<span className="text-muted">/{String(n).padStart(2, "0")}</span></p>
          <div data-hero-ui className="flex flex-1 gap-2" role="tablist" aria-label={t("hero.carousel")}>
            {slides.map((s, i) => (
              <button key={s.product.id} role="tab" aria-selected={i === index} aria-label={`${t("hero.slide", { n: num(i + 1), total: num(n) })}: ${l(s.product.title)}`} onClick={() => goTo(i, i > cur.current ? 1 : -1)} className="group relative h-6 flex-1">
                <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-fg/20 transition-[height] group-hover:h-[5px]">
                  <span data-bar className="absolute inset-0 origin-[var(--o,left)] scale-x-0 bg-fg rtl:[--o:right]" />
                </span>
              </button>
            ))}
          </div>
          <div data-hero-ui className="flex gap-2">
            <button className="btn-icon" onClick={prev} aria-label={t("common.prev")}><ArrowLeft size={18} className="rtl:rotate-180" /></button>
            <button className="btn-icon bg-fg !text-bg" onClick={nextSlide} aria-label={t("common.next")}><ArrowRight size={18} className="rtl:rotate-180" /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
