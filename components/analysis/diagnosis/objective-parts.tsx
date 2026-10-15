"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Field, SelectInput } from "@/components/assessment/builder-fields";
import { cn } from "@/components/ui/cn";
import type { ObjectiveDiagnosis } from "@/lib/api/diagnosis";
import { formatPercent } from "@/lib/assessment-results";
import { labelChip, type DiagnosisLabel } from "@/lib/diagnosis";
import { diagnosisHref, type DiagnosisParams } from "./links";

// Bab + TP pickers of Diagnosis TP (Figma New Design 85:6284). The Bab only narrows the TP list.
export function ObjectivePicker({
  slug,
  params,
  objectives,
}: {
  slug: string;
  params: DiagnosisParams;
  objectives: ObjectiveDiagnosis[];
}) {
  const router = useRouter();
  const id = useId();
  const selected = objectives.find((objective) => objective.learningObjective.id === params.tp);
  const [chapter, setChapter] = useState(selected ? String(selected.chapterNumber) : "");
  const chapters = [...new Map(objectives.map((objective) => [objective.chapterNumber, objective.chapterName])).entries()].sort(
    (a, b) => a[0] - b[0],
  );
  const shown = objectives.filter((objective) => !chapter || String(objective.chapterNumber) === chapter);

  return (
    <section className="grid gap-4 rounded-3xl bg-[#fafbfd] p-5 shadow-[0_4px_10px_rgba(0,0,0,0.1)] md:grid-cols-2">
      <Field htmlFor={`${id}-bab`} label="Bab">
        <SelectInput id={`${id}-bab`} onChange={(event) => setChapter(event.target.value)} value={chapter}>
          <option value="">Pilih Bab yang ingin dianalisis</option>
          {chapters.map(([number, name]) => (
            <option key={number} value={String(number)}>
              Bab {number}: {name}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field htmlFor={`${id}-tp`} label="Tujuan Pembelajaran (TP)">
        <SelectInput
          id={`${id}-tp`}
          onChange={(event) => router.replace(diagnosisHref(slug, params, { tp: event.target.value || undefined }), { scroll: false })}
          value={params.tp ?? ""}
        >
          <option value="">Pilih TP yang ingin dianalisis</option>
          {shown.map((objective) => (
            <option key={objective.learningObjective.id} value={objective.learningObjective.id}>
              TP {objective.learningObjective.number}: {objective.learningObjective.description}
            </option>
          ))}
        </SelectInput>
      </Field>
    </section>
  );
}

export type ObjectiveStudentRow = { id: string; name: string; score: number | null; label: DiagnosisLabel | null };

// "Label dan skor seluruh siswa" (Figma New Design 85:6752): every student's score and label on the TP.
export function ObjectiveStudentTable({
  slug,
  params,
  objectiveNumber,
  rows,
}: {
  slug: string;
  params: DiagnosisParams;
  objectiveNumber: string;
  rows: ObjectiveStudentRow[];
}) {
  const [query, setQuery] = useState("");
  const shown = rows.filter((row) => row.name.toLowerCase().includes(query.trim().toLowerCase()));
  const studentHref = (id: string) => diagnosisHref(slug, params, { view: "siswa", student: id, item: undefined });

  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
      <h3 className="text-xl font-semibold leading-normal text-[#1b1b1d]">Label dan skor seluruh siswa</h3>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex h-[44px] w-full items-center gap-3 rounded-xl border border-[#c5c6cd] bg-white px-3 focus-within:border-[#0058be] sm:w-[260px]">
          <input
            aria-label="Cari nama siswa"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#75777d]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama siswa"
            value={query}
          />
          <Image alt="" height={20} src="/assessment/search.svg" width={20} />
        </label>
        <span className="text-xs text-[#75777d]">
          {shown.length} dari {rows.length} siswa · urut nama A–Z
        </span>
      </div>
      <p className="text-xs text-[#45474c]">Klik nama atau &quot;Buka siswa&quot; untuk membuka Diagnosis Siswa.</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-separate border-spacing-0 text-left text-xs leading-normal">
          <thead className="bg-[#f5f3f4] text-[#45474c]">
            <tr>
              <th className="px-3 py-2.5 font-semibold">No.</th>
              <th className="px-3 py-2.5 font-semibold">Nama siswa</th>
              <th className="px-3 py-2.5 font-semibold">Label TP {objectiveNumber}</th>
              <th className="px-3 py-2.5 font-semibold">Skor TP {objectiveNumber}</th>
              <th className="px-3 py-2.5 font-semibold">Diagnosis</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((row, index) => (
              <tr key={row.id}>
                <td className="border-b border-[#eae7e9] px-3 py-2.5 text-[#45474c]">{String(index + 1).padStart(2, "0")}</td>
                <td className="border-b border-[#eae7e9] px-3 py-2.5">
                  <Link className="text-[#0058be] hover:underline" href={studentHref(row.id)}>
                    {row.name} →
                  </Link>
                </td>
                <td className="border-b border-[#eae7e9] px-3 py-2.5">
                  {row.label ? (
                    <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold", labelChip[row.label])}>{row.label}</span>
                  ) : (
                    <span className="text-[#9aa1ae]">Belum ada data</span>
                  )}
                </td>
                <td className="border-b border-[#eae7e9] px-3 py-2.5 text-[#1b1b1d]">{formatPercent(row.score)}</td>
                <td className="border-b border-[#eae7e9] px-3 py-2.5">
                  <Link className="text-[#0058be] hover:underline" href={studentHref(row.id)}>
                    Buka siswa →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
