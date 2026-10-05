"use client";

import { type FormEvent, useActionState, useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { createSubjectAction, updateSubjectAction } from "@/lib/actions/subjects";
import type { Subject } from "@/lib/api/types";
import { type SubjectFormErrors, type SubjectFormValues, validateSubjectForm } from "@/lib/subject-form";
import { FormField, outlineButtonClassName, primaryButtonClassName } from "./form-field";

function valuesOf(form: HTMLFormElement): SubjectFormValues {
  const data = new FormData(form);
  const value = (name: string) => String(data.get(name) ?? "").trim();
  return { name: value("name"), className: value("className"), academicYear: value("academicYear") };
}

// Mounted only while the modal is open, so each opening starts from a fresh form state.
function SubjectForm({ subject, onClose }: { subject?: Subject; onClose: () => void }) {
  const [state, formAction, pending] = useActionState(
    subject ? updateSubjectAction : createSubjectAction,
    undefined,
  );
  // Checked in the browser before submitting; the Server Function repeats the same rules.
  const [clientErrors, setClientErrors] = useState<SubjectFormErrors>({});

  useEffect(() => {
    if (state?.status === "saved") onClose();
  }, [state, onClose]);

  const failed = state?.status === "error" ? state : undefined;
  const values = failed?.values ?? {
    name: subject?.name ?? "",
    className: subject?.class.name ?? "",
    academicYear: subject?.class.academicYear ?? "",
  };
  const errorOf = (field: keyof SubjectFormErrors) => clientErrors[field] ?? failed?.fields?.[field];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const errors = validateSubjectForm(valuesOf(event.currentTarget));
    setClientErrors(errors);
    if (Object.keys(errors).length > 0) event.preventDefault();
  }

  return (
    // React resets the form after each submission; the key remounts it with the submitted values as defaults.
    <form
      action={formAction}
      className="flex flex-col gap-6"
      key={JSON.stringify(failed?.values ?? null)}
      noValidate
      onSubmit={handleSubmit}
    >
      {subject && (
        <>
          <input name="subjectId" type="hidden" value={subject.id} />
          <input name="classId" type="hidden" value={subject.class.id} />
        </>
      )}
      <div className="flex flex-col gap-3">
        <FormField
          defaultValue={values.name}
          error={errorOf("name")}
          label="Mata Pelajaran"
          maxLength={100}
          name="name"
          placeholder="Mata Pelajaran..."
        />
        <FormField
          defaultValue={values.className}
          error={errorOf("className")}
          label="Kelas"
          maxLength={60}
          name="className"
          placeholder="Kelas"
        />
        <FormField
          defaultValue={values.academicYear}
          error={errorOf("academicYear")}
          inputMode="numeric"
          label="Tahun Ajaran"
          maxLength={9}
          name="academicYear"
          placeholder="YYYY/YYYY"
        />
      </div>
      {failed?.message && (
        <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm leading-5 text-[#93000a]" role="alert">
          {failed.message}
        </p>
      )}
      <div className="flex justify-end gap-[10px]">
        <button className={outlineButtonClassName} disabled={pending} onClick={onClose} type="button">
          Cancel
        </button>
        <button className={primaryButtonClassName} disabled={pending} type="submit">
          {pending ? "Menyimpan..." : subject ? "Simpan" : "Create"}
        </button>
      </div>
    </form>
  );
}

// Figma 236:2076 (Tambah Kelas Baru) without a subject, 236:2112 (Edit Kelas) with one.
export function SubjectFormModal({
  open,
  subject,
  onClose,
}: {
  open: boolean;
  subject?: Subject;
  onClose: () => void;
}) {
  return (
    <Modal onClose={onClose} open={open} title={subject ? "Edit Kelas" : "Tambah Kelas Baru"}>
      <SubjectForm key={subject?.id ?? "new"} onClose={onClose} subject={subject} />
    </Modal>
  );
}
