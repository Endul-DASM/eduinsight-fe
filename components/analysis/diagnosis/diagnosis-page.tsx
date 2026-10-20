import Link from "next/link";
import { sectionClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import type { ClassDiagnosis, StudentDiagnosis } from "@/lib/api/diagnosis";
import type { Assessment, AssessmentDetail, CurriculumChapter } from "@/lib/api/types";
import { ClassView } from "./class-view";
import { diagnosisHref, type DiagnosisParams, type DiagnosisView } from "./links";
import { ObjectiveView } from "./objective-view";
import { ScopeFilters } from "./scope-filters";
import { StudentView } from "./student-view";

const views: { id: DiagnosisView; label: string }[] = [
  { id: "kelas", label: "Diagnosis Kelas" },
  { id: "tp", label: "Diagnosis TP" },
  { id: "siswa", label: "Diagnosis Siswa" },
];

function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section className={cn(sectionClassName, "items-center py-12 text-center")}>
      <p className="text-base font-semibold text-[#1b1b1d]">{title}</p>
      {children && <div className="max-w-[560px] text-sm leading-normal text-[#45474c]">{children}</div>}
    </section>
  );
}

// Tab Diagnosis of Analisis (PRD 5.5.1; FR-G-080 – 085): the scope, then Diagnosis Kelas, TP or Siswa.
export function DiagnosisPage({
  slug,
  subjectId,
  params,
  className,
  assessments,
  chapters,
  diagnosis,
  questionObjectives,
  student,
  itemAssessment,
}: {
  slug: string;
  subjectId: string;
  params: DiagnosisParams;
  className: string;
  assessments: Assessment[];
  chapters: CurriculumChapter[];
  diagnosis: ClassDiagnosis | null;
  questionObjectives: Map<string, string[]>;
  student: StudentDiagnosis | null;
  itemAssessment: AssessmentDetail | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <ScopeFilters assessments={assessments} chapters={chapters} params={params} slug={slug} />

      <nav aria-label="Bagian Diagnosis" className="flex flex-wrap gap-3">
        {views.map((item) => {
          const active = item.id === params.view;
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-xl px-2 py-2 text-base font-semibold leading-normal transition-colors",
                active ? "bg-[rgba(153,188,229,0.6)] text-[#004695]" : "text-[#1b1b1d] hover:bg-[#e6eff9]",
              )}
              href={diagnosisHref(slug, params, { view: item.id, item: undefined })}
              key={item.id}
              replace
              scroll={false}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {!diagnosis ? (
        <Empty title="Diagnosis belum tersedia.">Server belum menyediakan diagnosis untuk mapel ini. Pastikan backend sudah versi terbaru.</Empty>
      ) : diagnosis.analyzedStudents === 0 ? (
        <Empty title="Belum ada data diagnosis dalam cakupan ini.">
          Diagnosis dihitung dari post-test, ulangan harian, UTS dan UAS yang sudah dikerjakan siswa. Ubah filter semester, asesmen, atau
          Bab, atau tunggu siswa menyerahkan asesmen.
        </Empty>
      ) : params.view === "tp" ? (
        <ObjectiveView diagnosis={diagnosis} params={params} questionObjectives={questionObjectives} slug={slug} />
      ) : params.view === "siswa" ? (
        <StudentView
          className={className}
          diagnosis={diagnosis}
          itemAssessment={itemAssessment}
          params={params}
          slug={slug}
          student={student}
        />
      ) : (
        <ClassView
          className={className}
          diagnosis={diagnosis}
          params={params}
          questionObjectives={questionObjectives}
          slug={slug}
          subjectId={subjectId}
        />
      )}
    </div>
  );
}
