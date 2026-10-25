"use client";

import { type FormEvent, useActionState, useEffect, useState } from "react";
import { outlineButtonClassName, primaryButtonClassName } from "@/components/auth/styles";
import { TextField } from "@/components/auth/text-field";
import { Modal } from "@/components/ui/modal";
import { focusFirstError } from "@/components/ui/focus-first-error";
import { SelectMenu } from "@/components/ui/select-menu";
import { createSubjectAction, updateSubjectAction } from "@/lib/actions/subjects";
import type { Subject } from "@/lib/api/types";
import { type SubjectFormErrors, type SubjectFormValues, validateSubjectForm } from "@/lib/subject-form";
import { AcademicYearInput } from "./academic-year-input";
import { subjectModalClassName } from "./styles";

function valuesOf(form: HTMLFormElement): SubjectFormValues {
  const data = new FormData(form);
  const value = (name: string) => String(data.get(name) ?? "").trim();
  // "2026 / 2027" is accepted as 2026/2027.
  return { name: value("name"), className: value("className"), academicYear: value("academicYear").replace(/\s/g, "") };
}

// FR-G-024: copies the whole curriculum of another of the teacher's classes after saving. The backend only copies into
// an empty curriculum.
function CopyCurriculumField({ sources }: { sources: Subject[] }) {
  return (
    <div className="flex w-full flex-col gap-2">
      <label className="text-xs font-semibold leading-normal text-[#1b1b1d]" htmlFor="copyCurriculumFrom">
        Salin Kurikulum (Opsional)
      </label>
      <SelectMenu
        aria-describedby="copyCurriculumFrom-note"
        defaultValue=""
        disabled={sources.length === 0}
        id="copyCurriculumFrom"
        name="copyCurriculumFrom"
      >
        <option value="">Salin Kurikulum dari Kelas Anda yang Lain</option>
        {sources.map((source) => (
          <option key={source.id} value={source.id}>
            {source.name}, {source.class.name} ({source.class.academicYear})
          </option>
        ))}
      </SelectMenu>
      <p className="text-xs leading-normal text-[#75777d]" id="copyCurriculumFrom-note">
        {sources.length === 0
          ? "Belum ada kelas lain untuk disalin."
          : "CP, Bab, TP, dan Subbab disalin ke kelas ini. Hanya bisa bila kurikulum kelas ini masih kosong."}
      </p>
    </div>
  );
}

// Mounted only while the modal is open, so each opening starts from a fresh form state.
function SubjectForm({
  subject,
  subjects,
  onClose,
  onNotice,
}: {
  subject?: Subject;
  subjects: Subject[];
  onClose: () => void;
  onNotice?: (notice: string) => void;
}) {
  const [state, formAction, pending] = useActionState(
    subject ? updateSubjectAction : createSubjectAction,
    undefined,
  );
  // Checked in the browser before submitting; the Server Function repeats the same rules.
  const [clientErrors, setClientErrors] = useState<SubjectFormErrors>({});

  useEffect(() => {
    if (state?.status !== "saved") return;
    // The result of Salin Kurikulum, shown by the page once the modal closes.
    if (state.notice) onNotice?.(state.notice);
    onClose();
  }, [state, onClose, onNotice]);

  const failed = state?.status === "error" ? state : undefined;

  // The server's field errors come back after the submit.
  useEffect(() => {
    if (failed?.fields) focusFirstError();
  }, [failed]);
  const values = failed?.values ?? {
    name: subject?.name ?? "",
    className: subject?.class.name ?? "",
    academicYear: subject?.class.academicYear ?? "",
  };
  const errorOf = (field: keyof SubjectFormErrors) => clientErrors[field] ?? failed?.fields?.[field];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const errors = validateSubjectForm(valuesOf(event.currentTarget));
    setClientErrors(errors);
    if (Object.keys(errors).length > 0) {
      event.preventDefault();
      focusFirstError();
    }
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
        <TextField
          defaultValue={values.name}
          error={errorOf("name")}
          label="Mata Pelajaran"
          maxLength={100}
          name="name"
          placeholder="Masukkan Mata Pelajaran"
        />
        <TextField
          defaultValue={values.className}
          error={errorOf("className")}
          label="Kelas"
          maxLength={60}
          name="className"
          placeholder="Masukkan Kelas"
        />
        <AcademicYearInput defaultValue={values.academicYear} error={errorOf("academicYear")} />
        <CopyCurriculumField sources={subjects.filter((source) => source.id !== subject?.id)} />
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
          {pending ? "Menyimpan..." : subject ? "Save" : "Create"}
        </button>
      </div>
    </form>
  );
}

// Figma New Design 22:4085 (Tambah Kelas Baru) without a subject, 22:4096 (Edit Kelas) with one. subjects are the
// teacher's classes, offered as sources for Salin Kurikulum.
export function SubjectFormModal({
  open,
  subject,
  subjects,
  onClose,
  onNotice,
}: {
  open: boolean;
  subject?: Subject;
  subjects: Subject[];
  onClose: () => void;
  onNotice?: (notice: string) => void;
}) {
  return (
    <Modal
      className={subjectModalClassName}
      onClose={onClose}
      open={open}
      title={subject ? "Edit Kelas" : "Tambah Kelas Baru"}
    >
      <SubjectForm
        key={subject?.id ?? "new"}
        onClose={onClose}
        onNotice={onNotice}
        subject={subject}
        subjects={subjects}
      />
    </Modal>
  );
}
