"use client";

import { useRouter } from "next/navigation";
import { useId } from "react";
import { Field, SelectInput } from "@/components/assessment/builder-fields";
import type { Assessment } from "@/lib/api/types";
import { assessmentTypeLabels } from "@/lib/assessment-form";

// "Asesmen" of Asesmen sumber (Figma New Design 85:8869): the published post-test, UH, UTS or UAS whose students
// below the KKM become the remedial targets. The chosen remedial assessment (?remedial=) is kept.
export function SourceSelect({
  slug,
  sources,
  sourceId,
  remedialId,
}: {
  slug: string;
  sources: Assessment[];
  sourceId: string | null;
  remedialId: string | null;
}) {
  const router = useRouter();
  const id = useId();

  function go(source: string) {
    const params = new URLSearchParams({ tab: "remedial" });
    if (source) params.set("source", source);
    if (remedialId) params.set("remedial", remedialId);
    router.replace(`/${slug}/analysis?${params}`, { scroll: false });
  }

  return (
    <Field htmlFor={id} label="Asesmen">
      <SelectInput id={id} onChange={(event) => go(event.target.value)} value={sourceId ?? ""}>
        {!sourceId && <option value="">Pilih asesmen sumber...</option>}
        {sources.map((assessment) => (
          <option key={assessment.id} value={assessment.id}>
            {assessment.title} ({assessmentTypeLabels[assessment.type]})
          </option>
        ))}
      </SelectInput>
    </Field>
  );
}
