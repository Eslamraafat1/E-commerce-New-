import { Suspense } from "react";
import { Catalog, CatalogSkeleton } from "@/components/shop/catalog";
import { ShopHeader } from "@/components/shop/shop-header";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/new-arrivals">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "nav.new"), "/new-arrivals", dictTitle(locale, "new.sub"));
}

export default function NewArrivalsPage() {
  return (
    <>
      <ShopHeader eyebrow={{ key: "new.eyebrow" }} title={{ key: "new.title" }} sub={{ key: "new.sub" }} base="/new-arrivals" scope={{ onlyNew: true }} />
      <div className="container-x pb-24 pt-4">
        <Suspense fallback={<CatalogSkeleton />}><Catalog base={{ onlyNew: true }} defaultSort="newest" /></Suspense>
      </div>
    </>
  );
}
