import "server-only";
import { cookies } from "next/headers";
import { tokenExpiresAt } from "@/lib/auth/session-expiry";

export const SESSION_COOKIE = "eduinsight_session";

// The cookie outlives the token by a day, so an expired session can be told apart from no session and the
// sign-in page can say why the user was logged out. The backend refuses the token either way.
const COOKIE_GRACE_MS = 24 * 60 * 60 * 1000;

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

// When the signed-in session ends, in epoch milliseconds; undefined without a session.
export async function getSessionExpiresAt(): Promise<number | undefined> {
  const token = await getSessionToken();
  return token ? tokenExpiresAt(token) : undefined;
}

// Only callable from Server Functions: cookies cannot be written while a page renders.
export async function setSessionToken(token: string) {
  const expiresAt = tokenExpiresAt(token);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Follows the token's lifetime (JWT_EXPIRE_MINUTES on the backend).
    ...(expiresAt ? { expires: new Date(expiresAt + COOKIE_GRACE_MS) } : {}),
  });
}

export async function clearSessionToken() {
  (await cookies()).delete(SESSION_COOKIE);
}
