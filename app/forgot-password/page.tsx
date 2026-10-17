import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

// /forgot-password, from "Lupa kata sandi?" on the sign-in pages (SRS FR-X-004).
export default function ForgotPasswordRoute() {
  return (
    <AuthShell>
      <AuthCard>
        <h1 className="text-center text-2xl font-bold leading-10 tracking-[-0.32px] text-black">Lupa Kata Sandi</h1>
        <ForgotPasswordForm />
      </AuthCard>
    </AuthShell>
  );
}
