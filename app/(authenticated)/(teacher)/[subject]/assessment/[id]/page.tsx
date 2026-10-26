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
  const method = questionId ? "ketik" : builderMethodOf(query.method);

  const [subject, assessment] = await Promise.all([getSubject(slug), getAssessment(id)]);
  // An assessment of another subject is not shown under this one's URL.
  if (!subject || !assessment || assessment.subjectId !== subject.id) notFound();

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
      {step === "soal" && method === "ai" && <AiStep {...common} />}
      {step === "review" && <ReviewStep {...common} />}
      {step === "selesai" && <PublishDone slug={slug} />}
    </BuilderShell>
  );
}
