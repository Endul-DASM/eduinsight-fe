"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAiJob } from "@/lib/ai-job";
import { type BuilderMethod, builderPath } from "@/lib/assessment-form";

// Follows an AI Parsing or OCR job (FR-G-062, FR-G-063) and opens its result on this step (?import=id), where the
// drafts are reviewed like a template import.
export function useImportJob(slug: string, assessmentId: string, method: BuilderMethod) {
  const router = useRouter();
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const job = useAiJob(jobId, {
    onDone: (done) => {
      setJobId(null);
      const importId = done.resultRef?.importId;
      if (typeof importId === "string") router.push(`${builderPath(slug, assessmentId, method, "soal")}&import=${importId}`);
      else setError("Hasil pembacaan tidak ditemukan. Silakan coba lagi.");
    },
    onFailed: (message) => {
      setJobId(null);
      setError(`${message} Anda tetap bisa mengetik soal atau memakai template.`);
    },
  });
  return {
    waiting: Boolean(jobId) && job.status !== "failed",
    error,
    start: (id: string) => {
      setError(undefined);
      setJobId(id);
    },
    clearError: () => setError(undefined),
  };
}
