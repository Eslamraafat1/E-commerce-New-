import { L } from "@/lib/format";
import type { FacetData, Product, ProductListResult, ProductQuery, SortKey } from "@/lib/api/types";
import { categories, collections } from "./categories";
import { products } from "./products";
import { articles } from "./journal";

/**
 * The Demo Service: pure functions over the in-memory demo catalog.
 * Route Handlers (app/api/*) and server components call these directly in demo mode.
 */

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[ً-ٰٟ]/g, "").trim();

function searchText(p: Product) {
  const cat = categories.find((c) => c.id === p.categoryId);
  return norm([p.title.en, p.title.ar, p.description.en, p.description.ar, p.tags.join(" "), cat?.name.en, cat?.name.ar].join(" "));
}

function score(p: Product, q: string) {
  const terms = norm(q).split(/\s+/).filter(Boolean);
  const hay = searchText(p);
  const title = norm(p.title.en + " " + p.title.ar);
  let s = 0;
  for (const t of terms) {
    if (!hay.includes(t)) return 0;
    s += title.includes(t) ? 5 : 1;
    if (p.tags.some((x) => x.startsWith(t))) s += 3;
  }
  return s;
}

const sorters: Record<SortKey, (a: Product, b: Product) => number> = {
  featured: (a, b) => Number(b.featured) - Number(a.featured) || (b.rating ?? 0) - (a.rating ?? 0),
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0),
  best: (a, b) => Number(b.bestSeller) - Number(a.bestSeller) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0),
};

function facets(items: Product[]): FacetData {
  const cat = new Map<string, number>(), col = new Map<string, { hex: string; name: Product["title"]; n: number }>(), size = new Map<string, number>(), tag = new Map<string, number>();
  let min = Infinity, max = 0;
  for (const p of items) {
    min = Math.min(min, p.price); max = Math.max(max, p.price);
    cat.set(p.categoryId, (cat.get(p.categoryId) ?? 0) + 1);
    p.colors?.forEach((c) => col.set(c.id, { hex: c.hex, name: c.name, n: (col.get(c.id)?.n ?? 0) + 1 }));
    p.sizes?.forEach((s) => size.set(s, (size.get(s) ?? 0) + 1));
    p.tags.forEach((t) => tag.set(t, (tag.get(t) ?? 0) + 1));
  }
  return {
    priceMin: Number.isFinite(min) ? min : 0,
    priceMax: max,
    categories: [...cat].map(([id, count]) => ({ id, count })),
    colors: [...col].map(([id, v]) => ({ id, hex: v.hex, name: v.name, count: v.n })),
    sizes: [...size].map(([id, count]) => ({ id, count })),
    tags: [...tag].map(([id, count]) => ({ id, count })).sort((a, b) => b.count - a.count),
  };
}

export function listProducts(q: ProductQuery = {}): ProductListResult {
  let scope = products.slice();
  if (q.ids) scope = q.ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => !!p);
  if (q.collection) scope = scope.filter((p) => p.collectionIds.includes(q.collection!));
  if (q.lifestyle) scope = scope.filter((p) => p.lifestyleIds.includes(q.lifestyle!));
  if (q.onlyFeatured) scope = scope.filter((p) => p.featured);
  if (q.onlyBest) scope = scope.filter((p) => p.bestSeller);
  if (q.onlySale) scope = scope.filter((p) => !!p.compareAtPrice);
  const ranked = new Map<string, number>();
  if (q.q?.trim()) {
    scope = scope.filter((p) => { const s = score(p, q.q!); if (s) ranked.set(p.id, s); return s > 0; });
  }
  const facetData = facets(scope);

  let items = scope;
  if (q.category?.length) items = items.filter((p) => q.category!.includes(p.categoryId));
  if (q.tag?.length) items = items.filter((p) => q.tag!.some((t) => p.tags.includes(t)));
  if (q.minPrice !== undefined) items = items.filter((p) => p.price >= q.minPrice!);
  if (q.maxPrice !== undefined) items = items.filter((p) => p.price <= q.maxPrice!);
  if (q.availability === "in_stock") items = items.filter((p) => p.stockStatus !== "out_of_stock");
  if (q.minRating) items = items.filter((p) => (p.rating ?? 0) >= q.minRating!);
  if (q.color?.length) items = items.filter((p) => p.colors?.some((c) => q.color!.includes(c.id)));
  if (q.size?.length) items = items.filter((p) => p.sizes?.some((s) => q.size!.includes(s)));

  const sort: SortKey = q.sort ?? (q.q?.trim() ? "featured" : "featured");
  if (q.ids && !q.q) {
    // keep caller order
  } else if (q.q?.trim() && (!q.sort || q.sort === "featured")) {
    items = items.slice().sort((a, b) => (ranked.get(b.id) ?? 0) - (ranked.get(a.id) ?? 0) || sorters.featured(a, b));
  } else {
    items = items.slice().sort(sorters[q.onlyNew ? "newest" : sort]);
  }
  if (q.onlyNew && !q.sort) items = items.slice().sort(sorters.newest);

  const pageSize = Math.min(Math.max(q.pageSize ?? 12, 1), 60);
  const total = items.length;
  const page = Math.max(q.page ?? 1, 1);
  return { items: items.slice(0, page * pageSize), total, page, pageSize, facets: facetData };
}

export function getProduct(idOrSlug: string): Product | null {
  return products.find((p) => p.slug === idOrSlug || p.id === idOrSlug) ?? null;
}

export function relatedProducts(id: string, n = 4): Product[] {
  const p = getProduct(id);
  if (!p) return [];
  return products
    .filter((x) => x.id !== p.id)
    .map((x) => ({ x, s: (x.categoryId === p.categoryId ? 3 : 0) + x.tags.filter((t) => p.tags.includes(t)).length * 2 + x.collectionIds.filter((c) => p.collectionIds.includes(c)).length }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s || (b.x.rating ?? 0) - (a.x.rating ?? 0))
    .slice(0, n)
    .map((r) => r.x);
}

export function suggest(q: string) {
  const query = q.trim();
  if (!query) return { products: [], categories: [], terms: [] as string[] };
  const res = listProducts({ q: query, pageSize: 6 });
  const n = norm(query);
  const cats = categories.filter((c) => norm(c.name.en + " " + c.name.ar).includes(n)).map((c) => c.id);
  const terms = res.facets.tags.map((t) => t.id).filter((t) => t.includes(n)).slice(0, 4);
  return { products: res.items.slice(0, 5), categories: cats, terms };
}

export const getCategories = () => categories;
export const getCollections = () => collections;
export const getArticles = () => articles;
export { L };
