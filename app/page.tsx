import { HomePage } from "@/components/landing/home-page";
import { LandingShell } from "@/components/landing/landing-shell";
import { getLandingUser } from "@/lib/landing";

// / — the public Home page (Figma New Design 1:1318).
export default async function Home() {
  const user = await getLandingUser();

  return (
    <LandingShell page="home" user={user}>
      <HomePage />
    </LandingShell>
  );
}
