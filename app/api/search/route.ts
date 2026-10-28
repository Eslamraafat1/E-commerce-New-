import { suggest } from "@/data/demo/service";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  return Response.json({ data: suggest(q.slice(0, 80)) });
}
