import { cn } from "@/components/ui/cn";
import type { AssessmentResults } from "@/lib/api/results";
import { formatScore, objectivesByChapter } from "@/lib/assessment-results";
import { type DiagnosisLabel, diagnosisLabelNames, diagnosisLabels, labelOf } from "@/lib/dashboard/compute";

// The label colors of Diagnosis Cepat TP on the dashboard.
const labelTones: Record<DiagnosisLabel, string> = {
  SB: "bg-[#22c55e] text-[#f0fdf4]",
  B: "bg-[#bbf7d0] text-[#14532d]",
  C: "bg-[#fed7aa] text-[#7c2d12]",
  K: "bg-[#fecaca] text-[#991b1b]",
};

const sectionClassName = "flex flex-col gap-6 rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]";

// Performa per TP (FR-G-072): the class average of each TP, grouped by Bab, then a heatmap of every student's TP
// scores (BR-03) labelled SB/B/C/K (BR-04). Not in the Figma design; it follows the other result cards.
export function ObjectivePerformanceView({ results }: { results: AssessmentResults }) {
  const chapters = objectivesByChapter(results);
  const objectives = chapters.flatMap((chapter) => chapter.objectives);
  const students = results.students
    .filter((student) => student.status !== "not_attempted")
    .sort((a, b) => a.student.name.localeCompare(b.student.name, "id"));

  if (objectives.length === 0) {
    return (
      <section className={cn(sectionClassName, "items-center py-12 text-center")}>
        <p className="text-base font-semibold text-[#1b1b1d]">Soal asesmen ini belum ber-tag TP.</p>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className={sectionClassName}>
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[rgba(153,188,229,0.6)] pb-4">
          <div className="leading-normal">
            <h3 className="text-2xl font-semibold text-[#1b1b1d]">Performa per TP</h3>
            <p className="text-xs text-[#45474c]">
              Rata-rata skor kelas untuk tiap Tujuan Pembelajaran, dikelompokkan per Bab. Skor TP = persentase skor
              butir ber-tag TP itu.
            </p>
          </div>
          <span className="rounded-lg bg-[#e6eff9] px-2 py-1 text-xs font-semibold text-[#004695]">
            {objectives.length} TP · {chapters.length} Bab
          </span>
        </div>

        {chapters.map((chapter) => (
          <div className="flex flex-col gap-2" key={chapter.number}>
            <p className="text-sm font-semibold text-[#003264]">
              Bab {chapter.number} · {chapter.name}
            </p>
            <ul className="flex flex-col divide-y divide-[#eae7e9] rounded-xl border border-[#eae7e9]">
              {chapter.objectives.map((objective) => {
                const average = objective.classAverage;
                return (
                  <li
                    className="grid gap-3 px-4 py-3 text-xs leading-normal sm:grid-cols-[minmax(0,1fr)_200px_140px]"
                    key={objective.learningObjective.id}
                  >
                    <p className="text-[#1b1b1d]">
                      <span className="font-semibold">TP {objective.learningObjective.number}</span>{" "}
                      {objective.learningObjective.description}
                    </p>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-[#1b1b1d]">
                        {formatScore(average)}
                        {average !== null && (
                          <span className="ml-2 font-normal text-[#45474c]">{diagnosisLabelNames[labelOf(average)]}</span>
                        )}
                      </span>
                      <span className="h-1.5 rounded-full bg-[#eae7e9]">
                        <span
                          className="block h-full rounded-full bg-[#0058be]"
                          style={{ width: `${Math.min(100, average ?? 0)}%` }}
                        />
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-[#45474c]">
                      <span>
                        {objective.itemCount} butir · Soal {objective.questionNumbers.join(", ")}
                      </span>
                      {objective.limitedData && (
                        <span className="self-start rounded-md bg-[#ffedd5] px-1.5 py-0.5 text-[10px] font-semibold text-[#c2410c]">
                          Data terbatas (&lt; 3 butir)
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <section className={sectionClassName}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="leading-normal">
            <h3 className="text-xl font-semibold text-[#1b1b1d]">Peta capaian siswa per TP</h3>
            <p className="text-xs text-[#45474c]">Label SB ≥ 90, B ≥ 75, C ≥ 60, K &lt; 60. Sel kosong: uraian belum dinilai.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] font-semibold">
            {diagnosisLabels.map((label) => (
              <span className={cn("rounded-md px-2 py-0.5", labelTones[label])} key={label}>
                {label} · {diagnosisLabelNames[label]}
              </span>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-[#eae7e9]">
          <table className="w-full border-separate border-spacing-0 text-center text-xs">
            <thead className="bg-[#f5f3f4]">
              <tr>
                <th className="sticky left-0 min-w-[160px] border-b border-[#eae7e9] bg-[#f5f3f4] px-2 py-3 text-left font-semibold text-[#45474c]">
                  Nama siswa
                </th>
                {objectives.map((objective) => (
                  <th
                    className="min-w-[64px] border-b border-[#eae7e9] px-2 py-3 font-semibold text-[#45474c]"
                    key={objective.learningObjective.id}
                    title={objective.learningObjective.description}
                  >
                    TP {objective.learningObjective.number}
                    <span className="block text-[10px] font-normal text-[#75777d]">Bab {objective.chapterNumber}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.student.id}>
                  <td className="sticky left-0 border-b border-[#eae7e9] bg-white px-2 py-2 text-left font-medium text-[#1b1b1d]">
                    {student.student.name}
                  </td>
                  {objectives.map((objective) => {
                    const score = student.learningObjectives.find(
                      (entry) => entry.learningObjectiveId === objective.learningObjective.id,
                    )?.score;
                    return (
                      <td className="border-b border-[#eae7e9] p-1" key={objective.learningObjective.id}>
                        {score === null || score === undefined ? (
                          <span className="block rounded-md bg-[#f5f3f4] py-1.5 text-[#9aa1ae]">–</span>
                        ) : (
                          <span className={cn("block rounded-md py-1.5 font-semibold", labelTones[labelOf(score)])}>
                            {formatScore(score)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
