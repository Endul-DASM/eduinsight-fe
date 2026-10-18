import { notFound } from "next/navigation";
import { AssessmentIntroPage } from "@/components/student/assessment/assessment-intro-page";
import { RemedialPackage } from "@/components/student/remedial/remedial-package";
import { getMyRemedials } from "@/lib/api/student";
import { getSubject } from "@/lib/api/subjects";
import { findRemedialAssessment } from "@/lib/student-remedial";

// /student/{slug}/remedial/{id} — Persiapan Remedial of a remedial assessment.
export default async function StudentRemedialIntroRoute({ params }: PageProps<"/student/[subject]/remedial/[id]">) {
  const { subject: slug, id } = await params;
  const subject = await getSubject(slug);
  if (!subject) notFound();

  const found = findRemedialAssessment((await getMyRemedials()).remedials, subject.id, id);
  if (!found) notFound();

  return (
    <AssessmentIntroPage
      aside={<RemedialPackage remedial={found.remedial} />}
      assessment={found.assessment}
      section="remedial"
      slug={slug}
      subject={subject}
    />
  );
}
