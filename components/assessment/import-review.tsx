"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { primaryButtonClassName } from "@/components/auth/styles";
import { greyButtonClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import { saveImportAction } from "@/lib/actions/assessments";
import type { QuestionImport } from "@/lib/api/questions";
import type { AssessmentDetail } from "@/lib/api/types";
import type { BuilderMethod } from "@/lib/assessment-form";
import { focusFirstError } from "@/components/ui/focus-first-error";
import { builderPath } from "@/lib/assessment-form";
import { Field, FormMessage, InfoMessage, SelectInput } from "./builder-fields";
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
  // SOAL-H06: the TP of each question, picked from the platform's TPs instead of typed in the file. Starts on the TP
  // read from the file, if any.
  const [objectiveOf, setObjectiveOf] = useState<Record<string, string>>(() =>
    Object.fromEntries(result.drafts.map((draft) => [draft.id, draft.learningObjectives[0]?.id ?? ""])),
  );
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
    // Only the TPs the teacher changed are saved again.
    const objectiveChanges = Object.fromEntries(
      result.drafts
        .filter((draft) => {
          const picked = objectiveOf[draft.id];
          const current = draft.learningObjectives.map((objective) => objective.id);
          return kept.has(draft.id) && picked && (current.length !== 1 || current[0] !== picked);
        })
        .map((draft) => [draft.id, [objectiveOf[draft.id]]]),
    );
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
        objectiveChanges,
      );
      if (outcome.status === "error") {
        setMessage(outcome.message);
        focusFirstError();
      }
    });
  }

  const untagged = result.drafts.filter((draft) => kept.has(draft.id) && !objectiveOf[draft.id]).length;
  // The assessment's TPs, plus any TP read from the file that the assessment does not target.
  const objectiveOptions = [
    ...assessment.learningObjectives,
    ...result.drafts
      .flatMap((draft) => draft.learningObjectives)
      .filter(
        (objective, index, all) =>
          !assessment.learningObjectives.some((known) => known.id === objective.id) &&
          all.findIndex((other) => other.id === objective.id) === index,
      ),
  ];

  // A template counts rows; a document read by AI (AI-07/08) counts questions.
  const unit = /\.(xlsx|csv)$/i.test(result.filename) ? "baris" : "soal";
  const Unit = unit === "baris" ? "Baris" : "Soal";
  const proposed = result.drafts.filter((draft) => draft.keyCheck === "proposed").length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 leading-normal">
        <p className="text-base font-semibold text-[#1b1b1d]">Hasil impor: {result.filename}</p>
        <p className="text-sm text-[#45474c]">
          {result.drafts.length} soal terbaca dari {result.rowCount} {unit}
          {result.errors.length > 0 && `, ${result.errors.length} ${unit} gagal dibaca`}. Hapus centang pada soal yang
          tidak ingin dipakai.
          {assessment.questions.length > 0 &&
            ` Soal terpilih ditambahkan setelah ${assessment.questions.length} soal yang sudah ada.`}
        </p>
      </div>

      {proposed > 0 && (
        <div className="rounded-xl border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-sm leading-normal text-[#9a3412]">
          {proposed} soal tidak punya kunci di berkas, jadi kuncinya diusulkan AI. Periksa kunci soal bertanda &quot;Kunci
          diusulkan AI&quot; sebelum dipakai; ubah lewat Ketik di EduInsight bila perlu.
        </div>
      )}

      {result.errors.length > 0 && (
        <div className="rounded-xl border border-[#fecaca] bg-[#ffeded] px-4 py-3 text-sm leading-normal text-[#93000a]">
          <p className="font-semibold">{Unit} yang gagal dibaca (tidak ikut disimpan):</p>
          <ul className="mt-1 list-disc pl-5">
            {result.errors.map((error) => (
              <li key={`${error.row}-${error.message}`}>
                {Unit} {error.row}: {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {objectiveOptions.length === 0 && (
        <InfoMessage>
          Asesmen ini belum punya TP.{" "}
          <Link className="font-semibold underline" href={builderPath(slug, assessment.id, method, "spesifikasi")}>
            Pilih TP di Spesifikasi Soal
          </Link>{" "}
          agar setiap soal bisa diberi TP.
        </InfoMessage>
      )}

      {result.drafts.map((draft, index) => {
        const chosen = kept.has(draft.id);
        const picked = objectiveOf[draft.id];
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
              <>
                {!picked && (
                  <span className="rounded-3xl bg-[rgba(254,215,170,0.6)] px-2 py-0.5 text-[10px] font-semibold text-[#c2410c]">
                    Belum ada TP
                  </span>
                )}
                {draft.keyCheck === "proposed" && (
                  <span
                    className="rounded-3xl bg-[#ffeded] px-2 py-0.5 text-[10px] font-semibold text-[#dc2626]"
                    title="Kunci tidak ada di berkas; AI mengusulkannya. Periksa sebelum dipakai."
                  >
                    Kunci diusulkan AI
                  </span>
                )}
              </>
            }
            className={cn(!chosen && "opacity-50")}
            footer={
              <Field htmlFor={`tp-${draft.id}`} label="TP soal ini" required>
                <SelectInput
                  disabled={!chosen}
                  id={`tp-${draft.id}`}
                  invalid={chosen && !picked}
                  onChange={(event) => setObjectiveOf((current) => ({ ...current, [draft.id]: event.target.value }))}
                  value={picked}
                >
                  <option value="">Pilih TP...</option>
                  {objectiveOptions.map((objective) => (
                    <option key={objective.id} value={objective.id}>
                      TP {objective.number}: {objective.description}
                    </option>
                  ))}
                </SelectInput>
              </Field>
            }
            key={draft.id}
            options={draft.options}
            stem={draft.stem}
            title={`Soal ${assessment.questions.length + index + 1}`}
          />
        );
      })}

      {untagged > 0 && (
        <p className="text-xs leading-normal text-[#c2410c]">
          {untagged} soal belum punya TP. Soal tanpa TP menghalangi publikasi; pilih TP di setiap soal sebelum
          menyimpan.
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
