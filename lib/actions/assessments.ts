"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  type AssessmentInput,
  createAssessment,
  deleteAssessment,
  publishAssessment,
  replaceAssessmentLearningObjectives,
  replaceAssessmentQuestions,
  unpublishAssessment,
  updateAssessment,
} from "@/lib/api/assessments";
import { ApiError, isMockMode } from "@/lib/api/client";
import {
  AI_GENERATION_READY,
  generateQuestions,
  type GenerateQuestionsInput,
  OCR_READY,
  scanQuestions,
} from "@/lib/api/question-sources";
import {
  createQuestion,
  deleteQuestion,
  importQuestions,
  type QuestionInput,
  saveQuestionImport,
  updateQuestion,
} from "@/lib/api/questions";
import type { AssessmentMode, AssessmentType } from "@/lib/api/types";
import {
  type BuilderMethod,
  builderPath,
  durationOf,
  MAX_IMPORT_MB,
  OPTION_KEYS,
  type SpecificationValues,
  type TypedQuestion,
  validateSpecification,
  validateTypedQuestion,
  wibInputToIso,
} from "@/lib/assessment-form";

const MOCK_MODE_MESSAGE = "Mode demo: sambungkan backend (API_BASE_URL) untuk menyimpan asesmen.";
const SERVER_UNREACHABLE_MESSAGE = "Tidak dapat terhubung ke server. Coba lagi beberapa saat lagi.";
const AI_NOT_READY_MESSAGE =
  "Pembuatan soal dengan AI belum tersedia di server. Spesifikasi sudah tersimpan sebagai draf; Anda bisa melanjutkannya nanti.";
const OCR_NOT_READY_MESSAGE =
  "Scan OCR belum tersedia di server. Spesifikasi sudah tersimpan sebagai draf; sementara itu Anda bisa memakai Template atau Ketik di EduInsight.";

// fields are keyed by form field, or by question key for the question editor. questionIds maps the keys of new
// questions to the ids the backend gave them, also after a failure partway through.
export type BuilderResult =
  | { status: "error"; message?: string; fields?: Record<string, string>; questionIds?: Record<string, string> }
  | { status: "saved"; questionIds?: Record<string, string> };

// publish_blocked lists every problem, so the review step can show them all.
export type PublishState = { status: "error"; message: string; problems?: string[] } | { status: "saved" } | undefined;

type PublishBlockedQuestion = { message?: string };

// ApiError messages come from the backend in Indonesian; anything else means the request never got an answer.
function messageOf(error: unknown): string {
  return error instanceof ApiError && error.code ? error.message : SERVER_UNREACHABLE_MESSAGE;
}

function errorResult(error: unknown): Extract<BuilderResult, { status: "error" }> {
  const fields = error instanceof ApiError ? error.fields : undefined;
  return { status: "error", message: fields ? Object.values(fields)[0] : messageOf(error), fields };
}

function refresh(slug: string, assessmentId: string) {
  revalidatePath(`/${slug}/assessment`);
  revalidatePath(`/${slug}/assessment/${assessmentId}`);
}

// The slug and ids are bound by the page; they still come from the browser, and the backend checks access.

// Langkah 1 Spesifikasi Soal. Creates the draft the first time; "Selanjutnya" (next) opens langkah 2.
export async function saveSpecificationAction(
  slug: string,
  subjectId: string,
  assessmentId: string | null,
  method: BuilderMethod,
  values: SpecificationValues,
  next: boolean,
): Promise<BuilderResult> {
  const fields = validateSpecification(values, next);
  if (Object.keys(fields).length > 0) return { status: "error", fields: fields as Record<string, string> };
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };

  const input: AssessmentInput = {
    title: values.title,
    type: values.type as AssessmentType,
    // An empty KKM keeps the current one, which defaults to the subject's KKM (BR-01).
    ...(values.kkm ? { kkm: Number(values.kkm) } : {}),
    // Empty means the KKM is used (BR-02).
    remedialThreshold: values.remedialThreshold ? Number(values.remedialThreshold) : null,
    // The schedule and duration may stay empty in a draft; publishing requires them.
    opensAt: values.opensAt ? wibInputToIso(values.opensAt) : null,
    closesAt: values.closesAt ? wibInputToIso(values.closesAt) : null,
    durationMinutes: durationOf(values.hours, values.minutes),
    maxAttempts: Number(values.maxAttempts),
    ...(values.mode ? { mode: values.mode as AssessmentMode } : {}),
  };

  let id = assessmentId;
  try {
    if (id) await updateAssessment(id, input);
    else id = (await createAssessment(subjectId, { ...input, title: values.title, type: input.type! })).id;
    // Pilih TP (FR-G-042) needs at least one, so a draft without TPs keeps whatever it had.
    if (values.objectiveIds.length > 0) await replaceAssessmentLearningObjectives(id, values.objectiveIds);
  } catch (error) {
    if (id && !assessmentId) {
      // The draft exists even though a later call failed; continue on its page.
      refresh(slug, id);
      redirect(builderPath(slug, id, method, "spesifikasi"));
    }
    return errorResult(error);
  }

  refresh(slug, id);
  if (next) redirect(builderPath(slug, id, method, "soal"));
  if (!assessmentId) redirect(builderPath(slug, id, method, "spesifikasi"));
  return { status: "saved" };
}

function questionInput(question: TypedQuestion): QuestionInput {
  const pg = question.type === "pg";
  return {
    type: question.type,
    stem: question.stem.trim(),
    options: pg ? question.options.map((text, index) => ({ key: OPTION_KEYS[index], text: text.trim() })) : null,
    answerKey: pg ? question.answerKey : question.answerKey.trim(),
    learningObjectiveIds: question.objectiveIds,
    bloomLevel: question.bloomLevel || null,
    difficulty: question.difficulty || null,
  };
}

// Removed questions leave the assessment; they are deleted from the Bank Soal too unless another assessment uses
// them (409 in_use), in which case they stay there.
async function deleteUnused(questionIds: string[]) {
  for (const id of questionIds) {
    try {
      await deleteQuestion(id);
    } catch (error) {
      if (!(error instanceof ApiError && error.code === "in_use")) throw error;
    }
  }
}

// Langkah 2 "Ketik di EduInsight" (FR-G-060, FR-G-065): saves every question, then the assessment's question order
// (FR-G-043). The keys of new questions come back with their ids so a second save does not create them again.
export async function saveTypedQuestionsAction(
  slug: string,
  subjectId: string,
  assessmentId: string,
  method: BuilderMethod,
  questions: TypedQuestion[],
  removedIds: string[],
  next: boolean,
): Promise<BuilderResult> {
  const fields: Record<string, string> = {};
  for (const question of questions) {
    const problem = validateTypedQuestion(question);
    if (problem) fields[question.key] = problem;
  }
  if (Object.keys(fields).length > 0) return { status: "error", message: "Periksa lagi soal yang ditandai.", fields };
  if (next && questions.length === 0) return { status: "error", message: "Tambahkan minimal satu soal." };
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };

  const questionIds: Record<string, string> = {};
  try {
    for (const question of questions) {
      const input = questionInput(question);
      questionIds[question.key] = question.id
        ? (await updateQuestion(question.id, input)).id
        : (await createQuestion(subjectId, input)).id;
    }
    await replaceAssessmentQuestions(
      assessmentId,
      questions.map((question) => questionIds[question.key]),
    );
    await deleteUnused(removedIds);
  } catch (error) {
    refresh(slug, assessmentId);
    // Questions saved before the failure keep their ids, so retrying does not duplicate them.
    return { ...errorResult(error), questionIds };
  }

  refresh(slug, assessmentId);
  if (next) redirect(builderPath(slug, assessmentId, method, "review"));
  return { status: "saved", questionIds };
}

// 🗑 on a question in Review: it leaves the assessment (and the Bank Soal when nothing else uses it).
export async function removeQuestionAction(
  slug: string,
  assessmentId: string,
  questionId: string,
  remainingIds: string[],
): Promise<BuilderResult> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  try {
    await replaceAssessmentQuestions(assessmentId, remainingIds);
    await deleteUnused([questionId]);
  } catch (error) {
    return errorResult(error);
  }
  refresh(slug, assessmentId);
  return { status: "saved" };
}

// Template (FR-G-061): the uploaded file becomes draft questions, reviewed on the same page (?import=id).
export async function importQuestionsAction(
  slug: string,
  subjectId: string,
  assessmentId: string,
  method: BuilderMethod,
  form: FormData,
): Promise<BuilderResult> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { status: "error", message: "Pilih berkas template." };
  if (!/\.(xlsx|csv)$/i.test(file.name)) return { status: "error", message: "Unggah berkas .xlsx atau .csv dari template." };
  if (file.size > MAX_IMPORT_MB * 1024 * 1024) return { status: "error", message: `Ukuran berkas maksimal ${MAX_IMPORT_MB} MB.` };

  let importId: string;
  try {
    importId = (await importQuestions(subjectId, form)).id;
  } catch (error) {
    return errorResult(error);
  }
  redirect(`${builderPath(slug, assessmentId, method, "soal")}&import=${importId}`);
}

// FR-G-064: the teacher keeps the drafts that are right; they join the Bank Soal and the end of the assessment.
// The drafts left out are deleted. Also used for the result of a scan (OCR), which has the same shape.
export async function saveImportAction(
  slug: string,
  assessmentId: string,
  method: BuilderMethod,
  importId: string,
  keptIds: string[],
  droppedIds: string[],
  currentQuestionIds: string[],
  next: boolean,
): Promise<BuilderResult> {
  if (keptIds.length === 0 && currentQuestionIds.length === 0) {
    return { status: "error", message: "Pilih minimal satu soal hasil impor." };
  }
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  try {
    if (keptIds.length > 0) await saveQuestionImport(importId, keptIds);
    await deleteUnused(droppedIds);
    await replaceAssessmentQuestions(assessmentId, [...new Set([...currentQuestionIds, ...keptIds])]);
  } catch (error) {
    return errorResult(error);
  }
  refresh(slug, assessmentId);
  // The import is done either way; "Simpan Draft" stays on langkah 2 without it.
  redirect(builderPath(slug, assessmentId, method, next ? "review" : "soal"));
}

// Langkah 2 AI (FR-G-045, FR-G-047). Waits for the backend: see AI_GENERATION_READY.
export async function generateQuestionsAction(
  slug: string,
  assessmentId: string,
  method: BuilderMethod,
  input: GenerateQuestionsInput,
): Promise<BuilderResult> {
  if (input.counts.pg + input.counts.uraian === 0) return { status: "error", message: "Isi jumlah soal minimal satu." };
  if (input.learningObjectiveIds.length === 0) {
    return { status: "error", message: "Asesmen belum punya TP. Pilih TP di Spesifikasi Soal." };
  }
  if (!AI_GENERATION_READY) return { status: "error", message: AI_NOT_READY_MESSAGE };
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  try {
    await generateQuestions(assessmentId, input);
  } catch (error) {
    return errorResult(error);
  }
  refresh(slug, assessmentId);
  redirect(builderPath(slug, assessmentId, method, "review"));
}

// Langkah 2 OCR (FR-G-062, FR-G-063). Waits for the backend: see OCR_READY. The result is reviewed like an import.
export async function scanQuestionsAction(
  slug: string,
  subjectId: string,
  assessmentId: string,
  method: BuilderMethod,
  form: FormData,
): Promise<BuilderResult> {
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { status: "error", message: "Unggah dokumen hasil scan." };
  if (!OCR_READY) return { status: "error", message: OCR_NOT_READY_MESSAGE };
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  let importId: string;
  try {
    importId = (await scanQuestions(subjectId, form)).id;
  } catch (error) {
    return errorResult(error);
  }
  redirect(`${builderPath(slug, assessmentId, method, "soal")}&import=${importId}`);
}

export async function publishAction(slug: string, assessmentId: string): Promise<PublishState> {
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
  return { status: "saved" };
}

export async function unpublishAction(slug: string, assessmentId: string): Promise<PublishState> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };

  try {
    await unpublishAssessment(assessmentId);
  } catch (error) {
    return { status: "error", message: messageOf(error) };
  }
  refresh(slug, assessmentId);
  return { status: "saved" };
}

export async function deleteAssessmentAction(slug: string, assessmentId: string): Promise<PublishState> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };

  try {
    await deleteAssessment(assessmentId);
  } catch (error) {
    return { status: "error", message: messageOf(error) };
  }
  revalidatePath(`/${slug}/assessment`);
  redirect(`/${slug}/assessment?tab=daftar`);
}
