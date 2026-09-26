import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/api/session";

const publicPaths = new Set(["/", "/login"]);

// Optimistic check: only looks for the session cookie. The backend still validates the token on every
// request, and apiFetch sends the user back to /login when it has expired.
export function proxy(request: NextRequest) {
  // Mock mode has no backend and therefore no sessions.
  if (!process.env.API_BASE_URL) return NextResponse.next();

  if (publicPaths.has(request.nextUrl.pathname) || request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  // Skip Next.js internals and static files in public/.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
