import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/api/session";
import { RETURN_TO_COOKIE, RETURN_TO_COOKIE_OPTIONS, safeReturnPath } from "@/lib/auth/return-to";
import { isTokenExpired, SESSION_EXPIRED_PATH } from "@/lib/auth/session-expiry";

// Sign-in, sign-up and the Google OAuth routes, including everything below them.
const publicPrefixes = ["/login", "/register", "/forgot-password", "/auth/google", SESSION_EXPIRED_PATH];

function isPublic(pathname: string) {
  return pathname === "/" || publicPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

// Optimistic check: only looks at the session cookie and its expiry. The backend still validates the token on
// every request, and apiFetch sends the user back to sign in when it refuses it.
export function proxy(request: NextRequest) {
  // Mock mode has no backend and therefore no sessions.
  if (!process.env.API_BASE_URL) return NextResponse.next();

  if (isPublic(request.nextUrl.pathname)) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return signInFirst(request, "/login");
  // Expired, e.g. a tab left open past the end of the session: say so instead of failing on the first API call.
  if (isTokenExpired(token)) return signInFirst(request, SESSION_EXPIRED_PATH);

  return NextResponse.next();
}

// Sends the user to sign in and remembers the page, so they come back to it afterwards (e.g. a join link).
function signInFirst(request: NextRequest, path: string) {
  const response = NextResponse.redirect(new URL(path, request.url));

  // Prefetches (hovering a link) and form posts are not pages the user asked to open.
  if (request.method === "GET" && !request.headers.has("next-router-prefetch")) {
    const url = request.nextUrl.clone();
    // Added by client-side navigations; not part of the page's address.
    url.searchParams.delete("_rsc");
    const returnTo = safeReturnPath(url.pathname + url.search);
    if (returnTo) response.cookies.set(RETURN_TO_COOKIE, returnTo, RETURN_TO_COOKIE_OPTIONS);
  }

  return response;
}

export const config = {
  // Skip Next.js internals and static files in public/.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
