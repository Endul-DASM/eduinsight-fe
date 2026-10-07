import { apiFetch } from "./client";
import type { GoogleExchangeResponse, LoginResponse, RegisterRequest } from "./types";
import type { AuthRole } from "@/lib/auth/roles";
import { authRoles } from "@/lib/auth/roles";

// POST /auth/login — the identifier is an email or a username (SRS FR-X-001). The role is the sign-in page's;
// an account of another role is refused with 403 wrong_portal.
export async function loginRequest(identifier: string, password: string, role: AuthRole): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password, role: authRoles[role].apiRole }),
    withSession: false,
  });
}

// POST /auth/register/{guru|siswa} — the account is active right away, so this returns a session.
// Email verification (FR-X-008) is not built yet.
export async function registerRequest(role: AuthRole, input: RegisterRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>(`/auth/register/${authRoles[role].apiRole}`, {
    method: "POST",
    body: JSON.stringify(input),
    withSession: false,
  });
}

// POST /auth/verify-email/resend
export async function resendVerificationRequest(identifier: string): Promise<void> {
  await apiFetch<unknown>("/auth/verify-email/resend", {
    method: "POST",
    body: JSON.stringify({ identifier }),
    withSession: false,
  });
}

export type GoogleExchangeInput = {
  code: string;
  codeVerifier: string;
  redirectUri: string;
  nonce: string;
  role: AuthRole;
};

// POST /auth/google — the backend redeems the code with its client secret and verifies the ID token (SRS 3.3).
export async function exchangeGoogleCode(input: GoogleExchangeInput): Promise<GoogleExchangeResponse> {
  return apiFetch<GoogleExchangeResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ ...input, role: authRoles[input.role].apiRole }),
    withSession: false,
  });
}

// POST /auth/google/complete — finishes a Google sign-up with the chosen username.
export async function completeGoogleSignupRequest(signupToken: string, username: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/google/complete", {
    method: "POST",
    body: JSON.stringify({ signupToken, username }),
    withSession: false,
  });
}
