import { Suspense } from "react";
import { Catalog, CatalogSkeleton } from "@/components/shop/catalog";
import { ShopHeader } from "@/components/shop/shop-header";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/best-sellers">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "nav.best"), "/best-sellers", dictTitle(locale, "best.sub"));
}

export default function BestSellersPage() {
  return (
    <>
      <ShopHeader eyebrow={{ key: "best.eyebrow" }} title={{ key: "best.title" }} sub={{ key: "best.sub" }} base="/best-sellers" scope={{ onlyBest: true }} />
      <div className="container-x pb-24 pt-4">
        <Suspense fallback={<CatalogSkeleton />}><Catalog base={{ onlyBest: true }} defaultSort="best" /></Suspense>
      </div>
    </>
  );
}
