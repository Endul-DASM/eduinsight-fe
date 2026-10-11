import { redirect } from "next/navigation";
import { getGoogleSignup } from "@/lib/auth/google";
import { type AuthRole, authRoles } from "@/lib/auth/roles";
import { suggestUsername } from "@/lib/auth/validation";
import { AuthCard, AuthFootnote } from "./auth-card";
import { AuthShell } from "./auth-shell";
import { GoogleSignupForm } from "./google-signup-form";
import { RoleHeading } from "./role-heading";

export async function GoogleSignupPage({ role }: { role: AuthRole }) {
  const config = authRoles[role];
  // Set by /auth/google/callback; missing when the page is opened directly or the 10 minutes ran out.
  const signup = await getGoogleSignup();
  if (!signup || signup.role !== role) redirect(`${config.registerPath}?error=signup_expired`);

  return (
    <AuthShell>
      <AuthCard>
        <div className="flex flex-col gap-3">
          <RoleHeading role={role} title={`Daftar Sebagai ${config.label}`} />
          <AuthFootnote>Satu langkah lagi: pilih username untuk akun EduInsight Anda.</AuthFootnote>
        </div>
        <GoogleSignupForm
          email={signup.email}
          role={role}
          suggestedUsername={signup.suggestedUsername ?? suggestUsername(signup.email)}
        />
      </AuthCard>
    </AuthShell>
  );
}
