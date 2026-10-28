import { Suspense } from "react";
import { Catalog, CatalogSkeleton } from "@/components/shop/catalog";
import { PageHeader } from "@/components/ui/page-header";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/shop">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "shop.title"), "/shop", dictTitle(locale, "shop.sub"));
}

export default function ShopPage() {
  return (
    <>
      <PageHeader eyebrow={{ key: "shop.eyebrow" }} title={{ key: "shop.title" }} sub={{ key: "shop.sub" }} crumbs={[{ label: { key: "nav.shop" } }]} />
      <div className="container-x pb-24">
        <Suspense fallback={<CatalogSkeleton />}><Catalog /></Suspense>
      </div>
    </>
  );
}
