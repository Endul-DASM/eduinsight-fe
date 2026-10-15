"use client";

import { useRouter } from "next/navigation";
import { useId } from "react";
import { Field, SelectInput } from "@/components/assessment/builder-fields";
import { diagnosisHref, type DiagnosisParams } from "./links";

// "Nama Siswa" (Figma New Design 85:7350): the students with a scored attempt in scope.
export function StudentPicker({
  slug,
  params,
  students,
}: {
  slug: string;
  params: DiagnosisParams;
  students: { id: string; name: string }[];
}) {
  const router = useRouter();
  const id = useId();

  return (
    <section className="rounded-3xl bg-[#fafbfd] p-5 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
      <Field htmlFor={id} label="Nama Siswa">
        <SelectInput
          id={id}
          onChange={(event) =>
            router.replace(diagnosisHref(slug, params, { student: event.target.value || undefined, tp: undefined, item: undefined }), {
              scroll: false,
            })
          }
          value={params.student ?? ""}
        >
          <option value="">Pilih nama siswa...</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </SelectInput>
      </Field>
    </section>
  );
}
