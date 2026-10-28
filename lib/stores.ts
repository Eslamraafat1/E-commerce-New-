"use client";

import { createPersistedStore } from "./persisted-store";
import type { CartLineSnapshot, Order } from "./api/types";
import type { ShippingMethodId } from "@/config/store";

const EMPTY_LINES: CartLineSnapshot[] = [];
const EMPTY_IDS: string[] = [];
const EMPTY_ORDERS: Order[] = [];

export const cartStore = createPersistedStore<CartLineSnapshot[]>("vanta:cart", EMPTY_LINES);
export const wishlistStore = createPersistedStore<string[]>("vanta:wishlist", EMPTY_IDS);
export const recentStore = createPersistedStore<string[]>("vanta:recent", EMPTY_IDS);
export const ordersStore = createPersistedStore<Order[]>("vanta:demo-orders", EMPTY_ORDERS);
export const discountStore = createPersistedStore<string>("vanta:discount", "");
export const deliveryStore = createPersistedStore<ShippingMethodId>("vanta:delivery", "standard");

export interface DemoProfile { name: string; email: string; phone: string }
export interface DemoAddress { id: string; label: string; line1: string; city: string; postalCode: string; country: string }
export const profileStore = createPersistedStore<DemoProfile | null>("vanta:demo-profile", null);
export const addressStore = createPersistedStore<DemoAddress[]>("vanta:demo-addresses", []);

export const MAX_QTY = 10;

export type AddResult = "added" | "clamped" | "unavailable";

export function addToCart(line: CartLineSnapshot): AddResult {
  if (line.maxQty < 1) return "unavailable";
  let result: AddResult = "added";
  cartStore.set((prev) => {
    const i = prev.findIndex((l) => l.key === line.key);
    if (i === -1) {
      const qty = Math.min(line.qty, line.maxQty);
      if (qty < line.qty) result = "clamped";
      return [...prev, { ...line, qty }];
    }
    const next = prev.slice();
    const qty = Math.min(next[i].qty + line.qty, line.maxQty);
    if (qty < next[i].qty + line.qty) result = "clamped";
    next[i] = { ...next[i], qty, maxQty: line.maxQty, unitPrice: line.unitPrice };
    return next;
  });
  return result;
}
export const removeFromCart = (key: string) => cartStore.set((p) => p.filter((l) => l.key !== key));
export const setCartQty = (key: string, qty: number) =>
  cartStore.set((p) => p.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(Math.floor(qty) || 1, l.maxQty)) } : l)));
export const clearCart = () => cartStore.set(EMPTY_LINES);

export const toggleWishlist = (id: string) =>
  wishlistStore.set((p) => (p.includes(id) ? p.filter((x) => x !== id) : [id, ...p]));
export const pushRecent = (id: string) =>
  recentStore.set((p) => [id, ...p.filter((x) => x !== id)].slice(0, 12));
