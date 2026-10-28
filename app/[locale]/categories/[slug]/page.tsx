import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DetailBanner } from "@/components/shop/banner";
import { Catalog, CatalogSkeleton } from "@/components/shop/catalog";
import { getCategories, getCategory } from "@/lib/api/categories";
import { pageMeta, resolveLocale } from "@/lib/page";

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/categories/[slug]">) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const c = await getCategory(slug);
  if (!c) return {};
  return pageMeta(locale, c.name[locale], `/categories/${slug}`, c.blurb[locale]);
}

export default async function CategoryPage({ params }: PageProps<"/[locale]/categories/[slug]">) {
  const { slug } = await params;
  const c = await getCategory(slug);
  if (!c) notFound();
  return (
    <>
      <DetailBanner item={c} kind="category" crumbs={[{ label: { key: "nav.categories" }, href: "/categories" }, { label: c.name }]} />
      <div className="container-x pb-24">
        <Suspense fallback={<CatalogSkeleton />}><Catalog base={{ category: [c.id] }} hideCategoryFilter /></Suspense>
      </div>
    </>
  );
}
