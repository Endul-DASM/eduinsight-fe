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
  // Moves the subject to another class the user can see; its materials and questions move with it.
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

// A student in the subject (Daftar Siswa). name is the username until the student fills in a name (BR-11).
export type EnrolledStudent = { id: string; name: string; username: string; nis: string | null; joinedAt: string };

// GET /subjects/:id/students — the students who joined the subject, by name. Null when it is not the teacher's.
export const getSubjectStudents = cache(async (subjectId: string): Promise<EnrolledStudent[] | null> => {
  if (isMockMode) return [];
  try {
    return await apiFetch<EnrolledStudent[]>(`/subjects/${encodeURIComponent(subjectId)}/students`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) return null;
    throw error;
  }
});

// DELETE /subjects/:id/students/:studentId — the teacher takes a student out; scores stay and the student can join
// again with the code.
export async function removeSubjectStudent(subjectId: string, studentId: string): Promise<void> {
  await apiFetch<void>(`/subjects/${encodeURIComponent(subjectId)}/students/${encodeURIComponent(studentId)}`, {
    method: "DELETE",
  });
}

// DELETE /subjects/:id/enrollment — a student leaves the subject; scores stay and they can join again with the code.
export async function leaveSubject(subjectId: string): Promise<void> {
  await apiFetch<void>(`/subjects/${encodeURIComponent(subjectId)}/enrollment`, { method: "DELETE" });
}
