import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DetailBanner } from "@/components/shop/banner";
import { Catalog, CatalogSkeleton } from "@/components/shop/catalog";
import { getCollection, getCollections } from "@/lib/api/collections";
import { pageMeta, resolveLocale } from "@/lib/page";

export async function generateStaticParams() {
  return (await getCollections()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/collections/[slug]">) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const c = await getCollection(slug);
  if (!c) return {};
  return pageMeta(locale, c.name[locale], `/collections/${slug}`, c.blurb[locale]);
}

export default async function CollectionPage({ params }: PageProps<"/[locale]/collections/[slug]">) {
  const { slug } = await params;
  const c = await getCollection(slug);
  if (!c) notFound();
  return (
    <>
      <DetailBanner item={c} kind="collection" crumbs={[{ label: { key: "nav.collections" }, href: "/collections" }, { label: c.name }]} />
      <div className="container-x pb-24">
        <Suspense fallback={<CatalogSkeleton />}><Catalog base={{ collection: c.id }} /></Suspense>
      </div>
    </>
  );
}
