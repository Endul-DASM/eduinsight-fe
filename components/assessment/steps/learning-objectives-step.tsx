"use client";

import { type FormEvent, useActionState, useState } from "react";
import { saveLearningObjectivesAction } from "@/lib/actions/assessments";
import type { LearningObjectiveOption } from "@/lib/api/curriculum";
import type { AssessmentDetail } from "@/lib/api/types";
import { MIN_LEARNING_OBJECTIVE_MESSAGE } from "@/lib/assessment-form";
import { StepFooter } from "./step-footer";

const ALL_CHAPTERS = "";

const selectClassName =
  "h-10 rounded-[12px] border border-[#c5c6cd] bg-white px-3 text-sm text-[#091426] outline-none focus:border-[#0058be]";

// Langkah Pilih TP (FR-G-042): at least one Tujuan Pembelajaran from the subject's curriculum, filterable by Bab.
export function LearningObjectivesStep({
  slug,
  assessment,
  learningObjectives,
  locked,
}: {
  slug: string;
  assessment: AssessmentDetail;
  learningObjectives: LearningObjectiveOption[];
  locked: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    saveLearningObjectivesAction.bind(null, slug, assessment.id),
    undefined,
  );
  const [selected, setSelected] = useState(() => new Set(assessment.learningObjectives.map((objective) => objective.id)));
  const [chapterId, setChapterId] = useState(ALL_CHAPTERS);
  const [clientError, setClientError] = useState<string>();

  const error = clientError ?? (state?.status === "error" ? state.fields?.learningObjectiveIds : undefined);
  // Every Bab that covers at least one TP, in curriculum order.
  const chapters = new Map(learningObjectives.flatMap((objective) => objective.chapters.map((c) => [c.id, c.label])));
  const visible = learningObjectives.filter(
    (objective) => chapterId === ALL_CHAPTERS || objective.chapters.some((chapter) => chapter.id === chapterId),
  );
  const visibleIds = new Set(visible.map((objective) => objective.id));
  // Grouped by CP, in curriculum order.
  const groups = new Map<string, LearningObjectiveOption[]>();
  for (const objective of visible) {
    groups.set(objective.cpLabel, [...(groups.get(objective.cpLabel) ?? []), objective]);
  }

  function toggle(id: string, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
    setClientError(undefined);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (selected.size === 0) {
      setClientError(MIN_LEARNING_OBJECTIVE_MESSAGE);
      event.preventDefault();
    }
  }

  return (
    <form action={formAction} noValidate onSubmit={handleSubmit}>
      <fieldset className="flex flex-col gap-6" disabled={locked}>
        <legend className="mb-2 text-[16px] font-medium text-[#1b1b1d]">Pilih TP</legend>
        <p className="text-sm text-[#5c6470]">
          Tujuan Pembelajaran (TP) diambil dari Kurikulum mata pelajaran ini. Soal pada langkah berikutnya disaring
          sesuai pilihan ini.
        </p>

        {learningObjectives.length === 0 ? (
          <p className="rounded-lg bg-[#f5f3f4] px-4 py-3 text-sm text-[#45474c]">
            Kurikulum mata pelajaran ini belum memiliki TP. Lengkapi Kurikulum terlebih dahulu.
          </p>
        ) : (
          <>
            {chapters.size > 0 && (
              <label className="flex flex-wrap items-center gap-2 text-sm text-[#45474c]">
                Saring per Bab
                <select
                  className={selectClassName}
                  onChange={(event) => setChapterId(event.target.value)}
                  value={chapterId}
                >
                  <option value={ALL_CHAPTERS}>Semua Bab</option>
                  {[...chapters].map(([id, chapterLabel]) => (
                    <option key={id} value={id}>
                      {chapterLabel}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="flex flex-col gap-5">
              {[...groups].map(([cpLabel, items]) => (
                <div className="flex flex-col gap-2" key={cpLabel}>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#45474c]">{cpLabel}</p>
                  {items.map((objective) => (
                    <label
                      className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-[#c5c6cd] px-4 py-3 has-[:checked]:border-[#0058be] has-[:checked]:bg-[rgba(33,112,228,0.06)]"
                      key={objective.id}
                    >
                      <input
                        checked={selected.has(objective.id)}
                        className="mt-1 size-4 accent-[#0058be]"
                        name="learningObjectiveId"
                        onChange={(event) => toggle(objective.id, event.target.checked)}
                        type="checkbox"
                        value={objective.id}
                      />
                      <span className="flex flex-col gap-1">
                        <span className="text-sm text-[#1b1b1d]">
                          {objective.code && <span className="font-semibold">{objective.code} </span>}
                          {objective.description}
                        </span>
                        <span className="text-xs text-[#75777d]">
                          {objective.chapters.length > 0
                            ? `Bab: ${objective.chapters.map((chapter) => chapter.label).join(", ")}`
                            : "Belum dipetakan ke Bab"}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              ))}
            </div>

            {/* Picks hidden by the Bab filter stay selected and are saved too. */}
            {[...selected]
              .filter((id) => !visibleIds.has(id))
              .map((id) => (
                <input key={id} name="learningObjectiveId" type="hidden" value={id} />
              ))}
          </>
        )}

        {error && (
          <p className="text-sm text-[#ba1a1a]" role="alert">
            {error}
          </p>
        )}
        <StepFooter locked={locked} pending={pending} state={state} />
      </fieldset>
    </form>
  );
}
