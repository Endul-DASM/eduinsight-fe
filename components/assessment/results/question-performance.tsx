import Image from "next/image";
import Link from "next/link";
import { cn } from "@/components/ui/cn";
import type { AssessmentResults, QuestionPerformance } from "@/lib/api/results";
import { isChoiceType } from "@/lib/assessment-form";
import { answerKeyOf, chapterLabelOf, formatPercent, proportionOf, weakestQuestion } from "@/lib/assessment-results";

const percentOf = (count: number, total: number) => (total ? (count / total) * 100 : 0);

function OptionDistribution({ question }: { question: QuestionPerformance }) {
  if (!question.options) {
    return (
      <p className="text-xs text-[#45474c]">
        Uraian: {question.gradedCount ?? 0} dinilai, {question.pendingCount ?? 0} menunggu penilaian
      </p>
    );
  }
  const total = question.responseCount;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex h-2 overflow-hidden rounded-full bg-[#eef1f5]">
        {question.options.map((option) => (
          <span
            className={option.isKey ? "bg-[#0058be]" : "bg-[#c5c6cd]"}
            key={option.key}
            style={{ width: `${percentOf(option.count, total)}%` }}
            title={`${option.key}. ${option.text}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] leading-normal">
        {question.options.map((option) => (
          <span
            className={cn("whitespace-nowrap", option.isKey ? "font-semibold text-[#0058be]" : "text-[#45474c]")}
            key={option.key}
            title={option.misconceptionTag ? `Miskonsepsi: ${option.misconceptionTag}` : undefined}
          >
            {option.key} {option.count} ({formatPercent(percentOf(option.count, total))})
          </span>
        ))}
      </div>
      {question.unanswered > 0 && <span className="text-[10px] text-[#75777d]">{question.unanswered} tidak dijawab</span>}
    </div>
  );
}

// Performa Soal (FR-G-073; Figma New Design 65:14903, where the tab is labelled "Performa Per TP"): proportion
// correct and option distribution per question. The full psychometrics live in Analisis Soal.
export function QuestionPerformanceView({ slug, results }: { slug: string; results: AssessmentResults }) {
  const answered = results.questions.filter((question) => question.responseCount > 0).length;
  const weakest = weakestQuestion(results);
  const analysisHref = `/${slug}/analysis?assessment=${results.assessment.id}`;

  return (
    <section className="flex flex-col gap-6 rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="leading-normal">
          <h3 className="text-2xl font-semibold text-[#1b1b1d]">Performa soal</h3>
          <p className="text-xs text-[#45474c]">
            Proporsi benar dan distribusi pilihan jawaban untuk seluruh butir pada asesmen terpilih.
          </p>
        </div>
        <span className="rounded-lg bg-[#e6eff9] px-2 py-1 text-xs font-semibold text-[#004695]">
          {answered} dari {results.questions.length} butir
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#45474c]">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-[#0058be]" /> Opsi kunci
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-[#c5c6cd]" /> Opsi pengecoh
          </span>
        </div>
        <span>Distribusi: jumlah siswa (persentase), setiap baris = 100%</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#eae7e9]">
        <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-xs">
          <thead className="bg-[#f5f3f4] text-[#45474c]">
            <tr>
              <th className="border-b border-[#eae7e9] px-3 py-3 font-semibold">Butir / Bab</th>
              <th className="border-b border-[#eae7e9] px-3 py-3 font-semibold">TP</th>
              <th className="border-b border-[#eae7e9] px-3 py-3 font-semibold">Kunci</th>
              <th className="border-b border-[#eae7e9] px-3 py-3 font-semibold">Proporsi benar</th>
              <th className="border-b border-[#eae7e9] px-3 py-3 font-semibold">
                <span className="flex items-center justify-between gap-3">
                  Distribusi opsi
                  <Link className="flex items-center gap-1 font-semibold text-[#0058be] hover:underline" href={analysisHref}>
                    <Image alt="" height={16} src="/assessment/link.svg" width={16} />
                    Analisis Soal
                  </Link>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {results.questions.map((question) => {
              const percent = proportionOf(question);
              return (
                <tr className="align-top" key={question.questionId}>
                  <td className="border-b border-[#eae7e9] px-3 py-3">
                    <p className="font-semibold text-[#1b1b1d]">Butir {question.number}</p>
                    <p className="text-[#45474c]">{chapterLabelOf(results, question) || "Belum ada TP"}</p>
                  </td>
                  <td className="border-b border-[#eae7e9] px-3 py-3 text-[#1b1b1d]">
                    {question.learningObjectives.map((objective) => `TP ${objective.number}`).join(", ") || "–"}
                  </td>
                  <td className="border-b border-[#eae7e9] px-3 py-3 font-semibold text-[#0058be]">
                    {isChoiceType(question.type) ? (answerKeyOf(question) ?? "–") : "Uraian"}
                  </td>
                  <td className="w-[180px] border-b border-[#eae7e9] px-3 py-3">
                    <p className="font-semibold text-[#1b1b1d]">
                      {formatPercent(percent)}
                      {question.correctCount !== null && (
                        <span className="font-normal text-[#45474c]">
                          {" "}
                          ({question.correctCount}/{question.responseCount} siswa)
                        </span>
                      )}
                    </p>
                    <span className="mt-1 block h-1.5 rounded-full bg-[#eae7e9]">
                      <span className="block h-full rounded-full bg-[#0058be]" style={{ width: `${percent ?? 0}%` }} />
                    </span>
                  </td>
                  <td className="w-[380px] border-b border-[#eae7e9] px-3 py-3">
                    <OptionDistribution question={question} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {weakest && (
        <p className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-[#e6eff9] px-4 py-3 text-xs leading-normal text-[#1b1b1d]")}>
          <span className="font-semibold uppercase text-[#004695]">
            Butir {weakest.number}: {formatPercent(proportionOf(weakest))} benar
          </span>
          <span>
            Butir {weakest.number} memiliki proporsi benar terendah
            {weakest.correctCount !== null && ` (${weakest.correctCount}/${weakest.responseCount} siswa)`}. Tinjau
            pengecohnya
            {weakest.learningObjectives.length > 0 &&
              ` dan kaitannya dengan TP ${weakest.learningObjectives.map((objective) => objective.number).join(", ")}`}{" "}
            melalui{" "}
            <Link className="font-semibold text-[#0058be] hover:underline" href={analysisHref}>
              Analisis Soal
            </Link>
            .
          </span>
        </p>
      )}

      <p className="text-xs leading-normal text-[#45474c]">
        Proporsi benar = jawaban sesuai kunci ÷ jumlah siswa yang mengerjakan × 100; untuk uraian = rata-rata skor butir.
        Distribusi opsi = jumlah pemilih opsi ÷ jumlah siswa yang mengerjakan × 100.
      </p>
    </section>
  );
}
