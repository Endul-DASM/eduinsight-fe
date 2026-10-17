import Link from "next/link";
import { outlineButtonClassName } from "@/components/auth/styles";
import { cn } from "@/components/ui/cn";
import type { ClassDiagnosis, ObjectiveDiagnosis } from "@/lib/api/diagnosis";
import { formatPercent } from "@/lib/assessment-results";
import {
  countOf,
  diagnosisLabels,
  labelBar,
  patternsForObjective,
  patternTitle,
  scoreOf,
  sourceLabel,
  toLabel,
} from "@/lib/diagnosis";
import { diagnosisHref, type DiagnosisParams } from "./links";
import { ObjectivePicker, ObjectiveStudentTable } from "./objective-parts";

const card = "flex flex-col gap-4 rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]";

// The chosen TP: average and label spread, every student's score, and the patterns on its questions.
function SelectedObjective({
  slug,
  params,
  diagnosis,
  objective,
  questionObjectives,
}: {
  slug: string;
  params: DiagnosisParams;
  diagnosis: ClassDiagnosis;
  objective: ObjectiveDiagnosis;
  questionObjectives: Map<string, string[]>;
}) {
  const names = new Map(diagnosis.students.map((row) => [row.student.id, row.student.name]));
  const counts = objective.labelCounts;
  const scored = diagnosisLabels.reduce((sum, label) => sum + countOf(counts, label), 0);
  const patterns = patternsForObjective(diagnosis.misconceptions, questionObjectives, objective.learningObjective.id);
  const rows = diagnosis.students
    .map((row) => {
      const entry = scoreOf(row, objective.learningObjective.id);
      return { id: row.student.id, name: row.student.name, score: entry?.score ?? null, label: toLabel(entry?.label ?? null) };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "id"));

  return (
    <>
      <h3 className="text-xl font-semibold leading-normal text-[#1b1b1d]">Diagnosis TP {objective.learningObjective.number}</h3>
      <section className={card}>
        <p className="text-base font-semibold text-[#1b1b1d]">{objective.learningObjective.description}</p>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-start gap-8">
            <div className="leading-normal">
              <p className="text-[28px] font-bold text-[#0058be]">{formatPercent(objective.classAverage)}</p>
              <p className="text-xs text-[#45474c]">
                Rata-rata kelas · {scored} siswa
              </p>
            </div>
            <div className="leading-normal">
              <p className="text-sm text-[#1b1b1d]">
                Bab {objective.chapterNumber} · {objective.chapterName} · {objective.itemCount} butir sumber
                {objective.limitedData && <span className="ml-2 text-xs text-[#c2410c]">data terbatas (&lt; 3 butir)</span>}
              </p>
              <p className="text-xs text-[#45474c]">
                {countOf(counts, "K")} siswa berlabel K menjadi prioritas pendampingan
                {counts.noData > 0 && `; ${counts.noData} siswa belum punya data`}.
              </p>
            </div>
          </div>
          <Link className={cn(outlineButtonClassName, "px-4 py-2 text-sm")} href={diagnosisHref(slug, params, { view: "kelas", tp: undefined })}>
            ← Diagnosis kelas
          </Link>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-[#eae7e9]">
          {diagnosisLabels.map((label) => (
            <span
              className={labelBar[label]}
              key={label}
              style={{ width: `${scored ? (countOf(counts, label) / scored) * 100 : 0}%` }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-4 text-[10px] font-semibold">
          {diagnosisLabels.map((label) => (
            <span className="flex items-center gap-1 text-[#45474c]" key={label}>
              <span className={cn("size-2 rounded-full", labelBar[label])} />
              {label} · {countOf(counts, label)} ({formatPercent(scored ? (countOf(counts, label) / scored) * 100 : 0)})
            </span>
          ))}
        </div>
        <p className="text-xs text-[#75777d]">
          Label mengikuti BR-04 (SB ≥ {diagnosis.thresholds.sb}, B ≥ {diagnosis.thresholds.b}, C ≥ {diagnosis.thresholds.c}); ambang masih
          menunggu UAT.
        </p>
      </section>

      <ObjectiveStudentTable objectiveNumber={objective.learningObjective.number} params={params} rows={rows} slug={slug} />

      <section className={card}>
        <h3 className="text-xl font-semibold leading-normal text-[#1b1b1d]">Pola kesalahan pada TP ini</h3>
        {patterns.length === 0 ? (
          <p className="text-sm text-[#45474c]">Belum ada pola kesalahan dari butir TP ini.</p>
        ) : (
          patterns.map((pattern) => (
            <div className="flex flex-col gap-2 border-b border-[#eae7e9] pb-4 last:border-b-0 last:pb-0" key={pattern.rank}>
              <p className="text-base font-semibold text-[#1b1b1d]">
                Detail pola #{pattern.rank} · {patternTitle(pattern)}
              </p>
              <p className="text-sm text-[#0058be]">
                {pattern.affectedCount} siswa · {formatPercent(pattern.affectedPct)} kelas · {sourceLabel(pattern)}
              </p>
              <p className="text-xs text-[#45474c]">Narasi AI segera tersedia; indikasi pola perlu validasi guru.</p>
              <ul className="grid gap-x-4 gap-y-1 text-xs text-[#45474c] sm:grid-cols-3">
                {pattern.studentIds.map((id) => (
                  <li key={id}>
                    <Link className="hover:text-[#0058be] hover:underline" href={diagnosisHref(slug, params, { view: "siswa", student: id, item: undefined })}>
                      {names.get(id) ?? "Siswa"}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </>
  );
}

// Diagnosis TP (FR-G-081, FR-G-085; Figma New Design 85:6284, 85:6752): one TP's average, label spread, every
// student's score and the misconception patterns on its questions.
export function ObjectiveView({
  slug,
  params,
  diagnosis,
  questionObjectives,
}: {
  slug: string;
  params: DiagnosisParams;
  diagnosis: ClassDiagnosis;
  questionObjectives: Map<string, string[]>;
}) {
  const objective = diagnosis.learningObjectives.find((entry) => entry.learningObjective.id === params.tp);

  return (
    <div className="flex flex-col gap-6">
      <ObjectivePicker key={params.tp ?? "none"} objectives={diagnosis.learningObjectives} params={params} slug={slug} />

      {!objective ? (
        <p className="px-2 text-sm text-[#45474c]">Belum ada TP dipilih.</p>
      ) : (
        <SelectedObjective diagnosis={diagnosis} objective={objective} params={params} questionObjectives={questionObjectives} slug={slug} />
      )}
    </div>
  );
}
