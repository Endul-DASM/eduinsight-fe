import { notFound, redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { CheckEmail } from "@/components/auth/check-email";
import { getPendingVerification } from "@/lib/auth/pending-verification";
import { authRoles, isAuthRole } from "@/lib/auth/roles";

// /login/teacher/verify-email and /login/student/verify-email: where signing in with an unverified email leads
// (FR-X-008). The email comes from the cookie the sign-in sets; without it there is nothing to resend.
export default async function UnverifiedEmailRoute({ params }: PageProps<"/login/[role]/verify-email">) {
  const { role } = await params;
  if (!isAuthRole(role)) notFound();

  const email = await getPendingVerification();
  if (!email) redirect(authRoles[role].loginPath);

  return (
    <AuthShell>
      <AuthCard>
        <CheckEmail resendIsMain role={role} title="Email Belum Diverifikasi">
          Akun Anda belum aktif. Buka tautan verifikasi yang kami kirim ke{" "}
          <span className="font-semibold">{email}</span>, atau kirim ulang tautannya di bawah. Tautan berlaku 1 jam.
        </CheckEmail>
      </AuthCard>
    </AuthShell>
  );
}
