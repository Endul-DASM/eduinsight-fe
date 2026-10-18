import { notFound } from "next/navigation";
import { StudentDiagnosisPage } from "@/components/student/diagnosis/student-diagnosis-page";
import { isMockMode } from "@/lib/api/client";
import { mockStudent } from "@/lib/api/mocks";
import { getMyDashboard, getMyDiagnosis } from "@/lib/api/student";
import { getSubject } from "@/lib/api/subjects";
import { getCurrentUser } from "@/lib/api/users";
import { firstName } from "@/lib/display-name";

// /student/{slug}/diagnosis — Diagnosis Belajar.
export default async function StudentDiagnosisRoute({ params }: PageProps<"/student/[subject]/diagnosis">) {
  const { subject: slug } = await params;
  // The layout already loaded both; they are cached per request.
  const [user, subject] = await Promise.all([isMockMode ? mockStudent : getCurrentUser(), getSubject(slug)]);
  if (!subject) notFound();

  // Recommended materials and recent activity come from the dashboard.
  const [diagnosis, dashboard] = await Promise.all([getMyDiagnosis(subject.id), getMyDashboard(subject.id)]);

  return (
    <StudentDiagnosisPage dashboard={dashboard} diagnosis={diagnosis} slug={slug} studentName={firstName(user.name)} subject={subject} />
  );
}
