import { AuthForm } from "@/components/account/auth-forms";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/register">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "auth.register.title"), "/register", undefined, true);
}

export default function RegisterPage() {
  return (
    <div className="container-x py-16 sm:py-24">
      <AuthForm mode="register" />
    </div>
  );
}
