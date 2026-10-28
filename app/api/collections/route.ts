import { getCollections } from "@/data/demo/service";

export async function GET() {
  return Response.json({ data: getCollections() });
}
