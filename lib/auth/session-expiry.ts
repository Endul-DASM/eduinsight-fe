// When a backend access token expires, from its `exp` claim (JWT_EXPIRE_MINUTES on the backend).
// The signature is not checked: this only schedules the logout, and the backend still validates every request.
export function tokenExpiresAt(token: string): number | undefined {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(payload)) as { exp?: unknown };
    return typeof exp === "number" ? exp * 1000 : undefined;
  } catch {
    return undefined;
  }
}

export function isTokenExpired(token: string, now = Date.now()): boolean {
  const expiresAt = tokenExpiresAt(token);
  return expiresAt !== undefined && expiresAt <= now;
}

// Clears the session cookie and opens the sign-in page with a "session ended" notice. A route, not a redirect
// to /login, because cookies cannot be deleted while a page renders.
export const SESSION_EXPIRED_PATH = "/auth/session-expired";
