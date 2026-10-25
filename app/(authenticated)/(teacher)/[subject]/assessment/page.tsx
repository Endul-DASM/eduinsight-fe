import { notFound } from "next/navigation";
import { AssessmentListPage } from "@/components/assessment/assessment-list-page";
import { AssessmentPage, assessmentTabOf } from "@/components/assessment/assessment-page";
import { MethodPicker } from "@/components/assessment/method-picker";
import { ResultsPage, resultsViewOf } from "@/components/assessment/results/results-page";
import { getAssessments } from "@/lib/api/assessments";
import { getAssessmentResults } from "@/lib/api/results";
import { getSubject } from "@/lib/api/subjects";
import { getCurrentUser } from "@/lib/api/users";
import { isAssessmentStatus, isAssessmentType } from "@/lib/assessment-form";
import { getAssessmentCards } from "@/lib/assessment-list";
import { firstName } from "@/lib/display-name";

// Hasil Asesmen: the published assessments for the picker, and the results of the chosen one (?assessment=). Nothing
// is chosen until the teacher picks one (UAT ASM-U06).
async function hasilTab(slug: string, subjectId: string, assessmentParam: unknown, viewParam: unknown) {
  const published = (await getAssessments(subjectId))
    .filter((assessment) => assessment.status !== "draft")
    .sort((a, b) => (b.opensAt ?? "").localeCompare(a.opensAt ?? ""));
  const selectedId = published.find((assessment) => assessment.id === assessmentParam)?.id ?? null;
  const results = selectedId ? await getAssessmentResults(selectedId) : null;
  return (
    <ResultsPage assessments={published} results={results} selectedId={selectedId} slug={slug} view={resultsViewOf(viewParam)} />
  );
}

// /{slug}/assessment: Buat Asesmen, ?tab=daftar (with ?type= and ?status=) and ?tab=hasil (with ?assessment= and ?view=).
export default async function AssessmentRoute({ params, searchParams }: PageProps<"/[subject]/assessment">) {
  const { subject: slug } = await params;
  const query = await searchParams;
  // The layout already loaded the subject; getSubject is cached per request.
  const [user, subject] = await Promise.all([getCurrentUser(), getSubject(slug)]);
  if (!subject) notFound();

  const tab = assessmentTabOf(query.tab);
  const type = isAssessmentType(query.type) ? query.type : undefined;
  const status = isAssessmentStatus(query.status) ? query.status : undefined;

  return (
    <AssessmentPage slug={slug} tab={tab} teacherName={firstName(user.name)}>
      {tab === "buat" && <MethodPicker slug={slug} />}
      {tab === "daftar" && (
        <AssessmentListPage
          cards={await getAssessmentCards(subject, { type, status })}
          filtered={Boolean(type || status)}
          slug={slug}
        />
      )}
      {tab === "hasil" && (await hasilTab(slug, subject.id, query.assessment, query.view))}
    </AssessmentPage>
  );
}
