import { cache } from "react";
import { ApiError, apiFetch, isMockMode } from "./client";
import { mockSubjects } from "./mocks";
import type { Subject } from "./types";

// GET /subjects — subjects the signed-in teacher teaches.
export const getSubjects = cache(async (): Promise<Subject[]> => {
  if (isMockMode) return mockSubjects;

  return apiFetch<Subject[]>("/subjects");
});

// GET /subjects/:slug — returns null when the subject does not exist.
export const getSubject = cache(async (slug: string): Promise<Subject | null> => {
  if (isMockMode) return mockSubjects.find((subject) => subject.slug === slug) ?? null;

  try {
    return await apiFetch<Subject>(`/subjects/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});
