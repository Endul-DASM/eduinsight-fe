import { cache } from "react";
import { ApiError, apiFetch, isMockMode } from "./client";
import type { Assessment, AssessmentDetail, AssessmentMode, AssessmentStatus, AssessmentType } from "./types";

export type AssessmentFilters = {
  type?: AssessmentType;
  status?: AssessmentStatus;
};

// GET /subjects/:id/assessments — Daftar Assessment (FR-G-040). Mock mode has no assessments.
export const getAssessments = cache(async (subjectId: string, filters: AssessmentFilters = {}) => {
  if (isMockMode) return [] as Assessment[];

  const query = new URLSearchParams();
  if (filters.type) query.set("type", filters.type);
  if (filters.status) query.set("status", filters.status);
  const search = query.size > 0 ? `?${query}` : "";
  return apiFetch<Assessment[]>(`/subjects/${encodeURIComponent(subjectId)}/assessments${search}`);
});

// GET /assessments/:id — returns null when it does not exist or belongs to another teacher's subject.
export const getAssessment = cache(async (id: string): Promise<AssessmentDetail | null> => {
  if (isMockMode) return null;

  try {
    return await apiFetch<AssessmentDetail>(`/assessments/${encodeURIComponent(id)}`);
  } catch (error) {
    // 422 is an id that is not a UUID, which can only come from a hand-edited URL.
    if (error instanceof ApiError && (error.status === 404 || error.status === 422)) return null;
    throw error;
  }
});

// Informasi (FR-G-041) and Pengaturan (FR-G-044). Times are ISO 8601 with an offset.
export type AssessmentInput = {
  title?: string;
  type?: AssessmentType;
  kkm?: number;
  remedialThreshold?: number | null;
  opensAt?: string | null;
  closesAt?: string | null;
  durationMinutes?: number | null;
  maxAttempts?: number;
  mode?: AssessmentMode;
};

// POST /subjects/:id/assessments — creates a draft.
export async function createAssessment(
  subjectId: string,
  input: AssessmentInput & Required<Pick<AssessmentInput, "title" | "type">>,
): Promise<AssessmentDetail> {
  return apiFetch<AssessmentDetail>(`/subjects/${encodeURIComponent(subjectId)}/assessments`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// PATCH /assessments/:id — drafts only; a published assessment answers 409 not_draft.
export async function updateAssessment(id: string, input: AssessmentInput): Promise<AssessmentDetail> {
  return apiFetch<AssessmentDetail>(`/assessments/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

// PUT /assessments/:id/learning-objectives — Pilih TP (FR-G-042), at least one.
export async function replaceAssessmentLearningObjectives(
  id: string,
  learningObjectiveIds: string[],
): Promise<AssessmentDetail> {
  return apiFetch<AssessmentDetail>(`/assessments/${encodeURIComponent(id)}/learning-objectives`, {
    method: "PUT",
    body: JSON.stringify({ learningObjectiveIds }),
  });
}

// PUT /assessments/:id/questions — Pilih Soal (FR-G-043), in the order students see them.
export async function replaceAssessmentQuestions(id: string, questionIds: string[]): Promise<AssessmentDetail> {
  return apiFetch<AssessmentDetail>(`/assessments/${encodeURIComponent(id)}/questions`, {
    method: "PUT",
    body: JSON.stringify({ questionIds }),
  });
}

// POST /assessments/:id/publish — 422 publish_blocked lists what is missing (FR-G-050).
export async function publishAssessment(id: string): Promise<AssessmentDetail> {
  return apiFetch<AssessmentDetail>(`/assessments/${encodeURIComponent(id)}/publish`, { method: "POST" });
}

// POST /assessments/:id/unpublish — only before the assessment opens.
export async function unpublishAssessment(id: string): Promise<AssessmentDetail> {
  return apiFetch<AssessmentDetail>(`/assessments/${encodeURIComponent(id)}/unpublish`, { method: "POST" });
}

// DELETE /assessments/:id — drafts only.
export async function deleteAssessment(id: string): Promise<void> {
  await apiFetch<void>(`/assessments/${encodeURIComponent(id)}`, { method: "DELETE" });
}
