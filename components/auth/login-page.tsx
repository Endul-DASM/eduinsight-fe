import Link from "next/link";
import type { AuthNotice } from "@/lib/auth/messages";
import { type AuthRole, authRoles } from "@/lib/auth/roles";
import { AuthFootnote } from "./auth-card";
import { AuthShell } from "./auth-shell";
import { GoogleButton } from "./google-button";
import { LoginForm } from "./login-form";
import { RoleHeading } from "./role-heading";
import { textLinkClassName } from "./styles";

export function LoginPage({ role, notice }: { role: AuthRole; notice?: AuthNotice }) {
  const config = authRoles[role];

  return (
    <AuthShell>
      <RoleHeading role={role} title={`Masuk Sebagai ${config.label}`} />
      <LoginForm initialNotice={notice} role={role} />
      {/* SRS IF-UI-07: every sign-in page also offers Google. */}
      <div className="flex w-full max-w-[542px] flex-col items-center gap-4">
        <div className="flex w-full items-center gap-3 text-xs text-[#75777d]">
          <span className="h-px flex-1 bg-[#c5c6cd]" />
          <span>atau</span>
          <span className="h-px flex-1 bg-[#c5c6cd]" />
        </div>
        <GoogleButton intent="login" role={role} />
      </div>
      <AuthFootnote>
        Belum punya akun?{" "}
        <Link className={textLinkClassName} href={config.registerPath}>
          Daftar sekarang
        </Link>
      </AuthFootnote>
    </AuthShell>
  );
}
