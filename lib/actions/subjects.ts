"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClass } from "@/lib/api/classes";
import { ApiError, isMockMode } from "@/lib/api/client";
import { createSubject } from "@/lib/api/subjects";
import type { SchoolLevel } from "@/lib/api/types";
import { NEW_CLASS_OPTION } from "@/lib/subject-form";

export type SubjectFormValues = {
  name: string;
  classId: string;
  kkmDefault: string;
  className: string;
  classLevel: string;
  classAcademicYear: string;
  teacherIds: string[];
};

export type SubjectFormState =
  | {
      message: string;
      // Field errors, keyed by input name. New-class errors use a "class." prefix.
      fields?: Record<string, string>;
      // React resets the form after every submission, so the inputs are refilled from these.
      values: SubjectFormValues;
    }
  | undefined;

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function prefixKeys(fields: Record<string, string> | undefined, prefix: string) {
  return fields && Object.fromEntries(Object.entries(fields).map(([key, value]) => [`${prefix}${key}`, value]));
}

export async function createSubjectAction(
  _previous: SubjectFormState,
  formData: FormData,
): Promise<SubjectFormState> {
  const values: SubjectFormValues = {
    name: text(formData, "name"),
    classId: text(formData, "classId"),
    kkmDefault: text(formData, "kkmDefault"),
    className: text(formData, "className"),
    classLevel: text(formData, "classLevel"),
    classAcademicYear: text(formData, "classAcademicYear"),
    teacherIds: formData.getAll("teacherIds").map(String),
  };

  if (isMockMode) {
    return { message: "Mode demo: sambungkan backend (API_BASE_URL) untuk menyimpan mata pelajaran.", values };
  }

  if (values.classId === NEW_CLASS_OPTION) {
    try {
      const created = await createClass({
        name: values.className,
        level: values.classLevel as SchoolLevel,
        academicYear: values.classAcademicYear,
      });
      // The class exists now even if the subject fails below, so select it on the next attempt.
      values.classId = created.id;
      revalidatePath("/choose-subject/new");
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
      return { message: error.message, fields: prefixKeys(error.fields, "class."), values };
    }
  }

  let slug: string;
  try {
    const subject = await createSubject({
      name: values.name,
      classId: values.classId,
      kkmDefault: values.kkmDefault ? Number(values.kkmDefault) : undefined,
      // Only the admin form has teacher checkboxes.
      teacherIds: values.teacherIds.length > 0 ? values.teacherIds : undefined,
    });
    slug = subject.slug;
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return { message: error.message, fields: error.fields, values };
  }

  redirect(`/${slug}/dashboard`);
}
