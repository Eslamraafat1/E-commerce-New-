import { Suspense } from "react";
import { OrderConfirmation } from "@/components/shop/confirmation";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/order-confirmation">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "confirm.title"), "/order-confirmation", undefined, true);
}

export default function OrderConfirmationPage() {
  return (
    <div className="container-x py-16 sm:py-24">
      <Suspense fallback={<div className="skeleton mx-auto h-80 max-w-3xl" />}><OrderConfirmation /></Suspense>
    </div>
  );
}
