import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductExperience } from "@/components/shop/pdp";
import { ProductRail, RecentlyViewed } from "@/components/shop/rails";
import { Breadcrumbs } from "@/components/ui/page-header";
import { getCategory } from "@/lib/api/categories";
import { getProduct, getRelated, listProducts } from "@/lib/api/products";
import { store } from "@/config/store";
import { pageMeta, resolveLocale } from "@/lib/page";
import { absUrl, breadcrumbJsonLd, jsonLdHtml } from "@/lib/seo";

export async function generateStaticParams() {
  return (await listProducts({ pageSize: 60 })).items.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/products/[slug]">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  const meta = pageMeta(locale, p.title[locale], `/products/${slug}`, p.description[locale]);
  const image = { url: p.images[0].src, alt: p.images[0].alt[locale] };
  return { ...meta, openGraph: { ...meta.openGraph, images: [image] }, twitter: { ...meta.twitter, images: [image] } };
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
    brand: { "@type": "Brand", name: store.name },
    url: absUrl(locale, `/products/${p.slug}`),
    // Ratings in this demo are sample data, so they are shown in the UI but not emitted as
    // AggregateRating structured data (Google requires review markup to reflect genuine reviews).
    offers: {
      "@type": "AggregateOffer", priceCurrency: p.currency,
      lowPrice: Math.min(...p.variants.map((v) => v.price ?? p.price)) / 100,
      highPrice: Math.max(...p.variants.map((v) => v.price ?? p.price)) / 100,
      offerCount: p.variants.length,
      availability: p.stockStatus === "out_of_stock" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: absUrl(locale, `/products/${p.slug}`),
    },
  };
  const crumbsLd = breadcrumbJsonLd(locale, [
    { name: { key: "nav.shop" }, path: "/shop" },
    ...(category ? [{ name: category.name[locale], path: `/categories/${category.slug}` }] : []),
    { name: p.title[locale], path: `/products/${p.slug}` },
  ]);

  return (
    <div className="container-x pb-32 pt-8 lg:pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(jsonLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(crumbsLd)} />
      <div className="mb-8">
        <Breadcrumbs items={[{ label: { key: "nav.shop" }, href: "/shop" }, ...(category ? [{ label: category.name, href: `/categories/${category.slug}` }] : []), { label: p.title }]} />
      </div>
      <ProductExperience product={p} />
      <ProductRail products={related} titleKey="product.related" />
      <RecentlyViewed exclude={p.id} />
    </div>
  );
}
