"use server";

import { redirect } from "next/navigation";
import { completeGoogleSignupRequest, loginRequest, registerRequest, resendVerificationRequest } from "@/lib/api/auth";
import { ApiError, isMockMode } from "@/lib/api/client";
import { clearSessionToken, setSessionToken } from "@/lib/api/session";
import type { LoginResponse } from "@/lib/api/types";
import { clearGoogleSignup, getGoogleSignup } from "@/lib/auth/google";
import {
  type AuthNotice,
  MOCK_MODE_MESSAGE,
  REQUEST_FAILED_MESSAGE,
  SERVER_UNREACHABLE_MESSAGE,
  wrongRoleNotice,
} from "@/lib/auth/messages";
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

// The page's role travels in a hidden input; anything else is treated as tampering.
function roleFrom(formData: FormData): AuthRole {
  const role = formData.get("role");
  if (!isAuthRole(role)) throw new Error("Unknown sign-in role");
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

export type LoginState = (AuthNotice & { identifier: string; unverified?: boolean }) | undefined;

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const role = roleFrom(formData);
  const identifier = text(formData, "identifier");
  const password = String(formData.get("password") ?? "");

  if (!identifier || !password) {
    return { message: "Email/username dan kata sandi wajib diisi.", identifier };
  }

  // Mock mode has no accounts: go straight into the role's side of the app.
  if (isMockMode) redirect(authRoles[role].homePath);

  let notice: AuthNotice | undefined;
  try {
    notice = await startSession(role, await loginRequest(identifier, password));
  } catch (error) {
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
  redirect(authRoles[role].homePath);
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
  | { status: "error"; message?: string; fields?: FieldErrors; values: Pick<RegisterValues, "username" | "email"> }
  | { status: "sent"; email: string }
  | undefined;

export async function register(_previous: RegisterState, formData: FormData): Promise<RegisterState> {
  const role = roleFrom(formData);
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
  if (Object.keys(fields).length > 0) return { status: "error", fields, values: kept };

  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE, values: kept };

  try {
    await registerRequest(role, values);
  } catch (error) {
    const fields =
      error instanceof ApiError
        ? pickFields(error.fields, ["username", "email", "password", "passwordConfirmation"])
        : undefined;
    return { status: "error", message: fields ? undefined : messageOf(error), fields, values: kept };
  }

  return { status: "sent", email: values.email };
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
  redirect(authRoles[role].homePath);
}

export async function logout() {
  await clearSessionToken();
  redirect("/login");
}
