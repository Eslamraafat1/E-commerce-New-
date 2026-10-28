import { CategoryGrid } from "@/components/shop/banner";
import { PageHeader } from "@/components/ui/page-header";
import { getCategories } from "@/lib/api/categories";
import { listProducts } from "@/lib/api/products";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/categories">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "nav.categories"), "/categories", dictTitle(locale, "cat.sub"));
}

export default async function CategoriesPage() {
  const [cats, all] = await Promise.all([getCategories(), listProducts({ pageSize: 60 })]);
  const counts = Object.fromEntries(all.facets.categories.map((c) => [c.id, c.count]));
  return (
    <>
      <PageHeader eyebrow={{ key: "cat.eyebrow" }} title={{ key: "cat.title" }} sub={{ key: "cat.sub" }} crumbs={[{ label: { key: "nav.categories" } }]} />
      <div className="container-x pb-24"><CategoryGrid items={cats} counts={counts} /></div>
    </>
  );
}
