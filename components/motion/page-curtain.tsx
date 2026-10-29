"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { REDUCED, registerGsap } from "./gsap";

/** Accent curtain that wipes upward on every route change (skipped for reduced motion and first load). */
export function PageCurtain() {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (window.matchMedia(REDUCED).matches) return;
    const { gsap } = registerGsap();
    const el = ref.current!;
    const tl = gsap.timeline();
    tl.set(el, { yPercent: 0, autoAlpha: 1 }).to(el.children, { yPercent: -101, duration: 0.8, stagger: 0.07, ease: "expo.inOut" }, 0.05).set(el, { autoAlpha: 0 }).set(el.children, { yPercent: 0 });
    return () => { tl.kill(); };
  }, [pathname]);
  return (
    <div ref={ref} aria-hidden className="pointer-events-none invisible fixed inset-0 z-[110] flex">
      {[0, 1, 2, 3, 4].map((i) => <span key={i} className={`h-full flex-1 ${i % 2 ? "bg-fg" : "bg-accent"}`} />)}
    </div>
  );
}
