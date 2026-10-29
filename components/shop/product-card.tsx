"use client";

import { Eye, Plus, Star } from "lucide-react";
import { useRef, ViewTransition } from "react";
import { LocLink, useI18n } from "@/components/providers/i18n";
import { useUI } from "@/components/providers/ui";
import { SmartImage } from "@/components/ui/smart-image";
import type { Product } from "@/lib/api/types";
import { useAddToCart, WishlistButton } from "./actions";
import { Price } from "./variant";

export type CardVariant = "classic" | "tall" | "wide" | "minimal";

function Badge({ p }: { p: Product }) {
  const { t } = useI18n();
  if (p.stockStatus === "out_of_stock") return <span className="badge">{t("product.soldOut")}</span>;
  if (p.badge === "sale") return <span className="badge badge-sale">{t("badge.sale")}</span>;
  if (p.badge === "new") return <span className="badge badge-accent">{t("badge.new")}</span>;
  if (p.badge === "limited") return <span className="badge">{t("badge.limited")}</span>;
  if (p.bestSeller) return <span className="badge">{t("badge.best")}</span>;
  return null;
}

export function Rating({ p, className = "" }: { p: Product; className?: string }) {
  const { num, t } = useI18n();
  if (!p.rating) return null;
  return (
    <p className={`flex items-center gap-1 text-xs text-muted ${className}`} title={t("product.sampleRating")}>
      <Star size={13} className="fill-current text-accent2" aria-hidden />
      <span className="font-medium text-fg">{num(p.rating, 1)}</span>
      <span>({num(p.reviewCount ?? 0)})</span>
      <span className="sr-only">{t("product.sampleRating")}</span>
    </p>
  );
}

export function ProductCard({ product: p, variant = "classic", priority = false, sizes }: { product: Product; variant?: CardVariant; priority?: boolean; sizes?: string }) {
  const { t, l } = useI18n();
  const { openQuickView } = useUI();
  const add = useAddToCart();
  const imgRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const second = p.images.find((i, idx) => idx > 0 && !i.color) ?? (p.images.length > 1 ? p.images[1] : undefined);
  const simple = p.variants.length === 1 && !p.colors && !p.sizes?.length;
  const sold = p.stockStatus === "out_of_stock";
  const prices = p.variants.map((v) => v.price ?? p.price);
  const from = Math.min(...prices) !== Math.max(...prices);

  const quickAdd = () => {
    if (simple) add(p, p.variants[0], 1, imgRef.current?.getBoundingClientRect());
    else openQuickView(p);
  };

  // Subtle 3D tilt, only for fine pointers.
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = cardRef.current!, r = el.getBoundingClientRect();
    el.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * 6}deg`);
    el.style.setProperty("--gx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--gy", `${((e.clientY - r.top) / r.height) * 100}%`);
    el.style.setProperty("--rx", `${(0.5 - (e.clientY - r.top) / r.height) * 6}deg`);
  };
  const onLeave = () => { cardRef.current?.style.setProperty("--rx", "0deg"); cardRef.current?.style.setProperty("--ry", "0deg"); };

  const ratio = variant === "tall" ? "aspect-[3/4.2]" : variant === "wide" ? "aspect-square sm:aspect-[4/5] sm:w-56 shrink-0" : variant === "minimal" ? "aspect-square" : "aspect-[4/5]";
  const href = `/products/${p.slug}`;

  return (
    <article
      ref={cardRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`group/card relative ${variant === "wide" ? "flex gap-4 sm:gap-6" : "block"} [transform:perspective(900px)_rotateX(var(--rx,0))_rotateY(var(--ry,0))] transition-transform duration-300 ease-out`}
    >
      <div ref={imgRef} className={`img-wrap rounded-[var(--radius)] ${ratio} ${variant === "wide" ? "" : "w-full"}`}>
        <LocLink href={href} data-cursor={t("cursor.view")} className="absolute inset-0 z-[1]" aria-label={l(p.title)} tabIndex={-1}>
          <ViewTransition name={`product-${p.id}`} share="morph" default="none">
            <span className="absolute inset-0">
              <SmartImage src={p.images[0].src} alt={l(p.images[0].alt)} fill priority={priority} sizes={sizes ?? "(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"} className={`object-cover transition-transform duration-[900ms] ease-[var(--ease)] group-hover/card:scale-[1.06] ${sold ? "grayscale opacity-70" : ""}`} />
              {second && <SmartImage src={second.src} alt="" fill sizes="(max-width:1024px) 33vw, 25vw" className="object-cover opacity-0 transition-opacity duration-500 [@media(hover:hover)]:group-hover/card:opacity-100" />}
            </span>
          </ViewTransition>
        </LocLink>
        <span aria-hidden className="pointer-events-none absolute inset-0 z-[1] opacity-0 mix-blend-soft-light transition-opacity duration-300 [@media(hover:hover)]:group-hover/card:opacity-100" style={{ background: "radial-gradient(circle at var(--gx,50%) var(--gy,50%), rgba(255,255,255,.75), transparent 55%)" }} />
        <div className="pointer-events-none absolute inset-x-3 top-3 z-[2] flex items-start justify-between">
          <Badge p={p} />
          <span className="pointer-events-auto"><WishlistButton product={p} /></span>
        </div>
        {variant !== "minimal" && !sold && (
          <div className="absolute inset-x-3 bottom-3 z-[2] hidden gap-2 transition duration-300 [@media(hover:hover)]:flex [@media(hover:hover)]:translate-y-3 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within/card:translate-y-0 [@media(hover:hover)]:group-focus-within/card:opacity-100 [@media(hover:hover)]:group-hover/card:translate-y-0 [@media(hover:hover)]:group-hover/card:opacity-100">
            <button type="button" onClick={quickAdd} className="btn btn-dark btn-sm flex-1 !px-3" aria-label={`${t("product.quickAdd")}: ${l(p.title)}`}>
              <Plus size={16} /> {t("product.quickAdd")}
            </button>
            <button type="button" onClick={() => openQuickView(p)} className="btn-icon !size-10 !w-10 bg-surface" aria-label={`${t("product.quickView")}: ${l(p.title)}`}>
              <Eye size={17} className="m-auto" />
            </button>
          </div>
        )}
      </div>

      <div className={`${variant === "wide" ? "flex-1 py-1" : "pt-3"} min-w-0`}>
        <div className="flex items-start justify-between gap-3">
          <h3 className={`${variant === "tall" ? "display text-xl" : "font-medium"} leading-snug`}>
            <LocLink href={href} className="hover:underline underline-offset-4">{l(p.title)}</LocLink>
          </h3>
        </div>
        {variant === "wide" && <p className="mt-2 line-clamp-2 text-sm text-muted">{l(p.description)}</p>}
        <Price price={Math.min(...prices)} compareAt={from ? undefined : p.compareAtPrice} from={from} size="sm" className="mt-1" />
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <Rating p={p} />
          {p.colors && <span className="flex items-center gap-1" title={t("product.colorsCount", { n: p.colors.length })}>{p.colors.slice(0, 4).map((c) => <span key={c.id} className="size-3.5 rounded-full border border-line" style={{ background: c.hex }} />)}</span>}
          {p.stockStatus === "low_stock" && <span className="text-xs font-medium text-accent2">{t("product.lowStock")}</span>}
        </div>
        {variant === "wide" && (
          <div className="mt-4 flex gap-2">
            {!sold && <button type="button" onClick={quickAdd} className="btn btn-dark btn-sm"><Plus size={16} />{t("product.quickAdd")}</button>}
            <button type="button" onClick={() => openQuickView(p)} className="btn btn-ghost btn-sm"><Eye size={16} />{t("product.quickView")}</button>
          </div>
        )}
        {/* Touch devices have no hover: always expose Quick Add beneath the info */}
        {variant !== "wide" && variant !== "minimal" && !sold && (
          <button type="button" onClick={quickAdd} className="btn btn-ghost btn-sm mt-3 w-full [@media(hover:hover)]:hidden">
            <Plus size={16} /> {t("product.quickAdd")}
          </button>
        )}
      </div>
    </article>
  );
}
