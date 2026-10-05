import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { isMockMode } from "@/lib/api/client";
import {
  authorizeUrl,
  callbackUrl,
  codeChallenge,
  GOOGLE_CLIENT_ID,
  type GoogleIntent,
  randomToken,
  saveOAuthState,
} from "@/lib/auth/google";
import { authRoles, isAuthRole } from "@/lib/auth/roles";

// GET /auth/google?role=teacher&intent=login — starts signing in or up with Google.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const role = params.get("role");
  if (!isAuthRole(role)) redirect("/login");

  const intent: GoogleIntent = params.get("intent") === "register" ? "register" : "login";
  const page = intent === "register" ? authRoles[role].registerPath : authRoles[role].loginPath;

  if (isMockMode || !GOOGLE_CLIENT_ID) redirect(`${page}?error=google_unavailable`);

  const state = randomToken();
  const nonce = randomToken();
  const codeVerifier = randomToken();
  await saveOAuthState({ state, nonce, codeVerifier, role, intent });

  redirect(
    authorizeUrl({
      redirectUri: callbackUrl(request.nextUrl.origin),
      state,
      nonce,
      codeChallenge: await codeChallenge(codeVerifier),
    }),
  );
}
