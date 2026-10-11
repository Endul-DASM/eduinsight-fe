import type { AuthNotice } from "@/lib/auth/messages";
import type { AuthRole } from "@/lib/auth/roles";
import { AuthCard } from "./auth-card";
import { AuthShell } from "./auth-shell";
import { RegisterPanel } from "./register-panel";

// Sign-up on one page: an email account or Google (Figma New Design 22:2930, 22:3324).
export function RegisterOptionsPage({ role, notice }: { role: AuthRole; notice?: AuthNotice }) {
  return (
    <AuthShell>
      <AuthCard>
        <RegisterPanel notice={notice} role={role} />
      </AuthCard>
    </AuthShell>
  );
}
