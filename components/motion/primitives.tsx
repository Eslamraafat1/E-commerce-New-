"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { useI18n } from "@/components/providers/i18n";
import { DESKTOP, REDUCED, registerGsap, useGsapScope } from "./gsap";

/** 1. Magnetic control — only on fine-pointer desktops; touch behaves normally. */
export function Magnetic({ children, strength = 0.35, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.matchMedia(REDUCED).matches) return;
    const { gsap } = registerGsap();
    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => { xTo(0); yTo(0); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); gsap.killTweensOf(el); gsap.set(el, { clearProps: "transform" }); };
  }, [strength]);
  return <span ref={ref} className={`inline-flex ${className}`}>{children}</span>;
}

/** 2. Cinematic image reveal — clip-path mask + inner scale, triggered once on entering the viewport. */
export function ImageReveal({ children, className = "", direction = "up", parallax = 0 }: { children: ReactNode; className?: string; direction?: "up" | "left" | "right"; parallax?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGsapScope(ref, ({ gsap, mm }) => {
    mm.add(`(prefers-reduced-motion: no-preference)`, () => {
      const el = ref.current!;
      const inner = el.querySelector<HTMLElement>("[data-reveal-inner]");
      const from = direction === "up" ? "inset(100% 0% 0% 0%)" : direction === "left" ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)";
      gsap.fromTo(el, { clipPath: from }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.25, ease: "power4.inOut", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      if (inner) {
        gsap.fromTo(inner, { scale: 1.28 }, { scale: 1, duration: 1.6, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
        if (parallax) gsap.to(inner, { yPercent: parallax, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      }
    });
  });
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <div data-reveal-inner className="h-full w-full will-change-transform">{children}</div>
    </div>
  );
}

/** Text/block reveal: fades and lifts children marked [data-line] (or itself) when scrolled into view. */
export function Reveal({ as: Tag = "div", children, className = "", delay = 0 }: { as?: ElementType; children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLElement>(null);
  useGsapScope(ref as React.RefObject<HTMLElement>, ({ gsap, mm }) => {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(ref.current!, { y: 44, opacity: 0, duration: 1, delay, ease: "power3.out", scrollTrigger: { trigger: ref.current!, start: "top 90%", once: true } });
    });
  });
  return <Tag ref={ref} className={className}>{children}</Tag>;
}

/** Scroll progress bar. Fixed + transform-only → zero layout shift. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 40, mass: 0.4 });
  const { t } = useI18n();
  return (
    <motion.div
      role="progressbar"
      aria-label={t("a11y.scrollProgress")}
      aria-hidden
      style={{ scaleX, transformOrigin: "var(--progress-origin, 0%) 50%" }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] bg-accent [--progress-origin:0%] rtl:[--progress-origin:100%]"
    />
  );
}

export function BackToTop() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 900);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const go = () => {
    const reduced = window.matchMedia(REDUCED).matches;
    if (window.__lenis && !reduced) (window.__lenis as unknown as { scrollTo: (n: number) => void }).scrollTo(0);
    else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };
  return (
    <motion.button
      onClick={go}
      aria-label={t("a11y.backToTop")}
      tabIndex={show ? 0 : -1}
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 20, pointerEvents: show ? "auto" : "none" }}
      className="btn-icon fixed bottom-[max(1rem,env(safe-area-inset-bottom))] z-[60] bg-surface-2 shadow-lg max-lg:bottom-24 end-4"
    >
      <ArrowUp size={18} />
    </motion.button>
  );
}

/** Continuous marquee; the second track is aria-hidden duplicate content. */
export function Marquee({ items, className = "", speed = 40 }: { items: ReactNode[]; className?: string; speed?: number }) {
  return (
    <div className={`marquee ${className}`} style={{ ["--marquee-speed" as string]: `${speed}s` }}>
      {[0, 1].map((k) => (
        <div key={k} className="marquee-track" aria-hidden={k === 1 || undefined}>
          {items.map((it, i) => (
            <span key={i} className="flex shrink-0 items-center">{it}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

export { DESKTOP, REDUCED };
