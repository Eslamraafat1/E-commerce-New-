"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { registerGsap } from "@/components/motion/gsap";

/** Lenis smooth scrolling, synced with GSAP ScrollTrigger. Disabled for reduced-motion and touch (native feel). */
export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduced || !fine) return;

    const { gsap, ScrollTrigger } = registerGsap();
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, anchors: true });
    window.__lenis = lenis;
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);
  return null;
}
