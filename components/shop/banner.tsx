"use client";

import { LocLink, useI18n } from "@/components/providers/i18n";
import { SmartImage } from "@/components/ui/smart-image";
import { Breadcrumbs, type Crumb } from "@/components/ui/page-header";
import type { Category, Collection } from "@/lib/api/types";

/** Image banner for category / collection detail pages. */
export function DetailBanner({ item, crumbs, kind }: { item: Category | Collection; crumbs: Crumb[]; kind: "category" | "collection" }) {
  const { l, t } = useI18n();
  return (
    <header className="relative isolate overflow-hidden">
      <SmartImage src={item.image} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--bg)_55%,transparent),var(--bg))]" />
      <div className="container-x pb-12 pt-10 sm:pb-20 sm:pt-16">
        <Breadcrumbs items={crumbs} />
        <p className="eyebrow mt-16">{kind === "category" ? t("nav.categories") : t("nav.collections")}</p>
        <h1 className="display h-xl mt-3">{l(item.name)}</h1>
        <p className="lead mt-4 !text-fg/80">{l(item.blurb)}</p>
      </div>
    </header>
  );
}

export function CategoryGrid({ items, counts }: { items: (Category | Collection)[]; counts?: Record<string, number> }) {
  const { l, num, t } = useI18n();
  const base = "accent" in (items[0] ?? {}) ? "/categories" : "/collections";
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((c, i) => (
        <li key={c.id} className={i === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""}>
          <LocLink href={`${base}/${c.slug}`} className={`group relative block overflow-hidden rounded-[var(--radius)] ${i === 0 ? "aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[520px]" : "aspect-[4/3]"}`}>
            <SmartImage src={c.image} alt="" fill sizes="(max-width:1024px) 50vw, 33vw" className="object-cover transition-transform duration-[1200ms] group-hover:scale-110" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <span className="absolute inset-x-5 bottom-5 text-white">
              <span className="display block text-3xl sm:text-4xl">{l(c.name)}</span>
              <span className="mt-1 block text-sm text-white/80">{l(c.blurb)}</span>
              {counts && <span className="eyebrow mt-3 block !text-white/70">{t("catalog.results", { n: num(counts[c.id] ?? 0) })}</span>}
            </span>
          </LocLink>
        </li>
      ))}
    </ul>
  );
}
