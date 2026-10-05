import { RolePickerPage } from "@/components/auth/role-picker-page";
import { SESSION_EXPIRED_MESSAGE } from "@/lib/auth/messages";

export default async function LoginRoute({ searchParams }: PageProps<"/login">) {
  const { reason } = await searchParams;
  const notice = reason === "session_expired" ? { message: SESSION_EXPIRED_MESSAGE } : undefined;

  return <RolePickerPage notice={notice} />;
}
