import { cache } from "react";
import { ApiError, apiFetch, isMockMode } from "./client";
import { mockSubjects } from "./mocks";
import type { Subject } from "./types";

// GET /subjects — subjects the signed-in teacher teaches (every subject for an admin), or the ones a student joined.
export const getSubjects = cache(async (): Promise<Subject[]> => {
  if (isMockMode) return mockSubjects;

  return apiFetch<Subject[]>("/subjects");
});

// GET /subjects/:slug — returns null when the subject does not exist, belongs to another teacher, or the student
// has not joined it.
export const getSubject = cache(async (slug: string): Promise<Subject | null> => {
  if (isMockMode) return mockSubjects.find((subject) => subject.slug === slug) ?? null;

  try {
    return await apiFetch<Subject>(`/subjects/${encodeURIComponent(slug)}`);
  } catch (error) {
    // 403 is the backend refusing a role it does not serve this subject to yet (students), so it reads as not found.
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) return null;
    throw error;
  }
});

export type SubjectInput = {
  name: string;
  classId: string;
  kkmDefault?: number;
  // Admin only: the teachers to assign. Teachers are assigned to subjects they create.
  teacherIds?: string[];
};

// POST /subjects
export async function createSubject(input: SubjectInput): Promise<Subject> {
  return apiFetch<Subject>("/subjects", { method: "POST", body: JSON.stringify(input) });
}

export type SubjectUpdateInput = {
  name?: string;
  // Moving a subject to another class. The backend does not accept this yet and ignores it.
  classId?: string;
};

// PATCH /subjects/:id — mutations use the id because renaming a subject changes its slug.
export async function updateSubject(id: string, input: SubjectUpdateInput): Promise<Subject> {
  return apiFetch<Subject>(`/subjects/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(input) });
}

// DELETE /subjects/:id — a soft delete on the backend.
export async function deleteSubject(id: string): Promise<void> {
  await apiFetch<void>(`/subjects/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// POST /subjects/join — a student joins a subject with the code from its teacher. Not provided by the backend yet.
export async function joinSubject(joinCode: string): Promise<Subject> {
  return apiFetch<Subject>("/subjects/join", { method: "POST", body: JSON.stringify({ joinCode }) });
}
