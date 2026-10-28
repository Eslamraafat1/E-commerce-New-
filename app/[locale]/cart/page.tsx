import { CartPage } from "@/components/shop/cart-page";
import { PageHeader } from "@/components/ui/page-header";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/cart">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "nav.cart"), "/cart", undefined, true);
}

export default function Cart() {
  return (
    <>
      <PageHeader title={{ key: "nav.cart" }} crumbs={[{ label: { key: "nav.cart" } }]} />
      <div className="container-x pb-24"><CartPage /></div>
    </>
  );
}
