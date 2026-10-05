import "server-only";
import { redirect } from "next/navigation";
import { SESSION_EXPIRED_PATH } from "@/lib/auth/session-expiry";
import { getSessionToken } from "./session";

const API_BASE_URL = process.env.API_BASE_URL;

// Without API_BASE_URL the app runs on the mock data in lib/api/mocks.
export const isMockMode = !API_BASE_URL;

// Error body returned by eduinsight-be: { detail: { code, message, fields?, ...extra } }.
type ErrorBody = {
  detail?: { code?: string; message?: string; fields?: Record<string, string>; [key: string]: unknown };
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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  // The session expired or was revoked: send the user back to sign in.
  if (response.status === 401 && token) {
    redirect("/login");
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ErrorBody;
    throw new ApiError(
      response.status,
      body.detail?.message ?? `${init.method ?? "GET"} ${path} failed with ${response.status}`,
      body.detail?.code,
      body.detail?.fields,
    );
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}
