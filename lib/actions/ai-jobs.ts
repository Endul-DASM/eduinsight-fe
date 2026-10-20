"use server";

import { unstable_rethrow } from "next/navigation";
import { getAiJob, type AiJob } from "@/lib/api/ai-jobs";
import { ApiError, isMockMode } from "@/lib/api/client";

const MOCK_MODE_MESSAGE = "Mode demo: sambungkan backend (API_BASE_URL) untuk memakai fitur AI.";
const SERVER_UNREACHABLE_MESSAGE = "Tidak dapat terhubung ke server. Coba lagi beberapa saat lagi.";

// Read by useAiJob (lib/ai-job.ts). The backend answers 404 unless the signed-in teacher asked for the job.
export async function getAiJobAction(id: string): Promise<{ status: "ok"; job: AiJob } | { status: "error"; message: string }> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  try {
    return { status: "ok", job: await getAiJob(id) };
  } catch (error) {
    unstable_rethrow(error);
    return { status: "error", message: error instanceof ApiError && error.code ? error.message : SERVER_UNREACHABLE_MESSAGE };
  }
}
