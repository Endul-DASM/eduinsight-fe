"use client";

import { useState, useTransition } from "react";
import { primaryButtonClassName } from "@/components/auth/styles";
import { greyButtonClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import { saveImportAction } from "@/lib/actions/assessments";
import type { QuestionImport } from "@/lib/api/questions";
import type { AssessmentDetail } from "@/lib/api/types";
import type { BuilderMethod } from "@/lib/assessment-form";
import { FormMessage } from "./builder-fields";
import { QuestionCard } from "./question-card";

// FR-G-063 / FR-G-064: what came out of a template (or, later, a scan): rows that could not be read, and the draft
// questions to keep or leave out before they join the Bank Soal and the assessment.
export function ImportReview({
  slug,
  method,
  assessment,
  result,
}: {
  slug: string;
  method: BuilderMethod;
  assessment: AssessmentDetail;
  result: QuestionImport;
}) {
  const [kept, setKept] = useState<Set<string>>(() => new Set(result.drafts.map((draft) => draft.id)));
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    setKept((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function save(next: boolean) {
    setMessage(undefined);
    const keptIds = result.drafts.filter((draft) => kept.has(draft.id)).map((draft) => draft.id);
    const droppedIds = result.drafts.filter((draft) => !kept.has(draft.id)).map((draft) => draft.id);
    startTransition(async () => {
      const outcome = await saveImportAction(
        slug,
        assessment.id,
        method,
        result.id,
        keptIds,
        droppedIds,
        assessment.questions.map((question) => question.id),
        next,
      );
      if (outcome.status === "error") setMessage(outcome.message);
    });
  }

  const untagged = result.drafts.filter((draft) => kept.has(draft.id) && draft.learningObjectives.length === 0).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 leading-normal">
        <p className="text-base font-semibold text-[#1b1b1d]">Hasil impor: {result.filename}</p>
        <p className="text-sm text-[#45474c]">
          {result.drafts.length} soal terbaca dari {result.rowCount} baris
          {result.errors.length > 0 && `, ${result.errors.length} baris gagal dibaca`}. Hapus centang pada soal yang
          tidak ingin dipakai.
          {assessment.questions.length > 0 &&
            ` Soal terpilih ditambahkan setelah ${assessment.questions.length} soal yang sudah ada.`}
        </p>
      </div>

      {result.errors.length > 0 && (
        <div className="rounded-xl border border-[#fecaca] bg-[#ffeded] px-4 py-3 text-sm leading-normal text-[#93000a]">
          <p className="font-semibold">Baris yang gagal dibaca (tidak ikut disimpan):</p>
          <ul className="mt-1 list-disc pl-5">
            {result.errors.map((error) => (
              <li key={`${error.row}-${error.message}`}>
                Baris {error.row}: {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.drafts.map((draft, index) => {
        const chosen = kept.has(draft.id);
        return (
          <QuestionCard
            actions={
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#004695]">
                <input
                  checked={chosen}
                  className="size-4 accent-[#0058be]"
                  onChange={() => toggle(draft.id)}
                  type="checkbox"
                />
                Pakai soal ini
              </label>
            }
            answer={draft.answerKey}
            badge={
              draft.learningObjectives.length === 0 && (
                <span className="rounded-3xl bg-[rgba(254,215,170,0.6)] px-2 py-0.5 text-[10px] font-semibold text-[#c2410c]">
                  Belum ada TP
                </span>
              )
            }
            chips={draft.learningObjectives.map((objective) => `TP ${objective.number}`)}
            className={cn(!chosen && "opacity-50")}
            key={draft.id}
            options={draft.options}
            stem={draft.stem}
            title={`Soal ${assessment.questions.length + index + 1}`}
          />
        );
      })}

      {untagged > 0 && (
        <p className="text-xs leading-normal text-[#c2410c]">
          {untagged} soal belum punya TP (kolom &quot;tp&quot; kosong). Soal tanpa TP menghalangi publikasi; perbaiki
          di template lalu unggah ulang.
        </p>
      )}
      {message && <FormMessage>{message}</FormMessage>}

      <div className="flex flex-wrap justify-end gap-3">
        <button className={greyButtonClassName} disabled={pending} onClick={() => save(false)} type="button">
          Simpan Draft
        </button>
        <button className={primaryButtonClassName} disabled={pending} onClick={() => save(true)} type="button">
          {pending ? "Menyimpan..." : "Selanjutnya"}
        </button>
      </div>
    </div>
  );
}
