import type { AiJobAccepted } from "./ai-jobs";
import { apiFetch } from "./client";
import type { QuestionImport } from "./questions";
import type { BloomLevel, Question } from "./types";

// Question sources beyond typing and templates. OCR still waits for the backend: its Server Function only calls the
// endpoint below once the flag is on.

// Bikin Soal dengan AI (FR-G-045, FR-G-047): eduinsight-be AI-04/05, built on the material index (AI-03).
export const AI_GENERATION_READY = true;
// Scan soal kertas (FR-G-062) + AI Parsing (FR-G-063).
export const OCR_READY = false;

export type GenerateQuestionsInput = {
  learningObjectiveIds: string[];
  // How many questions of each type, e.g. { pg: 10, uraian: 2 }.
  counts: { pg: number; uraian: number };
  bloomLevel: BloomLevel;
  // Regenerate Semua (FR-G-046): the assessment's AI drafts still waiting for ACC are rejected and replaced.
  replacePending?: boolean;
};

// POST /assessments/:id/generate-questions → 202 { jobId }. Poll it with useAiJob; once done, the drafts (origin
// "ai", status "pending_review") are in the assessment, after its other questions.
export async function generateQuestions(assessmentId: string, input: GenerateQuestionsInput): Promise<AiJobAccepted> {
  return apiFetch<AiJobAccepted>(`/assessments/${encodeURIComponent(assessmentId)}/generate-questions`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// POST /questions/:id/variation → 202 { jobId }: Buat Variasi (FR-G-046), placed right after the question.
export async function requestVariation(questionId: string, assessmentId: string): Promise<AiJobAccepted> {
  return apiFetch<AiJobAccepted>(`/questions/${encodeURIComponent(questionId)}/variation`, {
    method: "POST",
    body: JSON.stringify({ assessmentId }),
  });
}

// Proposed: POST /subjects/:id/question-scans (multipart "file": PDF, JPG or PNG) → the same shape as a template
// import (drafts + unreadable parts in errors), so the review and save steps are shared.
export async function scanQuestions(subjectId: string, form: FormData): Promise<QuestionImport> {
  return apiFetch<QuestionImport>(`/subjects/${encodeURIComponent(subjectId)}/question-scans`, {
    method: "POST",
    body: form,
  });
}

// POST /questions/:id/approve — ACC of an AI draft (FR-X-010, FR-X-011); publishing refuses drafts that are still
// pending_review (FR-G-050).
export async function approveQuestion(id: string): Promise<Question> {
  return apiFetch<Question>(`/questions/${encodeURIComponent(id)}/approve`, { method: "POST" });
}

// POST /questions/:id/reject — the draft is kept as rejected, with the teacher's optional note (FR-X-012).
export async function rejectQuestion(id: string, note?: string): Promise<Question> {
  return apiFetch<Question>(`/questions/${encodeURIComponent(id)}/reject`, {
    method: "POST",
    body: JSON.stringify(note ? { note } : {}),
  });
}
