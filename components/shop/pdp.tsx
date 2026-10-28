"use client";

import { motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Link2, RotateCcw, Share2, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useRef, useState, ViewTransition } from "react";
import { LocLink, useI18n } from "@/components/providers/i18n";
import { useUI } from "@/components/providers/ui";
import { SmartImage } from "@/components/ui/smart-image";
import { store } from "@/config/store";
import type { Product } from "@/lib/api/types";
import { pushRecent } from "@/lib/stores";
import { useAddToCart, WishlistButton } from "./actions";
import { Rating } from "./product-card";
import { Price, QuantityInput, StockLabel, useVariantSelection, VariantSelectors } from "./variant";

function Gallery({ p, index, setIndex }: { p: Product; index: number; setIndex: (i: number) => void }) {
  const { t, l, isRtl, num } = useI18n();
  const zoomRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(false);
  const n = p.images.length;
  const go = (d: number) => setIndex((index + d + n) % n);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = zoomRef.current!, r = el.getBoundingClientRect();
    el.style.setProperty("--zx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--zy", `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  const onDragEnd = (_: unknown, info: PanInfo) => { if (Math.abs(info.offset.x) > 60) go(info.offset.x < 0 === !isRtl ? 1 : -1); };

  return (
    <div className="flex min-w-0 flex-col-reverse gap-3 lg:flex-row lg:gap-4" role="group" aria-roledescription="carousel" aria-label={t("product.gallery")}>
      {n > 1 && (
        <ul className="flex gap-2 overflow-x-auto no-scrollbar lg:max-h-[640px] lg:flex-col lg:overflow-y-auto" data-lenis-prevent>
          {p.images.map((im, i) => (
            <li key={im.src} className="shrink-0">
              <button onClick={() => setIndex(i)} aria-label={`${t("product.image")} ${i + 1} / ${n}`} aria-current={i === index} className={`relative block size-[72px] overflow-hidden rounded-xl border-2 transition lg:size-20 ${i === index ? "border-fg" : "border-transparent opacity-70 hover:opacity-100"}`}>
                <SmartImage src={im.src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div
        ref={zoomRef}
        onPointerEnter={(e) => e.pointerType === "mouse" && setZoom(true)}
        onPointerLeave={() => setZoom(false)}
        onPointerMove={onMove}
        className="img-wrap relative aspect-[4/5] min-w-0 flex-1 cursor-zoom-in rounded-[var(--radius)] lg:aspect-[5/6]"
        style={{ ["--zx" as string]: "50%", ["--zy" as string]: "50%" }}
      >
        <motion.div className="absolute inset-0" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd={onDragEnd}>
          <ViewTransition name={`product-${p.id}`} share="morph" default="none">
            <span className="absolute inset-0">
              <SmartImage key={p.images[index].src} src={p.images[index].src} alt={l(p.images[index].alt)} fill priority sizes="(max-width:1024px) 100vw, 55vw" className={`select-none object-cover transition-transform duration-500 ease-out ${zoom ? "scale-[1.8]" : "scale-100"}`} style={{ transformOrigin: "var(--zx) var(--zy)" }} draggable={false} />
            </span>
          </ViewTransition>
        </motion.div>
        {n > 1 && (
          <>
            <button className="btn-icon absolute start-3 top-1/2 -translate-y-1/2 bg-surface" onClick={() => go(-1)} aria-label={t("common.prev")}><ChevronLeft size={18} className="m-auto rtl:rotate-180" /></button>
            <button className="btn-icon absolute end-3 top-1/2 -translate-y-1/2 bg-surface" onClick={() => go(1)} aria-label={t("common.next")}><ChevronRight size={18} className="m-auto rtl:rotate-180" /></button>
            <p className="absolute bottom-3 start-3 rounded-full bg-surface/80 px-3 py-1 text-xs backdrop-blur tabular" aria-live="polite">{num(index + 1)} / {num(n)}</p>
          </>
        )}
      </div>
    </div>
  );
}

export function ProductExperience({ product: p }: { product: Product }) {
  const { t, l, num, locale } = useI18n();
  const { toast } = useUI();
  const sel = useVariantSelection(p);
  const add = useAddToCart();
  const [qty, setQty] = useState(1);
  const [index, setIndex] = useState(0);
  const [tab, setTab] = useState<"details" | "specs" | "shipping" | "reviews">("details");
  const [barVisible, setBarVisible] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const imgBox = useRef<HTMLDivElement>(null);

  useEffect(() => { pushRecent(p.id); }, [p.id]);
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBarVisible(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pick = (c: string) => { sel.setColor(c); const i = p.images.findIndex((im) => im.color === c); if (i >= 0) setIndex(i); };
  const sold = p.stockStatus === "out_of_stock";
  const max = sel.variant ? Math.min(sel.variant.stock, 10) : 10;
  const cta = sold ? t("product.soldOut") : sel.needsChoice ? t("product.selectSize") : !sel.variant ? t("product.unavailable") : !sel.canAdd ? t("product.soldOut") : t("product.addToCart");

  const doAdd = () => { if (sel.variant) add(p, sel.variant, qty, imgBox.current?.getBoundingClientRect()); };
  const prompt = () => { ctaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); toast(t("product.selectSize"), { kind: "info" }); document.querySelector<HTMLElement>(`[id^="pdp-${p.id}-"]`)?.focus(); };
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: l(p.title), url });
      else { await navigator.clipboard.writeText(url); toast(t("product.linkCopied")); }
    } catch { /* cancelled */ }
  };
  const copy = async () => { try { await navigator.clipboard.writeText(window.location.href); toast(t("product.linkCopied")); } catch { toast(t("error.generic"), { kind: "error" }); } };

  const ship = store.policy.shipping;
  const tabs = [["details", t("product.tabDetails")], ["specs", t("product.tabSpecs")], ["shipping", t("product.tabShipping")], ["reviews", t("product.tabReviews")]] as const;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
      <div className="min-w-0 lg:sticky lg:top-24 lg:self-start" ref={imgBox}>
        <Gallery p={p} index={index} setIndex={setIndex} />
      </div>

      <div className="min-w-0 space-y-7">
        <div>
          <p className="eyebrow flex items-center gap-2">
            {p.tags.slice(0, 2).map((x) => <span key={x} className="capitalize">{x}</span>)}
            {p.badge && <span className={`badge ${p.badge === "sale" ? "badge-sale" : "badge-accent"}`}>{t(`badge.${p.badge}` as never)}</span>}
          </p>
          <h1 className="display mt-3 text-[clamp(2.2rem,5vw,4.4rem)]">{l(p.title)}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Price price={sel.price} compareAt={sel.compareAt} from={sel.varies} size="lg" />
            <Rating p={p} />
          </div>
          <p className="mt-5 max-w-prose text-muted">{l(p.description)}</p>
        </div>

        <VariantSelectors p={p} sel={{ ...sel, setColor: pick }} idPrefix={`pdp-${p.id}`} />
        <StockLabel variant={sel.variant} needsChoice={sel.needsChoice} />

        <div ref={ctaRef} className="flex flex-wrap items-center gap-3">
          <QuantityInput value={qty} max={max} onChange={setQty} />
          <button className="btn btn-primary min-w-0 flex-1 !min-h-[56px] text-base" disabled={sold || (!sel.needsChoice && !sel.canAdd)} onClick={sel.needsChoice ? prompt : doAdd}>{cta}</button>
          <WishlistButton product={p} className="!size-[56px]" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-ghost btn-sm" onClick={share}><Share2 size={15} />{t("product.share")}</button>
          <button className="btn btn-ghost btn-sm" onClick={copy}><Link2 size={15} />{t("product.copyLink")}</button>
        </div>

        <ul className="grid gap-3 rounded-[var(--radius)] border border-line p-4 text-sm sm:grid-cols-2">
          <li className="flex gap-3"><Truck size={18} className="mt-0.5 shrink-0" />{t("product.shipLine", { days: `${num(ship.standard.etaDays[0])}–${num(ship.standard.etaDays[1])}` })}</li>
          <li className="flex gap-3"><RotateCcw size={18} className="mt-0.5 shrink-0" />{t("product.returnLine", { days: num(store.policy.returnsDays) })}</li>
          <li className="flex gap-3 sm:col-span-2"><ShieldCheck size={18} className="mt-0.5 shrink-0" />{t("product.demoLine")}</li>
        </ul>

        <section aria-label={t("product.info")}>
          <div role="tablist" aria-label={t("product.info")} className="flex gap-1 overflow-x-auto no-scrollbar border-b border-line">
            {tabs.map(([id, label]) => (
              <button key={id} role="tab" id={`tab-${id}`} aria-selected={tab === id} aria-controls={`panel-${id}`} tabIndex={tab === id ? 0 : -1}
                onClick={() => setTab(id)}
                onKeyDown={(e) => { const i = tabs.findIndex((x) => x[0] === tab); const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (d) { const dd = locale === "ar" ? -d : d; const nx = tabs[(i + dd + tabs.length) % tabs.length][0]; setTab(nx); document.getElementById(`tab-${nx}`)?.focus(); } }}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${tab === id ? "border-fg" : "border-transparent text-muted hover:text-fg"}`}>{label}</button>
            ))}
          </div>
          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} tabIndex={0} className="py-5 text-sm leading-relaxed">
            {tab === "details" && <p className="max-w-prose text-muted">{l(p.description)} {t("product.detailsExtra")}</p>}
            {tab === "specs" && (
              <>
                <dl className="divide-y divide-line">
                  {p.specs.map((s, i) => <div key={i} className="flex justify-between gap-4 py-3"><dt className="text-muted">{l(s.label)}</dt><dd className="text-end font-medium">{l(s.value)}</dd></div>)}
                  {sel.variant && <div className="flex justify-between gap-4 py-3"><dt className="text-muted">SKU</dt><dd className="font-mono" dir="ltr">{sel.variant.sku}</dd></div>}
                </dl>
                <p className="mt-3 text-xs text-muted">{t("product.demoSpecs")}</p>
              </>
            )}
            {tab === "shipping" && (
              <ul className="space-y-2 text-muted">
                <li>{t("ship.standard")}: {num(ship.standard.etaDays[0])}–{num(ship.standard.etaDays[1])} {t("ship.days")}</li>
                <li>{t("ship.express")}: {num(ship.express.etaDays[0])}–{num(ship.express.etaDays[1])} {t("ship.days")}</li>
                <li>{t("product.returnLine", { days: num(store.policy.returnsDays) })}</li>
                <li><LocLink className="underline" href="/policies/shipping">{t("policy.shipping")}</LocLink> · <LocLink className="underline" href="/policies/returns">{t("policy.returns")}</LocLink></li>
              </ul>
            )}
            {tab === "reviews" && (
              <div className="space-y-4">
                {p.rating ? <Rating p={p} /> : <p className="text-muted">{t("product.noReviews")}</p>}
                <p className="rounded-xl bg-bg2 p-3 text-xs text-muted">{t("product.reviewsDemo")}</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Mobile sticky purchase bar */}
      <div aria-hidden={!barVisible} className={`fixed inset-x-0 bottom-0 z-[55] border-t border-line bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl transition-transform duration-300 lg:hidden ${barVisible ? "translate-y-0" : "translate-y-full"}`}>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{l(p.title)}</p>
            <Price price={sel.price} compareAt={sel.compareAt} from={sel.varies} size="sm" />
          </div>
          <button className="btn btn-primary shrink-0" tabIndex={barVisible ? 0 : -1} disabled={sold || (!sel.needsChoice && !sel.canAdd)} onClick={sel.needsChoice ? prompt : doAdd}>
            {sel.needsChoice ? t("product.selectSize") : t("product.addToCart")}
          </button>
        </div>
      </div>
    </div>
  );
}
