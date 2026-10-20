import { apiFetch } from "./client";

// AI jobs (AI Plan §4.3, SRS 11.2): an AI endpoint answers 202 { jobId }; poll GET /ai-jobs/:id until the job is
// done or failed. Only the teacher who asked can read it.
export type AiJobStatus = "queued" | "running" | "done" | "failed";

export type AiJobAccepted = { jobId: string };

export type AiJob = {
  id: string;
  // e.g. "question_generation".
  feature: string;
  status: AiJobStatus;
  attempts: number;
  // Message of the last failure, ready to show; also set on a queued job that will be retried.
  error: string | null;
  // What the job made, once done, e.g. { questionIds: [...] }; its shape depends on the feature.
  resultRef: Record<string, unknown> | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
};

export async function getAiJob(id: string): Promise<AiJob> {
  return apiFetch<AiJob>(`/ai-jobs/${encodeURIComponent(id)}`);
}
