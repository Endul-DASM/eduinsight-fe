import { notFound } from "next/navigation";
import { LoginPage } from "@/components/auth/login-page";
import { noticeForError } from "@/lib/auth/messages";
import { isAuthRole } from "@/lib/auth/roles";
import { redirectIfSignedIn } from "@/lib/landing";

// /login/teacher and /login/student
export default async function RoleLoginRoute({ params, searchParams }: PageProps<"/login/[role]">) {
  const { role } = await params;
  if (!isAuthRole(role)) notFound();
  await redirectIfSignedIn();

  const { error } = await searchParams;
  return <LoginPage notice={noticeForError(error, role)} role={role} />;
}
