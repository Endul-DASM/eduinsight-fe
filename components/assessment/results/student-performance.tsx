"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/components/ui/cn";
import { SelectMenu } from "@/components/ui/select-menu";
import type { AssessmentResults, StudentPerformance } from "@/lib/api/results";
import {
  answerKeyOf,
  correctCountOf,
  formatScore,
  itemRecap,
  type ResultLabel,
  resultLabelOf,
  resultLabels,
} from "@/lib/assessment-results";

const headCell = "border-b border-[#eae7e9] px-2 py-3 text-xs font-semibold leading-normal text-[#45474c]";
const bodyCell = "border-b border-[#eae7e9] px-2 py-2.5 text-xs leading-normal text-[#1b1b1d]";

function ItemCell({ student, questionId, essay }: { student: StudentPerformance; questionId: string; essay: boolean }) {
  if (student.status === "not_attempted") return <span className="text-[#9aa1ae]">–</span>;
  const item = student.items.find((entry) => entry.questionId === questionId);
  if (!item) return <span className="text-[#9aa1ae]">–</span>;

  if (essay) {
    if (item.score === null) {
      return <span className="rounded-md bg-[#e6eff9] px-1.5 py-0.5 text-[10px] font-semibold text-[#004695]">Menunggu</span>;
    }
    return <span className="rounded-md bg-[#f0edef] px-1.5 py-0.5 font-semibold">{formatScore(item.score)}</span>;
  }
  return (
    <span
      className={cn(
        "rounded-md px-1.5 py-0.5 font-semibold",
        item.isCorrect ? "bg-[#dcfce7] text-[#14532d]" : "bg-[#fee2e2] text-[#991b1b]",
      )}
    >
      {item.answer ?? "–"} ({item.isCorrect ? 1 : 0})
    </span>
  );
}

// Performa Siswa (FR-G-071; Figma New Design 65:13515): each student's answer and score per question, then the
// total. The counted attempt is the student's best scored one (the backend's rule).
export function StudentPerformanceView({ results }: { results: AssessmentResults }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ResultLabel | "">("");
  const [ascending, setAscending] = useState(true);

  const shown = results.students
    .filter((student) => student.student.name.toLowerCase().includes(query.trim().toLowerCase()))
    .filter((student) => !status || resultLabelOf(student) === status)
    .sort((a, b) => (ascending ? 1 : -1) * a.student.name.localeCompare(b.student.name, "id"));
  const recap = itemRecap(results, shown);
  const questionCount = results.questions.length;

  return (
    <section className="flex flex-col gap-6 rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[rgba(153,188,229,0.6)] pb-4">
        <div className="leading-normal">
          <h3 className="text-2xl font-semibold text-[#1b1b1d]">Performa siswa</h3>
          <p className="text-xs text-[#45474c]">
            Skor total dan skor per butir untuk setiap siswa. Seluruh respons ditampilkan agar mudah diperiksa.
          </p>
        </div>
        <span className="rounded-lg bg-[#e6eff9] px-2 py-1 text-xs font-semibold text-[#004695]">
          {results.students.length} Siswa, {questionCount} Butir
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex h-[50px] w-full items-center gap-3 rounded-xl border border-[#c5c6cd] bg-[#fbf8fa] px-[13px] focus-within:border-[#0058be] sm:w-[260px]">
          <Image alt="" height={24} src="/assessment/search.svg" width={24} />
          <input
            aria-label="Cari nama siswa"
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#75777d]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama siswa"
            value={query}
          />
        </label>
        <div className="w-[220px]">
          <SelectMenu
            aria-label="Filter status"
            className="border-transparent bg-transparent font-semibold text-[#1b1b1d]"
            onChange={(event) => setStatus(event.target.value as ResultLabel | "")}
            value={status}
          >
            <option value="">Semua status</option>
            {Object.entries(resultLabels).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectMenu>
        </div>
        <p className="ml-auto flex items-center gap-3 text-xs text-[#45474c]">
          Isi sel: opsi (skor)
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-[#22c55e]" /> Benar = 1
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-[#f87171]" /> Salah = 0
          </span>
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#eae7e9]">
        <table className="w-full border-separate border-spacing-0 text-center">
          <thead className="bg-[#f5f3f4]">
            <tr>
              <th className={cn(headCell, "sticky left-0 z-10 min-w-[160px] bg-[#f5f3f4] text-left")}>
                <button className="hover:text-[#0058be]" onClick={() => setAscending((value) => !value)} type="button">
                  Nama siswa {ascending ? "↑" : "↓"}
                </button>
              </th>
              {results.questions.map((question) => (
                <th className={cn(headCell, "min-w-[56px]")} key={question.questionId} title={question.stem}>
                  B{question.number}
                  <span className="block text-[10px] font-normal text-[#75777d]">
                    {question.type === "pg" ? `Kunci ${answerKeyOf(question) ?? "–"}` : "Uraian"}
                  </span>
                </th>
              ))}
              <th className={cn(headCell, "border-l")}>Benar</th>
              <th className={headCell}>Skor</th>
              <th className={cn(headCell, "text-left")}>Ketuntasan</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((student) => {
              const label = resultLabels[resultLabelOf(student)];
              const attempted = student.status !== "not_attempted";
              return (
                <tr className="hover:bg-[#f9f9fb]" key={student.student.id}>
                  <td className={cn(bodyCell, "sticky left-0 bg-white text-left font-medium")}>{student.student.name}</td>
                  {results.questions.map((question) => (
                    <td className={bodyCell} key={question.questionId}>
                      <ItemCell essay={question.type === "uraian"} questionId={question.questionId} student={student} />
                    </td>
                  ))}
                  <td className={cn(bodyCell, "border-l")}>{attempted ? `${correctCountOf(student)}/${questionCount}` : "–"}</td>
                  <td className={cn(bodyCell, "font-semibold")}>{formatScore(student.score)}</td>
                  <td className={cn(bodyCell, "text-left")}>
                    <span className={cn("whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-semibold", label.className)}>
                      {label.label}
                    </span>
                  </td>
                </tr>
              );
            })}
            {shown.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-sm text-[#45474c]" colSpan={questionCount + 4}>
                  Tidak ada siswa yang cocok.
                </td>
              </tr>
            )}
          </tbody>
          {shown.length > 0 && (
            <tfoot className="bg-[#e6eff9]">
              <tr>
                <td className={cn(bodyCell, "sticky left-0 bg-[#e6eff9] text-left font-semibold text-[#003264]")}>
                  Jumlah benar / siswa
                </td>
                {recap.perQuestion.map((item) => (
                  <td className={bodyCell} key={item.questionId}>
                    {item.correct}/{item.total}
                  </td>
                ))}
                <td className={cn(bodyCell, "border-l")}>
                  {recap.correct}/{recap.total}
                </td>
                <td className={bodyCell}>{formatScore(recap.average)}</td>
                <td className={cn(bodyCell, "text-left")}>
                  {recap.mastered}/{recap.finals} tuntas
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="flex flex-wrap justify-between gap-2 text-xs leading-normal">
        <span className="text-[#45474c]">
          Pilihan ganda benar = 1, salah = 0; uraian memakai skor dari guru. Skor total = rata-rata skor butir (0–100);
          baris rekap menampilkan rata-rata skor kelas.
        </span>
        <span className="font-semibold text-[#1b1b1d]">
          Menampilkan {shown.length} dari {results.students.length} siswa
        </span>
      </div>
    </section>
  );
}
