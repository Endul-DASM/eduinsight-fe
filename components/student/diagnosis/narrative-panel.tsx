"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { outlineButtonClassName } from "@/components/auth/styles";
import { cn } from "@/components/ui/cn";
import { useAiJob } from "@/lib/ai-job";
import { myNarrativeAction, refreshMyDiagnosisAction } from "@/lib/actions/student-diagnosis";
import type { MyObjectiveDiagnosis } from "@/lib/api/student";

// "Penjelasan untukmu" (AI-11, FR-S-041): for each TP at Cukup or Kurang, where the mistakes likely are and one study
// tip. Written by AI from the student's own graded answers only; the teacher sees the same text.
export function NarrativePanel({
  slug,
  subjectId,
  objectives,
}: {
  slug: string;
  subjectId: string;
  // The Cukup/Kurang TPs.
  objectives: MyObjectiveDiagnosis[];
}) {
  const router = useRouter();
  const [jobId, setJobId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();
  const job = useAiJob(jobId, {
    onDone: async () => {
      await refreshMyDiagnosisAction(slug);
      setJobId(null);
      router.refresh();
    },
    onFailed: (failure) => {
      setJobId(null);
      setMessage(failure);
    },
  });
  if (objectives.length === 0) return null;
  const waiting = pending || (Boolean(jobId) && job.status !== "failed");
  const written = objectives.every((objective) => objective.narrative);

  function request() {
    setMessage(undefined);
    startTransition(async () => {
      const result = await myNarrativeAction(slug, subjectId);
      if (result.status === "queued") setJobId(result.jobId);
      else if (result.status === "ready") router.refresh();
      else setMessage(result.message);
    });
  }

  return (
    <section className="flex break-inside-avoid flex-col gap-4 rounded-3xl border border-[#c5c6cd] bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold leading-normal text-[#1b1b1d]">Penjelasan untukmu</h2>
        <span className="flex items-center gap-1 text-[10px] font-semibold uppercase text-[#004695]">
          <Image alt="" height={14} src="/assessment/sparkle.svg" width={14} />
          Penjelasan AI dari jawabanmu
        </span>
      </div>

      {written ? (
        <ul className="flex flex-col gap-4">
          {objectives.map((objective) => (
            <li className="flex flex-col gap-1 leading-normal" key={objective.learningObjective.id}>
              <p className="text-sm font-semibold text-[#1b1b1d]">
                TP {objective.learningObjective.number} {objective.learningObjective.description}
              </p>
              <p className="text-sm text-[#45474c]">{objective.narrative?.explanation}</p>
              <p className="rounded-xl bg-[#e6eff9] px-3 py-2 text-sm text-[#004695]">
                <span className="font-semibold">Tips belajar: </span>
                {objective.narrative?.tip}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col gap-3 text-sm leading-normal text-[#45474c]">
          <p>
            {waiting
              ? "Sebentar, AI sedang membaca jawabanmu..."
              : `Ada ${objectives.length} TP yang masih bisa kamu tingkatkan. Minta penjelasan letak kesalahanmu dan tips belajarnya.`}
          </p>
          {message && <p className="rounded-lg bg-[#ffdad6] px-3 py-2 text-[#93000a]">{message}</p>}
          {waiting ? (
            <span className="size-5 animate-spin rounded-full border-2 border-[#99bce5] border-t-[#0058be]" role="status" />
          ) : (
            <button className={cn(outlineButtonClassName, "gap-2 self-start")} onClick={request} type="button">
              <Image alt="" height={20} src="/assessment/sparkle.svg" width={20} />
              Jelaskan letak kesalahanku
            </button>
          )}
        </div>
      )}
    </section>
  );
}
