"use client";

import { type FormEvent, useActionState, useState } from "react";
import { FormField } from "@/components/subject-select/form-field";
import { saveSettingsAction } from "@/lib/actions/assessments";
import type { AssessmentDetail } from "@/lib/api/types";
import {
  assessmentModeLabels,
  type SettingsErrors,
  type SettingsValues,
  validateSettings,
} from "@/lib/assessment-form";
import { SelectField } from "../form-controls";
import { StepFooter } from "./step-footer";

function valuesOf(form: HTMLFormElement): SettingsValues {
  const data = new FormData(form);
  const value = (name: string) => String(data.get(name) ?? "").trim();
  return {
    durationMinutes: value("durationMinutes"),
    maxAttempts: value("maxAttempts"),
    mode: value("mode"),
    remedialThreshold: value("remedialThreshold"),
  };
}

// Langkah Pengaturan (FR-G-044). The summary next to it is the automatic part.
export function SettingsStep({
  slug,
  assessment,
  locked,
}: {
  slug: string;
  assessment: AssessmentDetail;
  locked: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveSettingsAction.bind(null, slug, assessment.id), undefined);
  const [clientErrors, setClientErrors] = useState<SettingsErrors>({});

  const failed = state?.status === "error" ? state : undefined;
  const values: SettingsValues = (failed?.values as SettingsValues | undefined) ?? {
    durationMinutes: assessment.durationMinutes ? String(assessment.durationMinutes) : "",
    maxAttempts: String(assessment.maxAttempts),
    mode: assessment.mode,
    remedialThreshold: assessment.remedialThreshold === null ? "" : String(assessment.remedialThreshold),
  };
  const errorOf = (field: keyof SettingsValues) => clientErrors[field] ?? failed?.fields?.[field];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const errors = validateSettings(valuesOf(event.currentTarget));
    setClientErrors(errors);
    if (Object.keys(errors).length > 0) event.preventDefault();
  }

  return (
    <form action={formAction} key={JSON.stringify(failed?.values ?? null)} noValidate onSubmit={handleSubmit}>
      <fieldset className="flex flex-col gap-6" disabled={locked}>
        <legend className="mb-6 text-[16px] font-medium text-[#1b1b1d]">Pengaturan</legend>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            defaultValue={values.durationMinutes}
            error={errorOf("durationMinutes")}
            inputMode="numeric"
            label="Durasi (menit)"
            max={600}
            min={1}
            name="durationMinutes"
            placeholder={`Perkiraan: ${assessment.summary.estimatedMinutes} menit`}
            type="number"
          />
          <FormField
            defaultValue={values.maxAttempts}
            error={errorOf("maxAttempts")}
            inputMode="numeric"
            label="Jumlah Percobaan"
            max={10}
            min={1}
            name="maxAttempts"
            type="number"
          />
          <SelectField defaultValue={values.mode} error={errorOf("mode")} label="Mode" name="mode">
            {(["daring", "luring"] as const).map((mode) => (
              <option key={mode} value={mode}>
                {assessmentModeLabels[mode]}
              </option>
            ))}
          </SelectField>
          <FormField
            defaultValue={values.remedialThreshold}
            error={errorOf("remedialThreshold")}
            inputMode="numeric"
            label="Ambang Remedial"
            max={100}
            min={0}
            name="remedialThreshold"
            placeholder={`Sama dengan KKM (${assessment.kkm})`}
            type="number"
          />
        </div>
        <p className="text-xs leading-5 text-[#75777d]">
          Durasi wajib diisi sebelum publikasi. Ambang remedial kosong berarti sama dengan KKM.
        </p>
        <StepFooter last locked={locked} pending={pending} state={state} />
      </fieldset>
    </form>
  );
}
