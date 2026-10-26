import { notFound } from "next/navigation";
import { AiStep } from "@/components/assessment/ai-step";
import { BuilderShell } from "@/components/assessment/builder-shell";
import { OcrStep } from "@/components/assessment/ocr-step";
import { PublishDone, ReviewStep } from "@/components/assessment/review-step";
import { SpecificationStep } from "@/components/assessment/specification-step";
import { TemplateStep } from "@/components/assessment/template-step";
import { TypedQuestionsStep } from "@/components/assessment/typed-questions-step";
import { ApiError } from "@/lib/api/client";
import { getAssessment } from "@/lib/api/assessments";
import { getCurriculum } from "@/lib/api/curriculum";
import { getMaterialsForObjective } from "@/lib/api/materials";
import { getQuestionImport, type QuestionImport } from "@/lib/api/questions";
import { getSubject } from "@/lib/api/subjects";
import { builderMethodOf, builderStepOf, isEditable } from "@/lib/assessment-form";

// /{slug}/assessment/{id}?method=…&step=spesifikasi|soal|review|selesai — the Buat Asesmen steps of one draft.
// Without a step, an assessment that can still be changed opens at Spesifikasi and any other at Review.
// &question={id} on the soal step edits only that question, in the typed-question editor.
export default async function AssessmentBuilderRoute({ params, searchParams }: PageProps<"/[subject]/assessment/[id]">) {
  const { subject: slug, id } = await params;
  const query = await searchParams;
  const questionId = typeof query.question === "string" ? query.question : undefined;

  const [subject, assessment] = await Promise.all([getSubject(slug), getAssessment(id)]);
  // An assessment of another subject is not shown under this one's URL.
  if (!subject || !assessment || assessment.subjectId !== subject.id) notFound();
  // A scheduled assessment is edited with the typed-question editor: AI, Template and Scan make drafts that need
  // review, which only a draft assessment may hold (UAT ASM-H01). Editing one question also uses it.
  const method = questionId || assessment.status === "scheduled" ? "ketik" : builderMethodOf(query.method);

  const step = query.step ? builderStepOf(query.step) : isEditable(assessment.status) ? "spesifikasi" : "review";

  // Each step only loads what it shows.
  const tree = step === "spesifikasi" ? await getCurriculum(subject.id) : null;
  let result: QuestionImport | null = null;
  if (step === "soal" && typeof query.import === "string") {
    try {
      result = await getQuestionImport(query.import);
    } catch (error) {
      // An old or foreign import id just shows the upload again.
      if (!(error instanceof ApiError && error.status < 500)) throw error;
    }
  }

  // SOAL-H01: AI questions are written from material that fits the TP (its Bab or Subbab, or mapped to it), the same
  // rule the backend uses. TPs without any extracted material are named before the AI is asked.
  const uncoveredObjectives =
    step === "soal" && method === "ai"
      ? (
          await Promise.all(
            assessment.learningObjectives.map(async (objective) => {
              const materials = await getMaterialsForObjective(subject.id, objective.id);
              return materials.some((material) => material.extractionStatus === "done") ? null : objective;
            }),
          )
        ).filter((objective) => objective !== null)
      : [];

  const common = { slug, method, assessment };

  return (
    <BuilderShell method={method} step={step}>
      {step === "spesifikasi" && (
        <SpecificationStep
          {...common}
          chapters={tree?.chapters.filter((chapter) => chapter.status === "final") ?? []}
          kkmDefault={subject.kkmDefault}
          subjectId={subject.id}
        />
      )}
      {step === "soal" && method === "ketik" && (
        <TypedQuestionsStep {...common} key={questionId ?? "all"} questionId={questionId} subjectId={subject.id} />
      )}
      {step === "soal" && method === "template" && <TemplateStep {...common} result={result} subjectId={subject.id} />}
      {step === "soal" && method === "ocr" && <OcrStep {...common} result={result} subjectId={subject.id} />}
      {step === "soal" && method === "ai" && <AiStep {...common} uncoveredObjectives={uncoveredObjectives} />}
      {step === "review" && <ReviewStep {...common} />}
      {step === "selesai" && <PublishDone slug={slug} />}
    </BuilderShell>
  );
}
