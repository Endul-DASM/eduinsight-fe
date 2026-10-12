import { notFound } from "next/navigation";
import { AssessmentPage } from "@/components/assessment/assessment-page";
import { AssessmentQuestionsPage } from "@/components/assessment/assessment-questions-page";
import { getAssessment } from "@/lib/api/assessments";
import { getCurriculum } from "@/lib/api/curriculum";
import { getSubject } from "@/lib/api/subjects";
import { getCurrentUser } from "@/lib/api/users";
import { firstName } from "@/lib/display-name";

// /{slug}/assessment/{id}/soal — Lihat Soal from Daftar Asesmen (Figma New Design 61:7050).
export default async function AssessmentQuestionsRoute({ params }: PageProps<"/[subject]/assessment/[id]/soal">) {
  const { subject: slug, id } = await params;
  const [user, subject, assessment] = await Promise.all([getCurrentUser(), getSubject(slug), getAssessment(id)]);
  // An assessment of another subject is not shown under this one's URL.
  if (!subject || !assessment || assessment.subjectId !== subject.id) notFound();

  const tree = await getCurriculum(subject.id).catch(() => null);

  return (
    <AssessmentPage slug={slug} tab="daftar" teacherName={firstName(user.name)}>
      <AssessmentQuestionsPage assessment={assessment} slug={slug} subject={subject} tree={tree} />
    </AssessmentPage>
  );
}
