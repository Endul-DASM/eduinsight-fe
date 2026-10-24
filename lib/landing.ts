import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isMockMode } from "./api/client";
import { getSessionToken } from "./api/session";
import type { CurrentUser } from "./api/types";
import { getCurrentUser } from "./api/users";
import { authRoleOf, authRoles } from "./auth/roles";
import { isTokenExpired } from "./auth/session-expiry";

// The visitor of Home and About, when signed in as a teacher or student, so the pages offer "Lanjut sebagai …"
// instead of Login and Sign Up. Public pages never fail because of it: no session, an expired one, mock mode, an
// unreachable backend or an admin account (which has no pages here) all count as signed out.
export async function getLandingUser(): Promise<CurrentUser | null> {
  // Always render per request. CI builds without API_BASE_URL, where the mock check below returns before
  // cookies() is read, so Next prerendered Home and About as static; on the VM the same code then read cookies
  // in a static page and every visit failed with DYNAMIC_SERVER_USAGE (500).
  await connection();
  if (isMockMode) return null;
  const token = await getSessionToken();
  if (!token || isTokenExpired(token)) return null;
  try {
    const user = await getCurrentUser();
    return authRoleOf(user.role) ? user : null;
  } catch {
    // Includes the redirect apiFetch raises when the backend refuses the token.
    return null;
  }
}

// Where signing in leads: the role's subject list (lib/auth/roles.ts). Only for a user from getLandingUser.
export function homePathOf(user: CurrentUser): string {
  const role = authRoleOf(user.role);
  return role ? authRoles[role].homePath : "/login";
}

export function continueLabelOf(user: CurrentUser): string {
  return `Lanjut sebagai ${user.name}`;
}

// Sign-in and sign-up pages: a visitor who is still signed in goes straight to their subjects.
export async function redirectIfSignedIn(): Promise<void> {
  const user = await getLandingUser();
  if (user) redirect(homePathOf(user));
}
