import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { LinkProblem } from "@/components/auth/link-problem";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

// /reset-password?token=..., the link in the password reset email (SRS FR-X-004).
export default async function ResetPasswordRoute({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;

  return (
    <AuthShell>
      <AuthCard>
        <h1 className="text-center text-2xl font-bold leading-10 tracking-[-0.32px] text-black">Atur Ulang Kata Sandi</h1>
        {typeof token === "string" && token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <LinkProblem
            message="Tautan tidak lengkap. Buka tautan langsung dari email Anda, atau minta tautan baru."
            retryHref="/forgot-password"
            retryLabel="Minta Tautan Baru"
          />
        )}
      </AuthCard>
    </AuthShell>
  );
}
