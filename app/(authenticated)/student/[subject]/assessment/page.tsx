import { notFound } from "next/navigation";
import { StudentAssessmentListPage } from "@/components/student/assessment/assessment-list-page";
import { isMockMode } from "@/lib/api/client";
import { mockStudent } from "@/lib/api/mocks";
import { getMyAssessments, getMyDashboard } from "@/lib/api/student";
import { getSubject } from "@/lib/api/subjects";
import { getCurrentUser } from "@/lib/api/users";
import { firstName } from "@/lib/display-name";
import { statusesOf } from "@/lib/student-assessment";

// /student/{slug}/assessment?tab=belum|selesai&q= — Daftar Asesmen siswa.
export default async function StudentAssessmentListRoute({ params, searchParams }: PageProps<"/student/[subject]/assessment">) {
  const { subject: slug } = await params;
  const query = await searchParams;
  const [user, subject] = await Promise.all([isMockMode ? mockStudent : getCurrentUser(), getSubject(slug)]);
  if (!subject) notFound();

  // my-assessments has no KKM; the dashboard's recent activity says tuntas / belum tuntas per assessment.
  const [assessments, dashboard] = await Promise.all([getMyAssessments(subject.id), getMyDashboard(subject.id)]);

  return (
    <StudentAssessmentListPage
      // Remedial assessments live under Remedial (FR-S-050).
      assessments={assessments.filter((assessment) => assessment.type !== "remedial")}
      query={typeof query.q === "string" ? query.q : ""}
      slug={slug}
      statuses={statusesOf(dashboard?.recentActivity ?? [])}
      studentName={firstName(user.name)}
      subject={subject}
      tab={query.tab === "selesai" ? "selesai" : "belum"}
    />
  );
}
