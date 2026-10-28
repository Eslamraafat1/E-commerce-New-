import { useDemoApi } from "./config";
import { apiFetch } from "./client";
import type { Collection } from "./types";

export async function getCollections(): Promise<Collection[]> {
  if (useDemoApi && typeof window === "undefined") return (await import("@/data/demo/service")).getCollections();
  return (await apiFetch<Collection[]>("/collections")).data;
}
export async function getCollection(slug: string) {
  return (await getCollections()).find((c) => c.slug === slug) ?? null;
}
