import { FaqList } from "@/components/ui/faq";
import { PageHeader } from "@/components/ui/page-header";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/faq">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "nav.faq"), "/faq");
}

export default function FaqPage() {
  return (
    <>
      <PageHeader eyebrow={{ key: "faq.eyebrow" }} title={{ key: "faq.title" }} crumbs={[{ label: { key: "nav.faq" } }]} />
      <div className="container-x pb-24"><div className="max-w-4xl"><FaqList /></div></div>
    </>
  );
}
