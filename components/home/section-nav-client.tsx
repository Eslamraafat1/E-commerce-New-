"use client";

import { useI18n } from "@/components/providers/i18n";
import { SectionNav } from "./section-bits";

/** Active-section indicator for the homepage (wide screens). */
export function SectionNavClient() {
  const { t } = useI18n();
  const sections = [
    { id: "hero", label: t("nav.home") },
    { id: "categories", label: t("nav.categories") },
    { id: "trending", label: t("trend.title") },
    { id: "showcase", label: t("show.eyebrow") },
    { id: "new", label: t("nav.new") },
    { id: "best", label: t("nav.best") },
    { id: "focus", label: t("focus.eyebrow") },
    { id: "bento", label: t("bento.eyebrow") },
    { id: "collections", label: t("nav.collections") },
    { id: "brand", label: t("story2.eyebrow") },
    { id: "journal", label: t("nav.journal") },
    { id: "faq", label: t("nav.faq") },
  ];
  return <SectionNav sections={sections} />;
}
