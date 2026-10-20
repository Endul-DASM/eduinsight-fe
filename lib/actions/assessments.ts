"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
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
  approveQuestion,
  generateQuestions,
  type GenerateQuestionsInput,
  parseQuestions,
  rejectQuestion,
  requestVariation,
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
import { type RemedialScheduleValues, validateRemedialSchedule } from "@/lib/remedial-figures";
import {
  type BuilderMethod,
  builderPath,
  durationOf,
  MAX_AI_QUESTIONS,
  MAX_IMPORT_MB,
  MAX_PARSE_MB,
  MAX_SCAN_MB,
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

// fields are keyed by form field, or by question key for the question editor. questionIds maps the keys of new
// questions to the ids the backend gave them, also after a failure partway through.
export type BuilderResult =
  | { status: "error"; message?: string; fields?: Record<string, string>; questionIds?: Record<string, string> }
  | { status: "saved"; questionIds?: Record<string, string> };

// An AI request was accepted; follow it with useAiJob (lib/ai-job.ts).
export type AiRequestResult = { status: "queued"; jobId: string } | { status: "error"; message: string };

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
    // An expired session makes apiFetch redirect to sign in, which works by throwing; let it through.
    unstable_rethrow(error);
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
      unstable_rethrow(error);
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
    unstable_rethrow(error);
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
    unstable_rethrow(error);
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
    unstable_rethrow(error);
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
    unstable_rethrow(error);
    return errorResult(error);
  }
  refresh(slug, assessmentId);
  // The import is done either way; "Simpan Draft" stays on langkah 2 without it.
  redirect(builderPath(slug, assessmentId, method, next ? "review" : "soal"));
}

// Langkah 2 AI (FR-G-045, FR-G-047) and Regenerate Semua (FR-G-046, with replaceJobId). The backend writes the
// drafts in a job; the page follows it and opens Review when it is done.
export async function generateQuestionsAction(
  slug: string,
  assessmentId: string,
  input: GenerateQuestionsInput,
): Promise<AiRequestResult> {
  const total = input.counts.pg + input.counts.uraian;
  if (total === 0) return { status: "error", message: "Isi jumlah soal minimal satu." };
  if (total > MAX_AI_QUESTIONS) {
    return { status: "error", message: `Paling banyak ${MAX_AI_QUESTIONS} soal per permintaan.` };
  }
  if (input.learningObjectiveIds.length === 0) {
    return { status: "error", message: "Asesmen belum punya TP. Pilih TP di Spesifikasi Soal." };
  }
  if (!AI_GENERATION_READY) return { status: "error", message: AI_NOT_READY_MESSAGE };
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  try {
    const { jobId } = await generateQuestions(assessmentId, input);
    return { status: "queued", jobId };
  } catch (error) {
    unstable_rethrow(error);
    return { status: "error", message: errorResult(error).message ?? SERVER_UNREACHABLE_MESSAGE };
  }
}

// Buat Variasi (FR-G-046): one equivalent AI question, placed right after this one.
export async function variationAction(slug: string, assessmentId: string, questionId: string): Promise<AiRequestResult> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  try {
    const { jobId } = await requestVariation(questionId, assessmentId);
    return { status: "queued", jobId };
  } catch (error) {
    unstable_rethrow(error);
    return { status: "error", message: errorResult(error).message ?? SERVER_UNREACHABLE_MESSAGE };
  }
}

// ACC of an AI draft (FR-X-011). Publishing needs every draft approved (FR-G-050).
export async function approveQuestionAction(slug: string, assessmentId: string, questionId: string): Promise<BuilderResult> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  try {
    await approveQuestion(questionId);
  } catch (error) {
    unstable_rethrow(error);
    return errorResult(error);
  }
  refresh(slug, assessmentId);
  return { status: "saved" };
}

// Tolak (FR-X-012): the draft is kept as rejected, for the record, and taken out of this assessment.
export async function rejectQuestionAction(
  slug: string,
  assessmentId: string,
  questionId: string,
  remainingIds: string[],
  note?: string,
): Promise<BuilderResult> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  try {
    await rejectQuestion(questionId, note?.trim() || undefined);
    await replaceAssessmentQuestions(assessmentId, remainingIds);
  } catch (error) {
    unstable_rethrow(error);
    return errorResult(error);
  }
  refresh(slug, assessmentId);
  return { status: "saved" };
}

// Called when an AI job finished, so the next render shows its drafts.
export async function refreshAssessmentAction(slug: string, assessmentId: string): Promise<void> {
  refresh(slug, assessmentId);
}

// Langkah 2 OCR (FR-G-062) and AI Parsing of a question document (FR-G-063): the backend reads the file in a job;
// the step follows it with useAiJob and opens the result (?import=id), reviewed like a template import.
export async function scanQuestionsAction(slug: string, subjectId: string, form: FormData): Promise<AiRequestResult> {
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { status: "error", message: "Unggah dokumen hasil scan." };
  if (!/\.(pdf|jpe?g|png)$/i.test(file.name)) return { status: "error", message: "Unggah berkas PDF, JPG, atau PNG." };
  if (file.size > MAX_SCAN_MB * 1024 * 1024) return { status: "error", message: `Ukuran berkas maksimal ${MAX_SCAN_MB} MB.` };
  return queueRead(() => scanQuestions(subjectId, form));
}

export async function parseQuestionsAction(slug: string, subjectId: string, form: FormData): Promise<AiRequestResult> {
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { status: "error", message: "Pilih berkas soal." };
  if (!/\.(docx|pdf|txt)$/i.test(file.name)) return { status: "error", message: "Unggah berkas .docx, .pdf, atau .txt." };
  if (file.size > MAX_PARSE_MB * 1024 * 1024) return { status: "error", message: `Ukuran berkas maksimal ${MAX_PARSE_MB} MB.` };
  return queueRead(() => parseQuestions(subjectId, form));
}

async function queueRead(request: () => Promise<{ jobId: string }>): Promise<AiRequestResult> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  try {
    return { status: "queued", jobId: (await request()).jobId };
  } catch (error) {
    unstable_rethrow(error);
    return { status: "error", message: errorResult(error).message ?? SERVER_UNREACHABLE_MESSAGE };
  }
}

export async function publishAction(slug: string, assessmentId: string): Promise<PublishState> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };

  try {
    await publishAssessment(assessmentId);
  } catch (error) {
    unstable_rethrow(error);
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
    unstable_rethrow(error);
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
    unstable_rethrow(error);
    return { status: "error", message: messageOf(error) };
  }
  revalidatePath(`/${slug}/assessment`);
  redirect(`/${slug}/assessment?tab=daftar`);
}

// Jadwalkan Remedial (FR-G-107): the remedial assessment's title, schedule, instructions and source assessment, then
// publishing it when asked. The source limits who may take it to its Perlu Remedial students (BR-08, FR-G-105).
export async function scheduleRemedialAction(
  slug: string,
  assessmentId: string,
  sourceId: string | null,
  values: RemedialScheduleValues,
  publish: boolean,
): Promise<PublishState & { fields?: Record<string, string> }> {
  const fields = validateRemedialSchedule(values, publish);
  if (Object.keys(fields).length > 0) {
    return { status: "error", message: "Periksa lagi isian jadwal.", fields: fields as Record<string, string> };
  }
  if (publish && !sourceId) {
    return { status: "error", message: "Pilih asesmen asal remedial di atas sebelum menjadwalkan." };
  }
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };

  const at = (time: string) => (values.date && time ? wibInputToIso(`${values.date}T${time}`) : null);
  try {
    await updateAssessment(assessmentId, {
      title: values.title.trim(),
      opensAt: at(values.start),
      closesAt: at(values.end),
      durationMinutes: values.duration ? Number(values.duration) : null,
      description: values.instructions.trim() || null,
      ...(sourceId ? { sourceAssessmentId: sourceId } : {}),
    });
  } catch (error) {
    unstable_rethrow(error);
    return { status: "error", message: messageOf(error) };
  }
  revalidatePath(`/${slug}/remedial`);
  if (!publish) {
    refresh(slug, assessmentId);
    return { status: "saved" };
  }
  const result = await publishAction(slug, assessmentId);
  revalidatePath(`/${slug}/remedial`);
  return result ?? { status: "saved" };
}
