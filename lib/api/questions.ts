import { apiFetch } from "./client";
import type { BloomLevel, Question, QuestionType } from "./types";

// Tambah soal manual (FR-G-060, FR-G-065). Pilihan ganda: 2–5 options keyed A–E, answerKey is the right key.
// Uraian: no options, answerKey is the model answer or rubric.
export type QuestionInput = {
  type: QuestionType;
  stem: string;
  options: { key: string; text: string }[] | null;
  answerKey: string;
  learningObjectiveIds: string[];
  bloomLevel: BloomLevel | null;
  difficulty: "mudah" | "sedang" | "sulit" | null;
};

// POST /subjects/:id/questions — manual questions are approved straight away.
export async function createQuestion(subjectId: string, input: QuestionInput): Promise<Question> {
  return apiFetch<Question>(`/subjects/${encodeURIComponent(subjectId)}/questions`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// PATCH /questions/:id — 409 question_answered once a student answered it (BR-10).
export async function updateQuestion(id: string, input: Partial<QuestionInput>): Promise<Question> {
  return apiFetch<Question>(`/questions/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(input) });
}

// DELETE /questions/:id — 409 in_use while an assessment still uses it.
export async function deleteQuestion(id: string): Promise<void> {
  await apiFetch<void>(`/questions/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// Impor soal dari template (FR-G-061, FR-G-063, FR-G-064): every row becomes a draft question, rows that cannot be
// read are listed in errors without failing the rest.
export type QuestionImport = {
  id: string;
  subjectId: string;
  filename: string;
  rowCount: number;
  errors: { row: number; message: string }[];
  createdAt: string;
  // The drafts not saved or deleted yet, in spreadsheet order.
  drafts: Question[];
};

// POST /subjects/:id/question-imports — multipart "file" (.xlsx or .csv, at most 5 MB and 500 rows).
export async function importQuestions(subjectId: string, form: FormData): Promise<QuestionImport> {
  return apiFetch<QuestionImport>(`/subjects/${encodeURIComponent(subjectId)}/question-imports`, {
    method: "POST",
    body: form,
  });
}

// GET /question-imports/:id
export async function getQuestionImport(id: string): Promise<QuestionImport> {
  return apiFetch<QuestionImport>(`/question-imports/${encodeURIComponent(id)}`);
}

// POST /question-imports/:id/save — approves the chosen drafts into the Bank Soal.
export async function saveQuestionImport(id: string, questionIds: string[]): Promise<{ saved: number }> {
  return apiFetch<{ saved: number }>(`/question-imports/${encodeURIComponent(id)}/save`, {
    method: "POST",
    body: JSON.stringify({ questionIds }),
  });
}
