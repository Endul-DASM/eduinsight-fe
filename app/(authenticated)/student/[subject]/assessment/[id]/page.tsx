import { notFound } from "next/navigation";
import { AssessmentIntroPage } from "@/components/student/assessment/assessment-intro-page";
import { getMyAssessments } from "@/lib/api/student";
import { getSubject } from "@/lib/api/subjects";

// /student/{slug}/assessment/{id} — Persiapan Asesmen.
export default async function StudentAssessmentIntroRoute({ params }: PageProps<"/student/[subject]/assessment/[id]">) {
  const { subject: slug, id } = await params;
  const subject = await getSubject(slug);
  if (!subject) notFound();

  const assessment = (await getMyAssessments(subject.id)).find((entry) => entry.id === id);
  if (!assessment) notFound();

  return <AssessmentIntroPage assessment={assessment} slug={slug} subject={subject} />;
}
