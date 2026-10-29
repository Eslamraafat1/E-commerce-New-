import { getCategories } from "@/lib/api/categories";
import { listProducts } from "@/lib/api/products";
import type { ProductQuery } from "@/lib/api/types";
import type { Txt } from "@/components/ui/page-header";
import { ShopHero } from "./shop-hero";

/** Server wrapper: loads category counts + trending tags, renders the immersive shop header. */
export async function ShopHeader({ eyebrow, title, sub, base = "/shop", scope = {} }: { eyebrow: Txt; title: Txt; sub: Txt; base?: string; scope?: ProductQuery }) {
  const [cats, all] = await Promise.all([getCategories(), listProducts({ ...scope, pageSize: 60 })]);
  const counts = Object.fromEntries(all.facets.categories.map((c) => [c.id, c.count]));
  return <ShopHero eyebrow={eyebrow} title={title} sub={sub} categories={cats.filter((c) => counts[c.id])} counts={counts} tags={all.facets.tags.map((t) => t.id)} total={all.total} base={base} />;
}
