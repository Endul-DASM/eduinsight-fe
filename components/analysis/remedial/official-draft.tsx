"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { outlineButtonClassName } from "@/components/auth/styles";
import { cn } from "@/components/ui/cn";
import { useAiJob } from "@/lib/ai-job";
import { officialDraftAction, refreshRemedialAction } from "@/lib/actions/remedial";
import type { BloomLevel } from "@/lib/api/types";
import { bloomLevels, builderPath } from "@/lib/assessment-form";

const field = "h-[32px] rounded-lg border border-[#c5c6cd] bg-white px-2 text-xs text-[#1b1b1d]";

// Draf remedial resmi dengan AI (AI-14, FR-G-103): AI questions on the source's weak TPs, written into its draft
// official remedial (made if missing). Once done, the teacher reviews and approves them in the assessment's Review step.
export function OfficialDraft({ slug, sourceId }: { slug: string; sourceId: string }) {
  const router = useRouter();
  const [pg, setPg] = useState(10);
  const [uraian, setUraian] = useState(0);
  const [bloom, setBloom] = useState<BloomLevel>("C2");
  const [message, setMessage] = useState<string>();
  const [target, setTarget] = useState<{ jobId: string; assessmentId: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const job = useAiJob(target?.jobId ?? null, {
    onDone: async () => {
      const assessmentId = target?.assessmentId;
      await refreshRemedialAction(slug);
      setTarget(null);
      if (assessmentId) router.push(builderPath(slug, assessmentId, "ai", "review"));
    },
    onFailed: (failure) => {
      setTarget(null);
      setMessage(failure);
      router.refresh();
    },
  });
  const waiting = pending || (Boolean(target) && job.status !== "failed");

  function request() {
    setMessage(undefined);
    startTransition(async () => {
      const result = await officialDraftAction(sourceId, { pg, uraian }, bloom);
      if (result.status === "queued" && result.assessmentId) setTarget({ jobId: result.jobId, assessmentId: result.assessmentId });
      else if (result.status === "error") setMessage(result.message);
    });
  }

  if (waiting) {
    return (
      <p className="flex items-center gap-2 text-xs text-[#45474c]">
        <span className="size-4 animate-spin rounded-full border-2 border-[#99bce5] border-t-[#0058be]" role="status" />
        AI sedang menyusun soal remedial resmi; Review terbuka saat selesai.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 text-xs text-[#45474c]">
        <label className="flex items-center gap-1">
          PG
          <input className={cn(field, "w-14")} max={20} min={0} onChange={(e) => setPg(Number(e.target.value))} type="number" value={pg} />
        </label>
        <label className="flex items-center gap-1">
          Essay
          <input
            className={cn(field, "w-14")}
            max={20}
            min={0}
            onChange={(e) => setUraian(Number(e.target.value))}
            type="number"
            value={uraian}
          />
        </label>
        <select aria-label="Level kognitif" className={field} onChange={(e) => setBloom(e.target.value as BloomLevel)} value={bloom}>
          {bloomLevels.map((level) => (
            <option key={level.value} value={level.value}>
              {level.value} {level.label}
            </option>
          ))}
        </select>
      </div>
      {message && <p className="rounded-lg bg-[#ffdad6] px-3 py-2 text-xs text-[#93000a]">{message}</p>}
      <button className={cn(outlineButtonClassName, "gap-2 self-start px-3 py-1.5 text-xs")} onClick={request} type="button">
        <Image alt="" height={16} src="/assessment/sparkle.svg" width={16} />
        Buat draf soal dengan AI
      </button>
    </div>
  );
}
