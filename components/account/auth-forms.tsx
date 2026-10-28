"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LocLink, useI18n } from "@/components/providers/i18n";
import { useUI } from "@/components/providers/ui";
import { DemoNotice } from "@/components/ui/page-header";
import { profileStore } from "@/lib/stores";

type Mode = "login" | "register" | "forgot";

/**
 * DEMO authentication UI. No account is created, passwords are validated but never stored, sent or checked.
 * Replace the submit handler with your real auth provider (see docs/BACKEND_INTEGRATION.md).
 */
export function AuthForm({ mode }: { mode: Mode }) {
  const { t, path } = useI18n();
  const { toast } = useUI();
  const router = useRouter();
  const [sent, setSent] = useState(false);

  const schema = useMemo(() => {
    const email = z.string().min(1, t("form.required")).email(t("form.email"));
    const password = z.string().min(8, t("form.passwordShort"));
    if (mode === "forgot") return z.object({ email });
    if (mode === "login") return z.object({ email, password: z.string().min(1, t("form.required")) });
    return z.object({ name: z.string().trim().min(2, t("form.required")), email, password, confirm: z.string() }).refine((d) => d.password === d.confirm, { path: ["confirm"], message: t("form.passwordMatch") });
  }, [mode, t]);

  type V = { name?: string; email: string; password?: string; confirm?: string };
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<V>({ resolver: zodResolver(schema) as never });

  const submit = handleSubmit(async (v) => {
    await new Promise((r) => setTimeout(r, 500));
    if (mode === "forgot") { setSent(true); return; }
    profileStore.set({ name: v.name ?? v.email.split("@")[0], email: v.email, phone: "" });
    toast(t("auth.demoSignedIn"), { kind: "info" });
    router.push(path("/account"));
  });

  const f = (name: keyof V, label: string, type = "text", auto?: string) => (
    <div>
      <label htmlFor={`a-${name}`} className="label">{label}</label>
      <input id={`a-${name}`} type={type} autoComplete={auto} className="field" aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `ae-${name}` : undefined} {...register(name)} />
      {errors[name] && <p id={`ae-${name}`} className="err" role="alert">{errors[name]?.message as string}</p>}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="display h-md">{t(`auth.${mode}.title` as never)}</h1>
      <p className="mt-3 text-muted">{t(`auth.${mode}.sub` as never)}</p>
      <div className="mt-6"><DemoNotice>{t("auth.demoNote")}</DemoNotice></div>
      {sent ? (
        <p role="status" className="mt-6 rounded-2xl border border-line bg-surface p-4">{t("auth.forgot.demoDone")}</p>
      ) : (
        <form noValidate onSubmit={submit} className="mt-6 space-y-4">
          {mode === "register" && f("name", t("form.name"), "text", "name")}
          {f("email", t("form.email.label"), "email", "email")}
          {mode !== "forgot" && f("password", t("form.password"), "password", mode === "login" ? "current-password" : "new-password")}
          {mode === "register" && f("confirm", t("form.confirm"), "password", "new-password")}
          <button className="btn btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" size={18} /> : t(`auth.${mode}.cta` as never)}</button>
        </form>
      )}
      <p className="mt-6 flex flex-wrap justify-between gap-2 text-sm">
        {mode !== "login" && <LocLink href="/login" className="underline underline-offset-4">{t("auth.login.title")}</LocLink>}
        {mode !== "register" && <LocLink href="/register" className="underline underline-offset-4">{t("auth.register.title")}</LocLink>}
        {mode === "login" && <LocLink href="/forgot-password" className="underline underline-offset-4">{t("auth.forgot.title")}</LocLink>}
      </p>
    </div>
  );
}
