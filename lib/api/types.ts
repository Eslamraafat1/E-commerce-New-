import type { Localized } from "@/lib/format";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface ProductImage {
  src: string;
  alt: Localized;
  /** Colour id this image belongs to; omitted for shared images. */
  color?: string;
}
export interface ColorOption { id: string; name: Localized; hex: string }
export interface Variant {
  id: string;
  sku: string;
  color?: string;
  size?: string;
  /** Overrides the product price when set (minor units). */
  price?: number;
  compareAtPrice?: number;
  stock: number;
}
export interface ProductSpec { label: Localized; value: Localized }

export interface Product {
  id: string;
  slug: string;
  title: Localized;
  description: Localized;
  categoryId: string;
  tags: string[];
  /** Base price in minor units (cents). */
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: ProductImage[];
  colors?: ColorOption[];
  sizes?: string[];
  sizeLabel?: Localized;
  variants: Variant[];
  stockStatus: StockStatus;
  rating?: number;
  reviewCount?: number;
  featured: boolean;
  bestSeller: boolean;
  badge?: "new" | "sale" | "limited";
  specs: ProductSpec[];
  createdAt: string;
  collectionIds: string[];
  lifestyleIds: string[];
}

export interface Category {
  id: string;
  slug: string;
  name: Localized;
  blurb: Localized;
  image: string;
  accent: string;
}
export interface Collection {
  id: string;
  slug: string;
  name: Localized;
  blurb: Localized;
  image: string;
  image2: string;
}
export interface Lifestyle { id: string; name: Localized; blurb: Localized; image: string }
export interface Article {
  slug: string;
  title: Localized;
  excerpt: Localized;
  body: Localized[];
  image: string;
  category: Localized;
  date: string;
  readMinutes: number;
}

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "rating" | "best";

export interface ProductQuery {
  q?: string;
  category?: string[];
  collection?: string;
  lifestyle?: string;
  tag?: string[];
  minPrice?: number;
  maxPrice?: number;
  availability?: "in_stock";
  minRating?: number;
  color?: string[];
  size?: string[];
  sort?: SortKey;
  page?: number;
  pageSize?: number;
  ids?: string[];
  onlyNew?: boolean;
  onlyBest?: boolean;
  onlyFeatured?: boolean;
  onlySale?: boolean;
}

export interface FacetData {
  priceMin: number;
  priceMax: number;
  categories: { id: string; count: number }[];
  colors: { id: string; hex: string; name: Localized; count: number }[];
  sizes: { id: string; count: number }[];
  tags: { id: string; count: number }[];
}

export interface ProductListResult {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  facets: FacetData;
}

export interface ApiEnvelope<T> { data: T; meta?: Record<string, unknown> }
export interface ApiErrorBody { error: { code: string; message: string; details?: unknown } }

export interface CartLineSnapshot {
  key: string; // productId::variantId
  productId: string;
  variantId: string;
  slug: string;
  title: Localized;
  image: string;
  variantLabel: Localized | null;
  sku: string;
  unitPrice: number;
  qty: number;
  maxQty: number;
}

export interface OrderInput {
  customer: { email: string; firstName: string; lastName: string; phone?: string };
  shipping: { address1: string; address2?: string; city: string; region?: string; postalCode: string; country: string };
  delivery: "standard" | "express" | "pickup";
  payment: "card" | "cod" | "wallet";
  discountCode?: string;
  lines: { productId: string; variantId: string; qty: number }[];
}
export interface Order {
  id: string;
  createdAt: string;
  status: "demo-placed";
  /** Always false in demo mode: nothing is stored server-side, no payment is taken, no email is sent. */
  persisted: false;
  input: Omit<OrderInput, "lines">;
  lines: CartLineSnapshot[];
  totals: { subtotal: number; discount: number; shipping: number; total: number };
}
