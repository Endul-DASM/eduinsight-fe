import { apiFetch } from "./client";
import type { QuestionImport } from "./questions";
import type { BloomLevel, Question } from "./types";

// Question sources the backend does not have yet. The functions already call the endpoints proposed below, but the
// Server Functions only use them once the flag is turned on, so the pages work today and connecting later means
// flipping the flag (and adjusting the paths if the backend picks other ones).

// Bikin Soal dengan AI (FR-G-045, FR-G-047): needs OpenAI + the Resource Library (RAG).
export const AI_GENERATION_READY = false;
// Scan soal kertas (FR-G-062) + AI Parsing (FR-G-063).
export const OCR_READY = false;

export type GenerateQuestionsInput = {
  learningObjectiveIds: string[];
  // How many questions of each type, e.g. { pg: 10, uraian: 2 }.
  counts: { pg: number; uraian: number };
  bloomLevel: BloomLevel;
};

// Proposed: POST /assessments/:id/generate-questions → draft questions (origin "ai", status "pending_review"), each
// linked to its source material, TP and Bloom level, already added to the assessment in order.
export async function generateQuestions(assessmentId: string, input: GenerateQuestionsInput): Promise<Question[]> {
  return apiFetch<Question[]>(`/assessments/${encodeURIComponent(assessmentId)}/generate-questions`, {
    method: "POST",
    body: JSON.stringify(input),
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

// Proposed: POST /questions/:id/approve — ACC of an AI draft (FR-X-010, FR-X-011); publishing refuses drafts that
// are still pending_review (FR-G-050).
export async function approveQuestion(id: string): Promise<Question> {
  return apiFetch<Question>(`/questions/${encodeURIComponent(id)}/approve`, { method: "POST" });
}
