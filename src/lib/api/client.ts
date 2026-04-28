import type { ZodType } from "zod";

const BASE_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = "ApiError";
  }
}

export function zparse<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const msg = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`API response mismatch: ${msg}`);
  }
  return result.data;
}

type ApiEnvelope<T> = { success: true; data: T } | { success: false; error: string };

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, params }: RequestOptions = {}
): Promise<T> {
  if (!BASE_URL) throw new Error("API_URL is not set");
  if (!API_KEY) throw new Error("API_KEY is not set");

  const url = new URL(`/api${path}`, BASE_URL);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
  });

  if (res.status === 204) return undefined as T;

  let json: ApiEnvelope<T>;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError(res.status, `Non-JSON response from API (${res.status} ${res.statusText})`);
  }

  if (!res.ok || !json.success) {
    const msg = "error" in json ? json.error : res.statusText;
    throw new ApiError(res.status, msg);
  }

  return json.data;
}
