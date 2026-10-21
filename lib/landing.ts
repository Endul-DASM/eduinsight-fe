import "server-only";
import { connection } from "next/server";
import { isMockMode } from "./api/client";
import { getSessionToken } from "./api/session";
import type { CurrentUser } from "./api/types";
import { getCurrentUser } from "./api/users";
import { isTokenExpired } from "./auth/session-expiry";

// The visitor of Home and About, when signed in, so the top bar can offer "Ke Dashboard" instead of Login and
// Sign Up. Public pages never fail or redirect because of it: no session, an expired one, mock mode or an
// unreachable backend all count as signed out.
export async function getLandingUser(): Promise<CurrentUser | null> {
  // Always render per request. CI builds without API_BASE_URL, where the mock check below returns before
  // cookies() is read, so Next prerendered Home and About as static; on the VM the same code then read cookies
  // in a static page and every visit failed with DYNAMIC_SERVER_USAGE (500).
  await connection();
  if (isMockMode) return null;
  const token = await getSessionToken();
  if (!token || isTokenExpired(token)) return null;
  try {
    return await getCurrentUser();
  } catch {
    // Includes the redirect apiFetch raises when the backend refuses the token.
    return null;
  }
}

export function dashboardPathOf(user: CurrentUser): string {
  return user.role === "siswa" ? "/student/dashboard" : "/choose-subject";
}
