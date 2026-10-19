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

// PATCH /me — Edit Profile. The email cannot be changed there.
export async function updateProfile(input: { name?: string; province?: string | null }): Promise<CurrentUser> {
  return apiFetch<CurrentUser>("/me", { method: "PATCH", body: JSON.stringify(input) });
}

// PUT /me/photo — multipart "file": JPG or PNG, at most 5 MB, at least 800 x 800.
export async function uploadProfilePhoto(form: FormData): Promise<CurrentUser> {
  return apiFetch<CurrentUser>("/me/photo", { method: "PUT", body: form });
}

// DELETE /me/photo
export async function deleteProfilePhoto(): Promise<CurrentUser> {
  return apiFetch<CurrentUser>("/me/photo", { method: "DELETE" });
}
