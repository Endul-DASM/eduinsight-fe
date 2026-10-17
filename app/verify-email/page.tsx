import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { LinkProblem } from "@/components/auth/link-problem";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";

// /verify-email?token=..., the link in the verification email (SRS FR-X-008).
export default async function VerifyEmailRoute({ searchParams }: PageProps<"/verify-email">) {
  const { token } = await searchParams;

  return (
    <AuthShell>
      <AuthCard>
        <h1 className="text-center text-2xl font-bold leading-10 tracking-[-0.32px] text-black">Verifikasi Email</h1>
        {typeof token === "string" && token ? (
          <VerifyEmailForm token={token} />
        ) : (
          <LinkProblem
            message="Tautan verifikasi tidak lengkap. Buka tautan langsung dari email Anda."
            retryHref="/login"
            retryLabel="Ke Halaman Masuk"
          />
        )}
      </AuthCard>
    </AuthShell>
  );
}
