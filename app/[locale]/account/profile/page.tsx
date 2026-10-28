import { ProfileForm } from "@/components/account/account";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/account/profile">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "account.profile"), "/account/profile", undefined, true);
}

export default function AccountProfilePage() {
  return <ProfileForm />;
}
