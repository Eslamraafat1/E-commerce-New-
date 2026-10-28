import { AuthForm } from "@/components/account/auth-forms";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/login">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "auth.login.title"), "/login", undefined, true);
}

export default function LoginPage() {
  return (
    <div className="container-x py-16 sm:py-24">
      <AuthForm mode="login" />
    </div>
  );
}
