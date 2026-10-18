import { notFound, unstable_rethrow } from "next/navigation";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { ApiError } from "@/lib/api/client";
import { getDashboard } from "@/lib/api/dashboard";
import { getSubject } from "@/lib/api/subjects";
import { getCurrentUser } from "@/lib/api/users";
import type { DashboardData } from "@/lib/dashboard/compute";
import { firstName } from "@/lib/display-name";

export default async function DashboardRoute({ params, searchParams }: PageProps<"/[subject]/dashboard">) {
  const { subject: slug } = await params;
  const { bab } = await searchParams;
  const [user, subject] = await Promise.all([getCurrentUser(), getSubject(slug)]);
  if (!subject) notFound();

  // The figures come from several requests; one failing should not take the whole page down.
  let data: DashboardData | null = null;
  let error: string | undefined;
  try {
    data = await getDashboard(subject);
  } catch (caught) {
    // An expired session makes apiFetch redirect to sign in, which works by throwing; let it through.
    unstable_rethrow(caught);
    error =
      caught instanceof ApiError && caught.code
        ? caught.message
        : "Data dashboard belum dapat dimuat dari server. Coba muat ulang halaman.";
  }

  const chapterNumber = typeof bab === "string" && /^\d+$/.test(bab) ? Number(bab) : null;

  return (
    <DashboardPage
      chapterNumber={chapterNumber}
      data={data}
      error={error}
      subject={subject}
      teacherName={firstName(user.name)}
    />
  );
}
