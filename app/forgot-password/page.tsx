import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { primaryButtonClassName } from "@/components/auth/styles";

// Placeholder until password reset by email (SRS FR-X-004) is available in the backend.
export default function ForgotPasswordRoute() {
  return (
    <AuthShell>
      <AuthCard>
        <h1 className="text-center text-2xl font-bold leading-10 tracking-[-0.32px] text-black">Lupa Kata Sandi</h1>
        <p className="text-center text-sm leading-5 text-[#45474c]">
          Fitur atur ulang kata sandi lewat email sedang disiapkan. Untuk sementara, hubungi guru pengampu atau tim
          EduInsight. Jika akun Anda terhubung dengan Google, Anda tetap dapat masuk dengan Google.
        </p>
        <Link className={`${primaryButtonClassName} self-center`} href="/login">
          Kembali ke Halaman Masuk
        </Link>
      </AuthCard>
    </AuthShell>
  );
}
