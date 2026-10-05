"use server";

import { redirect } from "next/navigation";
import { completeGoogleSignupRequest, loginRequest, registerRequest, resendVerificationRequest } from "@/lib/api/auth";
import { ApiError, isMockMode } from "@/lib/api/client";
import { clearSessionToken, setSessionToken } from "@/lib/api/session";
import type { LoginResponse, UserRole } from "@/lib/api/types";
import { clearGoogleSignup, getGoogleSignup } from "@/lib/auth/google";
import {
  type AuthNotice,
  MOCK_MODE_MESSAGE,
  REQUEST_FAILED_MESSAGE,
  SERVER_UNREACHABLE_MESSAGE,
  wrongRoleNotice,
} from "@/lib/auth/messages";
import { takeReturnPath } from "@/lib/auth/return-to";
import { type AuthRole, authRoleOf, authRoles, isAuthRole } from "@/lib/auth/roles";
import {
  type FieldErrors,
  INVALID_CREDENTIALS_MESSAGE,
  type RegisterField,
  type RegisterValues,
  validateRegister,
  validateUsername,
} from "@/lib/auth/validation";

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

// The page's role is bound to the action from its URL (/login/[role]). Bound arguments still come from the
// browser, so anything else is treated as tampering.
function assertRole(role: unknown): asserts role is AuthRole {
  if (!isAuthRole(role)) throw new Error("Unknown sign-in role");
}

// Still used by the Google sign-up form, which sends the role in a hidden input.
function roleFrom(formData: FormData): AuthRole {
  const role = formData.get("role");
  assertRole(role);
  return role;
}

// Keeps only the fields the form shows, so a stray backend key cannot hide the message.
function pickFields(fields: Record<string, string> | undefined, names: RegisterField[]): FieldErrors | undefined {
  if (!fields) return undefined;
  const picked = Object.fromEntries(names.filter((name) => fields[name]).map((name) => [name, fields[name]]));
  return Object.keys(picked).length > 0 ? picked : undefined;
}

// ApiError messages come from the backend in Indonesian; a bare HTTP error (e.g. an endpoint that does
// not exist yet) has no code and gets a generic message instead.
function messageOf(error: unknown): string {
  if (!(error instanceof ApiError)) return SERVER_UNREACHABLE_MESSAGE;
  return error.code ? error.message : REQUEST_FAILED_MESSAGE;
}

// Sets the session only when the account belongs on this page (FR-X-001). Admin accounts have no sign-in page.
async function startSession(role: AuthRole, result: LoginResponse): Promise<AuthNotice | undefined> {
  const accountRole = authRoleOf(result.user.role);
  if (!accountRole) return { message: INVALID_CREDENTIALS_MESSAGE };
  if (accountRole !== role) return wrongRoleNotice(accountRole);
  await setSessionToken(result.accessToken);
  return undefined;
}

// The page a signed-out user was sent away from (e.g. a join link), else the role's home page.
async function pageAfterSignIn(role: AuthRole): Promise<string> {
  return (await takeReturnPath()) ?? authRoles[role].homePath;
}

export type LoginState = (AuthNotice & { identifier: string; unverified?: boolean }) | undefined;

export async function login(role: AuthRole, _previous: LoginState, formData: FormData): Promise<LoginState> {
  assertRole(role);
  const identifier = text(formData, "identifier");
  const password = String(formData.get("password") ?? "");

  if (!identifier || !password) {
    return { message: "Email/username dan kata sandi wajib diisi.", identifier };
  }

  // Mock mode has no accounts: go straight into the role's side of the app.
  if (isMockMode) redirect(authRoles[role].homePath);

  let notice: AuthNotice | undefined;
  try {
    notice = await startSession(role, await loginRequest(identifier, password, role));
  } catch (error) {
    // The password was right but the account is another role's; the backend only says so after checking it.
    if (error instanceof ApiError && error.code === "wrong_portal") {
      const accountRole = typeof error.extra?.role === "string" ? authRoleOf(error.extra.role as UserRole) : null;
      // Admin accounts have no sign-in page, so they read as wrong credentials.
      return { ...(accountRole ? wrongRoleNotice(accountRole) : { message: INVALID_CREDENTIALS_MESSAGE }), identifier };
    }
    // Not sent by the backend yet: email verification (FR-X-008) is not built.
    if (error instanceof ApiError && error.code === "email_not_verified") {
      return { message: "Verifikasi email Anda terlebih dahulu.", identifier, unverified: true };
    }
    // 422 is the backend rejecting a username in the email field; it reads the same as wrong credentials.
    if (error instanceof ApiError && (error.status === 401 || error.status === 422)) {
      return { message: INVALID_CREDENTIALS_MESSAGE, identifier };
    }
    return { message: SERVER_UNREACHABLE_MESSAGE, identifier };
  }

  if (notice) return { ...notice, identifier };
  redirect(await pageAfterSignIn(role));
}

export type ResendState = { message: string } | undefined;

// FR-X-008: sends a new verification link. Submitted from the sign-in form, so it reuses its identifier.
export async function resendVerification(_previous: ResendState, formData: FormData): Promise<ResendState> {
  const identifier = text(formData, "identifier");
  if (isMockMode) return { message: MOCK_MODE_MESSAGE };
  try {
    await resendVerificationRequest(identifier);
  } catch (error) {
    return { message: messageOf(error) };
  }
  return { message: "Tautan verifikasi baru telah dikirim. Periksa kotak masuk email Anda." };
}

export type RegisterState =
  | { message?: string; fields?: FieldErrors; values: Pick<RegisterValues, "username" | "email"> }
  | undefined;

// Signs the new account in right away (FR-X-006, FR-X-007): there is no email verification yet.
export async function register(role: AuthRole, _previous: RegisterState, formData: FormData): Promise<RegisterState> {
  assertRole(role);
  const values: RegisterValues = {
    username: text(formData, "username"),
    email: text(formData, "email"),
    password: String(formData.get("password") ?? ""),
    passwordConfirmation: String(formData.get("passwordConfirmation") ?? ""),
  };
  // Passwords are never sent back to the browser.
  const kept = { username: values.username, email: values.email };

  // The browser validates first; this repeats it for requests that skip the form (SRS 6.1.1).
  const fields = validateRegister(values);
  if (Object.keys(fields).length > 0) return { fields, values: kept };

  if (isMockMode) return { message: MOCK_MODE_MESSAGE, values: kept };

  let notice: AuthNotice | undefined;
  try {
    notice = await startSession(role, await registerRequest(role, values));
  } catch (error) {
    const fields =
      error instanceof ApiError
        ? pickFields(error.fields, ["username", "email", "password", "passwordConfirmation"])
        : undefined;
    return { message: fields ? undefined : messageOf(error), fields, values: kept };
  }

  if (notice) return { message: notice.message, values: kept };
  redirect(await pageAfterSignIn(role));
}

export type GoogleSignupState =
  | (Partial<AuthNotice> & { fields?: Pick<FieldErrors, "username">; username: string })
  | undefined;

// Finishes signing up with Google once the user has picked a username (SRS 6.1.1).
export async function completeGoogleSignup(
  _previous: GoogleSignupState,
  formData: FormData,
): Promise<GoogleSignupState> {
  const role = roleFrom(formData);
  const username = text(formData, "username");

  const usernameError = validateUsername(username);
  if (usernameError) return { fields: { username: usernameError }, username };

  const signup = await getGoogleSignup();
  if (!signup || signup.role !== role) redirect(`${authRoles[role].registerPath}?error=signup_expired`);

  let notice: AuthNotice | undefined;
  try {
    notice = await startSession(role, await completeGoogleSignupRequest(signup.signupToken, username));
  } catch (error) {
    const fields = error instanceof ApiError ? pickFields(error.fields, ["username"]) : undefined;
    return { message: fields ? undefined : messageOf(error), fields, username };
  }

  await clearGoogleSignup();
  if (notice) return { ...notice, username };
  redirect(await pageAfterSignIn(role));
}

export async function logout() {
  await clearSessionToken();
  redirect("/login");
}
