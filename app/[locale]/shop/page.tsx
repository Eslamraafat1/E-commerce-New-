import { Suspense } from "react";
import { Catalog, CatalogSkeleton } from "@/components/shop/catalog";
import { ShopHeader } from "@/components/shop/shop-header";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/shop">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "shop.title"), "/shop", dictTitle(locale, "shop.sub"));
}

export default function ShopPage() {
  return (
    <>
      <ShopHeader eyebrow={{ key: "shop.eyebrow" }} title={{ key: "shop.title" }} sub={{ key: "shop.sub" }} base="/shop" scope={{}} />
      <div className="container-x pb-24 pt-4">
        <Suspense fallback={<CatalogSkeleton />}><Catalog /></Suspense>
      </div>
    </>
  );
}
