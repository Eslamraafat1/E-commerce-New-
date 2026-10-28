"use client";

import { LocLink, useI18n } from "@/components/providers/i18n";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="container-x grid min-h-[70dvh] place-items-center py-24 text-center">
      <div>
        <p className="display h-xl text-accent-ink">404</p>
        <h1 className="display h-md mt-4">{t("404.title")}</h1>
        <p className="lead mx-auto mt-4">{t("404.text")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LocLink href="/" className="btn btn-primary">{t("404.home")}</LocLink>
          <LocLink href="/shop" className="btn btn-ghost">{t("nav.shopAll")}</LocLink>
        </div>
      </div>
    </div>
  );
}
