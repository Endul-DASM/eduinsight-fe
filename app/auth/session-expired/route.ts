import { redirect } from "next/navigation";
import { clearSessionToken } from "@/lib/api/session";

// GET /auth/session-expired — the token ran out (or the backend refused it): drop the cookie and sign in again.
export async function GET() {
  await clearSessionToken();
  redirect("/login?reason=session_expired");
}
