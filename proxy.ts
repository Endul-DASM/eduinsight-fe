import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/api/session";
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
  if (!token) return NextResponse.redirect(new URL("/login", request.url));
  // Expired, e.g. a tab left open past the end of the session: say so instead of failing on the first API call.
  if (isTokenExpired(token)) return NextResponse.redirect(new URL(SESSION_EXPIRED_PATH, request.url));

  return NextResponse.next();
}

export const config = {
  // Skip Next.js internals and static files in public/.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
