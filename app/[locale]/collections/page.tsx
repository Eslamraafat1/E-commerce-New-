import { CategoryGrid } from "@/components/shop/banner";
import { PageHeader } from "@/components/ui/page-header";
import { getCollections } from "@/lib/api/collections";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/collections">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "nav.collections"), "/collections", dictTitle(locale, "col.sub"));
}

export default async function CollectionsPage() {
  const items = await getCollections();
  return (
    <>
      <PageHeader eyebrow={{ key: "col.eyebrow" }} title={{ key: "col.title" }} sub={{ key: "col.sub" }} crumbs={[{ label: { key: "nav.collections" } }]} />
      <div className="container-x pb-24"><CategoryGrid items={items} /></div>
    </>
  );
}
