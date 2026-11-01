import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_EXPIRED_PATH } from "@/lib/auth/session-expiry";
import { getSessionToken } from "./session";

const API_BASE_URL = process.env.API_BASE_URL;

// Without API_BASE_URL the app runs on the mock data in lib/api/mocks.
export const isMockMode = !API_BASE_URL;

// Error body returned by eduinsight-be: { detail: { code, message, fields?, ...extra } }.
type ErrorBody = {
  detail?: { code?: string; message?: string; fields?: Record<string, string>; [key: string]: unknown } | string;
};

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
    // Validation messages keyed by request field, e.g. { kkmDefault: "..." }.
    readonly fields?: Record<string, string>,
    // Any other keys of detail, e.g. { role: "siswa" } on wrong_portal.
    readonly extra?: Record<string, unknown>,
  ) {
    super(message);
  }
}

type ApiFetchInit = RequestInit & {
  // Set to false for requests that must not carry the session, such as login.
  withSession?: boolean;
};

export async function apiFetch<T>(path: string, { withSession = true, ...init }: ApiFetchInit = {}): Promise<T> {
  const token = withSession ? await getSessionToken() : undefined;
  // Requests without a session are the sign-in and sign-up ones, which the backend limits per user IP. nginx sets
  // X-Forwarded-For (Next.js fills it in when missing); uvicorn trusts it from 127.0.0.1 and takes the last address
  // it does not trust, so an address the browser made up is ignored.
  const forwardedFor = withSession ? null : (await headers()).get("x-forwarded-for");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      // JSON bodies are strings; FormData (file uploads) sets its own multipart boundary.
      ...(typeof init.body === "string" ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(forwardedFor ? { "X-Forwarded-For": forwardedFor } : {}),
      ...init.headers,
    },
  });

  // The session expired or was revoked: clear it and send the user back to sign in.
  if (response.status === 401 && token) {
    redirect(SESSION_EXPIRED_PATH);
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ErrorBody;
    // FastAPI's own errors (e.g. an unknown route) send detail as a plain string, without a code.
    const { code, message, fields, ...extra } = typeof body.detail === "object" && body.detail ? body.detail : {};
    throw new ApiError(
      response.status,
      message ?? `${init.method ?? "GET"} ${path} failed with ${response.status}`,
      code,
      fields,
      extra,
    );
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}
