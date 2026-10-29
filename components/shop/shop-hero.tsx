"use client";

import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { Marquee } from "@/components/motion/primitives";
import { SplitText, SpinBadge } from "@/components/motion/creative";
import { useGsapScope } from "@/components/motion/gsap";
import { Breadcrumbs, useTxt, type Txt } from "@/components/ui/page-header";
import { LocLink, useI18n } from "@/components/providers/i18n";
import { SmartImage } from "@/components/ui/smart-image";
import type { Category } from "@/lib/api/types";

/** Immersive header for the shop pages: giant split title, drifting tag marquee and a draggable category rail. */
export function ShopHero({ eyebrow, title, sub, categories, counts, tags, total, base = "/shop" }: { eyebrow: Txt; title: Txt; sub: Txt; categories: Category[]; counts: Record<string, number>; tags: string[]; total: number; base?: string }) {
  const { t, l, num } = useI18n();
  const tx = useTxt();
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLUListElement>(null);

  useGsapScope(root, ({ gsap, mm }) => {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from("[data-rail] li", { y: 80, opacity: 0, rotate: 3, stagger: 0.07, duration: 1, ease: "expo.out", delay: 0.4 });
      gsap.from("[data-sh-fade]", { y: 24, opacity: 0, stagger: 0.1, duration: 0.9, ease: "power3.out", delay: 0.3 });
      gsap.to("[data-sh-num]", { yPercent: -35, ease: "none", scrollTrigger: { trigger: root.current!, start: "top top", end: "bottom top", scrub: true } });
      gsap.to("[data-sh-title]", { yPercent: 18, opacity: 0.2, ease: "none", scrollTrigger: { trigger: root.current!, start: "top top", end: "bottom top", scrub: true } });
    });
  });

  // drag-to-scroll for mouse users (touch scrolls natively)
  const drag = useRef({ x: 0, s: 0, on: false, moved: false });
  const onDown = (e: React.PointerEvent) => { if (e.pointerType !== "mouse") return; drag.current = { x: e.clientX, s: rail.current!.scrollLeft, on: true, moved: false }; };
  const onMove = (e: React.PointerEvent) => { const d = drag.current; if (!d.on) return; const dx = e.clientX - d.x; if (Math.abs(dx) > 5) d.moved = true; rail.current!.scrollLeft = d.s - dx; };
  const onUp = () => { drag.current.on = false; };

  return (
    <header ref={root} className="relative isolate overflow-hidden pb-10 pt-6 sm:pt-10">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_85%_0%,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_70%),radial-gradient(50%_60%_at_0%_100%,color-mix(in_srgb,var(--accent-2)_14%,transparent),transparent_70%)]" />
      <div className="container-x">
        <Breadcrumbs items={[{ label: title }]} />
        <div className="relative mt-8 grid items-end gap-6 lg:grid-cols-[1fr_auto]">
          <div data-sh-title>
            <p data-sh-fade className="eyebrow mb-4 flex items-center gap-3"><span className="h-px w-10 bg-fg/40" />{tx(eyebrow)}</p>
            <SplitText as="h1" text={tx(title)} className="display text-[clamp(3.6rem,15vw,14rem)] !leading-[0.85] rtl:!leading-[1.1]" />
            <p data-sh-fade className="lead mt-5">{tx(sub)}</p>
          </div>
          <div data-sh-num className="relative hidden pb-4 lg:block">
            <p className="display stroke-text text-[12rem] leading-none tabular">{num(total)}</p>
            <SpinBadge text={t("shop.pieces")} className="absolute -start-6 top-4 size-28 text-fg" />
          </div>
        </div>
      </div>

      <div data-sh-fade className="mt-10 border-y border-line py-3" aria-hidden>
        <Marquee speed={55} items={tags.slice(0, 10).map((x, i) => <span key={x} className="flex items-center gap-6 pe-6"><span className={`display text-2xl uppercase ${i % 2 ? "stroke-text" : ""}`}>{x}</span><span className="size-2 rounded-full bg-accent" /></span>)} />
      </div>

      <div className="container-x mt-8">
        <h2 className="eyebrow mb-4">{t("shop.browse")}</h2>
        <ul
          ref={rail} data-rail onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
          className="-mx-[var(--gutter)] flex snap-x gap-3 overflow-x-auto px-[var(--gutter)] pb-3 no-scrollbar [@media(hover:hover)]:cursor-grab"
        >
          {categories.map((c) => (
            <li key={c.id} className="w-[44vw] shrink-0 snap-start sm:w-[22vw] lg:w-[14.5vw] lg:min-w-[11rem]">
              <LocLink href={`${base}?category=${c.id}`} onClick={(e) => { if (drag.current.moved) e.preventDefault(); }} draggable={false} className="group relative block aspect-[3/4] overflow-hidden rounded-[var(--radius)]">
                <SmartImage src={c.image} alt="" fill sizes="(max-width:640px) 44vw, 15vw" draggable={false} className="object-cover transition-transform duration-[900ms] ease-[var(--ease)] group-hover:scale-110" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent transition-opacity group-hover:opacity-90" />
                <span className="absolute end-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-black opacity-0 transition duration-300 group-hover:rotate-45 group-hover:opacity-100"><ArrowUpRight size={16} className="rtl:-scale-x-100" /></span>
                <span className="absolute inset-x-3 bottom-3 text-white"><span className="display block text-xl">{l(c.name)}</span><span className="eyebrow !text-white/70">{num(counts[c.id] ?? 0)}</span></span>
                <span className="absolute inset-x-0 bottom-0 h-1 origin-[var(--o,left)] scale-x-0 transition-transform duration-500 group-hover:scale-x-100 rtl:[--o:right]" style={{ background: c.accent }} />
              </LocLink>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
