"use client";

import { useActionState, useState } from "react";
import { cn } from "@/components/ui/cn";
import { saveQuestionsAction } from "@/lib/actions/assessments";
import type { AssessmentDetail, Question, QuestionPage } from "@/lib/api/types";
import { StepFooter } from "./step-footer";

const typeLabels = { pg: "PG", uraian: "Uraian" } as const;

const iconButtonClassName =
  "grid size-8 place-items-center rounded-[8px] border border-[#c5c6cd] bg-white text-sm text-[#45474c] hover:border-[#0058be] hover:text-[#0058be] disabled:cursor-not-allowed disabled:opacity-40";

function QuestionMeta({ question }: { question: Question }) {
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#75777d]">
      <span>{typeLabels[question.type]}</span>
      {question.bloomLevel && (
        <span>
          {question.bloomLevel} · {question.cognitiveLevel}
        </span>
      )}
      {question.indicators.length > 0 ? (
        <span>Indikator {question.indicators.map((indicator) => indicator.code ?? indicator.description).join(", ")}</span>
      ) : (
        <span className="text-[#ba1a1a]">Belum ada Indikator</span>
      )}
      {question.status === "pending_review" && <span className="text-[#c2410c]">Draf AI, belum ditinjau</span>}
    </span>
  );
}

// Langkah Pilih Soal (FR-G-043): Bank Soal questions tagged with the selected competencies, in the order students see.
export function QuestionsStep({
  slug,
  assessment,
  bank,
  locked,
}: {
  slug: string;
  assessment: AssessmentDetail;
  bank: QuestionPage;
  locked: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveQuestionsAction.bind(null, slug, assessment.id), undefined);
  const [selectedIds, setSelectedIds] = useState(() => assessment.questions.map((question) => question.id));

  // Questions already in the assessment stay listed even if they no longer match the selected competencies.
  const questions = new Map<string, Question>();
  for (const question of [...assessment.questions, ...bank.items]) questions.set(question.id, question);
  const selected = new Set(selectedIds);
  const available = bank.items.filter((question) => !selected.has(question.id));
  const fieldError = state?.status === "error" ? state.fields?.questionIds : undefined;

  function move(index: number, offset: -1 | 1) {
    setSelectedIds((current) => {
      const next = [...current];
      [next[index], next[index + offset]] = [next[index + offset], next[index]];
      return next;
    });
  }

  return (
    <form action={formAction} noValidate>
      <fieldset className="flex flex-col gap-6" disabled={locked}>
        <legend className="mb-2 text-[16px] font-medium text-[#1b1b1d]">Pilih Soal</legend>

        {/* Submitted in this order; it becomes the question numbering. */}
        {selectedIds.map((id) => (
          <input key={id} name="questionId" type="hidden" value={id} />
        ))}

        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#45474c]">
            Soal Terpilih ({selectedIds.length})
          </h3>
          {selectedIds.length === 0 ? (
            <p className="rounded-lg bg-[#f5f3f4] px-4 py-3 text-sm text-[#45474c]">
              Belum ada soal. Tambahkan dari Bank Soal di bawah.
            </p>
          ) : (
            <ol className="flex flex-col gap-2">
              {selectedIds.map((id, index) => {
                const question = questions.get(id);
                if (!question) return null;
                return (
                  <li className="flex items-start gap-3 rounded-[10px] border border-[#c5c6cd] px-4 py-3" key={id}>
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#eef5ff] text-xs font-semibold text-[#0058be]">
                      {index + 1}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="line-clamp-2 text-sm text-[#1b1b1d]">{question.stem}</span>
                      <QuestionMeta question={question} />
                    </span>
                    {!locked && (
                      <span className="flex shrink-0 gap-1">
                        <button
                          aria-label={`Naikkan soal ${index + 1}`}
                          className={iconButtonClassName}
                          disabled={index === 0}
                          onClick={() => move(index, -1)}
                          type="button"
                        >
                          ↑
                        </button>
                        <button
                          aria-label={`Turunkan soal ${index + 1}`}
                          className={iconButtonClassName}
                          disabled={index === selectedIds.length - 1}
                          onClick={() => move(index, 1)}
                          type="button"
                        >
                          ↓
                        </button>
                        <button
                          aria-label={`Keluarkan soal ${index + 1}`}
                          className={iconButtonClassName}
                          onClick={() => setSelectedIds((current) => current.filter((item) => item !== id))}
                          type="button"
                        >
                          ✕
                        </button>
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
          {fieldError && (
            <p className="text-sm text-[#ba1a1a]" role="alert">
              {fieldError}
            </p>
          )}
        </section>

        {!locked && (
          <section className="flex flex-col gap-3 border-t border-[#c5c6cd] pt-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#45474c]">
              Bank Soal sesuai Kompetensi ({available.length})
            </h3>
            {assessment.competencies.length === 0 ? (
              <p className="rounded-lg bg-[#f5f3f4] px-4 py-3 text-sm text-[#45474c]">
                Pilih Kompetensi terlebih dahulu agar soal yang sesuai dapat ditampilkan.
              </p>
            ) : available.length === 0 ? (
              <p className="rounded-lg bg-[#f5f3f4] px-4 py-3 text-sm text-[#45474c]">
                {bank.items.length === 0
                  ? "Bank Soal belum memiliki soal untuk Kompetensi yang dipilih."
                  : "Semua soal yang sesuai sudah dipilih."}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {available.map((question) => (
                  <li
                    className={cn("flex items-start gap-3 rounded-[10px] border border-dashed border-[#c5c6cd] px-4 py-3")}
                    key={question.id}
                  >
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="line-clamp-2 text-sm text-[#1b1b1d]">{question.stem}</span>
                      <QuestionMeta question={question} />
                    </span>
                    <button
                      className="shrink-0 rounded-[8px] border border-[#0058be] px-3 py-1.5 text-xs font-semibold text-[#0058be] hover:bg-[#eef5ff]"
                      onClick={() => setSelectedIds((current) => [...current, question.id])}
                      type="button"
                    >
                      Tambah
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {bank.total > bank.items.length && (
              <p className="text-xs text-[#75777d]">
                Menampilkan {bank.items.length} dari {bank.total} soal terbaru.
              </p>
            )}
          </section>
        )}

        <StepFooter locked={locked} pending={pending} state={state} />
      </fieldset>
    </form>
  );
}
