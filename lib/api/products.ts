import { useDemoApi } from "./config";
import { apiFetch } from "./client";
import type { Product, ProductListResult, ProductQuery, SortKey } from "./types";

const isServer = typeof window === "undefined";
const demo = () => import("@/data/demo/service");

const SORTS: SortKey[] = ["featured", "newest", "price-asc", "price-desc", "rating", "best"];
const csv = (v: string | undefined) => (v ? v.split(",").filter(Boolean) : undefined);
const num = (v: string | undefined) => (v !== undefined && v !== "" && !Number.isNaN(Number(v)) ? Number(v) : undefined);

/** URLSearchParams → ProductQuery (shared by the catalog UI, route handlers and any backend adapter). */
export function parseQuery(sp: URLSearchParams | Record<string, string | undefined>): ProductQuery {
  const get = (k: string) => (sp instanceof URLSearchParams ? sp.get(k) ?? undefined : sp[k]);
  const sort = get("sort") as SortKey | undefined;
  return {
    q: get("q") || undefined,
    category: csv(get("category")),
    collection: get("collection") || undefined,
    lifestyle: get("lifestyle") || undefined,
    tag: csv(get("tag")),
    minPrice: num(get("min")),
    maxPrice: num(get("max")),
    availability: get("stock") === "in" ? "in_stock" : undefined,
    minRating: num(get("rating")),
    color: csv(get("color")),
    size: csv(get("size")),
    sort: sort && SORTS.includes(sort) ? sort : undefined,
    page: num(get("page")),
    pageSize: num(get("pageSize")),
    ids: csv(get("ids")),
    onlyNew: get("new") === "1" || undefined,
    onlyBest: get("best") === "1" || undefined,
    onlyFeatured: get("featured") === "1" || undefined,
    onlySale: get("sale") === "1" || undefined,
  };
}

/** ProductQuery → flat params (inverse of parseQuery). */
export function queryParams(q: ProductQuery): Record<string, string | undefined> {
  return {
    q: q.q, category: q.category?.join(","), collection: q.collection, lifestyle: q.lifestyle, tag: q.tag?.join(","),
    min: q.minPrice?.toString(), max: q.maxPrice?.toString(), stock: q.availability ? "in" : undefined,
    rating: q.minRating?.toString(), color: q.color?.join(","), size: q.size?.join(","), sort: q.sort,
    page: q.page && q.page > 1 ? String(q.page) : undefined, pageSize: q.pageSize?.toString(), ids: q.ids?.join(","),
    new: q.onlyNew ? "1" : undefined, best: q.onlyBest ? "1" : undefined, featured: q.onlyFeatured ? "1" : undefined, sale: q.onlySale ? "1" : undefined,
  };
}

export async function listProducts(q: ProductQuery = {}, signal?: AbortSignal): Promise<ProductListResult> {
  if (useDemoApi && isServer) return (await demo()).listProducts(q);
  return (await apiFetch<ProductListResult>("/products", { params: queryParams(q), signal })).data;
}

export async function getProduct(idOrSlug: string): Promise<Product | null> {
  if (useDemoApi && isServer) return (await demo()).getProduct(idOrSlug);
  try {
    return (await apiFetch<Product>(`/products/${encodeURIComponent(idOrSlug)}`)).data;
  } catch (e) {
    if ((e as { status?: number }).status === 404) return null;
    throw e;
  }
}

export async function getRelated(id: string, n = 4): Promise<Product[]> {
  if (useDemoApi && isServer) return (await demo()).relatedProducts(id, n);
  return (await apiFetch<Product[]>(`/products/${encodeURIComponent(id)}`, { params: { related: n } })).data;
}

export interface Suggestions { products: Product[]; categories: string[]; terms: string[] }
export async function suggest(q: string, signal?: AbortSignal): Promise<Suggestions> {
  if (useDemoApi && isServer) return (await demo()).suggest(q);
  return (await apiFetch<Suggestions>("/search", { params: { q }, signal })).data;
}
