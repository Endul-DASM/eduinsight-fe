import Image from "next/image";
import Link from "next/link";
import { primaryButtonClassName } from "@/components/auth/styles";
import { cn } from "@/components/ui/cn";
import type { ClassDiagnosis, MisconceptionPattern } from "@/lib/api/diagnosis";
import { RootCauseNarrative } from "./root-cause-narrative";
import { formatPercent } from "@/lib/assessment-results";
import {
  classSummary,
  countOf,
  diagnosisLabelNames,
  diagnosisLabels,
  heatClassName,
  heatScale,
  labelCell,
  objectivesByChapter,
  patternTitle,
  sourceLabel,
} from "@/lib/diagnosis";
import { diagnosisHref, type DiagnosisParams } from "./links";

const card = "flex flex-col gap-4 rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]";

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-[#fafbfd] p-5 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
      <p className="text-xs leading-normal text-[#45474c]">{label}</p>
      <p className="text-[28px] font-semibold leading-normal text-[#003264]">{value}</p>
      <p className="text-xs leading-normal text-[#45474c]">{note}</p>
    </div>
  );
}

// The TPs a pattern's source questions are tagged with, e.g. "TP 1.1".
function patternObjectives(pattern: MisconceptionPattern, questionObjectives: Map<string, string[]>, numbers: Map<string, string>) {
  const ids = new Set(pattern.sources.flatMap((source) => questionObjectives.get(source.questionId) ?? []));
  return [...ids].map((id) => numbers.get(id)).filter((number): number is string => Boolean(number));
}

// Diagnosis Kelas (FR-G-080, FR-G-081, FR-G-011, FR-G-083/084 rule part; Figma New Design 65:15809).
export function ClassView({
  slug,
  subjectId,
  params,
  className,
  diagnosis,
  questionObjectives,
}: {
  slug: string;
  subjectId: string;
  params: DiagnosisParams;
  className: string;
  diagnosis: ClassDiagnosis;
  // Question id → TP ids, from the assessments in scope.
  questionObjectives: Map<string, string[]>;
}) {
  const summary = classSummary(diagnosis);
  const chapters = objectivesByChapter(diagnosis.learningObjectives);
  const numbers = new Map(diagnosis.learningObjectives.map((objective) => [objective.learningObjective.id, objective.learningObjective.number]));
  const names = new Map(diagnosis.students.map((row) => [row.student.id, row.student.name]));
  const [top, ...others] = [...diagnosis.misconceptions].sort((a, b) => a.rank - b.rank);
  const tpHref = (id: string) => diagnosisHref(slug, params, { view: "tp", tp: id });
  // The first TP a pattern's questions are tagged with, for its "Buka TP" link.
  const firstTpOf = (pattern: MisconceptionPattern) =>
    pattern.sources.flatMap((source) => questionObjectives.get(source.questionId) ?? [])[0];
  const topTp = top ? firstTpOf(top) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Stat
          label="Rata-rata ketercapaian"
          note={`${summary.objectiveCount} tujuan pembelajaran, ${diagnosis.analyzedStudents} siswa`}
          value={formatPercent(summary.average)}
        />
        <Stat
          label="Prioritas penguatan"
          note={
            summary.weakest
              ? `${summary.weakest.learningObjective.description.slice(0, 60)}, rata-rata ${formatPercent(summary.weakest.classAverage)}`
              : "Belum ada skor TP"
          }
          value={summary.weakest ? `TP ${summary.weakest.learningObjective.number}` : "–"}
        />
        <Stat
          label="Pola terbesar"
          note={summary.topPattern ? `${formatPercent(summary.topPattern.affectedPct)} kelas, ${patternTitle(summary.topPattern)}` : "Belum ada pola kesalahan"}
          value={summary.topPattern ? `${summary.topPattern.affectedCount} siswa` : "–"}
        />
      </div>

      <section className={card}>
        <div className="leading-normal">
          <h3 className="text-xl font-semibold text-[#1b1b1d]">Heatmap ketercapaian kelas</h3>
          <p className="text-xs text-[#45474c]">Rata-rata skor per TP (%). Klik persentase untuk membuka Diagnosis TP.</p>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
          <div className="flex shrink-0 flex-col justify-center leading-normal md:w-[100px]">
            <p className="text-sm font-semibold text-[#1b1b1d]">{className}</p>
            <p className="text-xs text-[#45474c]">{diagnosis.analyzedStudents} Siswa</p>
          </div>
          <div className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {diagnosis.learningObjectives.map((objective) => (
              <Link
                className={cn("flex flex-col gap-1 rounded-xl p-3 transition-opacity hover:opacity-90", heatClassName(objective.classAverage))}
                href={tpHref(objective.learningObjective.id)}
                key={objective.learningObjective.id}
              >
                <span className="text-[10px] font-semibold">TP {objective.learningObjective.number}</span>
                <span className="text-2xl font-bold">{formatPercent(objective.classAverage)} →</span>
                <span className="line-clamp-1 text-[10px]" title={objective.learningObjective.description}>
                  {objective.learningObjective.description}
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#45474c]">
          Skor rendah
          {heatScale.map((step) => (
            <span className={cn("h-2 w-6 rounded-full", step.className)} key={step.from} />
          ))}
          Skor tinggi (rentang 0–100%)
        </div>
        <p className="text-xs text-[#45474c]">
          Persentase = skor TP rata-rata siswa. Skala warna bukan ambang kategori SB/B/C/K.
        </p>
      </section>

      <section className={card}>
        <div className="flex items-center justify-between gap-3 border-b border-[rgba(153,188,229,0.6)] pb-4">
          <h3 className="flex items-center gap-3 text-xl font-semibold leading-normal text-[#1b1b1d]">
            <Image alt="" height={24} src="/dashboard/diagnosis-grid.svg" width={24} />
            Diagnosis Cepat TP
          </h3>
          <span className="rounded-3xl bg-[rgba(153,188,229,0.6)] px-2 py-1 text-xs font-semibold text-[#004695]">
            Jumlah Siswa: {diagnosis.analyzedStudents}
          </span>
        </div>
        <div className="overflow-x-auto">
          <div className="grid min-w-[560px] grid-cols-5 gap-2 text-center text-sm">
            <span />
            {diagnosisLabels.map((label) => (
              <span className="pb-1 text-base text-[#1b1b1d]" key={label}>
                {diagnosisLabelNames[label]}
              </span>
            ))}
            {diagnosis.chapters.map((chapter) => (
              <div className="contents" key={chapter.chapterId}>
                <Link
                  className="rounded-lg bg-[#0058be] px-3 py-2 font-semibold text-[#f5f3f4] hover:bg-[#004695]"
                  href={diagnosisHref(slug, params, { view: "tp", chapter: chapter.chapterId, tp: undefined })}
                  title={chapter.name}
                >
                  Bab {chapter.number}
                </Link>
                {diagnosisLabels.map((label) => (
                  <span className={cn("rounded-lg px-3 py-2 font-semibold", labelCell[label])} key={label}>
                    {countOf(chapter.labelCounts, label)}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={card}>
        <div className="leading-normal">
          <h3 className="text-xl font-semibold text-[#1b1b1d]">Distribusi label per TP</h3>
          <p className="text-xs text-[#45474c]">Jumlah siswa dalam setiap kategori. Klik TP atau angka untuk membuka Diagnosis TP.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-separate border-spacing-0 text-left text-xs leading-normal">
            {chapters.map((chapter) => (
              <tbody key={chapter.number}>
                <tr className="bg-[#f5f3f4] text-[#45474c]">
                  <th className="px-2 py-2 font-semibold">
                    Bab {chapter.number}: {chapter.name}
                  </th>
                  {diagnosisLabels.map((label) => (
                    <th className="px-2 py-2 font-semibold" key={label}>
                      {label}
                    </th>
                  ))}
                  <th className="px-2 py-2 font-semibold">Belum ada data</th>
                </tr>
                {chapter.objectives.map((objective) => (
                  <tr key={objective.learningObjective.id}>
                    <td className="border-b border-[#eae7e9] px-2 py-2.5">
                      <Link className="text-[#0058be] hover:underline" href={tpHref(objective.learningObjective.id)}>
                        TP {objective.learningObjective.number}: {objective.learningObjective.description} →
                      </Link>
                      {objective.limitedData && <span className="ml-2 text-[10px] text-[#c2410c]">data terbatas</span>}
                    </td>
                    {diagnosisLabels.map((label) => (
                      <td className="border-b border-[#eae7e9] px-2 py-2.5" key={label}>
                        <Link className="text-[#0058be] hover:underline" href={tpHref(objective.learningObjective.id)}>
                          {countOf(objective.labelCounts, label)} →
                        </Link>
                      </td>
                    ))}
                    <td className="border-b border-[#eae7e9] px-2 py-2.5 text-[#45474c]">{objective.labelCounts.noData}</td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
        <p className="text-xs text-[#45474c]">TP dengan kurang dari 3 butir ditandai data terbatas.</p>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-semibold leading-normal text-[#1b1b1d]">Akar masalah</h3>
        <span className="text-xs text-[#75777d]">Indikasi pola, perlu validasi guru</span>
      </div>
      {!top ? (
        <section className={cn(card, "items-center py-10 text-center text-sm text-[#45474c]")}>
          Belum ada pola kesalahan pada cakupan ini.
        </section>
      ) : (
        <>
          <section className={card}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="leading-normal">
                <p className="text-[10px] font-semibold uppercase text-[#0058be]">
                  Pola #1, dampak terbesar
                  {patternObjectives(top, questionObjectives, numbers).map((number) => `, TP ${number}`)}
                </p>
                <p className="text-xl font-semibold text-[#1b1b1d]">{patternTitle(top)}</p>
              </div>
              <div className="text-right leading-normal">
                <p className="text-2xl font-bold text-[#0058be]">{top.affectedCount} siswa</p>
                <p className="text-xs text-[#45474c]">
                  {formatPercent(top.affectedPct)} dari {diagnosis.analyzedStudents} siswa
                </p>
              </div>
            </div>
            <RootCauseNarrative
              filters={{ assessmentId: params.assessment, chapterId: params.chapter }}
              narrative={top.narrative ?? null}
              slug={slug}
              subjectId={subjectId}
            />
            <p className="text-xs font-semibold text-[#1b1b1d]">
              Bukti: {top.affectedCount} siswa, {sourceLabel(top)}, {[...new Set(top.sources.map((source) => source.assessmentTitle))].join(", ")}
            </p>
            <ul className="grid gap-x-4 gap-y-1 text-xs text-[#45474c] sm:grid-cols-3">
              {top.studentIds.map((id) => (
                <li key={id}>
                  <Link className="hover:text-[#0058be] hover:underline" href={diagnosisHref(slug, params, { view: "siswa", student: id, item: undefined })}>
                    {names.get(id) ?? "Siswa"}
                  </Link>
                </li>
              ))}
            </ul>
            {topTp && (
              <Link className={cn(primaryButtonClassName, "self-end")} href={tpHref(topTp)}>
                Buka TP {numbers.get(topTp)}
              </Link>
            )}
          </section>
          {others.map((pattern) => {
            const firstTp = firstTpOf(pattern);
            return (
              <section
                className="flex flex-wrap items-center gap-4 rounded-3xl bg-[#fafbfd] px-6 py-4 shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
                key={pattern.rank}
              >
                <span className="text-xl font-bold text-[#9aa1ae]">#{pattern.rank}</span>
                <div className="min-w-0 flex-1 leading-normal">
                  <p className="text-sm font-semibold text-[#1b1b1d]">{patternTitle(pattern)}</p>
                  <p className="text-xs text-[#45474c]">
                    {patternObjectives(pattern, questionObjectives, numbers).map((number) => `TP ${number}, `)}
                    {sourceLabel(pattern)}, indikasi, perlu validasi guru
                  </p>
                </div>
                <span className="text-sm font-semibold text-[#1b1b1d]">
                  {pattern.affectedCount} siswa ({formatPercent(pattern.affectedPct)})
                </span>
                {firstTp && (
                  <Link
                    className="rounded-xl border-2 border-[#0058be] px-4 py-2 text-sm font-semibold text-[#0058be] hover:bg-[#e6eff9]"
                    href={tpHref(firstTp)}
                  >
                    Lihat detail
                  </Link>
                )}
                {/* Without a tag the pattern has no name of its own; its AI explanation tells what went wrong (UAT). */}
                {pattern.tag === null && (
                  <div className="basis-full">
                    <RootCauseNarrative
                      filters={{ assessmentId: params.assessment, semester: params.semester, chapterId: params.chapter }}
                      narrative={pattern.narrative ?? null}
                      rank={pattern.rank}
                      slug={slug}
                      subjectId={subjectId}
                    />
                  </div>
                )}
              </section>
            );
          })}
          <p className="text-xs text-[#75777d]">
            Pola diurutkan berdasarkan jumlah siswa terdampak. Satu siswa dapat terlibat dalam lebih dari satu pola;
            persentase tidak dijumlahkan.
          </p>
        </>
      )}
    </div>
  );
}
