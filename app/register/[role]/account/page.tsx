import { notFound } from "next/navigation";
import { RegisterAccountPage } from "@/components/auth/register-account-page";
import { isAuthRole } from "@/lib/auth/roles";

// /register/teacher/account and /register/student/account
export default async function RoleRegisterAccountRoute({ params }: PageProps<"/register/[role]/account">) {
  const { role } = await params;
  if (!isAuthRole(role)) notFound();

  return <RegisterAccountPage role={role} />;
}
