import { notFound } from "next/navigation";
import { AssessmentListPage } from "@/components/assessment/assessment-list-page";
import { getAssessments } from "@/lib/api/assessments";
import { getSubject } from "@/lib/api/subjects";
import { isAssessmentStatus, isAssessmentType } from "@/lib/assessment-form";

export default async function AssessmentRoute({ params, searchParams }: PageProps<"/[subject]/assessment">) {
  const { subject: slug } = await params;
  const query = await searchParams;
  // The layout already loaded the subject; getSubject is cached per request.
  const subject = await getSubject(slug);
  if (!subject) notFound();

  const type = isAssessmentType(query.type) ? query.type : undefined;
  const status = isAssessmentStatus(query.status) ? query.status : undefined;
  const assessments = await getAssessments(subject.id, { type, status });

  return (
    <AssessmentListPage
      assessments={assessments}
      filtered={Boolean(type || status)}
      openCreate={query.new === "1"}
      slug={slug}
      subjectId={subject.id}
    />
  );
}
