import { notFound, redirect } from "next/navigation";
import { AttemptPlayer } from "@/components/student/assessment/attempt-player";
import { getAttempt, getMyAssessments } from "@/lib/api/student";
import { getSubject } from "@/lib/api/subjects";

// /student/{slug}/assessment/{id}/kerjakan — Pengerjaan Asesmen of the attempt in progress. Starting one happens on
// Persiapan (a POST), so without an open attempt the student goes back there.
export default async function StudentAttemptRoute({ params }: PageProps<"/student/[subject]/assessment/[id]/kerjakan">) {
  const { subject: slug, id } = await params;
  const subject = await getSubject(slug);
  if (!subject) notFound();

  const assessment = (await getMyAssessments(subject.id)).find((entry) => entry.id === id);
  if (!assessment) notFound();
  if (!assessment.openAttemptId) redirect(`/student/${slug}/assessment/${id}`);

  const attempt = await getAttempt(assessment.openAttemptId);
  if (!attempt) redirect(`/student/${slug}/assessment/${id}`);
  // Handed in meanwhile (e.g. time ran out and the backend submitted it).
  if (attempt.status === "submitted") redirect(`/student/${slug}/assessment/${id}/selesai?attempt=${attempt.id}`);

  return <AttemptPlayer attempt={attempt} listHref={`/student/${slug}/assessment`} slug={slug} subjectName={subject.name} />;
}
