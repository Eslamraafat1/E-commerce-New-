"use client";

import { ArrowUpRight } from "lucide-react";
import { useRef, useState } from "react";
import { REDUCED, registerGsap } from "@/components/motion/gsap";
import { LocLink, useI18n } from "@/components/providers/i18n";
import { SmartImage } from "@/components/ui/smart-image";
import type { Article } from "@/lib/api/types";

/** Editorial index: big titles, with a preview image that follows the cursor (thumbnails on touch). */
export function JournalList({ articles }: { articles: Article[] }) {
  const { l, t, date } = useI18n();
  const [active, setActive] = useState(0);
  const pv = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !pv.current || window.matchMedia(REDUCED).matches) return;
    const { gsap } = registerGsap();
    gsap.to(pv.current, { x: e.clientX, y: e.clientY, duration: 0.5, ease: "power3.out" });
  };
  return (
    <div onPointerMove={move} onPointerLeave={() => pv.current && registerGsap().gsap.to(pv.current, { opacity: 0, scale: 0.8, duration: 0.3 })} onPointerEnter={(e) => e.pointerType === "mouse" && pv.current && registerGsap().gsap.to(pv.current, { opacity: 1, scale: 1, duration: 0.4 })}>
      <ul className="border-t border-line">
        {articles.map((a, i) => (
          <li key={a.slug} className="border-b border-line">
            <LocLink href={`/journal/${a.slug}`} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-6 transition-[padding] duration-500 hover:ps-6 sm:gap-8 sm:py-9 rtl:hover:pe-6 rtl:hover:ps-0">
              <span className="eyebrow tabular">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0">
                <span className="eyebrow block">{l(a.category)} · {date(a.date)} · {t("jr.read", { n: a.readMinutes })}</span>
                <span className="display mt-1 block text-[clamp(1.4rem,3.6vw,3.4rem)] !leading-[1.05] transition-colors group-hover:text-accent-ink rtl:!leading-[1.3]">{l(a.title)}</span>
              </span>
              <span className="relative block size-16 shrink-0 overflow-hidden rounded-2xl sm:hidden"><SmartImage src={a.image} alt="" fill sizes="64px" className="object-cover" /></span>
              <span className="hidden size-14 place-items-center rounded-full border border-line transition group-hover:rotate-45 group-hover:bg-accent group-hover:text-on-accent sm:grid"><ArrowUpRight size={20} className="rtl:-scale-x-100" /></span>
            </LocLink>
          </li>
        ))}
      </ul>
      <div ref={pv} aria-hidden className="pointer-events-none fixed start-0 top-0 z-[60] opacity-0 max-sm:hidden [@media(hover:none)]:hidden">
        <div className="relative -ms-36 -mt-44 h-[22rem] w-72 overflow-hidden rounded-3xl shadow-2xl">
          {articles.map((a, i) => (
            <div key={a.slug} className={`absolute inset-0 transition-all duration-500 ${i === active ? "scale-100 opacity-100" : "scale-110 opacity-0"}`}><SmartImage src={a.image} alt="" fill sizes="300px" className="object-cover" /></div>
          ))}
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 p-4 pt-10 text-sm font-semibold text-white">{t("jr.hover")} →</span>
        </div>
      </div>
    </div>
  );
}
