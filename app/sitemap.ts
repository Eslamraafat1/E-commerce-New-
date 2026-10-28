import type { MetadataRoute } from "next";
import { locales, store } from "@/config/store";
import { getCategories } from "@/lib/api/categories";
import { getCollections } from "@/lib/api/collections";
import { getArticles } from "@/lib/api/content";
import { listProducts } from "@/lib/api/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cats, cols, arts, prods] = await Promise.all([getCategories(), getCollections(), getArticles(), listProducts({ pageSize: 60 })]);
  const paths = [
    "", "/shop", "/categories", "/collections", "/new-arrivals", "/best-sellers", "/journal", "/about", "/contact", "/faq",
    "/policies/shipping", "/policies/returns", "/policies/privacy", "/policies/terms",
    ...cats.map((c) => `/categories/${c.slug}`),
    ...cols.map((c) => `/collections/${c.slug}`),
    ...arts.map((a) => `/journal/${a.slug}`),
    ...prods.items.map((p) => `/products/${p.slug}`),
  ];
  return paths.flatMap((p) =>
    locales.map((l) => ({
      url: `${store.siteUrl}/${l}${p}`,
      changeFrequency: p.startsWith("/products") ? ("weekly" as const) : ("monthly" as const),
      priority: p === "" ? 1 : p.startsWith("/products") ? 0.8 : 0.6,
      alternates: { languages: Object.fromEntries(locales.map((x) => [x, `${store.siteUrl}/${x}${p}`])) },
    })),
  );
}
