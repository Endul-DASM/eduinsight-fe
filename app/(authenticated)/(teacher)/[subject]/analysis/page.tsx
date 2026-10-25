import { notFound } from "next/navigation";
import { AnalysisShell, analysisTabOf } from "@/components/analysis/analysis-shell";
import { DiagnosisPage } from "@/components/analysis/diagnosis/diagnosis-page";
import { diagnosisParamsOf } from "@/components/analysis/diagnosis/links";
import { RemedialAnalysisPage } from "@/components/analysis/remedial/remedial-analysis-page";
import { QuestionAnalysisPage } from "@/components/analysis/soal/question-analysis-page";
import { getAssessmentAnalysis } from "@/lib/api/analysis";
import { getAssessment, getAssessments } from "@/lib/api/assessments";
import { getCurriculum } from "@/lib/api/curriculum";
import { getClassDiagnosis, getStudentDiagnosis, type DiagnosisFilters } from "@/lib/api/diagnosis";
import { getRemedialGroups } from "@/lib/api/remedial";
import { getSubject } from "@/lib/api/subjects";
import type { AssessmentType, Subject } from "@/lib/api/types";
import { getMaterialReferences, getRemedialPair } from "@/lib/remedial";

type Query = Record<string, string | string[] | undefined>;

// The assessment types diagnosis reads by default (BR-03): pre-test and remedial are left out.
const diagnosedTypes: AssessmentType[] = ["post_test", "ulangan_harian", "uts", "uas"];

async function diagnosisTab(slug: string, subject: Subject, query: Query) {
  const params = diagnosisParamsOf(query);
  const filters: DiagnosisFilters = { assessmentId: params.assessment, chapterId: params.chapter };

  const [assessments, curriculum, diagnosis] = await Promise.all([
    getAssessments(subject.id),
    getCurriculum(subject.id),
    getClassDiagnosis(subject.id, filters),
  ]);

  // Question id → TP ids, to tie misconception patterns (by question) to TPs.
  const details = await Promise.all((diagnosis?.assessments ?? []).map((assessment) => getAssessment(assessment.id)));
  const questionObjectives = new Map(
    details.flatMap((detail) => detail?.questions ?? []).map((question) => [question.id, question.learningObjectives.map((tp) => tp.id)]),
  );

  const studentId = params.view === "siswa" ? params.student : undefined;
  const student = studentId ? await getStudentDiagnosis(subject.id, studentId, filters) : null;
  const itemAssessmentId = params.item?.split(":")[0];
  const itemAssessment = student && itemAssessmentId ? await getAssessment(itemAssessmentId) : null;

  return (
    <DiagnosisPage
      assessments={assessments
        .filter((assessment) => assessment.status !== "draft" && diagnosedTypes.includes(assessment.type))
        .sort((a, b) => (b.opensAt ?? "").localeCompare(a.opensAt ?? ""))}
      chapters={(curriculum?.chapters ?? []).filter((chapter) => chapter.status === "final").sort((a, b) => a.number - b.number)}
      className={subject.class.name}
      diagnosis={diagnosis}
      itemAssessment={itemAssessment}
      params={params}
      questionObjectives={questionObjectives}
      slug={slug}
      student={student}
      subjectId={subject.id}
    />
  );
}

// Analisis Soal: the published assessments for the picker and the analysis of the chosen one (?assessment=,
// otherwise the most recent).
async function soalTab(slug: string, subject: Subject, assessmentParam: unknown) {
  const published = (await getAssessments(subject.id))
    .filter((assessment) => assessment.status !== "draft")
    .sort((a, b) => (b.opensAt ?? b.updatedAt).localeCompare(a.opensAt ?? a.updatedAt));
  const selectedId = published.find((assessment) => assessment.id === assessmentParam)?.id ?? published[0]?.id ?? null;
  const analysis = selectedId ? await getAssessmentAnalysis(selectedId) : null;
  return <QuestionAnalysisPage analysis={analysis} assessments={published} selectedId={selectedId} slug={slug} />;
}

// Analisis Remedial: the source assessment (?source=) and the remedial one it is compared with (?remedial=).
async function remedialTab(slug: string, subject: Subject, query: Query) {
  const pair = await getRemedialPair(subject, query.source, query.remedial);
  const [references, groups] = await Promise.all([
    pair.sourceResults ? getMaterialReferences(subject, pair.sourceResults, pair.targets) : [],
    pair.source ? getRemedialGroups(pair.source.id) : null,
  ]);
  return <RemedialAnalysisPage groups={groups} pair={pair} references={references} slug={slug} />;
}

// /{slug}/analysis: ?tab=diagnosis (with view, scope filters, tp, student and item), ?tab=soal (with assessment) and
// ?tab=remedial (with source and remedial).
export default async function AnalysisRoute({ params, searchParams }: PageProps<"/[subject]/analysis">) {
  const { subject: slug } = await params;
  const query = await searchParams;
  const subject = await getSubject(slug);
  if (!subject) notFound();

  const tab = analysisTabOf(query.tab);

  return (
    <AnalysisShell slug={slug} tab={tab}>
      {tab === "diagnosis" && (await diagnosisTab(slug, subject, query))}
      {tab === "soal" && (await soalTab(slug, subject, query.assessment))}
      {tab === "remedial" && (await remedialTab(slug, subject, query))}
    </AnalysisShell>
  );
}
