import { articles, testimonials } from "@/data/demo/journal";
import { lifestyles } from "@/data/demo/categories";
import type { Article, Lifestyle } from "./types";

/**
 * Editorial content (journal, testimonials, lifestyle collections).
 * In demo mode this is local sample data; with a real backend, replace these with CMS / API calls.
 */
export async function getArticles(): Promise<Article[]> { return articles; }
export async function getArticle(slug: string): Promise<Article | null> { return articles.find((a) => a.slug === slug) ?? null; }
export async function getTestimonials() { return testimonials; }
export async function getLifestyles(): Promise<Lifestyle[]> { return lifestyles; }
