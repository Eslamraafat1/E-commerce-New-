"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Eye, Plus, Search } from "lucide-react";
import { useRef, useState } from "react";
import { DESKTOP, useGsapScope } from "@/components/motion/gsap";
import { Magnetic } from "@/components/motion/primitives";
import { LocLink, useI18n } from "@/components/providers/i18n";
import { useUI } from "@/components/providers/ui";
import { useAddToCart } from "@/components/shop/actions";
import { ProductCard, Rating } from "@/components/shop/product-card";
import { Price } from "@/components/shop/variant";
import { SmartImage } from "@/components/ui/smart-image";
import type { Category, Collection, Product } from "@/lib/api/types";
import { useRouter } from "next/navigation";
import { SectionHead } from "./section-bits";

/* ─────────── 9. New arrivals ─────────── */
export function NewArrivals({ products, categories }: { products: Product[]; categories: Category[] }) {
  const { t, l } = useI18n();
  const [cat, setCat] = useState("all");
  const ids = [...new Set(products.map((p) => p.categoryId))];
  const list = cat === "all" ? products : products.filter((p) => p.categoryId === cat);
  return (
    <section data-section="new" aria-labelledby="new-title" className="section">
      <div className="container-x">
        <SectionHead id="new-title" eyebrow={t("new.eyebrow")} title={t("new.title")} link={{ href: "/new-arrivals", label: t("common.viewAll") }} />
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label={t("filter.category")}>
          <button className="chip" aria-pressed={cat === "all"} onClick={() => setCat("all")}>{t("common.all")}</button>
          {ids.map((id) => <button key={id} className="chip" aria-pressed={cat === id} onClick={() => setCat(id)}>{l(categories.find((c) => c.id === id)?.name)}</button>)}
        </div>
        <motion.ul layout className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-6">
          <AnimatePresence mode="popLayout">
            {list.slice(0, 6).map((p, i) => (
              <motion.li key={p.id} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.45, delay: i * 0.04 }}
                className={i === 0 ? "col-span-2 md:col-span-2 lg:col-span-2 lg:row-span-1" : i === 3 ? "lg:mt-16" : i === 1 || i === 5 ? "lg:mt-8" : ""}>
                <ProductCard product={p} variant={i === 0 ? "tall" : "classic"} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
}

/* ─────────── 10. Best sellers — stacked cards that change depth as you scroll ─────────── */
export function BestSellers({ products }: { products: Product[] }) {
  const { t, l, num } = useI18n();
  const { openQuickView } = useUI();
  const add = useAddToCart();
  const root = useRef<HTMLDivElement>(null);

  useGsapScope(root, ({ gsap, mm }) => {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-stack]");
      cards.forEach((c, i) => {
        if (i === cards.length - 1) return;
        gsap.to(c, { scale: 0.93, filter: "brightness(0.55)", ease: "none", scrollTrigger: { trigger: cards[i + 1], start: "top 90%", end: "top 20%", scrub: true } });
      });
    });
  });

  return (
    <section data-section="best" aria-labelledby="best-title" className="section bg-bg2/50">
      <div className="container-x">
        <SectionHead id="best-title" eyebrow={t("best.eyebrow")} title={t("best.title")} link={{ href: "/best-sellers", label: t("common.viewAll") }}>{t("best.sub")}</SectionHead>
        <div ref={root} className="relative">
          {products.map((p, i) => {
            const simple = p.variants.length === 1 && !p.colors && !p.sizes?.length;
            const sold = p.stockStatus === "out_of_stock";
            return (
              <article key={p.id} data-stack className="sticky mb-6 overflow-hidden rounded-[var(--radius)] border border-line bg-surface shadow-[var(--shadow)] will-change-transform sm:mb-10" style={{ top: `calc(var(--header-h) + ${i * 14}px)` }}>
                <div className="grid sm:grid-cols-[1fr_1.1fr] lg:grid-cols-[0.8fr_1fr]">
                  <LocLink href={`/products/${p.slug}`} className="img-wrap relative block aspect-[16/10] sm:aspect-auto sm:min-h-[320px] lg:min-h-[420px]" aria-label={l(p.title)}>
                    <SmartImage src={p.images[0].src} alt={l(p.images[0].alt)} fill sizes="(max-width:640px) 100vw, 45vw" className="object-cover" />
                    <span className="display absolute start-4 top-3 text-6xl text-white mix-blend-difference sm:text-7xl">{String(i + 1).padStart(2, "0")}</span>
                  </LocLink>
                  <div className="flex flex-col justify-between gap-6 p-6 sm:p-8 lg:p-12">
                    <div>
                      <p className="eyebrow">{t("badge.best")} · {t("best.rank", { n: num(i + 1) })}</p>
                      <h3 className="display mt-3 text-[clamp(1.6rem,3.2vw,3rem)]"><LocLink href={`/products/${p.slug}`}>{l(p.title)}</LocLink></h3>
                      <p className="mt-3 line-clamp-2 max-w-md text-muted sm:line-clamp-3">{l(p.description)}</p>
                      <Rating p={p} className="mt-3" />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <Price price={Math.min(...p.variants.map((v) => v.price ?? p.price))} compareAt={p.compareAtPrice} size="lg" />
                      <div className="flex gap-2">
                        {!sold && <button className="btn btn-primary btn-sm" onClick={() => (simple ? add(p, p.variants[0], 1) : openQuickView(p))}><Plus size={16} />{t("product.quickAdd")}</button>}
                        <button className="btn btn-ghost btn-sm" onClick={() => openQuickView(p)}><Eye size={16} />{t("product.quickView")}</button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────── 11. Product in focus — scroll-driven transformation (desktop pin) + texture spotlight ─────────── */
export function ProductInFocus({ product: p }: { product: Product }) {
  const { t, l } = useI18n();
  const root = useRef<HTMLElement>(null);
  const [pinned, setPinned] = useState(false);
  const scenes = (p.colors ?? []).map((c) => ({ c, image: p.images.find((i) => i.color === c.id) ?? p.images[0] }));

  useGsapScope(root, ({ gsap, mm }) => {
    mm.add(`${DESKTOP} and (prefers-reduced-motion: no-preference)`, () => {
      setPinned(true);
      const imgs = gsap.utils.toArray<HTMLElement>("[data-scene-img]");
      const txt = gsap.utils.toArray<HTMLElement>("[data-scene-txt]");
      const stage = root.current!.querySelector<HTMLElement>("[data-stage]")!;
      const prog = root.current!.querySelector<HTMLElement>("[data-prog]");
      gsap.set(imgs.slice(1), { autoAlpha: 0 });
      gsap.set(txt.slice(1), { autoAlpha: 0, y: 40 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: stage, start: "top top", end: `+=${scenes.length * 90}%`, pin: true, scrub: 0.7, anticipatePin: 1, onUpdate: (s) => prog && (prog.style.transform = `scaleY(${s.progress})`) } });
      tl.fromTo(imgs[0], { scale: 0.8, rotate: -8, yPercent: 8 }, { scale: 1, rotate: 0, yPercent: 0, duration: 1 }, 0);
      scenes.forEach((s, i) => {
        const at = i * 2 + 1;
        if (i > 0) {
          tl.to(imgs[i - 1], { autoAlpha: 0, scale: 0.85, rotate: 10, xPercent: -12, duration: 1 }, at - 1)
            .fromTo(imgs[i], { autoAlpha: 0, scale: 1.2, rotate: -10, xPercent: 12 }, { autoAlpha: 1, scale: 1, rotate: 0, xPercent: 0, duration: 1 }, at - 1)
            .to(txt[i - 1], { autoAlpha: 0, y: -40, duration: 0.6 }, at - 1)
            .to(txt[i], { autoAlpha: 1, y: 0, duration: 0.6 }, at - 0.5)
            .to(stage, { backgroundColor: s.c.hex, duration: 1 }, at - 1);
        }
      });
      return () => { setPinned(false); };
    });
  }, [scenes.length]);

  if (!scenes.length) return null;
  return (
    <section ref={root} data-section="focus" aria-labelledby="focus-title" className="relative">
      <div data-stage className={`relative overflow-hidden transition-colors ${pinned ? "h-screen" : ""}`} style={{ backgroundColor: scenes[0].c.hex }}>
        <div className="container-x relative grid min-h-full items-center gap-8 py-20 lg:h-full lg:grid-cols-2 lg:py-0">
          <div className="relative text-[#0e0e10]">
            <p className="eyebrow !text-[#0e0e10]/70">{t("focus.eyebrow")}</p>
            <h2 id="focus-title" className="display h-lg mt-4">{l(p.title)}</h2>
            <div className={pinned ? "relative mt-8 h-40 max-w-md" : "mt-8 space-y-8"}>
              {scenes.map((s, i) => (
                <div key={s.c.id} data-scene-txt className={pinned ? "absolute inset-0" : ""}>
                  <p className="display text-2xl">{String(i + 1).padStart(2, "0")} — {l(s.c.name)}</p>
                  <p className="mt-2 max-w-sm text-[#0e0e10]/75">{t(`focus.s${i + 1}` as never)}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-5">
              <Magnetic><LocLink href={`/products/${p.slug}`} className="btn btn-dark !bg-[#0e0e10] !text-white">{t("story.cta")} <ArrowRight size={18} className="rtl:rotate-180" /></LocLink></Magnetic>
              <Price price={p.price} className="!text-[#0e0e10]" />
            </div>
          </div>
          <div className={pinned ? "relative h-[70vh]" : "space-y-6"}>
            {scenes.map((s) => (
              <div key={s.c.id} data-scene-img className={`${pinned ? "absolute inset-0" : "relative aspect-[4/3] sm:aspect-[16/10]"} overflow-hidden rounded-[var(--radius)] shadow-2xl`}>
                <SmartImage src={s.image.src} alt={l(s.image.alt)} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
              </div>
            ))}
          </div>
          {pinned && <span aria-hidden className="absolute end-6 top-1/2 h-40 w-0.5 -translate-y-1/2 bg-black/15"><span data-prog className="block h-full origin-top scale-y-0 bg-black" /></span>}
        </div>
      </div>
    </section>
  );
}

/** Experience #4 — pointer-following spotlight reveals the texture of a product on fine-pointer devices. */
export function TextureSpotlight({ product: p }: { product: Product }) {
  const { t, l } = useI18n();
  const box = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = box.current!.getBoundingClientRect();
    box.current!.style.setProperty("--mx", `${e.clientX - r.left}px`);
    box.current!.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  const mask = "[mask-image:radial-gradient(circle_170px_at_var(--mx)_var(--my),#000_40%,transparent_100%)] [-webkit-mask-image:radial-gradient(circle_170px_at_var(--mx)_var(--my),#000_40%,transparent_100%)]";
  return (
    <section data-section="spotlight" aria-labelledby="spot-title" className="section">
      <div className="container-x grid items-center gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="eyebrow mb-4">{t("spot.eyebrow")}</p>
          <h2 id="spot-title" className="display h-md">{t("spot.title")}</h2>
          <p className="lead mt-5">{t("spot.sub")}</p>
          <LocLink href={`/products/${p.slug}`} className="btn btn-ghost mt-8">{l(p.title)} <ArrowRight size={18} className="rtl:rotate-180" /></LocLink>
        </div>
        <div
          ref={box} onPointerEnter={(e) => e.pointerType === "mouse" && setOn(true)} onPointerLeave={() => setOn(false)} onPointerMove={move}
          className="img-wrap relative aspect-[4/3] rounded-[var(--radius)] [@media(hover:hover)]:cursor-none" style={{ ["--mx" as string]: "50%", ["--my" as string]: "50%" }}
        >
          <SmartImage src={p.images[0].src} alt={l(p.images[0].alt)} fill sizes="(max-width:1024px) 100vw, 55vw" className="object-cover [@media(hover:hover)]:grayscale [@media(hover:hover)]:brightness-[0.45] [@media(hover:hover)]:blur-[1px]" />
          <div aria-hidden className={`pointer-events-none absolute inset-0 transition-opacity duration-300 [@media(hover:none)]:hidden ${mask} ${on ? "opacity-100" : "opacity-0"}`}>
            <SmartImage src={p.images[0].src} alt="" fill sizes="(max-width:1024px) 100vw, 55vw" className="object-cover saturate-125 contrast-110" />
          </div>
          <p className="pointer-events-none absolute bottom-3 start-4 rounded-full bg-black/55 px-3 py-1 text-xs text-white backdrop-blur [@media(hover:none)]:hidden">{t("spot.hint")}</p>
        </div>
      </div>
    </section>
  );
}

/* ─────────── 12. Bento grid ─────────── */
export function BentoGrid({ categories, collection, product }: { categories: Category[]; collection: Collection; product: Product }) {
  const { t, l, price } = useI18n();
  const router = useRouter();
  const { path } = useI18n();
  const [flip, setFlip] = useState(false);
  const [hover, setHover] = useState(false);
  const [q, setQ] = useState("");
  const cat = categories[0];
  const tile = "relative overflow-hidden rounded-[var(--radius)] border border-line";
  return (
    <section data-section="bento" aria-labelledby="bento-title" className="section">
      <div className="container-x">
        <SectionHead id="bento-title" eyebrow={t("bento.eyebrow")} title={t("bento.title")} />
        <div className="grid auto-rows-[minmax(220px,auto)] gap-3 sm:gap-4 md:grid-cols-12">
          {/* big category — image zoom + chip row */}
          <LocLink href={`/categories/${cat.slug}`} className={`${tile} group min-h-[360px] md:col-span-7 md:row-span-2`}>
            <SmartImage src={cat.image} alt="" fill sizes="(max-width:768px) 100vw, 58vw" className="object-cover transition-transform duration-[1200ms] group-hover:scale-110" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <span className="absolute inset-x-6 bottom-6 text-white"><span className="eyebrow !text-white/70">{t("bento.category")}</span><span className="display mt-2 block text-5xl">{l(cat.name)}</span></span>
          </LocLink>
          {/* promo — marquee text */}
          <div className={`${tile} flex flex-col justify-between bg-accent p-6 text-on-accent md:col-span-5`}>
            <p className="eyebrow !text-on-accent/70">{t("bento.promo")}</p>
            <p className="display text-5xl">{t("bento.promoTitle")}</p>
            <p className="text-sm">{t("bento.promoText", { amount: price(10000) })} <code className="rounded bg-black/10 px-1.5 py-0.5 font-mono">WELCOME15</code></p>
          </div>
          {/* product highlight — 3D tilt */}
          <div
            className={`${tile} md:col-span-5 [perspective:800px]`}
            onPointerMove={(e) => { if (e.pointerType !== "mouse") return; const r = e.currentTarget.getBoundingClientRect(); const el = e.currentTarget.firstElementChild as HTMLElement; el.style.transform = `rotateY(${((e.clientX - r.left) / r.width - 0.5) * 14}deg) rotateX(${(0.5 - (e.clientY - r.top) / r.height) * 14}deg)`; }}
            onPointerLeave={(e) => ((e.currentTarget.firstElementChild as HTMLElement).style.transform = "")}
          >
            <LocLink href={`/products/${product.slug}`} className="group relative flex h-full min-h-[260px] items-end p-5 transition-transform duration-300 [transform-style:preserve-3d]">
              <SmartImage src={product.images[0].src} alt="" fill sizes="(max-width:768px) 100vw, 42vw" className="object-cover" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="relative text-white [transform:translateZ(40px)]"><span className="eyebrow !text-white/70">{t("bento.pick")}</span><span className="display block text-3xl">{l(product.title)}</span><span className="tabular">{price(product.price)}</span></span>
            </LocLink>
          </div>
          {/* flip card — brand story */}
          <button className={`${tile} min-h-[220px] bg-surface p-0 text-start md:col-span-4`} onClick={() => setFlip((f) => !f)} aria-pressed={flip} aria-label={t("bento.flip")}>
            <motion.span animate={{ rotateY: flip ? 180 : 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 block [transform-style:preserve-3d]">
              <span className="absolute inset-0 flex flex-col justify-between p-6 [backface-visibility:hidden]"><span className="eyebrow">{t("bento.why")}</span><span className="display text-4xl">{t("bento.whyTitle")}</span><span className="text-sm text-muted">{t("bento.tap")}</span></span>
              <span className="absolute inset-0 flex flex-col justify-center gap-2 bg-fg p-6 text-bg [backface-visibility:hidden] [transform:rotateY(180deg)]"><span className="font-semibold">{t("bento.back1")}</span><span className="opacity-80">{t("bento.back2")}</span></span>
            </motion.span>
          </button>
          {/* search tile */}
          <form className={`${tile} flex flex-col justify-between bg-bg2 p-6 md:col-span-4`} onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push(path(`/search?q=${encodeURIComponent(q.trim())}`)); }}>
            <p className="eyebrow">{t("bento.search")}</p>
            <p className="display text-3xl">{t("bento.searchTitle")}</p>
            <div className="flex items-center gap-2 rounded-full border border-line bg-surface-2 p-1 ps-4">
              <Search size={16} className="text-muted" /><label className="sr-only" htmlFor="bento-q">{t("search.placeholderShort")}</label>
              <input id="bento-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search.placeholderShort")} className="min-w-0 flex-1 bg-transparent py-2 outline-none" />
              <button className="btn btn-dark btn-sm" aria-label={t("search.open")}><ArrowRight size={15} className="rtl:rotate-180" /></button>
            </div>
          </form>
          {/* collection — image swap on hover */}
          <LocLink href={`/collections/${collection.slug}`} className={`${tile} group min-h-[220px] md:col-span-4`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <SmartImage src={collection.image} alt="" fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
            <SmartImage src={collection.image2} alt="" fill sizes="(max-width:768px) 100vw, 33vw" className={`object-cover transition-opacity duration-500 ${hover ? "opacity-100" : "opacity-0"}`} />
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <span className="absolute inset-x-5 bottom-5 text-white"><span className="eyebrow !text-white/70">{t("nav.collections")}</span><span className="display block text-3xl">{l(collection.name)}</span></span>
          </LocLink>
        </div>
      </div>
    </section>
  );
}
