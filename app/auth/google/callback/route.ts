import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { exchangeGoogleCode } from "@/lib/api/auth";
import { setSessionToken } from "@/lib/api/session";
import type { GoogleExchangeResponse } from "@/lib/api/types";
import { callbackUrl, saveGoogleSignup, takeOAuthState } from "@/lib/auth/google";
import { authRoleOf, authRoles } from "@/lib/auth/roles";
import { suggestUsername } from "@/lib/auth/validation";

// GET /auth/google/callback — Google sends the user back here with ?code&state.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const saved = await takeOAuthState();

  // Without the cookie there is no way to tell where the user came from.
  if (!saved) redirect("/login");

  const { role, intent } = saved;
  const page = intent === "register" ? authRoles[role].registerPath : authRoles[role].loginPath;

  // A state that does not match was not started by this browser (CSRF).
  if (params.get("state") !== saved.state) redirect(`${page}?error=google_failed`);
  if (params.get("error") === "access_denied") redirect(`${page}?error=google_cancelled`);

  const code = params.get("code");
  if (!code) redirect(`${page}?error=google_failed`);

  let result: GoogleExchangeResponse;
  try {
    result = await exchangeGoogleCode({
      code,
      codeVerifier: saved.codeVerifier,
      redirectUri: callbackUrl(request.nextUrl.origin),
      nonce: saved.nonce,
      role,
    });
  } catch {
    redirect(`${page}?error=google_failed`);
  }

  // The email has no account yet: pick a username first.
  if (!("accessToken" in result)) {
    await saveGoogleSignup({
      signupToken: result.signupToken,
      email: result.email,
      suggestedUsername: result.suggestedUsername ?? suggestUsername(result.email),
      role,
    });
    redirect(authRoles[role].registerGooglePath);
  }

  // An existing account keeps its role (FR-X-005), so it may belong on the other role's page (FR-X-001).
  const accountRole = authRoleOf(result.user.role);
  if (!accountRole) redirect(`${page}?error=google_failed`);
  if (accountRole !== role) redirect(`${authRoles[role].loginPath}?error=wrong_role`);

  await setSessionToken(result.accessToken);
  redirect(authRoles[role].homePath);
}
