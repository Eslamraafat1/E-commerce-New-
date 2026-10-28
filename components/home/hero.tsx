"use client";

import { ArrowDown, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { REDUCED, useGsapScope } from "@/components/motion/gsap";
import { Magnetic } from "@/components/motion/primitives";
import { LocLink, useI18n } from "@/components/providers/i18n";
import { SmartImage } from "@/components/ui/smart-image";
import type { Product } from "@/lib/api/types";

const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false });

/** Gate for the 3D scene: skip on reduced motion, data-saver, low-core/low-memory devices or no WebGL. */
function useCan3D() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    if (window.matchMedia(REDUCED).matches || nav.connection?.saveData) return;
    if ((nav.hardwareConcurrency ?? 8) < 4 || (nav.deviceMemory ?? 8) < 4) return;
    try {
      const c = document.createElement("canvas");
      if (!(c.getContext("webgl2") || c.getContext("webgl"))) return;
    } catch { return; }
    const id = window.setTimeout(() => setOk(true), 500); // let text + LCP paint first
    return () => clearTimeout(id);
  }, []);
  return ok;
}

export function Hero({ products }: { products: Product[] }) {
  const { t, l } = useI18n();
  const root = useRef<HTMLElement>(null);
  const can3D = useCan3D();
  const [a, b, c] = products;

  useGsapScope(root, ({ gsap, mm }) => {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from("[data-hero-line] > span", { yPercent: 115, duration: 1.3, stagger: 0.12 }, 0.1)
        .from("[data-hero-fade]", { y: 24, opacity: 0, duration: 1, stagger: 0.1 }, 0.55)
        .from("[data-hero-card]", { y: 80, opacity: 0, scale: 0.85, duration: 1.4, stagger: 0.14, ease: "expo.out" }, 0.4)
        .from("[data-hero-cue]", { opacity: 0, duration: 1 }, 1.2);

      // Scroll-out choreography
      gsap.to("[data-hero-title]", { yPercent: -18, opacity: 0.1, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
      gsap.to("[data-hero-bg]", { yPercent: 14, scale: 1.1, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });

      // Pointer parallax for fine pointers
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const cards = gsap.utils.toArray<HTMLElement>("[data-depth]");
        const setters = cards.map((el) => ({ x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }), y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }), d: Number(el.dataset.depth) }));
        const move = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
          setters.forEach((s) => { s.x(nx * s.d); s.y(ny * s.d); });
        };
        window.addEventListener("pointermove", move);
        return () => window.removeEventListener("pointermove", move);
      }
    });
  });

  const card = "group absolute overflow-hidden rounded-[22px] border border-white/10 shadow-2xl";
  return (
    <section ref={root} data-section="hero" aria-labelledby="hero-title" className="relative isolate -mt-[var(--header-h)] flex min-h-[100svh] flex-col justify-end overflow-hidden pb-10 pt-[calc(var(--header-h)+2rem)]">
      {/* background layers */}
      <div data-hero-bg aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_70%_30%,color-mix(in_srgb,var(--accent)_16%,transparent),transparent_70%),radial-gradient(60%_50%_at_10%_90%,color-mix(in_srgb,var(--accent-2)_14%,transparent),transparent_70%)]" />
        {can3D ? (
          <div className="absolute inset-x-0 top-0 h-[58%] opacity-80 sm:inset-x-auto sm:inset-y-0 sm:end-[-4%] sm:h-auto sm:w-[70%] sm:opacity-100"><HeroScene /></div>
        ) : (
          <div className="absolute end-[4%] top-[14%] size-[min(70vw,560px)] rounded-full bg-[radial-gradient(circle_at_30%_30%,#fff,var(--accent)_30%,color-mix(in_srgb,var(--accent)_30%,#000)_70%)] opacity-80 blur-[2px] float-y" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_55%,var(--bg))]" />
      </div>

      {/* floating product cards (clickable, above the canvas) */}
      <div className="pointer-events-none absolute inset-0 z-[2]" aria-hidden={false}>
        {[
          { p: a, cls: "end-[6%] top-[12%] h-[27%] w-[34%] sm:end-[8%] sm:top-[15%] sm:h-[44%] sm:w-[20%] rotate-[4deg]", depth: 50 },
          { p: b, cls: "end-[34%] top-[40%] hidden h-[32%] w-[15%] -rotate-[5deg] md:block", depth: -30 },
          { p: c, cls: "start-[8%] top-[18%] h-[22%] w-[28%] sm:start-auto sm:end-[20%] sm:top-auto sm:bottom-[14%] sm:h-[36%] sm:w-[17%] -rotate-[3deg]", depth: 80 },
        ].map(({ p, cls, depth }, i) => p && (
          <div key={p.id} data-depth={depth} className={`pointer-events-auto absolute ${cls.split(" ").filter((x) => !x.startsWith("rotate") && !x.startsWith("-rotate")).join(" ")}`}>
            <LocLink data-hero-card href={`/products/${p.slug}`} aria-label={l(p.title)} className={`${card} block size-full ${cls.includes("-rotate") ? "-rotate-3" : "rotate-3"} transition-transform duration-500 hover:!rotate-0 hover:scale-105`} style={{ animation: `float-y ${6 + i * 1.3}s ease-in-out ${i * -1.7}s infinite` }}>
              <SmartImage src={p.images[0].src} alt="" fill priority={i === 0} sizes="(max-width:640px) 35vw, 22vw" className="object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 max-sm:hidden">{l(p.title)}</span>
            </LocLink>
          </div>
        ))}
      </div>

      <div className="container-x relative z-[3]">
        <p data-hero-fade className="eyebrow mb-5 flex items-center gap-3"><span className="h-px w-10 bg-fg/40" />{t("hero.eyebrow")}</p>
        <h1 id="hero-title" data-hero-title className="display h-xl max-w-[12ch] sm:max-w-none">
          <span data-hero-line className="block overflow-hidden pb-[0.06em]"><span className="block">{t("hero.line1")}</span></span>
          <span data-hero-line className="block overflow-hidden pb-[0.06em]"><span className="block text-accent-ink [-webkit-text-stroke:0]">{t("hero.line2")}</span></span>
        </h1>
        <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-md">
            <p data-hero-fade className="lead !text-fg/80">{t("hero.sub")}</p>
            <div data-hero-fade className="mt-6 flex flex-wrap gap-3">
              <Magnetic><LocLink href="/shop" className="btn btn-primary">{t("hero.cta1")} <ArrowRight size={18} className="rtl:rotate-180" /></LocLink></Magnetic>
              <Magnetic><LocLink href="/collections" className="btn btn-ghost">{t("hero.cta2")}</LocLink></Magnetic>
            </div>
          </div>
          <a data-hero-cue href="#after-hero" className="hidden items-center gap-3 text-xs uppercase tracking-widest text-muted sm:flex" aria-label={t("hero.scroll")}>
            <span className="relative h-12 w-px overflow-hidden bg-line"><span className="absolute inset-x-0 top-0 h-1/2 bg-fg" style={{ animation: "scroll-cue 1.8s var(--ease) infinite" }} /></span>
            {t("hero.scroll")} <ArrowDown size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
