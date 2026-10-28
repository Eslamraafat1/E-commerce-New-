import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductExperience } from "@/components/shop/pdp";
import { ProductRail, RecentlyViewed } from "@/components/shop/rails";
import { Breadcrumbs } from "@/components/ui/page-header";
import { getCategory } from "@/lib/api/categories";
import { getProduct, getRelated, listProducts } from "@/lib/api/products";
import { store } from "@/config/store";
import { pageMeta, resolveLocale } from "@/lib/page";

export async function generateStaticParams() {
  return (await listProducts({ pageSize: 60 })).items.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/products/[slug]">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  const meta = pageMeta(locale, p.title[locale], `/products/${slug}`, p.description[locale]);
  return { ...meta, openGraph: { ...meta.openGraph, type: "website", images: [{ url: p.images[0].src, alt: p.images[0].alt[locale] }] }, twitter: { card: "summary_large_image" } };
}

export default async function ProductPage({ params }: PageProps<"/[locale]/products/[slug]">) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const [related, category] = await Promise.all([getRelated(p.id, 4), getCategory(p.categoryId)]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title[locale],
    description: p.description[locale],
    image: p.images.map((i) => i.src),
    sku: p.variants[0]?.sku,
    ...(p.rating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount } } : {}),
    offers: {
      "@type": "AggregateOffer", priceCurrency: p.currency,
      lowPrice: Math.min(...p.variants.map((v) => v.price ?? p.price)) / 100,
      highPrice: Math.max(...p.variants.map((v) => v.price ?? p.price)) / 100,
      offerCount: p.variants.length,
      availability: p.stockStatus === "out_of_stock" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: `${store.siteUrl}/${locale}/products/${p.slug}`,
    },
  };

  return (
    <div className="container-x pb-32 pt-8 lg:pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="mb-8">
        <Breadcrumbs items={[{ label: { key: "nav.shop" }, href: "/shop" }, ...(category ? [{ label: category.name, href: `/categories/${category.slug}` }] : []), { label: p.title }]} />
      </div>
      <ProductExperience product={p} />
      <ProductRail products={related} titleKey="product.related" />
      <RecentlyViewed exclude={p.id} />
    </div>
  );
}
