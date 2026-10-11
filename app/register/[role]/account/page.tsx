import { notFound, redirect } from "next/navigation";
import { authRoles, isAuthRole } from "@/lib/auth/roles";

// The sign-up form now opens on /register/[role]; old links to /register/[role]/account land there.
export default async function RoleRegisterAccountRoute({ params }: PageProps<"/register/[role]/account">) {
  const { role } = await params;
  if (!isAuthRole(role)) notFound();

  redirect(authRoles[role].registerPath);
}
