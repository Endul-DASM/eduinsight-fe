import { notFound, redirect } from "next/navigation";
import { AttemptPlayer } from "@/components/student/assessment/attempt-player";
import { getAttempt, getMyRemedials } from "@/lib/api/student";
import { getSubject } from "@/lib/api/subjects";
import { findRemedialAssessment } from "@/lib/student-remedial";

// /student/{slug}/remedial/{id}/kerjakan — Pengerjaan Remedial of the attempt in progress, like Pengerjaan Asesmen.
export default async function StudentRemedialAttemptRoute({ params }: PageProps<"/student/[subject]/remedial/[id]/kerjakan">) {
  const { subject: slug, id } = await params;
  const subject = await getSubject(slug);
  if (!subject) notFound();

  const found = findRemedialAssessment((await getMyRemedials()).remedials, subject.id, id);
  if (!found) notFound();
  if (!found.assessment.openAttemptId) redirect(`/student/${slug}/remedial/${id}`);

  const attempt = await getAttempt(found.assessment.openAttemptId);
  if (!attempt) redirect(`/student/${slug}/remedial/${id}`);
  // Handed in meanwhile (e.g. time ran out and the backend submitted it).
  if (attempt.status === "submitted") redirect(`/student/${slug}/remedial/${id}/selesai?attempt=${attempt.id}`);

  return (
    <AttemptPlayer attempt={attempt} listHref={`/student/${slug}/remedial`} section="remedial" slug={slug} subjectName={subject.name} />
  );
}
