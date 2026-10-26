"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { ApiError, isMockMode } from "@/lib/api/client";
import { type DiagnosisFilters, requestRootCause } from "@/lib/api/diagnosis";

const MOCK_MODE_MESSAGE = "Mode demo: sambungkan backend (API_BASE_URL) untuk memakai fitur AI.";
const SERVER_UNREACHABLE_MESSAGE = "Tidak dapat terhubung ke server. Coba lagi beberapa saat lagi.";

export type RootCauseActionResult = { status: "ready" } | { status: "queued"; jobId: string } | { status: "error"; message: string };

// Akar Masalah narrative (AI-10, FR-G-083) of the pattern with this rank, for the scope on screen. Asked for explicitly, so opening the page never
// spends the teacher's AI quota; a narrative already written for the same data comes back at once.
export async function rootCauseAction(
  slug: string,
  subjectId: string,
  filters: DiagnosisFilters,
  rank = 1,
): Promise<RootCauseActionResult> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  try {
    const result = await requestRootCause(subjectId, filters, rank);
    if (result.status === "queued") return { status: "queued", jobId: result.jobId };
  } catch (error) {
    unstable_rethrow(error);
    return { status: "error", message: error instanceof ApiError && error.code ? error.message : SERVER_UNREACHABLE_MESSAGE };
  }
  revalidatePath(`/${slug}/analysis`);
  return { status: "ready" };
}

// Called once the narrative job is done, so the next render reads it.
export async function refreshAnalysisAction(slug: string): Promise<void> {
  revalidatePath(`/${slug}/analysis`);
}
