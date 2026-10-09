const DEFAULT_BASE = "https://ciprop.mustsacco.co.ke";
const TENANT_ID = (import.meta.env.VITE_API_TENANT_ID as string | undefined)?.trim() || "ACA";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(
  /\/$/,
  "",
) || DEFAULT_BASE;

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

function messageFromBody(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const record = body as Record<string, unknown>;
  const error = record.error;
  if (typeof error === "string" && error.trim()) return error;
  if (error && typeof error === "object") {
    const msg = (error as Record<string, unknown>).message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  if (typeof record.message === "string" && record.message.trim()) return record.message;
  return fallback;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, headers, ...rest } = options;
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...rest,
    headers: {
      Accept: "application/json",
      "x-tenant-id": TENANT_ID,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      // Avoid importing auth.ts here (circular with login()); wipe session keys directly.
      localStorage.removeItem("ors_auth_token");
      localStorage.removeItem("ors_auth_user");
      sessionStorage.removeItem("ors_auth_token");
      sessionStorage.removeItem("ors_auth_user");
      window.dispatchEvent(new Event("ors-auth-change"));
      throw new ApiError("Your session has expired. Please sign in again.", 401, parsed);
    }
    throw new ApiError(
      messageFromBody(parsed, `Request failed (${res.status})`),
      res.status,
      parsed,
    );
  }

  return parsed as T;
}
