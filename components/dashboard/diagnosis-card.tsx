"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/components/ui/cn";
import { Modal } from "@/components/ui/modal";
import { subjectModalClassName } from "@/components/subject-select/styles";
import {
  type ChapterDiagnosis,
  type DiagnosisLabel,
  diagnosisLabelNames,
  diagnosisLabels,
  type LabelGroups,
  MIN_ITEMS_PER_TP,
  type StudentScore,
} from "@/lib/dashboard/compute";

// Three shades per label; a cell gets darker as more of the row's students fall in it (Figma annotation on 36:4950).
const palette: Record<DiagnosisLabel, [string, string, string]> = {
  SB: ["bg-[#dcfce7] text-[#14532d]", "bg-[#4ade80] text-[#14532d]", "bg-[#22c55e] text-[#f0fdf4]"],
  B: ["bg-[#ecfdf3] text-[#14532d]", "bg-[#bbf7d0] text-[#14532d]", "bg-[#86efac] text-[#14532d]"],
  C: ["bg-[#ffedd5] text-[#7c2d12]", "bg-[#fed7aa] text-[#7c2d12]", "bg-[#fb923c] text-[#431407]"],
  K: ["bg-[#fee2e2] text-[#991b1b]", "bg-[#fecaca] text-[#991b1b]", "bg-[#f87171] text-[#450a0a]"],
};

function cellClassName(label: DiagnosisLabel, count: number, rowTotal: number) {
  if (count === 0) return "bg-[#f5f3f4] text-[#75777d]";
  const share = count / rowTotal;
  return palette[label][share < 0.2 ? 0 : share < 0.45 ? 1 : 2];
}

const rowTotal = (groups: LabelGroups) => diagnosisLabels.reduce((sum, label) => sum + groups[label].length, 0);

type StudentList = { title: string; description: string; students: StudentScore[] };

function CountButton({
  groups,
  label,
  onOpen,
  title,
  className,
}: {
  groups: LabelGroups;
  label: DiagnosisLabel;
  onOpen: (list: StudentList) => void;
  title: string;
  className?: string;
}) {
  const students = groups[label];
  const total = rowTotal(groups);

  return (
    <button
      aria-label={`${students.length} siswa ${diagnosisLabelNames[label]} di ${title}`}
      className={cn(
        "rounded-xl p-2.5 text-center text-base font-semibold leading-normal transition-[filter] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0058be] enabled:hover:brightness-95 disabled:cursor-default",
        cellClassName(label, students.length, total),
        className,
      )}
      disabled={students.length === 0}
      onClick={() =>
        onOpen({
          title: `${title}: ${diagnosisLabelNames[label]}`,
          description: `${students.length} dari ${total} siswa`,
          students,
        })
      }
      type="button"
    >
      {students.length}
    </button>
  );
}

// FR-G-011: pressing a number lists its students; the count in the cell is the length of the list.
function StudentListModal({ list, onClose }: { list: StudentList | null; onClose: () => void }) {
  return (
    <Modal
      className={subjectModalClassName}
      description={list?.description}
      onClose={onClose}
      open={Boolean(list)}
      showClose
      title={list?.title ?? ""}
    >
      <ul className="flex max-h-[50vh] flex-col divide-y divide-[#e6eff9] overflow-y-auto">
        {list?.students.map((student) => (
          <li className="flex items-center justify-between gap-4 py-2.5 text-base leading-normal" key={student.studentId}>
            <span className="truncate text-[#1b1b1d]">{student.name}</span>
            <span className="shrink-0 font-semibold text-[#45474c]">{Math.round(student.score)}</span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

// "Diagnosis Cepat TP" (Figma New Design 22:4162, 37:5316). selectedNumber is the Bab shown in Detail Bab, if any.
export function DiagnosisCard({
  chapters,
  studentCount,
  baseHref,
  selectedNumber,
  hasScores,
}: {
  chapters: ChapterDiagnosis[];
  studentCount: number;
  baseHref: string;
  selectedNumber: number | null;
  hasScores: boolean;
}) {
  const [list, setList] = useState<StudentList | null>(null);

  return (
    <section className="flex w-full flex-col gap-5 rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
      <div className="flex flex-wrap items-center justify-between gap-3 py-1">
        <h2 className="flex items-center gap-3 text-xl font-semibold leading-normal text-[#1b1b1d]">
          <Image alt="" height={24} src="/dashboard/diagnosis-grid.svg" width={24} />
          Diagnosis Cepat TP
        </h2>
        <span className="rounded-3xl bg-[rgba(153,188,229,0.6)] px-2 py-1 text-xs font-semibold leading-normal text-[#004695]">
          Jumlah Siswa: {studentCount}
        </span>
      </div>
      <hr className="border-[#c5c6cd]" />

      {chapters.length === 0 ? (
        <p className="py-6 text-center text-sm leading-normal text-[#45474c]">
          Belum ada Bab final di Kurikulum. Diagnosis per Bab muncul setelah Bab dan TP disimpan final.
        </p>
      ) : (
        <>
          {!hasScores && (
            <p className="rounded-xl bg-[#e6eff9] px-4 py-3 text-sm leading-normal text-[#004695]">
              Belum ada pengerjaan siswa yang dinilai, jadi semua sel masih 0.
            </p>
          )}
          <div className="overflow-x-auto">
            <div className="grid min-w-[480px] grid-cols-5 gap-x-3 gap-y-4">
              <span />
              {diagnosisLabels.map((label) => (
                <span className="text-center text-base leading-normal text-[#1b1b1d]" key={label}>
                  {diagnosisLabelNames[label]}
                </span>
              ))}
              {chapters.map((chapter) => {
                const selected = chapter.number === selectedNumber;
                return (
                  <div className="contents" key={chapter.id}>
                    <Link
                      aria-current={selected ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-center rounded-xl bg-[#0058be] px-3 py-3 text-base font-semibold leading-normal text-[#f5f3f4] drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)] transition-colors hover:bg-[#004695]",
                        selected && "bg-[#003264] ring-2 ring-[#99bce5] ring-offset-2",
                      )}
                      href={`${baseHref}?bab=${chapter.number}`}
                      scroll={false}
                      title={chapter.name}
                    >
                      Bab {chapter.number}
                    </Link>
                    {diagnosisLabels.map((label) => (
                      <CountButton
                        groups={chapter.students}
                        key={label}
                        label={label}
                        onOpen={setList}
                        title={`Bab ${chapter.number}`}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
      <StudentListModal list={list} onClose={() => setList(null)} />
    </section>
  );
}

// "Distribusi label per TP" for the Bab chosen in Detail Bab (Figma New Design 37:5316).
export function ObjectiveTable({ chapter, baseHref }: { chapter: ChapterDiagnosis; baseHref: string }) {
  const [list, setList] = useState<StudentList | null>(null);
  const weakest = chapter.objectives
    .map((objective) => ({ objective, total: rowTotal(objective.students), weak: objective.students.K.length }))
    .filter((entry) => entry.weak > 0)
    .sort((a, b) => b.weak / b.total - a.weak / a.total)[0];

  return (
    <section className="flex w-full flex-col gap-4 rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold leading-normal text-[#1b1b1d]">Distribusi label per TP</h2>
          <p className="text-xs leading-normal text-[#45474c]">
            Jumlah siswa dalam setiap kategori untuk Bab {chapter.number}: {chapter.name}.
          </p>
        </div>
        <Link className="text-sm font-semibold text-[#0058be] hover:underline" href={baseHref} scroll={false}>
          ← Kembali ke Dashboard
        </Link>
      </div>
      {chapter.objectives.length === 0 ? (
        <p className="py-4 text-sm text-[#45474c]">Bab ini belum punya TP.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm leading-normal">
            <thead className="bg-[#e6eff9] text-xs font-semibold text-[#1b1b1d]">
              <tr>
                <th className="rounded-l-lg px-3 py-2.5" scope="col">
                  Bab {chapter.number}: {chapter.name}
                </th>
                {diagnosisLabels.map((label) => (
                  <th className="w-16 px-2 py-2.5 text-center" key={label} scope="col" title={diagnosisLabelNames[label]}>
                    {label}
                  </th>
                ))}
                <th className="w-16 rounded-r-lg px-3 py-2.5 text-center" scope="col">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6eff9]">
              {chapter.objectives.map((objective) => (
                <tr className={cn(weakest?.objective.id === objective.id && "bg-[#e6eff9]/60")} key={objective.id}>
                  <th className="px-3 py-2 font-normal text-[#0058be]" scope="row">
                    <span className="font-semibold">TP {objective.number}:</span> {objective.description}
                    {objective.itemCount < MIN_ITEMS_PER_TP && (
                      <span className="ml-2 whitespace-nowrap rounded-3xl bg-[#ffedd5] px-2 py-0.5 text-[10px] font-semibold text-[#7c2d12]">
                        data terbatas
                      </span>
                    )}
                  </th>
                  {diagnosisLabels.map((label) => (
                    <td className="px-2 py-2" key={label}>
                      <CountButton
                        className="w-full py-1.5 text-sm"
                        groups={objective.students}
                        label={label}
                        onOpen={setList}
                        title={`TP ${objective.number}`}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center text-[#45474c]">{rowTotal(objective.students)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs leading-normal text-[#45474c]">
        Label mengikuti BR-04: SB ≥ 90, B 75–89, C 60–74, K &lt; 60. TP bertanda &ldquo;data terbatas&rdquo; dinilai
        dari kurang dari {MIN_ITEMS_PER_TP} butir soal (BR-05).
      </p>
      {weakest && (
        <p className="text-xs leading-normal text-[#1b1b1d]">
          TP {weakest.objective.number} memiliki {weakest.weak} siswa berlabel K (
          {Math.round((weakest.weak / weakest.total) * 100)}%). Dahulukan penguatan TP ini.
        </p>
      )}
      <StudentListModal list={list} onClose={() => setList(null)} />
    </section>
  );
}
