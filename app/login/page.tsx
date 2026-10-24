import { RolePickerPage } from "@/components/auth/role-picker-page";
import { SESSION_EXPIRED_MESSAGE } from "@/lib/auth/messages";
import { redirectIfSignedIn } from "@/lib/landing";

export default async function LoginRoute({ searchParams }: PageProps<"/login">) {
  // Still signed in: no need to sign in again. An expired session counts as signed out.
  await redirectIfSignedIn();
  const { reason } = await searchParams;
  const notice = reason === "session_expired" ? { message: SESSION_EXPIRED_MESSAGE } : undefined;

  return <RolePickerPage notice={notice} />;
}
