import { NotFoundPage } from "@/components/landing/not-found-page";
import { getLandingUser, homePathOf } from "@/lib/landing";

// Every notFound() and unknown URL (UAT baris 194). "Kembali ke Halaman Utama" leads a signed-in teacher or student to
// their subjects, and anyone else to Home.
export default async function NotFound() {
  const user = await getLandingUser();
  return <NotFoundPage homeHref={user ? homePathOf(user) : "/"} />;
}
