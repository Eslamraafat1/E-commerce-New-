import { badRequest, toErrorResponse } from "@/lib/api/errors";
import { contactSchema } from "@/lib/api/schemas";

/** DEMO ONLY: validates the message and discards it. Nothing is stored or emailed. */
export async function POST(req: Request) {
  try {
    const parsed = contactSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw badRequest("Invalid message", parsed.error.flatten());
    return Response.json({ data: { delivered: false, note: "Demo mode: your message was validated but not delivered." } });
  } catch (e) {
    return toErrorResponse(e);
  }
}
