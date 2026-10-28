"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/components/providers/i18n";
import { lockScroll } from "@/lib/scroll-lock";

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input:not([disabled]),select,[tabindex]:not([tabindex="-1"])';

type Side = "center" | "end" | "start" | "bottom";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: Side;
  hideTitle?: boolean;
  children: React.ReactNode;
  className?: string;
  /** Skip the built-in close button (e.g. when the dialog renders its own). */
  noClose?: boolean;
  initialFocus?: React.RefObject<HTMLElement | null>;
}

/** Accessible dialog: portal, focus trap + restoration, Escape, scroll lock, reduced-motion safe. */
export function Dialog({ open, onClose, title, side = "center", hideTitle, children, className = "", noClose, initialFocus }: Props) {
  const { t, isRtl } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const restore = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restore.current = document.activeElement as HTMLElement | null;
    const unlock = lockScroll();
    const node = ref.current;
    const raf = requestAnimationFrame(() => {
      const first = initialFocus?.current ?? node?.querySelector<HTMLElement>("[data-autofocus]") ?? node?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? node)?.focus({ preventScroll: true });
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); onClose(); return; }
      if (e.key !== "Tab" || !node) return;
      const items = [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (!items.length) { e.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey, true);
      unlock();
      restore.current?.focus?.({ preventScroll: true });
    };
  }, [open, onClose, initialFocus]);

  if (typeof document === "undefined") return null;

  const fromX = side === "end" ? (isRtl ? "-100%" : "100%") : side === "start" ? (isRtl ? "100%" : "-100%") : 0;
  const panel: Record<Side, string> = {
    center: "m-auto w-[min(100%-1.5rem,64rem)] max-h-[calc(100dvh-1.5rem)] rounded-[var(--radius)]",
    end: "ms-auto h-dvh w-[min(100%,28rem)] rounded-s-[var(--radius)]",
    start: "me-auto h-dvh w-[min(100%,26rem)] rounded-e-[var(--radius)]",
    bottom: "mt-auto max-h-[92dvh] w-full rounded-t-[var(--radius)]",
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex" data-lenis-prevent>
          <motion.div className="absolute inset-0 bg-[var(--scrim)] backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={`relative flex flex-col overflow-hidden border border-line bg-surface shadow-2xl outline-none ${panel[side]} ${className}`}
            initial={side === "center" ? { opacity: 0, y: 24, scale: 0.97 } : side === "bottom" ? { y: "100%" } : { x: fromX }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={side === "center" ? { opacity: 0, y: 12, scale: 0.98 } : side === "bottom" ? { y: "100%" } : { x: fromX }}
            transition={{ type: "spring", stiffness: 360, damping: 38 }}
          >
            <h2 id={titleId} className={hideTitle ? "sr-only" : "px-5 pb-1 pt-5 text-lg font-semibold pe-16"}>{title}</h2>
            {!noClose && (
              <button onClick={onClose} aria-label={t("common.close")} className="btn-icon absolute end-3 top-3 z-10 bg-surface">
                <X size={18} />
              </button>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
