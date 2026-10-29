"use client";

import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { LocLink, useI18n } from "@/components/providers/i18n";
import { SmartImage } from "@/components/ui/smart-image";

export interface AccItem { id: string; href: string; name: string; blurb: string; image: string; accent: string; meta?: string }

/** Expanding image panels: horizontal on desktop, vertical on phones. Hover / focus / tap opens a panel. */
export function ImageAccordion({ items, label }: { items: AccItem[]; label: string }) {
  const { t, num } = useI18n();
  const [active, setActive] = useState(0);
  return (
    <ul aria-label={label} className="flex h-[78svh] max-h-[760px] min-h-[520px] flex-col gap-2 lg:h-[72vh] lg:flex-row lg:gap-3">
      {items.map((it, i) => {
        const on = i === active;
        return (
          <li key={it.id} className={`relative min-h-0 min-w-0 overflow-hidden rounded-[var(--radius)] transition-[flex-grow] duration-[800ms] ease-[var(--ease)] ${on ? "grow-[7]" : "grow"} basis-0`} onMouseEnter={() => matchMedia("(hover:hover)").matches && setActive(i)}>
            <LocLink href={it.href} aria-label={it.name} onFocus={() => setActive(i)} onClick={(e) => { if (!on && !matchMedia("(hover:hover)").matches) { e.preventDefault(); setActive(i); } }} data-cursor={on ? t("cursor.view") : undefined} className="group absolute inset-0 block">
              <SmartImage src={it.image} alt="" fill sizes="(max-width:1024px) 100vw, 60vw" className={`object-cover transition-transform duration-[1400ms] ease-[var(--ease)] ${on ? "scale-100" : "scale-125"}`} />
              <span className={`absolute inset-0 transition-opacity duration-700 ${on ? "bg-gradient-to-t from-black/80 via-black/10 to-transparent" : "bg-black/45"}`} />
              <span className="absolute start-4 top-4 eyebrow !text-white/80 tabular">{String(i + 1).padStart(2, "0")}</span>
              {/* collapsed label */}
              <span className={`absolute transition-opacity duration-500 max-lg:inset-x-4 max-lg:top-1/2 max-lg:-translate-y-1/2 lg:inset-x-0 lg:bottom-6 lg:flex lg:justify-center ${on ? "opacity-0" : "opacity-100 delay-300"}`}>
                <span className="display text-xl text-white lg:[writing-mode:vertical-rl] lg:rotate-180 lg:text-3xl">{it.name}</span>
              </span>
              {/* expanded content */}
              <span className={`absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 text-white transition-all duration-700 lg:inset-x-8 lg:bottom-8 ${on ? "translate-y-0 opacity-100 delay-300" : "translate-y-6 opacity-0"}`}>
                <span className="min-w-0">
                  <span className="display block text-[clamp(2rem,5vw,4.6rem)] leading-[0.95]">{it.name}</span>
                  <span className="mt-2 block max-w-sm text-sm text-white/85">{it.blurb}</span>
                  {it.meta && <span className="eyebrow mt-3 block !text-white/70">{num(Number(it.meta))} {t("cat.items")}</span>}
                </span>
                <span className="grid size-14 shrink-0 place-items-center rounded-full text-[#0e0e10] transition-transform group-hover:rotate-45 rtl:group-hover:-rotate-45" style={{ background: it.accent }}><ArrowUpRight size={22} className="rtl:-scale-x-100" /></span>
              </span>
            </LocLink>
          </li>
        );
      })}
    </ul>
  );
}
