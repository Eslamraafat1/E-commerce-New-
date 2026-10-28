import type { ApiErrorBody } from "./types";

export class ApiError extends Error {
  constructor(public code: string, message: string, public status = 500, public details?: unknown) {
    super(message);
    this.name = "ApiError";
  }
  toBody(): ApiErrorBody { return { error: { code: this.code, message: this.message, details: this.details } }; }
}
export const notFound = (what = "Resource") => new ApiError("not_found", `${what} not found`, 404);
export const badRequest = (message: string, details?: unknown) => new ApiError("bad_request", message, 400, details);

export function toErrorResponse(e: unknown) {
  const err = e instanceof ApiError ? e : new ApiError("internal_error", "Unexpected server error", 500);
  return Response.json(err.toBody(), { status: err.status });
}
