"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Reveal } from "@/components/motion/primitives";
import { SplitText } from "@/components/motion/creative";
import { LocLink, useI18n } from "@/components/providers/i18n";

export function SectionHead({ eyebrow, title, link, children, id }: { eyebrow: string; title: ReactNode; link?: { href: string; label: string }; children?: ReactNode; id?: string }) {
  return (
    <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-14">
      <div className="max-w-3xl">
        <p className="eyebrow mb-4 flex items-center gap-3"><span className="h-px w-8 bg-fg/40" />{eyebrow}</p>
        {typeof title === "string" ? <SplitText id={id} text={title} className="display h-lg" /> : <h2 id={id} className="display h-lg">{title}</h2>}
        {children && <div className="lead mt-5">{children}</div>}
      </div>
      {link && (
        <LocLink href={link.href} className="group inline-flex items-center gap-2 text-sm font-semibold">
          <span className="underline underline-offset-4">{link.label}</span>
          <span className="grid size-10 place-items-center rounded-full border border-line transition group-hover:bg-accent group-hover:text-on-accent"><ArrowRight size={16} className="rtl:rotate-180" /></span>
        </LocLink>
      )}
    </Reveal>
  );
}

/** Right-edge indicator of which homepage section is currently in view. */
export function SectionNav({ sections }: { sections: { id: string; label: string }[] }) {
  const { t } = useI18n();
  const [active, setActive] = useState(sections[0]?.id);
  useEffect(() => {
    const els = sections.map((s) => document.querySelector(`[data-section="${s.id}"]`)).filter(Boolean) as Element[];
    const io = new IntersectionObserver(
      (entries) => { const v = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]; if (v) setActive((v.target as HTMLElement).dataset.section ?? ""); },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.2, 0.5] },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [sections]);
  return (
    <nav aria-label={t("a11y.sectionNav")} className="fixed end-3 top-1/2 z-[50] hidden -translate-y-1/2 2xl:block">
      <ul className="flex flex-col items-end gap-3">
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} onClick={(e) => { e.preventDefault(); const el = document.querySelector(`[data-section="${s.id}"]`); if (el) { if (window.__lenis) (window.__lenis as unknown as { scrollTo: (e: Element) => void }).scrollTo(el); else el.scrollIntoView({ behavior: "smooth" }); }; }} aria-current={active === s.id ? "true" : undefined} className="group flex items-center gap-3 py-0.5" aria-label={s.label}>
              <span className={`text-xs transition ${active === s.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"} rounded bg-surface-2 px-2 py-0.5`}>{s.label}</span>
              <span className={`block h-1.5 rounded-full transition-all ${active === s.id ? "w-6 bg-accent" : "w-1.5 bg-fg/30 group-hover:bg-fg"}`} />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
