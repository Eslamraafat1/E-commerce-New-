import { AboutBody } from "@/components/content/content";
import { PageHeader } from "@/components/ui/page-header";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "nav.about"), "/about");
}

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow={{ key: "about.eyebrow" }} title={{ key: "about.title" }} crumbs={[{ label: { key: "nav.about" } }]} />
      <AboutBody />
    </>
  );
}
