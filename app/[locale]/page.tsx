import type { Metadata } from "next";
import { getCategories } from "@/lib/api/categories";
import { getCollections } from "@/lib/api/collections";
import { getArticles, getLifestyles, getTestimonials } from "@/lib/api/content";
import { getProduct, listProducts } from "@/lib/api/products";
import { getDict, hasLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { ScrollText } from "@/components/motion/creative";
import { Hero } from "@/components/home/hero";
import { BrandMarquee, CategoryUniverse, FeaturedStory, HorizontalShowcase, Trending } from "@/components/home/sections-a";
import { BentoGrid, BestSellers, NewArrivals, ProductInFocus, TextureSpotlight } from "@/components/home/sections-b";
import { Benefits, BrandStory, Collections, Discovery, FaqSection, FinalCta, JournalSection, Lifestyles, NewsletterSection, Testimonials } from "@/components/home/sections-c";
import { img } from "@/data/demo/images";
import { SectionNavClient } from "@/components/home/section-nav-client";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  return { alternates: { canonical: `/${locale}`, languages: { en: "/en", ar: "/ar" } }, description: getDict(locale)["meta.description"] };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const [featured, trending, newest, best, all, categories, collections, lifestyles, articles, testimonials, focus, texture] = await Promise.all([
    listProducts({ onlyFeatured: true, pageSize: 12 }),
    listProducts({ sort: "best", pageSize: 7 }),
    listProducts({ onlyNew: true, sort: "newest", pageSize: 12 }),
    listProducts({ onlyBest: true, sort: "best", pageSize: 5 }),
    listProducts({ pageSize: 60 }),
    getCategories(),
    getCollections(),
    getLifestyles(),
    getArticles(),
    getTestimonials(),
    getProduct("court-low-sneaker"),
    getProduct("cream-knit-poncho"),
  ]);

  const counts = Object.fromEntries(all.facets.categories.map((c) => [c.id, c.count]));
  const order = ["court-low-sneaker", "nimbus-noise-cancelling", "scarlet-lock-satchel", "verde-three-seat-sofa"];
  const pool = [...featured.items, ...all.items];
  const slides = order.map((slug) => pool.find((p) => p.slug === slug)).filter((p): p is NonNullable<typeof p> => !!p).map((product) => {
    const c = categories.find((x) => x.id === product.categoryId);
    return { product, accent: c?.accent ?? "#d4ff3a", category: c?.name[locale] ?? "" };
  });
  const story = featured.items.find((p) => p.slug === "nimbus-noise-cancelling") ?? featured.items[0];
  const showcase = featured.items.filter((p) => p.id !== story.id).slice(0, 8);
  const bentoProduct = featured.items.find((p) => p.slug === "studio-pro-anc-headphones") ?? featured.items[1];
  const terms = all.facets.tags.map((x) => x.id).filter((x) => ["headphones", "sneakers", "sofas", "skincare", "watches", "backpacks"].includes(x));

  return (
    <>
      <SectionNavClient />
      <Hero slides={slides} />
      <BrandMarquee />
      <CategoryUniverse categories={categories} counts={counts} />
      <FeaturedStory product={story} />
      <Trending products={trending.items} />
      <HorizontalShowcase products={showcase} />
      <NewArrivals products={newest.items} categories={categories} />
      <BestSellers products={best.items} />
      {focus && <ProductInFocus product={focus} />}
      {texture && <TextureSpotlight product={texture} />}
      <BentoGrid categories={categories} collection={collections[0]} product={bentoProduct} />
      <Discovery products={[all.items[0], all.items[19], all.items[33], all.items[7]].filter(Boolean)} categories={categories} collections={collections} terms={terms} />
      <Lifestyles items={lifestyles} />
      <Collections items={collections} />
      <BrandStory images={[img("styleA", 900), img("styleC", 900), img("styleB", 900), img("shop", 900)]} />
      <ScrollText text={getDict(locale)["col.title"]} reverse />
      <Benefits />
      <JournalSection articles={articles} />
      <Testimonials items={testimonials} />
      <NewsletterSection />
      <FaqSection />
      <FinalCta image={img("styleB", 1800)} />
    </>
  );
}
