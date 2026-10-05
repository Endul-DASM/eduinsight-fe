import "server-only";
import { cookies } from "next/headers";
import type { AuthRole } from "./roles";

// Sign in with Google: OAuth 2.0 Authorization Code + PKCE with state and nonce (SRS IF-SW-05, NFR-19).
// Only the public client ID lives here; the backend redeems the code with the client secret.
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const OAUTH_COOKIE = "eduinsight_oauth";
const SIGNUP_COOKIE = "eduinsight_google_signup";
const TEN_MINUTES = 10 * 60;

export type GoogleIntent = "login" | "register";

type OAuthState = {
  state: string;
  nonce: string;
  codeVerifier: string;
  role: AuthRole;
  intent: GoogleIntent;
};

// A Google account with no EduInsight account yet, waiting for a username.
export type GoogleSignup = {
  signupToken: string;
  email: string;
  suggestedUsername?: string;
  role: AuthRole;
};

function base64url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

export function randomToken(): string {
  return base64url(crypto.getRandomValues(new Uint8Array(32)));
}

export async function codeChallenge(codeVerifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(codeVerifier));
  return base64url(new Uint8Array(digest));
}

export function callbackUrl(origin: string): string {
  return new URL("/auth/google/callback", origin).toString();
}

export function authorizeUrl(params: { redirectUri: string; state: string; nonce: string; codeChallenge: string }) {
  const url = new URL(AUTHORIZE_URL);
  url.search = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID ?? "",
    redirect_uri: params.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: params.state,
    nonce: params.nonce,
    code_challenge: params.codeChallenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return url.toString();
}

// Cookie values are base64url JSON so they never contain characters a cookie cannot hold.
function encode(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function decode<T>(value: string | undefined): T | undefined {
  if (!value) return undefined;
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString()) as T;
  } catch {
    return undefined;
  }
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  // Lax still sends the cookie on the top-level redirect back from Google.
  sameSite: "lax",
  maxAge: TEN_MINUTES,
} as const;

export async function saveOAuthState(value: OAuthState) {
  (await cookies()).set(OAUTH_COOKIE, encode(value), { ...cookieOptions, path: "/auth/google" });
}

// Single use: the state is deleted as soon as it is read.
export async function takeOAuthState(): Promise<OAuthState | undefined> {
  const store = await cookies();
  const value = decode<OAuthState>(store.get(OAUTH_COOKIE)?.value);
  store.delete({ name: OAUTH_COOKIE, path: "/auth/google" });
  return value;
}

export async function saveGoogleSignup(value: GoogleSignup) {
  (await cookies()).set(SIGNUP_COOKIE, encode(value), { ...cookieOptions, path: "/" });
}

export async function getGoogleSignup(): Promise<GoogleSignup | undefined> {
  return decode<GoogleSignup>((await cookies()).get(SIGNUP_COOKIE)?.value);
}

export async function clearGoogleSignup() {
  (await cookies()).delete(SIGNUP_COOKIE);
}
