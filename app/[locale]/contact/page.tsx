import { ContactForm } from "@/components/content/content";
import { PageHeader } from "@/components/ui/page-header";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "nav.contact"), "/contact");
}

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow={{ key: "contact.eyebrow" }} title={{ key: "contact.title" }} sub={{ key: "contact.sub" }} crumbs={[{ label: { key: "nav.contact" } }]} />
      <div className="container-x pb-24"><div className="max-w-xl"><ContactForm /></div></div>
    </>
  );
}
