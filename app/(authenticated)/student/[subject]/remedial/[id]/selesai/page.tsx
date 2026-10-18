import { notFound, redirect } from "next/navigation";
import { AssessmentDonePage } from "@/components/student/assessment/assessment-done-page";
import { isMockMode } from "@/lib/api/client";
import { mockStudent } from "@/lib/api/mocks";
import { getAttempt } from "@/lib/api/student";
import { getCurrentUser } from "@/lib/api/users";
import { firstName } from "@/lib/display-name";

// /student/{slug}/remedial/{id}/selesai?attempt={attemptId} — Remedial Selesai.
export default async function StudentRemedialDoneRoute({
  params,
  searchParams,
}: PageProps<"/student/[subject]/remedial/[id]/selesai">) {
  const { subject: slug, id } = await params;
  const { attempt: attemptId } = await searchParams;
  if (typeof attemptId !== "string") redirect(`/student/${slug}/remedial`);

  const [user, attempt] = await Promise.all([isMockMode ? mockStudent : getCurrentUser(), getAttempt(attemptId)]);
  if (!attempt || attempt.assessmentId !== id) notFound();
  if (attempt.status !== "submitted") redirect(`/student/${slug}/remedial/${id}/kerjakan`);

  return <AssessmentDonePage attempt={attempt} section="remedial" slug={slug} studentName={firstName(user.name)} />;
}
