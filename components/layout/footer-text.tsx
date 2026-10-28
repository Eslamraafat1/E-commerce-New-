"use client";

import type { ReactNode } from "react";
import { store } from "@/config/store";
import { LocLink, useI18n } from "@/components/providers/i18n";
import type { Localized } from "@/lib/format";

interface Props {
  logo: ReactNode;
  newsletter: ReactNode;
  categories: { href: string; name: Localized }[];
  social: { id: string; label: string; href: string }[];
}

export function FooterText({ logo, newsletter, categories, social }: Props) {
  const { t, l } = useI18n();
  const col = "space-y-2.5 text-sm";
  const a = "text-muted transition-colors hover:text-fg";
  const hasContact = !!(store.contact.email || store.contact.phone || store.contact.address);
  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="lg:col-span-5">
        {logo}
        <p className="mt-4 max-w-sm text-muted">{t("footer.blurb")}</p>
        <p className="eyebrow mb-3 mt-8">{t("footer.newsletter")}</p>
        <div className="max-w-md">{newsletter}</div>
      </div>
      <nav aria-label={t("footer.shop")} className="lg:col-span-2">
        <p className="eyebrow mb-4">{t("footer.shop")}</p>
        <ul className={col}>
          <li><LocLink className={a} href="/shop">{t("nav.shopAll")}</LocLink></li>
          <li><LocLink className={a} href="/new-arrivals">{t("nav.new")}</LocLink></li>
          <li><LocLink className={a} href="/best-sellers">{t("nav.best")}</LocLink></li>
          <li><LocLink className={a} href="/collections">{t("nav.collections")}</LocLink></li>
          {categories.slice(0, 3).map((c) => <li key={c.href}><LocLink className={a} href={c.href}>{l(c.name)}</LocLink></li>)}
        </ul>
      </nav>
      <nav aria-label={t("footer.support")} className="lg:col-span-2">
        <p className="eyebrow mb-4">{t("footer.support")}</p>
        <ul className={col}>
          <li><LocLink className={a} href="/contact">{t("nav.contact")}</LocLink></li>
          <li><LocLink className={a} href="/faq">{t("nav.faq")}</LocLink></li>
          <li><LocLink className={a} href="/account/orders">{t("account.orders")}</LocLink></li>
          <li><LocLink className={a} href="/account">{t("nav.account")}</LocLink></li>
          <li><LocLink className={a} href="/about">{t("nav.about")}</LocLink></li>
          <li><LocLink className={a} href="/journal">{t("nav.journal")}</LocLink></li>
        </ul>
      </nav>
      <nav aria-label={t("footer.policies")} className="lg:col-span-3">
        <p className="eyebrow mb-4">{t("footer.policies")}</p>
        <ul className={col}>
          <li><LocLink className={a} href="/policies/shipping">{t("policy.shipping")}</LocLink></li>
          <li><LocLink className={a} href="/policies/returns">{t("policy.returns")}</LocLink></li>
          <li><LocLink className={a} href="/policies/privacy">{t("policy.privacy")}</LocLink></li>
          <li><LocLink className={a} href="/policies/terms">{t("policy.terms")}</LocLink></li>
          <li><LocLink className={a} href="/admin">{t("nav.admin")}</LocLink></li>
        </ul>
        <ul className="mt-6 flex flex-wrap gap-2" aria-label={t("footer.social")}>
          {social.map((s) => <li key={s.id}><a href={s.href} className="chip" rel="noopener">{s.label}</a></li>)}
        </ul>
        {hasContact && (
          <address className="mt-6 space-y-1 text-sm not-italic text-muted">
            {store.contact.email && <p>{store.contact.email}</p>}
            {store.contact.phone && <p dir="ltr">{store.contact.phone}</p>}
            {store.contact.address && <p>{store.contact.address}</p>}
          </address>
        )}
      </nav>
      <div className="flex flex-col gap-2 border-t border-line pt-6 text-xs text-muted lg:col-span-12 lg:flex-row lg:justify-between">
        <p>© {store.name}. {t("footer.rights")}</p>
        <p>{t("footer.demo")}</p>
      </div>
    </div>
  );
}
