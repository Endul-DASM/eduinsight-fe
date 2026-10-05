import Link from "next/link";
import { type AuthRole, authRoles } from "@/lib/auth/roles";
import { AuthFootnote } from "./auth-card";
import { AuthShell } from "./auth-shell";
import { RegisterForm } from "./register-form";
import { RoleHeading } from "./role-heading";
import { textLinkClassName } from "./styles";

export function RegisterAccountPage({ role }: { role: AuthRole }) {
  const config = authRoles[role];

  return (
    <AuthShell>
      <RoleHeading role={role} title={`Daftar Sebagai ${config.label}`} />
      <RegisterForm role={role} />
      <AuthFootnote>
        Sudah punya akun?{" "}
        <Link className={textLinkClassName} href={config.loginPath}>
          Masuk
        </Link>
      </AuthFootnote>
    </AuthShell>
  );
}
