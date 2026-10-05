import { notFound } from "next/navigation";
import { RegisterOptionsPage } from "@/components/auth/register-options-page";
import { noticeForError } from "@/lib/auth/messages";
import { isAuthRole } from "@/lib/auth/roles";

// /register/teacher and /register/student
export default async function RoleRegisterRoute({ params, searchParams }: PageProps<"/register/[role]">) {
  const { role } = await params;
  if (!isAuthRole(role)) notFound();

  const { error } = await searchParams;
  return <RegisterOptionsPage notice={noticeForError(error, role)} role={role} />;
}
