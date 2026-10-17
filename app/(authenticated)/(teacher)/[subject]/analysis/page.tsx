import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalysisPage } from "@/components/analysis/analysis-page";
import { AnalysisShell, analysisTabOf } from "@/components/analysis/analysis-shell";
import { DiagnosisPage } from "@/components/analysis/diagnosis/diagnosis-page";
import { diagnosisParamsOf } from "@/components/analysis/diagnosis/links";
import { primaryButtonClassName } from "@/components/auth/styles";
import { sectionClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import { getAssessment, getAssessments } from "@/lib/api/assessments";
import { getCurriculum } from "@/lib/api/curriculum";
import { getClassDiagnosis, getStudentDiagnosis, type DiagnosisFilters } from "@/lib/api/diagnosis";
import { getSubject } from "@/lib/api/subjects";
import type { AssessmentType, Subject } from "@/lib/api/types";

// The assessment types diagnosis reads by default (BR-03): pre-test and remedial are left out.
const diagnosedTypes: AssessmentType[] = ["post_test", "ulangan_harian", "uts", "uas"];

async function diagnosisTab(slug: string, subject: Subject, query: Record<string, string | string[] | undefined>) {
  const params = diagnosisParamsOf(query);
  const filters: DiagnosisFilters = { assessmentId: params.assessment, semester: params.semester, chapterId: params.chapter };

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
    />
  );
}

// Analisis Remedial (Figma New Design: empty frame) — the remedial results live under the Remedial menu for now.
function RemedialTab({ slug }: { slug: string }) {
  return (
    <section className={cn(sectionClassName, "items-center py-12 text-center")}>
      <p className="text-base font-semibold text-[#1b1b1d]">Analisis remedial ada di menu Remedial.</p>
      <p className="max-w-[560px] text-sm leading-normal text-[#45474c]">
        Bandingkan asesmen asal dengan remedial, lihat peningkatan per siswa dan per TP, lalu jadwalkan remedial berikutnya.
      </p>
      <Link className={cn(primaryButtonClassName, "px-6 py-2 text-sm")} href={`/${slug}/remedial`}>
        Buka Remedial
      </Link>
    </section>
  );
}

// /{slug}/analysis: ?tab=diagnosis (with view, scope filters, tp, student and item), ?tab=soal and ?tab=remedial.
export default async function AnalysisRoute({ params, searchParams }: PageProps<"/[subject]/analysis">) {
  const { subject: slug } = await params;
  const query = await searchParams;
  const subject = await getSubject(slug);
  if (!subject) notFound();

  const tab = analysisTabOf(query.tab);

  return (
    <AnalysisShell slug={slug} tab={tab}>
      {tab === "diagnosis" && (await diagnosisTab(slug, subject, query))}
      {tab === "soal" && <AnalysisPage />}
      {tab === "remedial" && <RemedialTab slug={slug} />}
    </AnalysisShell>
  );
}
