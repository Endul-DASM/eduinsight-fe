"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { ApiError, apiFetch, isMockMode } from "@/lib/api/client";
import type { Attempt } from "@/lib/api/student";

const MOCK_MODE_MESSAGE = "Mode demo: sambungkan backend (API_BASE_URL) untuk mengerjakan asesmen.";
const SERVER_UNREACHABLE_MESSAGE = "Tidak dapat terhubung ke server. Coba lagi beberapa saat lagi.";

// Messages for the 409s of POST /assessments/{id}/attempts and the attempt endpoints.
const startErrors: Record<string, string> = {
  offline_assessment: "Asesmen ini dikerjakan secara luring di kelas, bukan di aplikasi.",
  not_open: "Asesmen belum dibuka. Tunggu sampai jadwal buka.",
  closed: "Asesmen sudah ditutup.",
  no_attempts_left: "Kesempatan mengerjakan asesmen ini sudah habis.",
  attempt_submitted: "Asesmen ini sudah diserahkan.",
};

function messageOf(error: unknown): string {
  if (!(error instanceof ApiError)) return SERVER_UNREACHABLE_MESSAGE;
  return (error.code && startErrors[error.code]) || error.message || SERVER_UNREACHABLE_MESSAGE;
}

export type StartAttemptState = { message: string } | undefined;

// FR-S-010: starts an attempt, or resumes the one in progress, then opens it.
export async function startAttemptAction(slug: string, assessmentId: string): Promise<StartAttemptState> {
  if (isMockMode) return { message: MOCK_MODE_MESSAGE };
  try {
    await apiFetch<Attempt>(`/assessments/${encodeURIComponent(assessmentId)}/attempts`, { method: "POST" });
  } catch (error) {
    // An expired session makes apiFetch redirect to sign in, which works by throwing; let it through.
    unstable_rethrow(error);
    return { message: messageOf(error) };
  }
  redirect(`/student/${slug}/assessment/${assessmentId}/kerjakan`);
}

export type SaveResult = { ok: true; savedAt: string; deadlineAt: string } | { ok: false; message: string; submitted?: boolean };

// FR-S-011: the answers changed since the last save. Null clears an answer.
export async function saveResponsesAction(
  attemptId: string,
  responses: { questionId: string; answer: string | null }[],
): Promise<SaveResult> {
  if (isMockMode) return { ok: false, message: MOCK_MODE_MESSAGE };
  try {
    const saved = await apiFetch<{ savedAt: string; deadlineAt: string }>(`/attempts/${encodeURIComponent(attemptId)}/responses`, {
      method: "PUT",
      body: JSON.stringify({ responses }),
    });
    return { ok: true, ...saved };
  } catch (error) {
    unstable_rethrow(error);
    return {
      ok: false,
      message: messageOf(error),
      submitted: error instanceof ApiError && error.code === "attempt_submitted",
    };
  }
}

export type SubmitResult = { message: string } | undefined;

// Hands the attempt in (FR-S-013), then shows Asesmen Selesai. An attempt the backend already submitted (time up)
// goes to the same page.
export async function submitAttemptAction(slug: string, assessmentId: string, attemptId: string): Promise<SubmitResult> {
  if (isMockMode) return { message: MOCK_MODE_MESSAGE };
  try {
    await apiFetch<Attempt>(`/attempts/${encodeURIComponent(attemptId)}/submit`, { method: "POST" });
  } catch (error) {
    unstable_rethrow(error);
    if (!(error instanceof ApiError && error.code === "attempt_submitted")) return { message: messageOf(error) };
  }
  revalidatePath(`/student/${slug}`, "layout");
  redirect(`/student/${slug}/assessment/${assessmentId}/selesai?attempt=${attemptId}`);
}
