import Link from "next/link";
import { cn } from "@/components/ui/cn";
import type { AuthNotice } from "@/lib/auth/messages";
import { type AuthRole, authRoles } from "@/lib/auth/roles";
import { AuthFootnote } from "./auth-card";
import { AuthNoticeMessage } from "./auth-notice";
import { AuthShell } from "./auth-shell";
import { GoogleButton } from "./google-button";
import { RoleHeading } from "./role-heading";
import { outlineButtonClassName, textLinkClassName } from "./styles";

// First sign-up step: an email account or Google.
export function RegisterOptionsPage({ role, notice }: { role: AuthRole; notice?: AuthNotice }) {
  const config = authRoles[role];

  return (
    <AuthShell>
      <RoleHeading role={role} title={`Daftar Sebagai ${config.label}`} />
      {notice && (
        <div className="w-full max-w-[542px]">
          <AuthNoticeMessage notice={notice} />
        </div>
      )}
      {/* Both buttons take the width of the wider one, as in the design. */}
      <div className="flex w-fit flex-col gap-3">
        <Link className={cn(outlineButtonClassName, "h-[54px] w-full")} href={config.registerAccountPath}>
          Buat Akun
        </Link>
        <GoogleButton intent="register" role={role} />
      </div>
      <AuthFootnote>
        Sudah punya akun?{" "}
        <Link className={textLinkClassName} href={config.loginPath}>
          Masuk
        </Link>
      </AuthFootnote>
    </AuthShell>
  );
}
