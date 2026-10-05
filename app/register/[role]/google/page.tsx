import { notFound } from "next/navigation";
import { GoogleSignupPage } from "@/components/auth/google-signup-page";
import { isAuthRole } from "@/lib/auth/roles";

// /register/teacher/google and /register/student/google — reached from /auth/google/callback only.
export default async function RoleRegisterGoogleRoute({ params }: PageProps<"/register/[role]/google">) {
  const { role } = await params;
  if (!isAuthRole(role)) notFound();

  return <GoogleSignupPage role={role} />;
}
