"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/providers/i18n";

const KEYS = [1, 2, 3, 4, 5, 6] as const;

/** Keyboard-accessible accordion (button + region, aria-expanded). */
export function FaqList({ limit }: { limit?: number }) {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(1);
  return (
    <ul className="divide-y divide-line border-y border-line">
      {KEYS.slice(0, limit).map((k) => {
        const isOpen = open === k;
        return (
          <li key={k}>
            <h3>
              <button id={`faq-q-${k}`} aria-expanded={isOpen} aria-controls={`faq-a-${k}`} onClick={() => setOpen(isOpen ? null : k)} className="flex w-full items-center justify-between gap-6 py-5 text-start text-lg font-medium">
                {t(`faq.q${k}` as never)}
                <span className={`grid size-9 shrink-0 place-items-center rounded-full border border-line transition-transform duration-300 ${isOpen ? "rotate-45 bg-accent text-on-accent" : ""}`}><Plus size={16} /></span>
              </button>
            </h3>
            <div id={`faq-a-${k}`} role="region" aria-labelledby={`faq-q-${k}`} className={`grid transition-[grid-template-rows] duration-300 ease-[var(--ease)] ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden"><p className="max-w-3xl pb-6 text-muted" inert={!isOpen}>{t(`faq.a${k}` as never)}</p></div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
