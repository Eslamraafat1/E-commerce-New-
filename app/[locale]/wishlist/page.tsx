import { WishlistGrid } from "@/components/shop/rails";
import { PageHeader } from "@/components/ui/page-header";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/wishlist">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "nav.wishlist"), "/wishlist", undefined, true);
}

export default function WishlistPage() {
  return (
    <>
      <PageHeader title={{ key: "nav.wishlist" }} sub={{ key: "wishlist.sub" }} crumbs={[{ label: { key: "nav.wishlist" } }]} />
      <div className="container-x pb-24"><WishlistGrid /></div>
    </>
  );
}
