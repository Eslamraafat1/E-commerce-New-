import { getCategories } from "@/data/demo/service";

export async function GET() {
  return Response.json({ data: getCategories() });
}
