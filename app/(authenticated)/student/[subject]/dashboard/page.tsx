import { notFound } from "next/navigation";
import { StudentDashboardPage, StudentMasteryDetailPage } from "@/components/student/dashboard/student-dashboard-page";
import { isMockMode } from "@/lib/api/client";
import { mockStudent } from "@/lib/api/mocks";
import { getMyDashboard, getMyRemedials } from "@/lib/api/student";
import { getSubject } from "@/lib/api/subjects";
import { getCurrentUser } from "@/lib/api/users";
import { firstName } from "@/lib/display-name";
import { isActive, remedialsOf } from "@/lib/student-remedial";

// /student/{slug}/dashboard — Dashboard Siswa; ?detail=penguasaan shows every Bab of Level Penguasaan Materi.
export default async function StudentDashboardRoute({ params, searchParams }: PageProps<"/student/[subject]/dashboard">) {
  const { subject: slug } = await params;
  const { detail } = await searchParams;
  // The layout already loaded both; they are cached per request.
  const [user, subject] = await Promise.all([isMockMode ? mockStudent : getCurrentUser(), getSubject(slug)]);
  if (!subject) notFound();

  if (detail === "penguasaan") return <StudentMasteryDetailPage dashboard={await getMyDashboard(subject.id)} />;

  // Remedial Aktif (UAT SIS-H01): the subject's remedials not tuntas yet, apart from Upcoming Test.
  const [dashboard, remedials] = await Promise.all([getMyDashboard(subject.id), getMyRemedials()]);

  return (
    <StudentDashboardPage
      activeRemedials={remedialsOf(remedials.remedials, subject.id).filter(isActive)}
      dashboard={dashboard}
      slug={slug}
      studentName={firstName(user.name)}
      subject={subject}
    />
  );
}
