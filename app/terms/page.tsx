import type { Metadata } from "next";
import { LandingShell } from "@/components/landing/landing-shell";
import { TermsPage } from "@/components/landing/terms-page";
import { getLandingUser } from "@/lib/landing";

export const metadata: Metadata = {
  title: "Ketentuan Layanan EduInsight",
  description: "Ketentuan penggunaan EduInsight untuk guru dan siswa.",
};

// /terms — Ketentuan Layanan (UAT baris 198), linked from every footer.
export default async function Terms() {
  const user = await getLandingUser();

  return (
    <LandingShell page="terms" user={user}>
      <TermsPage />
    </LandingShell>
  );
}
