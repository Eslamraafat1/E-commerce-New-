import { Addresses } from "@/components/account/account";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/account/addresses">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "account.addresses"), "/account/addresses", undefined, true);
}

export default function AccountAddressesPage() {
  return <Addresses />;
}
