import type { Metadata } from "next";
import { LandingShell } from "@/components/landing/landing-shell";
import { PrivacyPage } from "@/components/landing/privacy-page";
import { getLandingUser } from "@/lib/landing";

export const metadata: Metadata = {
  title: "Kebijakan Privasi EduInsight",
  description: "Data yang dikumpulkan EduInsight, cara memakainya, dan hak pengguna atas data tersebut.",
};

// /privacy — Kebijakan Privasi, linked from every footer.
export default async function Privacy() {
  const user = await getLandingUser();

  return (
    <LandingShell page="privacy" user={user}>
      <PrivacyPage />
    </LandingShell>
  );
}
