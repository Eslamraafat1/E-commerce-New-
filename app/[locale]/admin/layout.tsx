import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({ children }: LayoutProps<"/[locale]/admin">) {
  return (
    <>
      <PageHeader eyebrow={{ key: "admin.eyebrow" }} title={{ key: "nav.admin" }} crumbs={[{ label: { key: "nav.admin" } }]} />
      <div className="container-x grid gap-8 pb-24 lg:grid-cols-[16rem_1fr] lg:gap-14">
        <AdminNav />
        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}
