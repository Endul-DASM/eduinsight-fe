import "server-only";
import { cookies } from "next/headers";

// The page a signed-out user tried to open, e.g. a teacher's join link (/join/CODE). The proxy sets it and
// signing in or up sends the user back there instead of to the role's home page.
export const RETURN_TO_COOKIE = "eduinsight_return_to";

export const RETURN_TO_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  // Long enough to sign up, short enough that a later, unrelated sign-in is not sent there.
  maxAge: 30 * 60,
} as const;

// Only paths on this site: "//evil.example" and "/\evil.example" would leave it (open redirect).
export function safeReturnPath(value: string | undefined): string | undefined {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return undefined;
  return value;
}

// Only callable from Server Functions: reads the return path once and forgets it.
export async function takeReturnPath(): Promise<string | undefined> {
  const store = await cookies();
  const value = store.get(RETURN_TO_COOKIE)?.value;
  if (value !== undefined) store.delete(RETURN_TO_COOKIE);
  return safeReturnPath(value);
}
