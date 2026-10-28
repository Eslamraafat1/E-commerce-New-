import { Suspense } from "react";
import { Catalog, CatalogSkeleton } from "@/components/shop/catalog";
import { PageHeader } from "@/components/ui/page-header";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/search">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "search.title"), "/search", undefined, true);
}

export default function SearchPage() {
  return (
    <>
      <PageHeader eyebrow={{ key: "search.eyebrow" }} title={{ key: "search.title" }} sub={{ key: "search.sub" }} crumbs={[{ label: { key: "search.title" } }]} />
      <div className="container-x pb-24">
        <Suspense fallback={<CatalogSkeleton />}><Catalog /></Suspense>
      </div>
    </>
  );
}
