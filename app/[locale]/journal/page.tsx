import { ArticleGrid } from "@/components/content/content";
import { PageHeader } from "@/components/ui/page-header";
import { getArticles } from "@/lib/api/content";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[locale]/journal">) {
  const locale = await resolveLocale(params);
  return pageMeta(locale, dictTitle(locale, "nav.journal"), "/journal");
}

export default async function JournalPage() {
  const items = await getArticles();
  return (
    <>
      <PageHeader eyebrow={{ key: "jr.eyebrow" }} title={{ key: "jr.title" }} sub={{ key: "jr.sub" }} crumbs={[{ label: { key: "nav.journal" } }]} />
      <div className="container-x pb-24"><ArticleGrid items={items} /></div>
    </>
  );
}
