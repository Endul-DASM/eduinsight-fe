"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAssessment,
  deleteAssessment,
  publishAssessment,
  replaceAssessmentCompetencies,
  replaceAssessmentQuestions,
  unpublishAssessment,
  updateAssessment,
} from "@/lib/api/assessments";
import { ApiError, isMockMode } from "@/lib/api/client";
import type { AssessmentMode, AssessmentType } from "@/lib/api/types";
import {
  type InformationValues,
  isAssessmentType,
  nextWizardStep,
  type SettingsValues,
  validateInformation,
  validateSettings,
  wibInputToIso,
  type WizardStep,
} from "@/lib/assessment-form";

const MOCK_MODE_MESSAGE = "Mode demo: sambungkan backend (API_BASE_URL) untuk menyimpan asesmen.";
const SERVER_UNREACHABLE_MESSAGE = "Tidak dapat terhubung ke server. Coba lagi beberapa saat lagi.";

// "saved" carries a timestamp so the form can tell two successful saves apart.
export type AssessmentFormState =
  | { status: "error"; message?: string; fields?: Record<string, string>; values?: Record<string, string> }
  | { status: "saved"; savedAt: number }
  | undefined;

// publish_blocked lists every problem, so the summary card can show them all.
export type PublishState =
  | { status: "error"; message: string; problems?: string[] }
  | { status: "saved"; savedAt: number }
  | undefined;

type PublishBlockedQuestion = { message?: string };

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

// ApiError messages come from the backend in Indonesian; anything else means the request never got an answer.
function messageOf(error: unknown): string {
  return error instanceof ApiError && error.code ? error.message : SERVER_UNREACHABLE_MESSAGE;
}

function errorState(error: unknown, values?: Record<string, string>): AssessmentFormState {
  const fields = error instanceof ApiError ? error.fields : undefined;
  return { status: "error", message: fields ? undefined : messageOf(error), fields, values };
}

function wizardPath(slug: string, assessmentId: string, step?: WizardStep) {
  const path = `/${slug}/assessment/${assessmentId}`;
  return step ? `${path}?step=${step}` : path;
}

function refresh(slug: string, assessmentId: string) {
  revalidatePath(`/${slug}/assessment`);
  revalidatePath(wizardPath(slug, assessmentId));
}

// Saves a step, then opens the next one; the last step stays put and reports "saved".
function afterSave(slug: string, assessmentId: string, step: WizardStep): AssessmentFormState {
  refresh(slug, assessmentId);
  const next = nextWizardStep(step);
  if (next) redirect(wizardPath(slug, assessmentId, next));
  return { status: "saved", savedAt: Date.now() };
}

// The slug and ids are bound by the page; they still come from the browser, and the backend checks access.
// Actions without form fields ignore the previous state and form data that useActionState passes.

export async function createAssessmentAction(
  slug: string,
  subjectId: string,
  _previous: AssessmentFormState,
  formData: FormData,
): Promise<AssessmentFormState> {
  const title = text(formData, "title");
  const type = text(formData, "type");
  const values = { title, type };

  const fields: Record<string, string> = {};
  if (!title || title.length > 200) fields.title = "Judul asesmen 1–200 karakter.";
  if (!isAssessmentType(type)) fields.type = "Pilih jenis asesmen.";
  if (Object.keys(fields).length > 0) return { status: "error", fields, values };

  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE, values };

  let assessmentId: string;
  try {
    assessmentId = (await createAssessment(subjectId, { title, type: type as AssessmentType })).id;
  } catch (error) {
    return errorState(error, values);
  }
  revalidatePath(`/${slug}/assessment`);
  redirect(wizardPath(slug, assessmentId, "informasi"));
}

export async function saveInformationAction(
  slug: string,
  assessmentId: string,
  _previous: AssessmentFormState,
  formData: FormData,
): Promise<AssessmentFormState> {
  const values: InformationValues = {
    title: text(formData, "title"),
    type: text(formData, "type"),
    kkm: text(formData, "kkm"),
    opensAt: text(formData, "opensAt"),
    closesAt: text(formData, "closesAt"),
  };
  const fields = validateInformation(values);
  if (Object.keys(fields).length > 0) return { status: "error", fields, values };

  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE, values };

  try {
    await updateAssessment(assessmentId, {
      title: values.title,
      type: values.type as AssessmentType,
      // An empty KKM keeps the current one, which defaults to the subject's KKM (BR-01).
      ...(values.kkm ? { kkm: Number(values.kkm) } : {}),
      // The schedule may stay empty in a draft; publishing requires it.
      opensAt: values.opensAt ? wibInputToIso(values.opensAt) : null,
      closesAt: values.closesAt ? wibInputToIso(values.closesAt) : null,
    });
  } catch (error) {
    return errorState(error, { ...values });
  }
  return afterSave(slug, assessmentId, "informasi");
}

export async function saveCompetenciesAction(
  slug: string,
  assessmentId: string,
  _previous: AssessmentFormState,
  formData: FormData,
): Promise<AssessmentFormState> {
  const competencyIds = formData.getAll("competencyId").map(String);
  if (competencyIds.length === 0) {
    return { status: "error", fields: { competencyIds: "Pilih minimal satu Kompetensi." } };
  }

  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };

  try {
    await replaceAssessmentCompetencies(assessmentId, competencyIds);
  } catch (error) {
    return errorState(error);
  }
  return afterSave(slug, assessmentId, "kompetensi");
}

export async function saveQuestionsAction(
  slug: string,
  assessmentId: string,
  _previous: AssessmentFormState,
  formData: FormData,
): Promise<AssessmentFormState> {
  // In the order the teacher arranged them.
  const questionIds = formData.getAll("questionId").map(String);

  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };

  try {
    await replaceAssessmentQuestions(assessmentId, questionIds);
  } catch (error) {
    return errorState(error);
  }
  return afterSave(slug, assessmentId, "soal");
}

export async function saveSettingsAction(
  slug: string,
  assessmentId: string,
  _previous: AssessmentFormState,
  formData: FormData,
): Promise<AssessmentFormState> {
  const values: SettingsValues = {
    durationMinutes: text(formData, "durationMinutes"),
    maxAttempts: text(formData, "maxAttempts"),
    mode: text(formData, "mode"),
    remedialThreshold: text(formData, "remedialThreshold"),
  };
  const fields = validateSettings(values);
  if (Object.keys(fields).length > 0) return { status: "error", fields, values };

  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE, values };

  try {
    await updateAssessment(assessmentId, {
      durationMinutes: values.durationMinutes ? Number(values.durationMinutes) : null,
      maxAttempts: Number(values.maxAttempts),
      mode: values.mode as AssessmentMode,
      // Empty means the KKM is used (BR-02).
      remedialThreshold: values.remedialThreshold ? Number(values.remedialThreshold) : null,
    });
  } catch (error) {
    return errorState(error, { ...values });
  }
  return afterSave(slug, assessmentId, "pengaturan");
}

export async function publishAction(
  slug: string,
  assessmentId: string,
): Promise<PublishState> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };

  try {
    await publishAssessment(assessmentId);
  } catch (error) {
    if (error instanceof ApiError && error.code === "publish_blocked") {
      // The backend names the missing fields and the questions at fault (FR-G-050).
      const questions = (error.extra?.questions ?? []) as PublishBlockedQuestion[];
      const problems = [
        ...Object.values(error.fields ?? {}),
        ...questions.map((question) => question.message).filter((message): message is string => !!message),
      ];
      return { status: "error", message: "Asesmen belum dapat dipublikasikan:", problems };
    }
    return { status: "error", message: messageOf(error) };
  }
  refresh(slug, assessmentId);
  return { status: "saved", savedAt: Date.now() };
}

export async function unpublishAction(
  slug: string,
  assessmentId: string,
): Promise<PublishState> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };

  try {
    await unpublishAssessment(assessmentId);
  } catch (error) {
    return { status: "error", message: messageOf(error) };
  }
  refresh(slug, assessmentId);
  return { status: "saved", savedAt: Date.now() };
}

export async function deleteAssessmentAction(
  slug: string,
  assessmentId: string,
): Promise<PublishState> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };

  try {
    await deleteAssessment(assessmentId);
  } catch (error) {
    return { status: "error", message: messageOf(error) };
  }
  revalidatePath(`/${slug}/assessment`);
  redirect(`/${slug}/assessment`);
}
