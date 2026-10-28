import { getProduct } from "@/data/demo/service";
import { badRequest, toErrorResponse } from "@/lib/api/errors";
import { buildLine, computeTotals } from "@/lib/api/cart";
import { orderSchema } from "@/lib/api/schemas";
import type { Order } from "@/lib/api/types";

/**
 * DEMO ONLY. Validates the order and re-prices it from the catalog (never trusting client prices),
 * but does NOT persist anything, charge a payment, or send email.
 */
export async function POST(req: Request) {
  try {
    const parsed = orderSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw badRequest("Invalid order", parsed.error.flatten());
    const { lines, ...input } = parsed.data;
    const snapshots = lines.map((l) => {
      const p = getProduct(l.productId);
      const v = p?.variants.find((x) => x.id === l.variantId);
      if (!p || !v) throw badRequest(`Unknown product or variant: ${l.productId}`);
      if (v.stock < l.qty) throw badRequest(`Insufficient stock for ${p.title.en}`);
      return buildLine(p, v, l.qty);
    });
    const t = computeTotals(snapshots, input.delivery, input.discountCode);
    const order: Order = {
      id: `VNT-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      status: "demo-placed",
      persisted: false,
      input,
      lines: snapshots,
      totals: { subtotal: t.subtotal, discount: t.discount, shipping: t.shipping, total: t.total },
    };
    return Response.json({ data: order }, { status: 201 });
  } catch (e) {
    return toErrorResponse(e);
  }
}

/** Public demo endpoint: never lists customer orders. A real backend must authorise this per user. */
export async function GET() {
  return Response.json({ data: [], meta: { note: "Demo mode: orders are not stored server-side." } });
}
