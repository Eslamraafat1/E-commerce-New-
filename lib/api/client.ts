import { apiBaseUrl } from "./config";
import { ApiError } from "./errors";
import type { ApiEnvelope, ApiErrorBody } from "./types";

type Params = Record<string, string | number | boolean | string[] | undefined>;

function qs(params?: Params) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v === undefined || v === "" || v === false) continue;
    sp.set(k, Array.isArray(v) ? v.join(",") : String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/** Typed fetch wrapper returning the response envelope ({ data, meta? }). */
export async function apiFetch<T>(path: string, opts: { method?: string; params?: Params; body?: unknown; signal?: AbortSignal } = {}): Promise<ApiEnvelope<T>> {
  let res: Response;
  try {
    res = await fetch(`${apiBaseUrl}${path}${qs(opts.params)}`, {
      method: opts.method ?? "GET",
      headers: opts.body ? { "Content-Type": "application/json" } : undefined,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new ApiError("network_error", "Network request failed", 0);
  }
  const json = (await res.json().catch(() => null)) as (ApiEnvelope<T> & Partial<ApiErrorBody>) | null;
  if (!res.ok || !json || json.error) {
    throw new ApiError(json?.error?.code ?? "http_error", json?.error?.message ?? `Request failed (${res.status})`, res.status, json?.error?.details);
  }
  return json;
}
