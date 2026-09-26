import { cache } from "react";
import { apiFetch, isMockMode } from "./client";
import { mockTeacher, mockTeachers } from "./mocks";
import type { CurrentUser, TeacherSummary } from "./types";

// GET /me — the signed-in user. In mock mode this is always the mock teacher.
export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  if (isMockMode) return mockTeacher;

  return apiFetch<CurrentUser>("/me");
});

// GET /teachers — admin only; the teachers an admin can assign to a subject.
export const getTeachers = cache(async (): Promise<TeacherSummary[]> => {
  if (isMockMode) return mockTeachers;

  return apiFetch<TeacherSummary[]>("/teachers");
});
