import { apiFetch } from "./client";
import type { Order, OrderInput } from "./types";

/** Demo orders are NOT persisted server-side: the response is computed and returned, nothing more. */
export async function createOrder(input: OrderInput): Promise<Order> {
  return (await apiFetch<Order>("/orders", { method: "POST", body: input })).data;
}
export async function listOrders(): Promise<Order[]> {
  return (await apiFetch<Order[]>("/orders")).data;
}
export async function sendContact(body: { name: string; email: string; message: string }) {
  return (await apiFetch<{ delivered: boolean; note: string }>("/contact", { method: "POST", body })).data;
}
