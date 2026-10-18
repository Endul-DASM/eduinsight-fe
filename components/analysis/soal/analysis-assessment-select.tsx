"use client";

import { useRouter } from "next/navigation";
import { useId } from "react";
import { Field, SelectInput } from "@/components/assessment/builder-fields";
import type { Assessment } from "@/lib/api/types";
import { assessmentTypeLabels, cardStatus } from "@/lib/assessment-form";

// "Asesmen" picker of Analisis Soal (Figma New Design 65:16039). Only published assessments have answers to analyze.
export function AnalysisAssessmentSelect({
  slug,
  assessments,
  selectedId,
}: {
  slug: string;
  assessments: Assessment[];
  selectedId: string | null;
}) {
  const router = useRouter();
  const id = useId();

  return (
    <section className="rounded-3xl bg-[#fafbfd] p-5 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
      <Field htmlFor={id} label="Asesmen">
        <SelectInput
          id={id}
          onChange={(event) => router.replace(`/${slug}/analysis?tab=soal&assessment=${event.target.value}`, { scroll: false })}
          value={selectedId ?? ""}
        >
          {!selectedId && <option value="">Pilih Asesmen...</option>}
          {assessments.map((assessment) => (
            <option key={assessment.id} value={assessment.id}>
              {assessment.title} ({assessmentTypeLabels[assessment.type]}, {cardStatus[assessment.status].label})
            </option>
          ))}
        </SelectInput>
      </Field>
    </section>
  );
}
