"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { outlineButtonClassName } from "@/components/auth/styles";
import { cn } from "@/components/ui/cn";
import { useAiJob } from "@/lib/ai-job";
import { refreshAnalysisAction, rootCauseAction } from "@/lib/actions/diagnosis";
import type { DiagnosisFilters, RootCauseNarrative as Narrative } from "@/lib/api/diagnosis";

// The AI reading of a misconception pattern (AI-10, FR-G-083): the top one on the Akar Masalah card, and any untagged
// one below it (UAT). The backend writes it
// from aggregates only (no student names), checks that every number in it comes from the data, and keeps it for the
// same scope and data. The pattern itself and its ranking stay rule-based (BR-06).
export function RootCauseNarrative({
  slug,
  subjectId,
  filters,
  narrative,
  rank = 1,
}: {
  slug: string;
  subjectId: string;
  filters: DiagnosisFilters;
  narrative: Narrative | null;
  rank?: number;
}) {
  const router = useRouter();
  const [jobId, setJobId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();
  const job = useAiJob(jobId, {
    onDone: async () => {
      await refreshAnalysisAction(slug);
      setJobId(null);
      router.refresh();
    },
    onFailed: (failure) => {
      setJobId(null);
      setMessage(failure);
    },
  });
  const waiting = pending || (Boolean(jobId) && job.status !== "failed");

  function request() {
    setMessage(undefined);
    startTransition(async () => {
      const result = await rootCauseAction(slug, subjectId, filters, rank);
      if (result.status === "queued") setJobId(result.jobId);
      else if (result.status === "ready") router.refresh();
      else setMessage(result.message);
    });
  }

  if (narrative) {
    return (
      <div className="flex flex-col gap-3 rounded-xl bg-[#e6eff9] px-4 py-3 text-sm leading-normal text-[#1b1b1d]">
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase text-[#004695]">
          <Image alt="" height={14} src="/assessment/sparkle.svg" width={14} />
          Penjelasan AI · indikasi, perlu validasi guru
        </p>
        <p className="font-semibold">{narrative.summary}</p>
        <div>
          <p className="text-xs font-semibold text-[#004695]">Kemungkinan penyebab</p>
          <p>{narrative.cause}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-[#004695]">Saran pembelajaran</p>
          <p>{narrative.suggestion}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-[#e6eff9] px-4 py-3 text-sm leading-normal text-[#004695]">
      <p>
        {waiting
          ? "AI sedang menyusun penjelasan akar masalah dari pola ini..."
          : "Minta AI menjelaskan kemungkinan penyebab pola ini dan saran pembelajarannya. AI hanya menerima jumlah dan persentase, soal, serta TP, tanpa nama siswa."}
      </p>
      {message && <p className="rounded-lg bg-[#ffdad6] px-3 py-2 text-[#93000a]">{message}</p>}
      {!waiting && (
        <button className={cn(outlineButtonClassName, "gap-2 self-start bg-white")} onClick={request} type="button">
          <Image alt="" height={20} src="/assessment/sparkle.svg" width={20} />
          Buat Penjelasan AI
        </button>
      )}
      {waiting && <span className="size-5 animate-spin rounded-full border-2 border-[#99bce5] border-t-[#0058be]" role="status" />}
    </div>
  );
}
