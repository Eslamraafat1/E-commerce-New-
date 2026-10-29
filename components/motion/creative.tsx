"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { REDUCED, registerGsap, useGsapScope } from "./gsap";

/** Word-by-word masked headline reveal (works for Latin and Arabic — splits on spaces only). */
export function SplitText({ text, as: Tag = "h2", className = "", id, delay = 0, trigger = true }: { text: string; as?: ElementType; className?: string; id?: string; delay?: number; trigger?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  useGsapScope(ref as React.RefObject<HTMLElement>, ({ gsap, mm }) => {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const words = ref.current!.querySelectorAll("[data-w]");
      gsap.fromTo(words, { yPercent: 115, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 1.1, delay, stagger: 0.07, ease: "power4.out", scrollTrigger: trigger ? { trigger: ref.current!, start: "top 88%", once: true } : undefined });
    });
  }, [text]);
  return (
    <Tag ref={ref} id={id} className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <span data-w className="inline-block will-change-transform">{w}&nbsp;</span>
        </span>
      ))}
    </Tag>
  );
}

/** Large outlined text that slides horizontally as you scroll (scroll-linked marquee divider). */
export function ScrollText({ text, className = "", reverse = false }: { text: string; className?: string; reverse?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useGsapScope(ref, ({ gsap, mm }) => {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const row = ref.current!.querySelector("[data-row]")!;
      gsap.fromTo(row, { xPercent: reverse ? -25 : 0 }, { xPercent: reverse ? 0 : -25, ease: "none", scrollTrigger: { trigger: ref.current!, start: "top bottom", end: "bottom top", scrub: 0.8 } });
    });
  });
  return (
    <div ref={ref} aria-hidden className={`overflow-hidden py-6 ${className}`}>
      <div data-row className="flex w-max whitespace-nowrap">
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} className={`display pe-10 text-[clamp(4rem,12vw,11rem)] leading-[0.9] ${i % 2 ? "stroke-text" : "text-fg/90"}`}>{text} <span className="text-accent-ink">✦</span></span>
        ))}
      </div>
    </div>
  );
}

/** Staggered fade-up for freshly rendered cards ([data-card] inside the container). Re-runs for new nodes only. */
export function useCardReveal(container: React.RefObject<HTMLElement | null>, dep: unknown) {
  useEffect(() => {
    const root = container.current;
    if (!root || window.matchMedia(REDUCED).matches) return;
    const els = [...root.querySelectorAll<HTMLElement>("[data-card]:not([data-seen])")];
    if (!els.length) return;
    const { gsap } = registerGsap();
    els.forEach((e) => e.setAttribute("data-seen", ""));
    const t = gsap.fromTo(els, { y: 70, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 0.9, stagger: { each: 0.06, from: "start" }, ease: "expo.out", clearProps: "transform,opacity" });
    return () => { t.kill(); gsap.set(els, { clearProps: "all" }); };
  }, [container, dep]);
}

/** Cursor-following label bubble for [data-cursor] elements (fine pointers only). */
export function CursorBubble() {
  const ref = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.matchMedia(REDUCED).matches) return;
    const { gsap } = registerGsap();
    const el = ref.current!;
    const x = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      x(e.clientX); y(e.clientY);
      const t = (e.target as HTMLElement | null)?.closest?.("[data-cursor]") as HTMLElement | null;
      if (t) { label.current!.textContent = t.dataset.cursor ?? ""; gsap.to(el, { scale: 1, opacity: 1, duration: 0.3, overwrite: "auto" }); }
      else gsap.to(el, { scale: 0.2, opacity: 0, duration: 0.3, overwrite: "auto" });
    };
    gsap.set(el, { scale: 0.2, opacity: 0 });
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed start-0 top-0 z-[95] hidden [@media(hover:hover)]:block">
      <div className="-ms-11 -mt-11 grid size-[88px] place-items-center rounded-full bg-accent text-on-accent shadow-xl">
        <span ref={label} className="text-xs font-bold uppercase tracking-wider" />
      </div>
    </div>
  );
}

/** Rotating circular text badge. */
export function SpinBadge({ text, className = "", ...rest }: { text: string; className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={`animate-[spin_18s_linear_infinite] ${className}`} {...rest}>
      <defs><path id="spin-c" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" /></defs>
      <text fontSize="11" letterSpacing="3" fill="currentColor" className="font-mono uppercase"><textPath href="#spin-c">{text} • {text} •</textPath></text>
    </svg>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs">{children}</span>;
}
