import { notFound } from "next/navigation";
import { PolicyBody } from "@/components/content/content";
import { PageHeader } from "@/components/ui/page-header";
import type { DictKey } from "@/lib/i18n";
import { dictTitle, pageMeta, resolveLocale } from "@/lib/page";

const SLUGS = ["shipping", "returns", "privacy", "terms"] as const;
type Slug = (typeof SLUGS)[number];
const isSlug = (s: string): s is Slug => (SLUGS as readonly string[]).includes(s);

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/policies/[slug]">) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  if (!isSlug(slug)) return {};
  return pageMeta(locale, dictTitle(locale, `policy.${slug}` as DictKey), `/policies/${slug}`);
}

export default async function PolicyPage({ params }: PageProps<"/[locale]/policies/[slug]">) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();
  return (
    <>
      <PageHeader eyebrow={{ key: "policy.eyebrow" }} title={{ key: `policy.${slug}` as DictKey }} crumbs={[{ label: { key: `policy.${slug}` as DictKey } }]} />
      <div className="container-x pb-24"><PolicyBody slug={slug} /></div>
    </>
  );
}
