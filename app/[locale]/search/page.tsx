import { Suspense } from "react";
import { Catalog, CatalogSkeleton } from "@/components/shop/catalog";
import { ShopHeader } from "@/components/shop/shop-header";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/search">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "search.title"), "/search", undefined, true);
}

export default function SearchPage() {
  return (
    <>
      <ShopHeader eyebrow={{ key: "search.eyebrow" }} title={{ key: "search.title" }} sub={{ key: "search.sub" }} base="/search" scope={{}} />
      <div className="container-x pb-24 pt-4">
        <Suspense fallback={<CatalogSkeleton />}><Catalog /></Suspense>
      </div>
    </>
  );
}
