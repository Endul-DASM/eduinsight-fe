import { notFound } from "next/navigation";
import { AssessmentWizard } from "@/components/assessment/assessment-wizard";
import { getAssessment } from "@/lib/api/assessments";
import { getCompetencies } from "@/lib/api/curriculum";
import { getQuestionsForCompetencies } from "@/lib/api/questions";
import { getSubject } from "@/lib/api/subjects";
import { wizardStepOf } from "@/lib/assessment-form";

export default async function AssessmentWizardRoute({
  params,
  searchParams,
}: PageProps<"/[subject]/assessment/[id]">) {
  const { subject: slug, id } = await params;
  const step = wizardStepOf((await searchParams).step);

  const [subject, assessment] = await Promise.all([getSubject(slug), getAssessment(id)]);
  // An assessment of another subject is not shown under this one's URL.
  if (!subject || !assessment || assessment.subjectId !== subject.id) notFound();

  // Each step only loads what it shows.
  const competencies = step === "kompetensi" ? await getCompetencies(subject.id) : [];
  const bank =
    step === "soal"
      ? await getQuestionsForCompetencies(
          subject.id,
          assessment.competencies.map((competency) => competency.id),
        )
      : { items: [], total: 0 };

  return (
    <AssessmentWizard
      assessment={assessment}
      bank={bank}
      competencies={competencies}
      slug={slug}
      step={step}
      subject={subject}
    />
  );
}
