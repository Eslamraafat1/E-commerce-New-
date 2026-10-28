"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useI18n } from "@/components/providers/i18n";

/**
 * Validates the address and shows an honest demo state. No subscription is created until a real
 * email service is connected (see docs/BACKEND_INTEGRATION.md).
 */
export function NewsletterForm({ id = "nl" }: { id?: string }) {
  const { t } = useI18n();
  const [done, setDone] = useState(false);
  const schema = z.object({ email: z.string().min(1, t("form.required")).email(t("form.email")) });
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string }>({ resolver: zodResolver(schema) });

  if (done) {
    return (
      <p role="status" className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 text-sm">
        <Check size={18} className="mt-0.5 shrink-0 text-accent-ink" /> {t("newsletter.demoDone")}
      </p>
    );
  }
  return (
    <form noValidate onSubmit={handleSubmit(async () => { await new Promise((r) => setTimeout(r, 450)); setDone(true); })} className="w-full">
      <label htmlFor={id} className="sr-only">{t("newsletter.label")}</label>
      <div className="flex items-center gap-2 rounded-full border border-line bg-surface-2 p-1.5 ps-5 focus-within:border-[var(--focus)]">
        <input id={id} type="email" autoComplete="email" inputMode="email" placeholder={t("newsletter.placeholder")} aria-invalid={!!errors.email} aria-describedby={errors.email ? `${id}-err` : undefined} className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-muted" {...register("email")} />
        <button className="btn btn-primary btn-sm shrink-0" disabled={isSubmitting}>{isSubmitting ? t("common.loading") : t("newsletter.cta")} <ArrowRight size={16} className="flip-rtl rtl:rotate-180" /></button>
      </div>
      {errors.email && <p id={`${id}-err`} className="err ps-5" role="alert">{errors.email.message}</p>}
      <p className="mt-2 ps-5 text-xs text-muted">{t("newsletter.demoNote")}</p>
    </form>
  );
}
