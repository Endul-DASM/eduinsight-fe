"use client";

import { useRouter } from "next/navigation";
import { useId } from "react";
import type { Assessment } from "@/lib/api/types";
import { assessmentTypeLabels, cardStatus } from "@/lib/assessment-form";
import { Field, SelectInput } from "../builder-fields";

// "Asesmen" picker of Hasil Asesmen (Figma New Design 65:13118). Only published assessments have results.
export function AssessmentSelect({
  slug,
  assessments,
  selectedId,
  view,
}: {
  slug: string;
  assessments: Assessment[];
  selectedId: string | null;
  view: string;
}) {
  const router = useRouter();
  const id = useId();

  return (
    <Field htmlFor={id} label="Asesmen">
      <SelectInput
        id={id}
        onChange={(event) =>
          router.replace(`/${slug}/assessment?tab=hasil&assessment=${event.target.value}&view=${view}`, { scroll: false })
        }
        value={selectedId ?? ""}
      >
        {!selectedId && <option value="">Pilih Asesmen...</option>}
        {assessments.map((assessment) => (
          <option key={assessment.id} value={assessment.id}>
            {assessment.title} · {assessmentTypeLabels[assessment.type]} · {cardStatus[assessment.status].label}
          </option>
        ))}
      </SelectInput>
    </Field>
  );
}
