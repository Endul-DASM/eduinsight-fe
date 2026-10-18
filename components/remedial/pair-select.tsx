"use client";

import { usePathname, useRouter } from "next/navigation";
import { useId } from "react";
import { Field, SelectInput } from "@/components/assessment/builder-fields";
import type { Assessment } from "@/lib/api/types";
import { assessmentTypeLabels, cardStatus } from "@/lib/assessment-form";

// The backend does not link a remedial assessment to the assessment it follows up yet, so the teacher picks both;
// the choice stays in the URL (?source=&remedial=) for this page and Jadwalkan Remedial.
export function PairSelect({
  sources,
  remedials,
  sourceId,
  remedialId,
}: {
  sources: Assessment[];
  remedials: Assessment[];
  sourceId: string | null;
  remedialId: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const id = useId();

  function go(source: string | null, remedial: string | null) {
    const params = new URLSearchParams();
    if (source) params.set("source", source);
    if (remedial) params.set("remedial", remedial);
    router.replace(`${pathname}?${params}`, { scroll: false });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field hint="Post-test, ulangan harian, UTS, atau UAS yang sudah dipublikasikan" htmlFor={`${id}-source`} label="Asesmen asal">
        <SelectInput id={`${id}-source`} onChange={(event) => go(event.target.value, remedialId)} value={sourceId ?? ""}>
          {!sourceId && <option value="">Pilih asesmen asal...</option>}
          {sources.map((assessment) => (
            <option key={assessment.id} value={assessment.id}>
              {assessment.title} ({assessmentTypeLabels[assessment.type]})
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field hint="Asesmen berjenis Remedial yang menindaklanjuti asesmen asal" htmlFor={`${id}-remedial`} label="Asesmen remedial">
        <SelectInput id={`${id}-remedial`} onChange={(event) => go(sourceId, event.target.value || null)} value={remedialId ?? ""}>
          {remedials.length === 0 && <option value="">Belum ada asesmen remedial</option>}
          {remedials.map((assessment) => (
            <option key={assessment.id} value={assessment.id}>
              {assessment.title} ({cardStatus[assessment.status].label})
            </option>
          ))}
        </SelectInput>
      </Field>
    </div>
  );
}
