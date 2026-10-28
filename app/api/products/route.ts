import { listProducts } from "@/data/demo/service";
import { parseQuery } from "@/lib/api/products";
import { toErrorResponse } from "@/lib/api/errors";

export async function GET(req: Request) {
  try {
    const q = parseQuery(new URL(req.url).searchParams);
    return Response.json({ data: listProducts(q) });
  } catch (e) {
    return toErrorResponse(e);
  }
}
