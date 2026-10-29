"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Link2, RotateCcw, Share2, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useRef, useState, ViewTransition } from "react";
import { Magnetic } from "@/components/motion/primitives";
import { ScrollText, SplitText } from "@/components/motion/creative";
import { useGsapScope } from "@/components/motion/gsap";
import { LocLink, useI18n } from "@/components/providers/i18n";
import { useUI } from "@/components/providers/ui";
import { SmartImage } from "@/components/ui/smart-image";
import { store } from "@/config/store";
import type { Product } from "@/lib/api/types";
import { pushRecent } from "@/lib/stores";
import { useAddToCart, WishlistButton } from "./actions";
import { Rating } from "./product-card";
import { Price, QuantityInput, StockLabel, useVariantSelection, VariantSelectors } from "./variant";

/** Desktop: tall stacked gallery with per-image cursor zoom. Selected colour scrolls its photo into view. */
function StackGallery({ p, focus }: { p: Product; focus: number }) {
  const { l, t } = useI18n();
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [flash, setFlash] = useState(-1);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const el = refs.current[focus];
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top < 80 || r.bottom > window.innerHeight) {
      const lenis = window.__lenis as unknown as { scrollTo: (e: Element, o?: object) => void } | undefined;
      if (lenis) lenis.scrollTo(el, { offset: -100 }); else el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    const a = setTimeout(() => setFlash(focus), 0), b = setTimeout(() => setFlash(-1), 1200);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [focus]);

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--zx", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--zy", `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  return (
    <div className="grid grid-cols-2 gap-3" role="group" aria-label={t("product.gallery")}>
      {p.images.map((im, i) => (
        <div
          key={im.src} ref={(el) => { refs.current[i] = el; }} onPointerMove={move}
          data-cursor={t("cursor.zoom")}
          className={`img-wrap group relative rounded-[var(--radius)] transition-shadow duration-500 ${i === 0 || p.images.length % 2 === 0 && i === p.images.length - 1 && false ? "col-span-2 aspect-[5/5.6]" : "aspect-[4/5]"} ${i === p.images.length - 1 && i % 2 === 1 ? "col-span-2 !aspect-[16/10]" : ""} ${flash === i ? "shadow-[0_0_0_4px_var(--accent)]" : ""}`}
          style={{ ["--zx" as string]: "50%", ["--zy" as string]: "50%" }}
        >
          {i === 0 ? (
            <ViewTransition name={`product-${p.id}`} share="morph" default="none">
              <span className="absolute inset-0"><SmartImage src={im.src} alt={l(im.alt)} fill priority sizes="(max-width:1280px) 50vw, 40vw" className="object-cover transition-transform duration-700 ease-out [@media(hover:hover)]:group-hover:scale-[1.7]" style={{ transformOrigin: "var(--zx) var(--zy)" }} /></span>
            </ViewTransition>
          ) : (
            <SmartImage src={im.src} alt={l(im.alt)} fill sizes="(max-width:1280px) 25vw, 20vw" className="object-cover transition-transform duration-700 ease-out [@media(hover:hover)]:group-hover:scale-[1.7]" style={{ transformOrigin: "var(--zx) var(--zy)" }} />
          )}
          <span className="absolute start-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[0.7rem] text-white tabular backdrop-blur">{String(i + 1).padStart(2, "0")}</span>
        </div>
      ))}
    </div>
  );
}

/** Mobile / tablet: swipeable carousel with thumbnails. */
function Carousel({ p, index, setIndex }: { p: Product; index: number; setIndex: (i: number) => void }) {
  const { t, l, isRtl, num } = useI18n();
  const n = p.images.length;
  const go = (d: number) => setIndex((index + d + n) % n);
  const onDragEnd = (_: unknown, info: PanInfo) => { if (Math.abs(info.offset.x) > 60) go(info.offset.x < 0 === !isRtl ? 1 : -1); };
  return (
    <div className="flex min-w-0 flex-col gap-3" role="group" aria-roledescription="carousel" aria-label={t("product.gallery")}>
      <div className="img-wrap relative aspect-[4/5] rounded-[var(--radius)]">
        <motion.div className="absolute inset-0" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd={onDragEnd}>
          <AnimatePresence initial={false}>
            <motion.div key={index} className="absolute inset-0" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
              <SmartImage src={p.images[index].src} alt={l(p.images[index].alt)} fill priority sizes="100vw" className="select-none object-cover" draggable={false} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        {n > 1 && (
          <>
            <button className="btn-icon absolute start-3 top-1/2 -translate-y-1/2 bg-surface" onClick={() => go(-1)} aria-label={t("common.prev")}><ChevronLeft size={18} className="rtl:rotate-180" /></button>
            <button className="btn-icon absolute end-3 top-1/2 -translate-y-1/2 bg-surface" onClick={() => go(1)} aria-label={t("common.next")}><ChevronRight size={18} className="rtl:rotate-180" /></button>
            <p className="absolute bottom-3 start-3 rounded-full bg-surface/80 px-3 py-1 text-xs tabular backdrop-blur" aria-live="polite">{num(index + 1)} / {num(n)}</p>
          </>
        )}
      </div>
      {n > 1 && (
        <ul className="flex gap-2 overflow-x-auto no-scrollbar">
          {p.images.map((im, i) => (
            <li key={im.src} className="shrink-0"><button onClick={() => setIndex(i)} aria-label={`${t("product.image")} ${i + 1} / ${n}`} aria-current={i === index} className={`relative block size-[72px] overflow-hidden rounded-xl border-2 transition ${i === index ? "border-fg" : "border-transparent opacity-70"}`}><SmartImage src={im.src} alt="" fill sizes="72px" className="object-cover" /></button></li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Scroll-driven editorial story below the purchase area: marquee, word reveal, spec cards, policies, reviews. */
function ProductStory({ p }: { p: Product }) {
  const { t, l, num } = useI18n();
  const root = useRef<HTMLElement>(null);
  useGsapScope(root, ({ gsap, ScrollTrigger, mm }) => {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo("[data-w]", { opacity: 0.12 }, { opacity: 1, stagger: 0.06, ease: "none", scrollTrigger: { trigger: "[data-words]", start: "top 80%", end: "bottom 50%", scrub: true } });
      gsap.set("[data-spec]", { y: 60, opacity: 0 });
      ScrollTrigger.batch("[data-spec]", { start: "top 90%", once: true, onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, stagger: 0.1, duration: 0.9, ease: "expo.out" }) });
    });
  });
  const ship = store.policy.shipping;
  const words = l(p.description).split(" ");
  return (
    <section ref={root} aria-label={t("product.info")} className="mt-24">
      <ScrollText text={l(p.title)} />
      <p data-words className="display mx-auto max-w-5xl text-[clamp(1.8rem,4.4vw,4rem)] !leading-[1.08] rtl:!leading-[1.35]">
        {words.map((w, i) => <span key={i} data-w className="inline-block pe-[0.25em]">{w}</span>)}
      </p>
      <p className="mx-auto mt-4 max-w-5xl text-xs text-muted">{t("product.detailsExtra")}</p>

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        <div data-spec className="card p-6">
          <h2 className="eyebrow">{t("product.tabSpecs")}</h2>
          <dl className="mt-4 divide-y divide-line text-sm">
            {p.specs.map((s, i) => <div key={i} className="flex justify-between gap-4 py-3"><dt className="text-muted">{l(s.label)}</dt><dd className="text-end font-medium">{l(s.value)}</dd></div>)}
          </dl>
          <p className="mt-3 text-xs text-muted">{t("product.demoSpecs")}</p>
        </div>
        <div data-spec className="card p-6">
          <h2 className="eyebrow">{t("product.tabShipping")}</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-3"><Truck size={18} className="shrink-0" />{t("ship.standard")}: {num(ship.standard.etaDays[0])}–{num(ship.standard.etaDays[1])} {t("ship.days")}</li>
            <li className="flex gap-3"><Truck size={18} className="shrink-0" />{t("ship.express")}: {num(ship.express.etaDays[0])}–{num(ship.express.etaDays[1])} {t("ship.days")}</li>
            <li className="flex gap-3"><RotateCcw size={18} className="shrink-0" />{t("product.returnLine", { days: num(store.policy.returnsDays) })}</li>
          </ul>
          <p className="mt-4 text-sm"><LocLink className="underline" href="/policies/shipping">{t("policy.shipping")}</LocLink> · <LocLink className="underline" href="/policies/returns">{t("policy.returns")}</LocLink></p>
        </div>
        <div data-spec className="card p-6">
          <h2 className="eyebrow">{t("product.tabReviews")}</h2>
          {p.rating ? (
            <div className="mt-4">
              <p className="display text-6xl tabular">{num(p.rating, 1)}</p>
              <Rating p={p} className="mt-2" />
            </div>
          ) : <p className="mt-4 text-sm text-muted">{t("product.noReviews")}</p>}
          <p className="mt-4 rounded-xl bg-bg2 p-3 text-xs text-muted">{t("product.reviewsDemo")}</p>
        </div>
      </div>
    </section>
  );
}

export function ProductExperience({ product: p }: { product: Product }) {
  const { t, l } = useI18n();
  const { toast } = useUI();
  const sel = useVariantSelection(p);
  const add = useAddToCart();
  const [qty, setQty] = useState(1);
  const [index, setIndex] = useState(0);
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
  const tint = p.colors?.find((c) => c.id === sel.color)?.hex ?? "var(--accent)";

  const doAdd = () => { if (sel.variant) add(p, sel.variant, qty, imgBox.current?.getBoundingClientRect()); };
  const prompt = () => { ctaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); toast(t("product.selectSize"), { kind: "info" }); document.querySelector<HTMLElement>(`[id^="pdp-${p.id}-"]`)?.focus(); };
  const share = async () => {
    const url = window.location.href;
    try { if (navigator.share) await navigator.share({ title: l(p.title), url }); else { await navigator.clipboard.writeText(url); toast(t("product.linkCopied")); } } catch { /* cancelled */ }
  };
  const copy = async () => { try { await navigator.clipboard.writeText(window.location.href); toast(t("product.linkCopied")); } catch { toast(t("error.generic"), { kind: "error" }); } };
  const priceKey = `${sel.price}-${sel.variant?.id ?? "x"}`;

  return (
    <div className="relative overflow-x-clip">
      {/* ambient colour wash that follows the selected colour */}
      <div aria-hidden className="pointer-events-none absolute -inset-x-[10%] -top-40 -z-10 h-[70vh] opacity-30 blur-3xl transition-[background] duration-1000" style={{ background: `radial-gradient(50% 60% at 70% 30%, ${tint}, transparent 70%)` }} />

      <div className="mb-10">
        <p className="eyebrow mb-3 flex flex-wrap items-center gap-3">
          {p.tags.slice(0, 2).map((x) => <span key={x} className="capitalize">{x}</span>)}
          {p.badge && <span className={`badge ${p.badge === "sale" ? "badge-sale" : "badge-accent"}`}>{t(`badge.${p.badge}` as never)}</span>}
        </p>
        <SplitText as="h1" text={l(p.title)} className="display text-[clamp(2.6rem,8.4vw,8rem)] !leading-[0.92] rtl:!leading-[1.15]" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-14">
        <div className="min-w-0" ref={imgBox}>
          <div className="hidden lg:block"><StackGallery p={p} focus={index} /></div>
          <div className="lg:hidden"><Carousel p={p} index={index} setIndex={setIndex} /></div>
        </div>

        <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-6 rounded-[calc(var(--radius)*1.3)] border border-line bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] p-5 shadow-[var(--shadow)] backdrop-blur-xl sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div key={priceKey} initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "-100%", opacity: 0 }} transition={{ type: "spring", stiffness: 380, damping: 32 }}>
                    <Price price={sel.price} compareAt={sel.compareAt} from={sel.varies} size="lg" />
                  </motion.div>
                </AnimatePresence>
              </div>
              <Rating p={p} />
            </div>
            <p className="max-w-prose text-muted">{l(p.description)}</p>

            <VariantSelectors p={p} sel={{ ...sel, setColor: pick }} idPrefix={`pdp-${p.id}`} />
            <StockLabel variant={sel.variant} needsChoice={sel.needsChoice} />

            <div ref={ctaRef} className="flex flex-wrap items-center gap-3">
              <QuantityInput value={qty} max={max} onChange={setQty} />
              <Magnetic className="min-w-0 flex-1">
                <button className="btn btn-primary w-full !min-h-[58px] text-base" disabled={sold || (!sel.needsChoice && !sel.canAdd)} onClick={sel.needsChoice ? prompt : doAdd}>{cta}</button>
              </Magnetic>
              <WishlistButton product={p} className="!size-[58px]" />
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-ghost btn-sm" onClick={share}><Share2 size={15} />{t("product.share")}</button>
              <button className="btn btn-ghost btn-sm" onClick={copy}><Link2 size={15} />{t("product.copyLink")}</button>
            </div>
            <ul className="grid gap-3 border-t border-line pt-5 text-sm">
              <li className="flex gap-3"><Truck size={18} className="mt-0.5 shrink-0" />{t("product.shipLine", { days: `${store.policy.shipping.standard.etaDays[0]}–${store.policy.shipping.standard.etaDays[1]}` })}</li>
              <li className="flex gap-3"><RotateCcw size={18} className="mt-0.5 shrink-0" />{t("product.returnLine", { days: store.policy.returnsDays })}</li>
              <li className="flex gap-3"><ShieldCheck size={18} className="mt-0.5 shrink-0" />{t("product.demoLine")}</li>
            </ul>
          </div>
        </div>
      </div>

      <ProductStory p={p} />

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
