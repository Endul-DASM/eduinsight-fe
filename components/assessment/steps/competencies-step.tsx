"use client";

import { type FormEvent, useActionState, useState } from "react";
import { saveCompetenciesAction } from "@/lib/actions/assessments";
import type { CompetencyOption } from "@/lib/api/curriculum";
import type { AssessmentDetail } from "@/lib/api/types";
import { StepFooter } from "./step-footer";

const MIN_COMPETENCY_MESSAGE = "Pilih minimal satu Kompetensi.";

// Langkah Pilih Kompetensi (FR-G-042): at least one competency from the subject's curriculum.
export function CompetenciesStep({
  slug,
  assessment,
  competencies,
  locked,
}: {
  slug: string;
  assessment: AssessmentDetail;
  competencies: CompetencyOption[];
  locked: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    saveCompetenciesAction.bind(null, slug, assessment.id),
    undefined,
  );
  const [selected, setSelected] = useState(() => new Set(assessment.competencies.map((competency) => competency.id)));
  const [clientError, setClientError] = useState<string>();

  const error = clientError ?? (state?.status === "error" ? state.fields?.competencyIds : undefined);
  // Grouped by Bab › Subbab, in curriculum order.
  const groups = new Map<string, CompetencyOption[]>();
  for (const competency of competencies) {
    groups.set(competency.path, [...(groups.get(competency.path) ?? []), competency]);
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
      setClientError(MIN_COMPETENCY_MESSAGE);
      event.preventDefault();
    }
  }

  return (
    <form action={formAction} noValidate onSubmit={handleSubmit}>
      <fieldset className="flex flex-col gap-6" disabled={locked}>
        <legend className="mb-2 text-[16px] font-medium text-[#1b1b1d]">Pilih Kompetensi</legend>
        <p className="text-sm text-[#5c6470]">
          Kompetensi diambil dari Kurikulum mata pelajaran ini. Soal pada langkah berikutnya disaring sesuai pilihan
          ini.
        </p>

        {competencies.length === 0 ? (
          <p className="rounded-lg bg-[#f5f3f4] px-4 py-3 text-sm text-[#45474c]">
            Kurikulum mata pelajaran ini belum memiliki Kompetensi. Lengkapi Kurikulum terlebih dahulu.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {[...groups].map(([path, items]) => (
              <div className="flex flex-col gap-2" key={path}>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#45474c]">{path}</p>
                {items.map((competency) => (
                  <label
                    className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-[#c5c6cd] px-4 py-3 has-[:checked]:border-[#0058be] has-[:checked]:bg-[rgba(33,112,228,0.06)]"
                    key={competency.id}
                  >
                    <input
                      checked={selected.has(competency.id)}
                      className="mt-1 size-4 accent-[#0058be]"
                      name="competencyId"
                      onChange={(event) => toggle(competency.id, event.target.checked)}
                      type="checkbox"
                      value={competency.id}
                    />
                    <span className="flex flex-col gap-1">
                      <span className="text-sm text-[#1b1b1d]">
                        {competency.code && <span className="font-semibold">{competency.code} </span>}
                        {competency.description}
                      </span>
                      <span className="text-xs text-[#75777d]">{competency.indicatorCount} Indikator</span>
                    </span>
                  </label>
                ))}
              </div>
            ))}
          </div>
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
