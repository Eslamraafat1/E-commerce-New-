import { getProduct, relatedProducts } from "@/data/demo/service";
import { notFound, toErrorResponse } from "@/lib/api/errors";

export async function GET(req: Request, ctx: RouteContext<"/api/products/[id]">) {
  try {
    const { id } = await ctx.params;
    const related = new URL(req.url).searchParams.get("related");
    if (related) return Response.json({ data: relatedProducts(id, Number(related) || 4) });
    const p = getProduct(id);
    if (!p) throw notFound("Product");
    return Response.json({ data: p });
  } catch (e) {
    return toErrorResponse(e);
  }
}
