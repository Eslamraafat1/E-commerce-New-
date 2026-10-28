"use client";

import { store } from "@/config/store";
import { LocLink } from "@/components/providers/i18n";

/** Animated brand mark: two strokes forming a V with an accent point. Colours come from CSS tokens. */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="group-hover/logo:[&_.v-r]:translate-x-[1px]">
      <path className="v-l" d="M3 5 L16 28" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" fill="none" style={{ strokeDasharray: 26, strokeDashoffset: 0 }} />
      <path className="v-r transition-transform duration-500" d="M29 5 L16 28" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" fill="none" />
      <circle cx="16" cy="5.5" r="3" className="fill-[var(--accent)] transition-transform duration-500 origin-center group-hover/logo:scale-125" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <LocLink href="/" aria-label={`${store.name} — home`} className={`group/logo inline-flex items-center gap-2 ${className}`}>
      <LogoMark />
      <span className="display text-[1.55rem] leading-none tracking-[-0.06em] rtl:tracking-normal">{store.name}</span>
    </LocLink>
  );
}
