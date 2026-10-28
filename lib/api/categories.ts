import { useDemoApi } from "./config";
import { apiFetch } from "./client";
import type { Category } from "./types";

export async function getCategories(): Promise<Category[]> {
  if (useDemoApi && typeof window === "undefined") return (await import("@/data/demo/service")).getCategories();
  return (await apiFetch<Category[]>("/categories")).data;
}
export async function getCategory(slug: string) {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}
