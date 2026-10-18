import type { Metadata } from "next";
import { AboutPage } from "@/components/landing/about-page";
import { LandingShell } from "@/components/landing/landing-shell";
import { getLandingUser } from "@/lib/landing";

export const metadata: Metadata = {
  title: "Tentang EduInsight",
  description: "Diagnosis pembelajaran berbasis Tujuan Pembelajaran untuk guru semua mata pelajaran dan jenjang kelas.",
};

// /about — the public About page (Figma New Design 187:9563).
export default async function About() {
  const user = await getLandingUser();

  return (
    <LandingShell page="about" user={user}>
      <AboutPage />
    </LandingShell>
  );
}
