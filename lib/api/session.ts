import "server-only";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "eduinsight_session";

// Same lifetime as the backend access token (JWT_EXPIRE_MINUTES).
const SESSION_MAX_AGE_SECONDS = 60 * 60;

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

// Only callable from Server Functions: cookies cannot be written while a page renders.
export async function setSessionToken(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionToken() {
  (await cookies()).delete(SESSION_COOKIE);
}
