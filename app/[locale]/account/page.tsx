import { Dashboard } from "@/components/account/account";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/account">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "account.dashboard"), "/account", undefined, true);
}

export default function AccountDashboardPage() {
  return <Dashboard />;
}
