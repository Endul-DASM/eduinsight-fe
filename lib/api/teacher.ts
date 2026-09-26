import { cache } from "react";
import { apiFetch, isMockMode } from "./client";
import { mockTeacher } from "./mocks";
import type { Teacher } from "./types";

// GET /me — the signed-in teacher. Until auth exists, the "Masuk sebagai Guru" button signs in as the mock teacher.
export const getCurrentTeacher = cache(async (): Promise<Teacher> => {
  if (isMockMode) return mockTeacher;

  return apiFetch<Teacher>("/me");
});
