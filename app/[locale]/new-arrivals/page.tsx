import { Suspense } from "react";
import { Catalog, CatalogSkeleton } from "@/components/shop/catalog";
import { PageHeader } from "@/components/ui/page-header";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/new-arrivals">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "nav.new"), "/new-arrivals", dictTitle(locale, "new.sub"));
}

export default function NewArrivalsPage() {
  return (
    <>
      <PageHeader eyebrow={{ key: "new.eyebrow" }} title={{ key: "new.title" }} sub={{ key: "new.sub" }} crumbs={[{ label: { key: "nav.new" } }]} />
      <div className="container-x pb-24">
        <Suspense fallback={<CatalogSkeleton />}><Catalog base={{ onlyNew: true }} defaultSort="newest" /></Suspense>
      </div>
    </>
  );
}
