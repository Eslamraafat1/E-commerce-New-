import { AuthForm } from "@/components/account/auth-forms";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/forgot-password">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "auth.forgot.title"), "/forgot-password", undefined, true);
}

export default function ForgotPasswordPage() {
  return (
    <div className="container-x py-16 sm:py-24">
      <AuthForm mode="forgot" />
    </div>
  );
}
