"use client";

import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { LocLink, useI18n } from "@/components/providers/i18n";
import type { DictKey } from "@/lib/i18n";
import type { Localized } from "@/lib/format";

/** Text that is either a dictionary key, a localized pair or a plain string. */
export type Txt = { key: DictKey } | Localized | string;
export function useTxt() {
  const { t, l } = useI18n();
  return (x: Txt | undefined) => (x === undefined ? "" : typeof x === "string" ? x : "key" in x ? t(x.key) : l(x));
}

export interface Crumb { label: Txt; href?: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const { t } = useI18n();
  const tx = useTxt();
  const all: Crumb[] = [{ label: { key: "nav.home" }, href: "/" }, ...items];
  return (
    <nav aria-label={t("a11y.breadcrumb")} className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5 text-muted">
        {all.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {c.href && i < all.length - 1 ? <LocLink href={c.href} className="hover:text-fg hover:underline">{tx(c.label)}</LocLink> : <span aria-current={i === all.length - 1 ? "page" : undefined} className="text-fg">{tx(c.label)}</span>}
            {i < all.length - 1 && <ChevronRight size={14} className="rtl:rotate-180" aria-hidden />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({ eyebrow, title, sub, crumbs, children, className = "" }: { eyebrow?: Txt; title: Txt; sub?: Txt; crumbs?: Crumb[]; children?: ReactNode; className?: string }) {
  const tx = useTxt();
  return (
    <header className={`container-x pb-8 pt-8 sm:pt-12 ${className}`}>
      {crumbs && <Breadcrumbs items={crumbs} />}
      <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-4xl">
          {eyebrow && <p className="eyebrow mb-3">{tx(eyebrow)}</p>}
          <h1 className="display h-lg">{tx(title)}</h1>
          {sub && <p className="lead mt-4">{tx(sub)}</p>}
        </div>
        {children}
      </div>
    </header>
  );
}

export function DemoNotice({ children }: { children: ReactNode }) {
  return <p role="note" className="rounded-2xl border border-dashed border-line bg-bg2/60 px-4 py-3 text-sm text-muted">{children}</p>;
}
