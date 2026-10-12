"use server";

import { revalidatePath } from "next/cache";
import { createClass, getClasses } from "@/lib/api/classes";
import { ApiError, isMockMode } from "@/lib/api/client";
import { copyCurriculum } from "@/lib/api/curriculum";
import { createSubject, deleteSubject, updateSubject } from "@/lib/api/subjects";
import type { SchoolClass } from "@/lib/api/types";
import {
  inferSchoolLevel,
  type SubjectFormErrors,
  type SubjectFormValues,
  validateSubjectForm,
} from "@/lib/subject-form";

const MOCK_MODE_MESSAGE = "Mode demo: sambungkan backend (API_BASE_URL) untuk menyimpan perubahan.";
const SERVER_UNREACHABLE_MESSAGE = "Tidak dapat terhubung ke server. Coba lagi beberapa saat lagi.";

// "saved" carries a timestamp so the modal can tell two successful saves apart and close each time.
export type SubjectFormState =
  | { status: "error"; message?: string; fields?: SubjectFormErrors; values: SubjectFormValues }
  // notice reports the optional Salin Kurikulum step, which runs after the class is saved.
  | { status: "saved"; savedAt: number; notice?: string }
  | undefined;

export type DeleteSubjectState = { status: "error"; message: string } | { status: "saved"; savedAt: number } | undefined;

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function valuesFrom(formData: FormData): SubjectFormValues {
  return {
    name: text(formData, "name"),
    className: text(formData, "className"),
    // "2026 / 2027" is accepted as 2026/2027.
    academicYear: text(formData, "academicYear").replace(/\s/g, ""),
  };
}

// ApiError messages come from the backend in Indonesian; anything else means the request never got an answer.
function messageOf(error: unknown): string {
  return error instanceof ApiError && error.code ? error.message : SERVER_UNREACHABLE_MESSAGE;
}

function saved(notice?: string) {
  revalidatePath("/choose-subject");
  return { status: "saved" as const, savedAt: Date.now(), notice };
}

// FR-G-024: copies another subject's curriculum once the class is saved. Only into an empty curriculum, so a failure
// leaves the saved class as it is and is reported instead.
async function copyCurriculumFrom(subjectId: string, sourceSubjectId: string): Promise<string | undefined> {
  if (!sourceSubjectId) return undefined;
  try {
    await copyCurriculum(subjectId, sourceSubjectId);
    return "Kelas tersimpan dan kurikulum berhasil disalin.";
  } catch (error) {
    return `Kelas tersimpan, tetapi kurikulum belum tersalin: ${messageOf(error)}`;
  }
}

class ClassFieldError extends Error {
  constructor(readonly fields: SubjectFormErrors) {
    super("Invalid class");
  }
}

// The modals ask for a class name and academic year; the backend wants a class id. Reuse a class with the same
// name and year, or create it with the level read from the grade in its name.
async function findOrCreateClass(values: SubjectFormValues): Promise<SchoolClass> {
  const existing = (await getClasses()).find(
    (schoolClass) =>
      schoolClass.name.toLowerCase() === values.className.toLowerCase() &&
      schoolClass.academicYear === values.academicYear,
  );
  if (existing) return existing;

  // Validation already rejected names without a grade, so the level is always known here.
  const level = inferSchoolLevel(values.className) ?? "SMA";
  try {
    return await createClass({ name: values.className, level, academicYear: values.academicYear });
  } catch (error) {
    if (!(error instanceof ApiError) || !error.fields) throw error;
    const { name, level: levelError, academicYear } = error.fields;
    throw new ClassFieldError({
      className:
        name ?? (levelError && (level === "SD" ? "Kelas SD (tingkat 1–6) belum didukung server." : levelError)),
      academicYear,
    });
  }
}

function errorState(error: unknown, values: SubjectFormValues): SubjectFormState {
  if (error instanceof ClassFieldError) return { status: "error", fields: error.fields, values };
  // The subject endpoints name the fields name and classId.
  const fields = error instanceof ApiError ? error.fields : undefined;
  if (fields?.name || fields?.classId) {
    return { status: "error", fields: { name: fields.name, className: fields.classId }, values };
  }
  return { status: "error", message: messageOf(error), values };
}

export async function createSubjectAction(
  _previous: SubjectFormState,
  formData: FormData,
): Promise<SubjectFormState> {
  const values = valuesFrom(formData);
  const fields = validateSubjectForm(values);
  if (Object.keys(fields).length > 0) return { status: "error", fields, values };

  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE, values };

  let created;
  try {
    const schoolClass = await findOrCreateClass(values);
    // KKM is left to the backend default (BR-01).
    created = await createSubject({ name: values.name, classId: schoolClass.id });
  } catch (error) {
    return errorState(error, values);
  }
  return saved(await copyCurriculumFrom(created.id, text(formData, "copyCurriculumFrom")));
}

export async function updateSubjectAction(
  _previous: SubjectFormState,
  formData: FormData,
): Promise<SubjectFormState> {
  const subjectId = text(formData, "subjectId");
  const currentClassId = text(formData, "classId");
  const values = valuesFrom(formData);
  const fields = validateSubjectForm(values);
  if (Object.keys(fields).length > 0) return { status: "error", fields, values };

  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE, values };

  try {
    const schoolClass = await findOrCreateClass(values);
    // Only sent when the class or academic year changed; the backend moves the subject and its slug follows.
    const classId = schoolClass.id === currentClassId ? undefined : schoolClass.id;
    await updateSubject(subjectId, { name: values.name, classId });
  } catch (error) {
    return errorState(error, values);
  }
  return saved(await copyCurriculumFrom(subjectId, text(formData, "copyCurriculumFrom")));
}

export async function deleteSubjectAction(
  _previous: DeleteSubjectState,
  formData: FormData,
): Promise<DeleteSubjectState> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  try {
    await deleteSubject(text(formData, "subjectId"));
  } catch (error) {
    return { status: "error", message: messageOf(error) };
  }
  return saved();
}
