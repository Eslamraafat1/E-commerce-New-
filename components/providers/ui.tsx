"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Info, X, TriangleAlert } from "lucide-react";
import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/api/types";
import { useI18n } from "./i18n";

type ToastKind = "success" | "info" | "error";
interface Toast { id: number; kind: ToastKind; message: string; action?: { label: string; onClick: () => void } }
interface Flight { id: number; src: string; from: DOMRect }

interface UICtx {
  cartOpen: boolean; setCartOpen: (v: boolean) => void;
  paletteOpen: boolean; setPaletteOpen: (v: boolean) => void;
  quickView: Product | null; openQuickView: (p: Product) => void; closeQuickView: () => void;
  toast: (message: string, opts?: { kind?: ToastKind; action?: Toast["action"] }) => void;
  flyToCart: (src: string, from: DOMRect | null) => void;
  bumpKey: number;
}
const Ctx = createContext<UICtx | null>(null);
export const useUI = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useUI outside provider");
  return c;
};

const QuickView = dynamic(() => import("@/components/shop/quick-view").then((m) => m.QuickView), { ssr: false });
const CartDrawer = dynamic(() => import("@/components/shop/cart-drawer").then((m) => m.CartDrawer), { ssr: false });
const CommandPalette = dynamic(() => import("@/components/layout/command-palette").then((m) => m.CommandPalette), { ssr: false });

export function UIProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const [cartOpen, setCartOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [bumpKey, setBumpKey] = useState(0);
  const [cartEver, setCartEver] = useState(false);
  const [qvEver, setQvEver] = useState(false);
  const idRef = useRef(0);

  const toast = useCallback<UICtx["toast"]>((message, opts) => {
    const id = ++idRef.current;
    setToasts((p) => [...p.slice(-2), { id, kind: opts?.kind ?? "success", message, action: opts?.action }]);
    setTimeout(() => setToasts((p) => p.filter((x) => x.id !== id)), opts?.action ? 6000 : 3800);
  }, []);

  const flyToCart = useCallback((src: string, from: DOMRect | null) => {
    setBumpKey((k) => k + 1);
    if (!from || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = ++idRef.current;
    setFlights((p) => [...p, { id, src, from }]);
    setTimeout(() => setFlights((p) => p.filter((f) => f.id !== id)), 900);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo<UICtx>(
    () => ({
      cartOpen, setCartOpen: (v: boolean) => { if (v) setCartEver(true); setCartOpen(v); },
      paletteOpen, setPaletteOpen,
      quickView, openQuickView: (p: Product) => { setQvEver(true); setQuickView(p); }, closeQuickView: () => setQuickView(null),
      toast, flyToCart, bumpKey,
    }),
    [cartOpen, paletteOpen, quickView, toast, flyToCart, bumpKey],
  );

  const target = typeof document !== "undefined" ? document.getElementById("cart-button")?.getBoundingClientRect() : undefined;

  return (
    <Ctx.Provider value={value}>
      {children}
      {qvEver && <QuickView />}
      {cartEver && <CartDrawer />}
      {paletteOpen && <CommandPalette />}

      {/* Fly-to-cart feedback */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[120]">
        {flights.map((f) => (
          <motion.div
            key={f.id}
            className="absolute overflow-hidden rounded-2xl border border-line bg-surface shadow-xl"
            style={{ left: f.from.left, top: f.from.top, width: f.from.width, height: f.from.height, backgroundImage: `url(${f.src})`, backgroundSize: "cover", backgroundPosition: "center" }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{
              left: (target?.left ?? window.innerWidth - 60) + (target?.width ?? 0) / 2 - 20,
              top: (target?.top ?? 20) + (target?.height ?? 0) / 2 - 20,
              width: 40, height: 40, opacity: 0.2, borderRadius: 999,
            }}
            transition={{ duration: 0.75, ease: [0.55, 0, 0.2, 1] }}
          />
        ))}
      </div>

      {/* Toasts */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[130] flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-end sm:[inset-inline-end:0] sm:[inset-inline-start:auto]" role="region" aria-label={t("a11y.notifications")} aria-live="polite">
        <AnimatePresence>
          {toasts.map((x) => (
            <motion.div
              key={x.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm shadow-xl"
              role={x.kind === "error" ? "alert" : "status"}
            >
              <span className={`grid size-7 shrink-0 place-items-center rounded-full ${x.kind === "success" ? "bg-accent text-on-accent" : x.kind === "error" ? "bg-danger text-bg" : "bg-fg text-bg"}`}>
                {x.kind === "success" ? <Check size={15} /> : x.kind === "error" ? <TriangleAlert size={15} /> : <Info size={15} />}
              </span>
              <span className="flex-1">{x.message}</span>
              {x.action && (
                <button className="font-semibold underline underline-offset-4" onClick={() => { x.action!.onClick(); setToasts((p) => p.filter((y) => y.id !== x.id)); }}>
                  {x.action.label}
                </button>
              )}
              <button aria-label={t("common.close")} className="opacity-60 hover:opacity-100" onClick={() => setToasts((p) => p.filter((y) => y.id !== x.id))}>
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
