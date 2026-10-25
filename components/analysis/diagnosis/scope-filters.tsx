"use client";

import { useRouter } from "next/navigation";
import { useId } from "react";
import { Field, SelectInput } from "@/components/assessment/builder-fields";
import type { Assessment, CurriculumChapter } from "@/lib/api/types";
import { assessmentTypeLabels } from "@/lib/assessment-form";
import { diagnosisHref, type DiagnosisParams } from "./links";

// Cakupan diagnosis (FR-G-081: filter by assessment and Bab; the class and subject are the workspace). The semester
// filter was taken out at UAT. Without an assessment the backend takes every published post-test, ulangan harian, UTS
// and UAS.
export function ScopeFilters({
  slug,
  params,
  assessments,
  chapters,
}: {
  slug: string;
  params: DiagnosisParams;
  assessments: Assessment[];
  chapters: CurriculumChapter[];
}) {
  const router = useRouter();
  const id = useId();
  // A narrower scope can drop the chosen TP or question, so those reset.
  const go = (change: Partial<DiagnosisParams>) =>
    router.replace(diagnosisHref(slug, params, { ...change, tp: undefined, item: undefined }), { scroll: false });

  return (
    <section className="grid gap-4 rounded-3xl bg-[#fafbfd] p-5 shadow-[0_4px_10px_rgba(0,0,0,0.1)] md:grid-cols-2">
      <Field htmlFor={`${id}-assessment`} label="Asesmen">
        <SelectInput id={`${id}-assessment`} onChange={(event) => go({ assessment: event.target.value || undefined })} value={params.assessment ?? ""}>
          <option value="">Semua post-test, UH, UTS, UAS</option>
          {assessments.map((assessment) => (
            <option key={assessment.id} value={assessment.id}>
              {assessment.title} ({assessmentTypeLabels[assessment.type]})
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field htmlFor={`${id}-chapter`} label="Bab">
        <SelectInput id={`${id}-chapter`} onChange={(event) => go({ chapter: event.target.value || undefined })} value={params.chapter ?? ""}>
          <option value="">Semua Bab</option>
          {chapters.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              Bab {chapter.number}: {chapter.name}
            </option>
          ))}
        </SelectInput>
      </Field>
    </section>
  );
}
