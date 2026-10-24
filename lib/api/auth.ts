import { apiFetch } from "./client";
import type {
  GoogleExchangeResponse,
  LoginResponse,
  NewPasswordInput,
  RegisterRequest,
  RegisterResponse,
} from "./types";
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

// POST /auth/register/{guru|siswa} — sends a verification email (FR-X-008); returns a session instead only when
// the backend has verification turned off.
export async function registerRequest(role: AuthRole, input: RegisterRequest): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>(`/auth/register/${authRoles[role].apiRole}`, {
    method: "POST",
    body: JSON.stringify(input),
    withSession: false,
  });
}

// POST /auth/verify-email — redeems the emailed link and signs the user in.
export async function verifyEmailRequest(token: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
    withSession: false,
  });
}

// POST /auth/verify-email/resend — always 202, so it never reveals whether the account exists.
export async function resendVerificationRequest(identifier: string): Promise<void> {
  await apiFetch<unknown>("/auth/verify-email/resend", {
    method: "POST",
    body: JSON.stringify({ identifier }),
    withSession: false,
  });
}

// POST /auth/password/forgot (FR-X-004) — always 202 for a well-formed email.
export async function forgotPasswordRequest(email: string): Promise<void> {
  await apiFetch<unknown>("/auth/password/forgot", {
    method: "POST",
    body: JSON.stringify({ email }),
    withSession: false,
  });
}

// POST /auth/password/reset — sets the new password from the emailed link and signs the user in.
export async function resetPasswordRequest(token: string, input: NewPasswordInput): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/password/reset", {
    method: "POST",
    body: JSON.stringify({ token, ...input }),
    withSession: false,
  });
}

// POST /auth/password/change — signs out every other session, so it returns a new one for this browser.
// POST /auth/password/set — Buat Password for a Google-only account; returns a new session (409 password_exists
// when the account already has one).
export async function setPasswordRequest(input: NewPasswordInput): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/password/set", { method: "POST", body: JSON.stringify(input) });
}

export async function changePasswordRequest(currentPassword: string, input: NewPasswordInput): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/password/change", {
    method: "POST",
    body: JSON.stringify({ currentPassword, ...input }),
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
