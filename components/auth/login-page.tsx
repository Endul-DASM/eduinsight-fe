import type { AuthNotice } from "@/lib/auth/messages";
import { type AuthRole, authRoles } from "@/lib/auth/roles";
import { AuthCard, AuthDivider } from "./auth-card";
import { AuthShell } from "./auth-shell";
import { GoogleButton } from "./google-button";
import { LoginForm } from "./login-form";
import { RoleHeading } from "./role-heading";

// Figma New Design 22:2834 (Guru) and 22:3270 (Siswa).
export function LoginPage({ role, notice }: { role: AuthRole; notice?: AuthNotice }) {
  return (
    <AuthShell>
      <AuthCard>
        <RoleHeading role={role} title={`Masuk Sebagai ${authRoles[role].label}`} />
        <LoginForm initialNotice={notice} role={role} />
        {/* SRS IF-UI-07: every sign-in page also offers Google. Not in the design, so it sits under the form. */}
        <div className="flex flex-col gap-4">
          <AuthDivider />
          <GoogleButton intent="login" role={role} />
        </div>
      </AuthCard>
    </AuthShell>
  );
}
