import { Checkout } from "@/components/shop/checkout";
import { PageHeader } from "@/components/ui/page-header";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/checkout">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "cart.checkout"), "/checkout", undefined, true);
}

export default function CheckoutPage() {
  return (
    <>
      <PageHeader title={{ key: "cart.checkout" }} crumbs={[{ label: { key: "nav.cart" }, href: "/cart" }, { label: { key: "cart.checkout" } }]} />
      <div className="container-x pb-24"><Checkout /></div>
    </>
  );
}
