"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useLayoutEffect, type DependencyList, type RefObject } from "react";

let registered = false;
export function registerGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export const REDUCED = "(prefers-reduced-motion: reduce)";
export const DESKTOP = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

/**
 * Runs a GSAP setup function scoped to `scope`, with automatic cleanup (context revert + ScrollTrigger kill).
 * The callback receives a matchMedia helper so desktop-only pinning and reduced-motion variants are explicit.
 */
export function useGsapScope(
  scope: RefObject<HTMLElement | null>,
  setup: (ctx: { gsap: typeof gsap; ScrollTrigger: typeof ScrollTrigger; mm: gsap.MatchMedia }) => void,
  deps: DependencyList = [],
) {
  useIsoLayoutEffect(() => {
    if (!scope.current) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      setup({ gsap, ScrollTrigger, mm });
    }, scope);
    return () => ctx.revert();
  }, deps);
}
