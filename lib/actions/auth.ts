"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import {
  changePasswordRequest,
  completeGoogleSignupRequest,
  forgotPasswordRequest,
  loginRequest,
  registerRequest,
  resendVerificationRequest,
  resetPasswordRequest,
  setPasswordRequest,
  verifyEmailRequest,
} from "@/lib/api/auth";
import { ApiError, isMockMode } from "@/lib/api/client";
import { clearSessionToken, setSessionToken } from "@/lib/api/session";
import type { LoginResponse, NewPasswordInput, RegisterResponse, UserRole } from "@/lib/api/types";
import { clearGoogleSignup, getGoogleSignup } from "@/lib/auth/google";
import {
  type AuthNotice,
  MOCK_ACCOUNT_MESSAGE,
  MOCK_MODE_MESSAGE,
  REQUEST_FAILED_MESSAGE,
  SERVER_UNREACHABLE_MESSAGE,
  wrongRoleNotice,
} from "@/lib/auth/messages";
import { getPendingVerification, setPendingVerification } from "@/lib/auth/pending-verification";
import { takeReturnPath } from "@/lib/auth/return-to";
import { type AuthRole, authRoleOf, authRoles, isAuthRole } from "@/lib/auth/roles";
import {
  type FieldErrors,
  INVALID_CREDENTIALS_MESSAGE,
  type RegisterField,
  type RegisterValues,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
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

export type LoginState = (AuthNotice & { identifier: string }) | undefined;

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
    // FR-X-008: the password is right but the email is not verified yet; a page of its own offers a new link.
    if (error instanceof ApiError && error.code === "email_not_verified") {
      const email = typeof error.extra?.email === "string" ? error.extra.email : identifier;
      await setPendingVerification(email);
      // Thrown from the catch block, so nothing here catches it.
      redirect(authRoles[role].verifyEmailPath);
    }
    // Too many attempts: the backend says how long to wait.
    if (error instanceof ApiError && error.code === "rate_limited") {
      return { message: error.message, identifier };
    }
    // A 422 is a malformed request body; it reads the same as wrong credentials.
    if (error instanceof ApiError && (error.status === 401 || error.status === 422)) {
      return { message: INVALID_CREDENTIALS_MESSAGE, identifier };
    }
    return { message: SERVER_UNREACHABLE_MESSAGE, identifier };
  }

  if (notice) return { ...notice, identifier };
  redirect(await pageAfterSignIn(role));
}

export type ResendState = { message: string } | undefined;

// FR-X-008: sends a new verification link. The sign-up page sends the email it registered; the "Email Belum
// Diverifikasi" page sends nothing, and the email comes from the cookie set when signing in.
export async function resendVerification(_previous: ResendState, formData: FormData): Promise<ResendState> {
  const identifier = text(formData, "identifier") || (await getPendingVerification());
  if (!identifier) return { message: "Sesi verifikasi berakhir. Silakan masuk kembali." };
  if (isMockMode) return { message: MOCK_MODE_MESSAGE };
  try {
    await resendVerificationRequest(identifier);
  } catch (error) {
    return { message: messageOf(error) };
  }
  return { message: "Tautan verifikasi baru telah dikirim. Periksa kotak masuk email Anda." };
}

export type RegisterState =
  | {
      message?: string;
      fields?: FieldErrors;
      values: Pick<RegisterValues, "username" | "name" | "email">;
      // The account exists; the form gives way to "Akun Berhasil Dibuat!".
      created?: boolean;
      // The account exists but its email must be verified first (FR-X-008); the form gives way to "Periksa Email".
      verificationSentTo?: string;
    }
  | undefined;

// Creates the account without signing it in. With email verification on (FR-X-008) the page asks the user to open
// the emailed link; otherwise it shows "Akun Berhasil Dibuat!" and the user signs in (Figma New Design 22:3160).
export async function register(role: AuthRole, _previous: RegisterState, formData: FormData): Promise<RegisterState> {
  assertRole(role);
  const values: RegisterValues = {
    username: text(formData, "username"),
    // Runs of spaces are collapsed so the first word is found reliably.
    name: text(formData, "name").replace(/\s+/g, " "),
    email: text(formData, "email"),
    password: String(formData.get("password") ?? ""),
    passwordConfirmation: String(formData.get("passwordConfirmation") ?? ""),
  };
  // Passwords are never sent back to the browser.
  const kept = { username: values.username, name: values.name, email: values.email };

  // The browser validates first; this repeats it for requests that skip the form (SRS 6.1.1).
  const fields = validateRegister(values);
  if (Object.keys(fields).length > 0) return { fields, values: kept };

  // Mock mode has no accounts, but the success screen can still be tried.
  if (isMockMode) return { created: true, values: kept };

  let result: RegisterResponse;
  try {
    result = await registerRequest(role, values);
  } catch (error) {
    const fields =
      error instanceof ApiError
        ? pickFields(error.fields, ["username", "name", "email", "password", "passwordConfirmation"])
        : undefined;
    return { message: fields ? undefined : messageOf(error), fields, values: kept };
  }

  if ("status" in result) return { verificationSentTo: result.email, values: kept };
  // Verification is off and the backend returned a session; it is not kept, so the user signs in on the role's page.
  if (authRoleOf(result.user.role) !== role) return { message: REQUEST_FAILED_MESSAGE, values: kept };
  return { created: true, values: kept };
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

// Signs in with the session returned by an emailed link and opens the account's home page. Admin accounts have no
// sign-in page here, so they only get a message.
async function signInFromLink(result: LoginResponse, done: string): Promise<{ message: string }> {
  const role = authRoleOf(result.user.role);
  if (!role) return { message: done };
  await setSessionToken(result.accessToken);
  redirect(authRoles[role].homePath);
}

export type LinkState = { message: string; invalidLink?: boolean } | undefined;

// FR-X-008: the token comes from the emailed link (/verify-email?token=) and is bound to the action.
export async function verifyEmail(token: string): Promise<LinkState> {
  if (isMockMode) return { message: MOCK_ACCOUNT_MESSAGE };
  let result: LoginResponse;
  try {
    result = await verifyEmailRequest(token);
  } catch (error) {
    if (error instanceof ApiError && error.code === "token_invalid") {
      return { message: error.message, invalidLink: true };
    }
    return { message: messageOf(error) };
  }
  // Outside the try: redirect() works by throwing.
  return signInFromLink(result, "Email berhasil diverifikasi.");
}

export type ForgotPasswordState = { message?: string; error?: string; email: string; sent?: boolean } | undefined;

// FR-X-004: the backend answers the same whether or not the email is registered, and so does this.
export async function requestPasswordReset(
  _previous: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = text(formData, "email");
  const emailError = validateEmail(email);
  if (emailError) return { error: emailError, email };
  if (isMockMode) return { message: MOCK_ACCOUNT_MESSAGE, email };

  try {
    await forgotPasswordRequest(email);
  } catch (error) {
    const fieldError = error instanceof ApiError ? error.fields?.email : undefined;
    return fieldError ? { error: fieldError, email } : { message: messageOf(error), email };
  }
  return {
    sent: true,
    email,
    message: "Jika email tersebut terdaftar, kami telah mengirim tautan untuk mengatur ulang kata sandi.",
  };
}

type PasswordField = "currentPassword" | "password" | "passwordConfirmation";
export type PasswordErrors = Partial<Record<PasswordField, string>>;

function newPasswordOf(formData: FormData): NewPasswordInput {
  return {
    password: String(formData.get("password") ?? ""),
    passwordConfirmation: String(formData.get("passwordConfirmation") ?? ""),
  };
}

function validateNewPassword({ password, passwordConfirmation }: NewPasswordInput): PasswordErrors {
  const errors: PasswordErrors = {
    password: validatePassword(password),
    passwordConfirmation: validatePasswordConfirmation(password, passwordConfirmation),
  };
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
}

// Keeps only the fields the form shows, like pickFields for the sign-up form.
function passwordFieldsOf(error: unknown, names: PasswordField[]): PasswordErrors | undefined {
  const fields = error instanceof ApiError ? error.fields : undefined;
  if (!fields) return undefined;
  const picked = Object.fromEntries(names.filter((name) => fields[name]).map((name) => [name, fields[name]]));
  return Object.keys(picked).length > 0 ? picked : undefined;
}

export type ResetPasswordState = { message?: string; invalidLink?: boolean; fields?: PasswordErrors } | undefined;

// FR-X-004: sets the new password from the emailed link (/reset-password?token=) and signs the user in.
export async function resetPassword(
  token: string,
  _previous: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const input = newPasswordOf(formData);
  const fields = validateNewPassword(input);
  if (Object.keys(fields).length > 0) return { fields };
  if (isMockMode) return { message: MOCK_ACCOUNT_MESSAGE };

  let result: LoginResponse;
  try {
    result = await resetPasswordRequest(token, input);
  } catch (error) {
    if (error instanceof ApiError && error.code === "token_invalid") {
      return { message: error.message, invalidLink: true };
    }
    const fields = passwordFieldsOf(error, ["password", "passwordConfirmation"]);
    return fields ? { fields } : { message: messageOf(error) };
  }
  // Outside the try: redirect() works by throwing.
  return signInFromLink(result, "Kata sandi berhasil diatur ulang.");
}

export type ChangePasswordState = { message?: string; changed?: boolean; fields?: PasswordErrors } | undefined;

// Changes the signed-in user's password. Every other session is signed out, and this browser gets a new one.
export async function changePassword(_previous: ChangePasswordState, formData: FormData): Promise<ChangePasswordState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const input = newPasswordOf(formData);
  const fields: PasswordErrors = {
    ...(currentPassword ? {} : { currentPassword: "Kata sandi saat ini wajib diisi." }),
    ...validateNewPassword(input),
  };
  if (Object.keys(fields).length > 0) return { fields };
  if (isMockMode) return { message: MOCK_ACCOUNT_MESSAGE };

  try {
    const result = await changePasswordRequest(currentPassword, input);
    await setSessionToken(result.accessToken);
  } catch (error) {
    // An expired session makes apiFetch redirect to sign in, which works by throwing.
    unstable_rethrow(error);
    const fields = passwordFieldsOf(error, ["currentPassword", "password", "passwordConfirmation"]);
    return fields ? { fields } : { message: messageOf(error) };
  }
  return { changed: true, message: "Kata sandi berhasil diubah. Sesi di perangkat lain telah dikeluarkan." };
}

export type SetPasswordState = { message?: string; created?: boolean; fields?: PasswordErrors } | undefined;

// Buat Password for an account that signs in with Google. Like a change, other sessions are signed out and this
// browser gets a new one; the pages are read again so Edit Profile shows Ubah Password from now on.
export async function setPassword(_previous: SetPasswordState, formData: FormData): Promise<SetPasswordState> {
  const input = newPasswordOf(formData);
  const fields = validateNewPassword(input);
  if (Object.keys(fields).length > 0) return { fields };
  if (isMockMode) return { message: MOCK_ACCOUNT_MESSAGE };

  try {
    const result = await setPasswordRequest(input);
    await setSessionToken(result.accessToken);
  } catch (error) {
    // An expired session makes apiFetch redirect to sign in, which works by throwing.
    unstable_rethrow(error);
    const fields = passwordFieldsOf(error, ["password", "passwordConfirmation"]);
    return fields ? { fields } : { message: messageOf(error) };
  }
  revalidatePath("/", "layout");
  return { created: true, message: "Kata sandi berhasil dibuat. Sekarang Anda juga bisa masuk dengan username atau email." };
}

export async function logout() {
  await clearSessionToken();
  redirect("/login");
}

// "Bukan Anda? Keluar" on Home: signs out and stays there, now with the sign-up options.
export async function logoutToHome() {
  await clearSessionToken();
  redirect("/#mulai");
}
