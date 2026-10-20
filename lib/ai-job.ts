"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { getAiJobAction } from "@/lib/actions/ai-jobs";
import type { AiJob } from "@/lib/api/ai-jobs";

// Follows an AI job (AI Plan §4.3) until it is done or failed. AI endpoints answer 202 { jobId }; pass that id here.
// Generation can take over a minute, and a job the backend retries waits between attempts, so the hook keeps
// polling for up to MAX_WAIT_MS. The job itself keeps running after that, and the teacher gets a notification when it
// ends (FR-X-041).

const POLL_MS = 2000;
const MAX_WAIT_MS = 5 * 60 * 1000;
// Polls in a row that may fail (network, server restart) before giving up.
const MAX_ERRORS = 3;

const FAILED_MESSAGE = "Proses AI gagal. Silakan coba lagi.";
const TIMEOUT_MESSAGE = "Proses AI masih berjalan. Kami akan mengirim notifikasi saat selesai.";

export type AiJobState =
  | { status: "idle" }
  // job is null until the first check.
  | { status: "waiting"; job: AiJob | null }
  | { status: "done"; job: AiJob }
  | { status: "failed"; message: string; job: AiJob | null };

type Options = {
  onDone?: (job: AiJob) => void;
  onFailed?: (message: string, job: AiJob | null) => void;
};

export function useAiJob(jobId: string | null, { onDone, onFailed }: Options = {}): AiJobState {
  // Kept with the id it belongs to, so a new jobId starts from "waiting" without resetting state in the effect.
  const [state, setState] = useState<{ jobId: string; value: AiJobState } | null>(null);
  const done = useEffectEvent((job: AiJob) => onDone?.(job));
  const failed = useEffectEvent((message: string, job: AiJob | null) => onFailed?.(message, job));

  useEffect(() => {
    if (!jobId) return;
    const id = jobId;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let errors = 0;
    let lastJob: AiJob | null = null;
    const startedAt = Date.now();

    function fail(message: string, job: AiJob | null) {
      setState({ jobId: id, value: { status: "failed", message, job } });
      failed(message, job);
    }

    async function check() {
      const result = await getAiJobAction(id);
      if (cancelled) return;
      if (result.status === "error") {
        errors += 1;
        if (errors >= MAX_ERRORS) return fail(result.message, lastJob);
      } else {
        errors = 0;
        const { job } = result;
        lastJob = job;
        if (job.status === "done") {
          setState({ jobId: id, value: { status: "done", job } });
          return done(job);
        }
        if (job.status === "failed") return fail(job.error ?? FAILED_MESSAGE, job);
        setState({ jobId: id, value: { status: "waiting", job } });
      }
      if (Date.now() - startedAt > MAX_WAIT_MS) return fail(TIMEOUT_MESSAGE, lastJob);
      timer = setTimeout(check, POLL_MS);
    }

    timer = setTimeout(check, POLL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [jobId]);

  if (!jobId) return { status: "idle" };
  return state?.jobId === jobId ? state.value : { status: "waiting", job: null };
}
