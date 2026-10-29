"use client";

import { Moon, Sun, Zap, ZapOff } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n";
import { localeMeta, locales, type Locale } from "@/config/store";

export function ThemeToggle() {
  const { t } = useI18n();
  const toggle = () => {
    const d = document.documentElement;
    const next = d.dataset.theme === "dark" ? "light" : "dark";
    const apply = () => { d.dataset.theme = next; d.style.colorScheme = next; };
    try { localStorage.setItem("vanta-theme", next); } catch { /* ignore */ }
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (doc.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) doc.startViewTransition(apply);
    else apply();
  };
  return (
    <button onClick={toggle} className="btn-icon" aria-label={t("a11y.toggleTheme")} title={t("a11y.toggleTheme")}>
      <Moon size={18} className="theme-moon" />
      <Sun size={18} className="theme-sun" />
    </button>
  );
}

export function LanguageSwitcher({ compact }: { compact?: boolean }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const other = locales.find((l) => l !== locale) as Locale;

  const go = (to: Locale) => {
    document.cookie = `vanta-locale=${to}; path=/; max-age=31536000; samesite=lax`;
    const rest = pathname.replace(/^\/(en|ar)(?=\/|$)/, "");
    router.push(`/${to}${rest}${window.location.search}${window.location.hash}`);
  };
  return (
    <button onClick={() => go(other)} className={compact ? "btn btn-ghost btn-sm" : "btn-icon !w-auto px-3 text-sm font-semibold"} aria-label={t("a11y.switchLanguage", { lang: localeMeta[other].label })} lang={other}>
      {localeMeta[other].label}
    </button>
  );
}

/** Lets people override the OS reduced-motion setting for this site (stored locally; applies on reload). */
export function MotionToggle() {
  const { t } = useI18n();
  const toggle = () => {
    const root = document.documentElement;
    const osReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const on = root.dataset.motion ? root.dataset.motion === "full" : !osReduced;
    try { localStorage.setItem("vanta-motion", on ? "reduced" : "full"); } catch { /* ignore */ }
    location.reload();
  };
  return (
    <button onClick={toggle} className="btn-icon" aria-label={t("a11y.toggleMotion")} title={t("a11y.toggleMotion")}>
      <Zap size={18} className="motion-on" /><ZapOff size={18} className="motion-off" />
    </button>
  );
}
