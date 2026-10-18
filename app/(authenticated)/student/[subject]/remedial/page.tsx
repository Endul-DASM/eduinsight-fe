import { notFound } from "next/navigation";
import { RemedialListPage } from "@/components/student/remedial/remedial-list-page";
import { isMockMode } from "@/lib/api/client";
import { mockStudent } from "@/lib/api/mocks";
import { getMyAssessments, getMyRemedials } from "@/lib/api/student";
import { getSubject } from "@/lib/api/subjects";
import { getCurrentUser } from "@/lib/api/users";
import { firstName } from "@/lib/display-name";
import { remedialsOf } from "@/lib/student-remedial";

// /student/{slug}/remedial?tab=perlu|tuntas&q= — Daftar Remedial siswa of this subject.
export default async function StudentRemedialListRoute({ params, searchParams }: PageProps<"/student/[subject]/remedial">) {
  const { subject: slug } = await params;
  const query = await searchParams;
  const [user, subject] = await Promise.all([isMockMode ? mockStudent : getCurrentUser(), getSubject(slug)]);
  if (!subject) notFound();

  // my-remedials covers every subject; the assessments give the ones that needed no remedial.
  const [remedials, assessments] = await Promise.all([getMyRemedials(), getMyAssessments(subject.id)]);

  return (
    <RemedialListPage
      assessments={assessments}
      query={typeof query.q === "string" ? query.q : ""}
      remedials={remedialsOf(remedials.remedials, subject.id)}
      slug={slug}
      studentName={firstName(user.name)}
      subject={subject}
      tab={query.tab === "tuntas" ? "tuntas" : "perlu"}
    />
  );
}
