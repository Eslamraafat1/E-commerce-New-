import { RecentlyViewed } from "@/components/shop/rails";
import { PageHeader } from "@/components/ui/page-header";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/recently-viewed">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "recent.title"), "/recently-viewed", undefined, true);
}

export default function RecentlyViewedPage() {
  return (
    <>
      <PageHeader title={{ key: "recent.title" }} sub={{ key: "recent.sub" }} crumbs={[{ label: { key: "recent.title" } }]} />
      <div className="container-x pb-24"><RecentlyViewed standalone /></div>
    </>
  );
}
