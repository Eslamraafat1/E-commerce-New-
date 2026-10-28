import { AccountNav } from "@/components/account/account";
import { PageHeader } from "@/components/ui/page-header";

export default function AccountLayout({ children }: LayoutProps<"/[locale]/account">) {
  return (
    <>
      <PageHeader eyebrow={{ key: "account.eyebrow" }} title={{ key: "nav.account" }} crumbs={[{ label: { key: "nav.account" } }]} />
      <div className="container-x grid gap-8 pb-24 lg:grid-cols-[16rem_1fr] lg:gap-14">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}
