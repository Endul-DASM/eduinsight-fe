import "server-only";
import { cookies } from "next/headers";

// The email of an account that signed in with the right password but has not verified it yet (FR-X-008). Kept in a
// cookie, not the URL, so the address stays out of the browser history; the "Email Belum Diverifikasi" page reads it.
const PENDING_VERIFICATION_COOKIE = "eduinsight_pending_verification";

const PENDING_VERIFICATION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  // Long enough to open the email and come back; the verification link itself lasts an hour.
  maxAge: 30 * 60,
} as const;

// Only callable from Server Functions: cookies cannot be written while a page renders.
export async function setPendingVerification(email: string) {
  (await cookies()).set(PENDING_VERIFICATION_COOKIE, email, PENDING_VERIFICATION_COOKIE_OPTIONS);
}

export async function getPendingVerification(): Promise<string | undefined> {
  return (await cookies()).get(PENDING_VERIFICATION_COOKIE)?.value || undefined;
}
