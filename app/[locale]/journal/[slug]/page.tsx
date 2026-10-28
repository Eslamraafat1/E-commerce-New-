import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/content/content";
import { Breadcrumbs } from "@/components/ui/page-header";
import { getArticle, getArticles } from "@/lib/api/content";
import { pageMeta, resolveLocale } from "@/lib/page";

export async function generateStaticParams() {
  return (await getArticles()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/journal/[slug]">) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) return {};
  const m = pageMeta(locale, a.title[locale], `/journal/${slug}`, a.excerpt[locale]);
  return { ...m, openGraph: { ...m.openGraph, type: "article" as const, images: [{ url: a.image }] } };
}

export default async function ArticlePage({ params }: PageProps<"/[locale]/journal/[slug]">) {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) notFound();
  const more = (await getArticles()).filter((x) => x.slug !== slug).slice(0, 2);
  return (
    <>
      <div className="container-x pt-8"><Breadcrumbs items={[{ label: { key: "nav.journal" }, href: "/journal" }, { label: a.title }]} /></div>
      <div className="pt-10"><ArticleBody a={a} more={more} /></div>
    </>
  );
}
