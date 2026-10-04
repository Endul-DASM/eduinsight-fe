"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { createSubjectAction, type SubjectFormValues } from "@/lib/actions/subjects";
import type { SchoolClass, TeacherSummary } from "@/lib/api/types";
import { NEW_CLASS_OPTION } from "@/lib/subject-form";

const inputClassName =
  "h-11 w-full rounded-lg border border-[#c5c6cd] bg-white px-4 text-sm font-normal text-[#091426] outline-none placeholder:text-[#6b7280] focus:border-[#085ac0] focus:ring-2 focus:ring-[rgba(8,90,192,0.15)] aria-invalid:border-[#ba1a1a]";

const labelClassName = "flex flex-col gap-2 text-sm font-semibold text-[#091426]";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="text-xs font-normal text-[#ba1a1a]">{message}</span>;
}

function ClassField({
  classes,
  values,
  errors,
  defaultAcademicYear,
}: {
  classes: SchoolClass[];
  values?: SubjectFormValues;
  errors: Record<string, string>;
  defaultAcademicYear: string;
}) {
  const defaultClassId = values?.classId || classes[0]?.id || NEW_CLASS_OPTION;
  const [isNewClass, setIsNewClass] = useState(defaultClassId === NEW_CLASS_OPTION);

  return (
    <>
      <label className={labelClassName}>
        Kelas
        <select
          aria-invalid={Boolean(errors.classId)}
          className={inputClassName}
          name="classId"
          defaultValue={defaultClassId}
          onChange={(event) => setIsNewClass(event.target.value === NEW_CLASS_OPTION)}
        >
          {classes.map((schoolClass) => (
            <option key={schoolClass.id} value={schoolClass.id}>
              {schoolClass.name} ({schoolClass.level}, {schoolClass.academicYear})
            </option>
          ))}
          <option value={NEW_CLASS_OPTION}>+ Tambah kelas baru</option>
        </select>
        <FieldError message={errors.classId} />
      </label>

      {isNewClass && (
        <fieldset className="grid gap-4 rounded-lg border border-dashed border-[#c5c6cd] p-4 sm:grid-cols-3">
          <legend className="px-1 text-xs font-semibold text-[#45474c]">Kelas baru</legend>
          <label className={labelClassName}>
            Nama Kelas
            <input
              aria-invalid={Boolean(errors["class.name"])}
              className={inputClassName}
              defaultValue={values?.className}
              name="className"
              placeholder="X IPA 1"
              required
            />
            <FieldError message={errors["class.name"]} />
          </label>
          <label className={labelClassName}>
            Jenjang
            <select className={inputClassName} defaultValue={values?.classLevel || "SMA"} name="classLevel">
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
            </select>
          </label>
          <label className={labelClassName}>
            Tahun Ajaran
            <input
              aria-invalid={Boolean(errors["class.academicYear"])}
              className={inputClassName}
              defaultValue={values?.classAcademicYear || defaultAcademicYear}
              name="classAcademicYear"
              pattern="\d{4}/\d{4}"
              placeholder="2026/2027"
              required
            />
            <FieldError message={errors["class.academicYear"]} />
          </label>
        </fieldset>
      )}
    </>
  );
}

export function SubjectForm({
  classes,
  teachers,
  defaultAcademicYear,
}: {
  classes: SchoolClass[];
  // Only admins pick teachers; teachers are assigned to the subjects they create.
  teachers: TeacherSummary[] | null;
  defaultAcademicYear: string;
}) {
  const [state, formAction, pending] = useActionState(createSubjectAction, undefined);
  const values = state?.values;
  const errors = state?.fields ?? {};
  // Field errors are shown next to their input; only repeat the message when it adds something.
  const message = state && !Object.values(errors).includes(state.message) ? state.message : undefined;

  return (
    // Fields are uncontrolled: React resets the form after every submission, back to each defaultValue.
    // Remounting with the submitted values as defaults keeps the user's input (and a newly created class
    // selected) through that reset. classes.length is part of the key because a new class can arrive
    // after the state, and a <select> only applies defaultValue on mount.
    <form
      action={formAction}
      className="flex flex-col gap-5"
      key={`${classes.length}:${JSON.stringify(values ?? null)}`}
    >
      <label className={labelClassName}>
        Nama Mata Pelajaran
        <input
          aria-invalid={Boolean(errors.name)}
          className={inputClassName}
          defaultValue={values?.name}
          maxLength={100}
          minLength={2}
          name="name"
          placeholder="Matematika"
          required
        />
        <FieldError message={errors.name} />
      </label>

      <ClassField
        classes={classes}
        defaultAcademicYear={defaultAcademicYear}
        errors={errors}
        values={values}
      />

      <label className={labelClassName}>
        KKM Default
        <input
          aria-invalid={Boolean(errors.kkmDefault)}
          className={`${inputClassName} max-w-[8rem]`}
          defaultValue={values?.kkmDefault || "75"}
          max={100}
          min={0}
          name="kkmDefault"
          required
          type="number"
        />
        <span className="text-xs font-normal text-[#45474c]">
          Dipakai untuk asesmen yang tidak mengisi KKM sendiri.
        </span>
        <FieldError message={errors.kkmDefault} />
      </label>

      {teachers && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-semibold text-[#091426]">Guru Pengampu</legend>
          {teachers.length === 0 && <p className="text-sm text-[#45474c]">Belum ada akun guru.</p>}
          {teachers.map((teacher) => (
            <label className="flex items-center gap-3 text-sm text-[#091426]" key={teacher.id}>
              <input
                className="size-4 accent-[#085ac0]"
                defaultChecked={values?.teacherIds.includes(teacher.id)}
                name="teacherIds"
                type="checkbox"
                value={teacher.id}
              />
              {teacher.name}
              <span className="text-xs text-[#45474c]">{teacher.email}</span>
            </label>
          ))}
          <FieldError message={errors.teacherIds} />
        </fieldset>
      )}

      <p aria-live="polite" className="min-h-5 text-sm text-[#ba1a1a]">
        {message}
      </p>

      <div className="flex items-center justify-end gap-3">
        <Link
          className="inline-flex h-12 items-center rounded-[12px] px-6 text-sm font-semibold text-[#45474c] hover:bg-[#eef2f7]"
          href="/choose-subject"
        >
          Batal
        </Link>
        <Button disabled={pending} size="lg" type="submit">
          {pending ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </form>
  );
}
