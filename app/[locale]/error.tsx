"use client";

import { useEffect } from "react";
import { LocLink, useI18n } from "@/components/providers/i18n";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="container-x grid min-h-[70dvh] place-items-center py-24 text-center" role="alert">
      <div>
        <h1 className="display h-lg">{t("error.title")}</h1>
        <p className="lead mx-auto mt-4">{t("error.generic")}</p>
        {error.digest && <p className="mt-2 font-mono text-xs text-muted" dir="ltr">{error.digest}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="btn btn-primary">{t("common.retry")}</button>
          <LocLink href="/" className="btn btn-ghost">{t("404.home")}</LocLink>
        </div>
      </div>
    </div>
  );
}
