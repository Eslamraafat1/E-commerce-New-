import { OrdersList } from "@/components/account/account";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/account/orders">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "account.orders"), "/account/orders", undefined, true);
}

export default function AccountOrdersPage() {
  return <OrdersList />;
}
