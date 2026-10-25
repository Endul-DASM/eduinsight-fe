"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { primaryButtonClassName } from "@/components/auth/styles";
import { greyButtonClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import { useAiJob } from "@/lib/ai-job";
import { generateQuestionsAction, refreshAssessmentAction } from "@/lib/actions/assessments";
import type { AssessmentDetail, BloomLevel, LearningObjectiveRef } from "@/lib/api/types";
import {
  bloomLevels,
  type BuilderMethod,
  builderPath,
  type CreatableQuestionType,
  MAX_AI_QUESTIONS,
  questionTypeOptions,
} from "@/lib/assessment-form";
import { Field, FormMessage, TextInput } from "./builder-fields";
import { BuilderWait } from "./builder-shell";

// Langkah 2 AI Generated (Figma New Design 60:4677; FR-G-045, FR-G-047): which question types, how many of each,
// and the Bloom level. The backend writes the drafts from the assessment's TPs and the teacher's indexed material in
// a job; this page follows the job and opens Review, where the drafts wait for ACC, once it is done.
export function AiStep({
  slug,
  method,
  assessment,
  uncoveredObjectives = [],
}: {
  slug: string;
  method: BuilderMethod;
  assessment: AssessmentDetail;
  // TPs with no extracted material in their Bab or mapped to them: the AI cannot write questions for them (SOAL-H01).
  uncoveredObjectives?: LearningObjectiveRef[];
}) {
  const blocked = uncoveredObjectives.length > 0;
  const id = useId();
  const [types, setTypes] = useState<Set<CreatableQuestionType>>(new Set(["pg"]));
  const [counts, setCounts] = useState<Record<CreatableQuestionType, string>>({ pg: "", benar_salah: "" });
  const [bloom, setBloom] = useState<BloomLevel>("C1");
  const [message, setMessage] = useState<string>();
  const [jobId, setJobId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const job = useAiJob(jobId, {
    onDone: async () => {
      await refreshAssessmentAction(slug, assessment.id);
      router.push(builderPath(slug, assessment.id, method, "review"));
    },
    onFailed: (failure) => {
      setJobId(null);
      setMessage(`${failure} Anda tetap bisa mengetik soal sendiri atau memakai Template.`);
    },
  });

  function toggle(type: CreatableQuestionType) {
    setTypes((current) => {
      const next = new Set(current);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
    setMessage(undefined);
  }

  function preview() {
    setMessage(undefined);
    const count = (type: CreatableQuestionType) => (types.has(type) ? Number(counts[type] || 0) : 0);
    if (types.size === 0) return setMessage("Pilih minimal satu jenis soal.");
    for (const type of types) {
      const value = Number(counts[type] || 0);
      if (!Number.isInteger(value) || value < 1) return setMessage("Isi jumlah soal tiap jenis yang dipilih.");
    }
    if (count("pg") + count("benar_salah") > MAX_AI_QUESTIONS) {
      return setMessage(`Paling banyak ${MAX_AI_QUESTIONS} soal sekali buat. Tambah lagi setelahnya bila perlu.`);
    }
    startTransition(async () => {
      const result = await generateQuestionsAction(slug, assessment.id, {
        learningObjectiveIds: assessment.learningObjectives.map((objective) => objective.id),
        counts: { pg: count("pg"), benarSalah: count("benar_salah") },
        bloomLevel: bloom,
      });
      if (result.status === "error") setMessage(result.message);
      else setJobId(result.jobId);
    });
  }

  if (jobId && job.status !== "failed") {
    return (
      <BuilderWait
        description="Sekitar setengah menit untuk tiap 5 soal. Halaman ini boleh ditutup; notifikasi dikirim saat soal siap ditinjau."
        title="AI sedang menyusun soal dari materi Anda..."
      />
    );
  }

  const bloomIndex = bloomLevels.findIndex((level) => level.value === bloom);

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-xs font-semibold leading-normal text-[#1b1b1d]">Jenis soal</legend>
        <div className="grid gap-x-2 gap-y-3 sm:grid-cols-3">
          {questionTypeOptions.map((option) => {
            const checked = types.has(option.value);
            return (
              <label
                className={cn(
                  "flex h-[50px] cursor-pointer items-center gap-3 rounded-xl border bg-[#fbf8fa] px-[13px] text-base leading-normal text-[#1b1b1d]",
                  checked ? "border-[#0058be]" : "border-[#c5c6cd]",
                )}
                key={option.value}
              >
                <input
                  checked={checked}
                  className="size-5 shrink-0 accent-[#0058be]"
                  onChange={() => toggle(option.value)}
                  type="checkbox"
                />
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {questionTypeOptions
        .filter((option) => types.has(option.value))
        .map((option) => (
          <Field htmlFor={`${id}-${option.value}`} key={option.value} label={`Jumlah Soal ${option.label}`}>
            <TextInput
              id={`${id}-${option.value}`}
              inputMode="numeric"
              onChange={(event) =>
                setCounts((current) => ({ ...current, [option.value]: event.target.value.replace(/\D/g, "") }))
              }
              placeholder="Masukkan Jumlah Soal"
              value={counts[option.value]}
            />
          </Field>
        ))}

      <fieldset className="flex flex-col gap-3 rounded-xl border border-[#c5c6cd] bg-[rgba(250,251,253,0.6)] px-3 py-3">
        <legend className="sr-only">Tentukan Level Bloom</legend>
        <p aria-hidden className="text-base leading-normal text-[#1b1b1d]">
          Tentukan Level Bloom
        </p>
        <div className="grid grid-cols-6 gap-0 overflow-hidden rounded-full bg-[#eef3fa]">
          {bloomLevels.map((level, index) => (
            <span className={cn("h-2", index <= bloomIndex ? "bg-[#0058be]" : "bg-transparent")} key={level.value} />
          ))}
        </div>
        <div className="grid grid-cols-6 text-center">
          {bloomLevels.map((level) => {
            const active = level.value === bloom;
            return (
              <label className="flex cursor-pointer flex-col items-center gap-1 rounded-lg py-1 hover:bg-[#e6eff9]" key={level.value}>
                <input
                  checked={active}
                  className="sr-only"
                  name={`${id}-bloom`}
                  onChange={() => setBloom(level.value)}
                  type="radio"
                />
                <span className={cn("text-xs font-semibold", active ? "text-[#0058be]" : "text-[#9aa1ae]")}>
                  {level.value}
                </span>
                <span className={cn("text-[10px] uppercase", active ? "text-[#1b1b1d]" : "text-[#9aa1ae]")}>
                  {level.label}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {blocked && (
        <FormMessage>
          Soal AI hanya bisa dibuat dari materi yang sesuai dengan TP.{" "}
          {uncoveredObjectives.map((objective) => `TP ${objective.number}`).join(", ")} belum punya materi. Unggah materi
          lalu petakan ke TP di{" "}
          <Link className="font-semibold underline" href={`/${slug}/curriculum?tab=materi`}>
            Kurikulum › Upload Materi
          </Link>
          , atau ketik soal sendiri.
        </FormMessage>
      )}
      {message && <FormMessage>{message}</FormMessage>}

      <div className="flex flex-wrap justify-end gap-3">
        <Link className={greyButtonClassName} href={`/${slug}/assessment?tab=daftar`}>
          Simpan Draft
        </Link>
        <button className={cn(primaryButtonClassName, "gap-3")} disabled={pending || blocked} onClick={preview} type="button">
          <Image alt="" height={24} src="/assessment/sparkle-light.svg" width={24} />
          {pending ? "Membuat soal..." : "Pratinjau Soal"}
        </button>
      </div>
    </div>
  );
}
