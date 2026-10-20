"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { ApiError, isMockMode } from "@/lib/api/client";
import { requestMyNarrative } from "@/lib/api/student";

const MOCK_MODE_MESSAGE = "Mode demo: sambungkan backend (API_BASE_URL) untuk memakai fitur AI.";
const SERVER_UNREACHABLE_MESSAGE = "Tidak dapat terhubung ke server. Coba lagi beberapa saat lagi.";

export type NarrativeActionResult = { status: "ready" } | { status: "queued"; jobId: string } | { status: "error"; message: string };

// AI-11 (FR-S-041): asked for by the student, so opening Diagnosis spends nothing; the same answers come back at once.
export async function myNarrativeAction(slug: string, subjectId: string): Promise<NarrativeActionResult> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  try {
    const result = await requestMyNarrative(subjectId);
    if (result.status === "queued" && result.jobId) return { status: "queued", jobId: result.jobId };
  } catch (error) {
    unstable_rethrow(error);
    return { status: "error", message: error instanceof ApiError && error.code ? error.message : SERVER_UNREACHABLE_MESSAGE };
  }
  revalidatePath(`/student/${slug}/diagnosis`);
  return { status: "ready" };
}

export async function refreshMyDiagnosisAction(slug: string): Promise<void> {
  revalidatePath(`/student/${slug}/diagnosis`);
}
