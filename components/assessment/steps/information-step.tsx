"use client";

import { type FormEvent, useActionState, useState } from "react";
import { FormField } from "@/components/subject-select/form-field";
import { saveInformationAction } from "@/lib/actions/assessments";
import type { AssessmentDetail } from "@/lib/api/types";
import {
  assessmentTypeLabels,
  assessmentTypes,
  type InformationErrors,
  type InformationValues,
  isoToWibInput,
  validateInformation,
} from "@/lib/assessment-form";
import { SelectField } from "../form-controls";
import { StepFooter } from "./step-footer";

function valuesOf(form: HTMLFormElement): InformationValues {
  const data = new FormData(form);
  const value = (name: string) => String(data.get(name) ?? "").trim();
  return {
    title: value("title"),
    type: value("type"),
    kkm: value("kkm"),
    opensAt: value("opensAt"),
    closesAt: value("closesAt"),
  };
}

// Langkah Informasi (FR-G-041). The target class is the subject's class.
export function InformationStep({
  slug,
  assessment,
  className,
  locked,
}: {
  slug: string;
  assessment: AssessmentDetail;
  className: string;
  locked: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    saveInformationAction.bind(null, slug, assessment.id),
    undefined,
  );
  // Checked in the browser before submitting; the Server Function repeats the same rules.
  const [clientErrors, setClientErrors] = useState<InformationErrors>({});

  const failed = state?.status === "error" ? state : undefined;
  const values: InformationValues = (failed?.values as InformationValues | undefined) ?? {
    title: assessment.title,
    type: assessment.type,
    kkm: String(assessment.kkm),
    opensAt: isoToWibInput(assessment.opensAt),
    closesAt: isoToWibInput(assessment.closesAt),
  };
  const errorOf = (field: keyof InformationValues) => clientErrors[field] ?? failed?.fields?.[field];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const errors = validateInformation(valuesOf(event.currentTarget));
    setClientErrors(errors);
    if (Object.keys(errors).length > 0) event.preventDefault();
  }

  return (
    // React resets the form after each submission; the key remounts it with the submitted values as defaults.
    <form action={formAction} key={JSON.stringify(failed?.values ?? null)} noValidate onSubmit={handleSubmit}>
      <fieldset className="flex flex-col gap-6" disabled={locked}>
        <legend className="mb-6 text-[16px] font-medium text-[#1b1b1d]">Informasi Asesmen</legend>
        <FormField
          defaultValue={values.title}
          error={errorOf("title")}
          label="Judul Asesmen"
          maxLength={200}
          name="title"
          required
        />
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField defaultValue={values.type} error={errorOf("type")} label="Jenis" name="type" required>
            {assessmentTypes.map((type) => (
              <option key={type} value={type}>
                {assessmentTypeLabels[type]}
              </option>
            ))}
          </SelectField>
          <FormField defaultValue={className} label="Kelas Sasaran" name="targetClass" readOnly />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            defaultValue={values.opensAt}
            error={errorOf("opensAt")}
            label="Jadwal Buka (WIB)"
            name="opensAt"
            type="datetime-local"
          />
          <FormField
            defaultValue={values.closesAt}
            error={errorOf("closesAt")}
            label="Jadwal Tutup (WIB)"
            name="closesAt"
            type="datetime-local"
          />
          <FormField
            defaultValue={values.kkm}
            error={errorOf("kkm")}
            inputMode="numeric"
            label="KKM"
            max={100}
            min={0}
            name="kkm"
            type="number"
          />
        </div>
        <p className="text-xs leading-5 text-[#75777d]">
          Jadwal boleh dikosongkan selama masih draf, tetapi wajib diisi sebelum dipublikasikan.
        </p>
        <StepFooter locked={locked} pending={pending} state={state} />
      </fieldset>
    </form>
  );
}
