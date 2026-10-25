import { notFound } from "next/navigation";
import { PracticePage } from "@/components/student/remedial/practice-page";
import { getMyRemedials } from "@/lib/api/student";
import { getSubject } from "@/lib/api/subjects";
import { remedialsOf } from "@/lib/student-remedial";

// /student/{slug}/remedial/latihan/{source} — Soal Latihan of the approved remedial package of a source assessment
// (UAT REM-H05).
export default async function StudentPracticeRoute({ params }: PageProps<"/student/[subject]/remedial/latihan/[source]">) {
  const { subject: slug, source } = await params;
  const subject = await getSubject(slug);
  if (!subject) notFound();

  const remedial = remedialsOf((await getMyRemedials()).remedials, subject.id).find(
    (entry) => entry.sourceAssessment.id === source,
  );
  // Practice questions reach the student with the package, once the teacher approved it.
  if (!remedial?.package) notFound();

  return <PracticePage remedial={remedial} slug={slug} />;
}
