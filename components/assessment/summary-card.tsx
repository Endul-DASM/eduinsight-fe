"use client";

import Link from "next/link";
import { type FormEvent, useActionState } from "react";
import { outlineButtonClassName, primaryButtonClassName } from "@/components/subject-select/form-field";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { ClipboardIcon, SparkIcon } from "@/components/ui/icons";
import {
  deleteAssessmentAction,
  type PublishState,
  publishAction,
  unpublishAction,
} from "@/lib/actions/assessments";
import type { AssessmentDetail } from "@/lib/api/types";
import { AiRecommendationNote, TimerIcon } from "./assessment-mockup";
import { FormAlert } from "./form-controls";

const cognitiveTones = { LOTS: "bg-[#0058be]", MOTS: "bg-[#adc6ff]", HOTS: "bg-[#091426]" } as const;

function SummaryRow({
  icon: Icon,
  label,
  value,
  tone = "text-[#1b1b1d]",
}: {
  icon: typeof TimerIcon;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#c5c6cd] pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-3 text-sm text-[#45474c]">
        <Icon className="size-[18px]" />
        {label}
      </div>
      <span className={cn("text-sm", tone)}>{value}</span>
    </div>
  );
}

function numbers(list: number[]) {
  return list.join(", ");
}

function percent(count: number, total: number) {
  return total ? Math.round((count / total) * 100) : 0;
}

function StateMessage({ state }: { state: PublishState }) {
  if (state?.status !== "error") return null;
  return (
    <FormAlert>
      <p>{state.message}</p>
      {state.problems && state.problems.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {state.problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}
    </FormAlert>
  );
}

function DraftActions({ slug, assessmentId }: { slug: string; assessmentId: string }) {
  const [publishState, publish, publishing] = useActionState(publishAction.bind(null, slug, assessmentId), undefined);
  const [deleteState, remove, deleting] = useActionState(
    deleteAssessmentAction.bind(null, slug, assessmentId),
    undefined,
  );

  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm("Hapus draf asesmen ini? Tindakan ini tidak dapat dibatalkan.")) event.preventDefault();
  }

  return (
    <section className="space-y-3">
      <StateMessage state={publishState} />
      <StateMessage state={deleteState} />
      <form action={publish}>
        <button className={cn(primaryButtonClassName, "w-full")} disabled={publishing || deleting} type="submit">
          {publishing ? "Memeriksa..." : "Simpan & Publikasi"}
        </button>
      </form>
      <Link className={cn(outlineButtonClassName, "w-full")} href={`/${slug}/assessment`}>
        Simpan sebagai Draf
      </Link>
      <p className="text-[11px] leading-4 text-[#75777d]">
        Setiap langkah tersimpan sebagai draf saat Anda menekan Simpan.
      </p>
      <form action={remove} onSubmit={confirmDelete}>
        <button
          className="inline-flex w-full items-center justify-center rounded-lg px-6 py-2 text-sm font-semibold text-[#ba1a1a] transition-colors hover:bg-[#ffdad6] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={publishing || deleting}
          type="submit"
        >
          {deleting ? "Menghapus..." : "Hapus Draf"}
        </button>
      </form>
    </section>
  );
}

function PublishedActions({ slug, assessment }: { slug: string; assessment: AssessmentDetail }) {
  const [state, unpublish, pending] = useActionState(unpublishAction.bind(null, slug, assessment.id), undefined);

  return (
    <section className="space-y-3">
      <StateMessage state={state} />
      {assessment.status === "scheduled" ? (
        <form action={unpublish}>
          <button className={cn(outlineButtonClassName, "w-full")} disabled={pending} type="submit">
            {pending ? "Membatalkan..." : "Batalkan Publikasi"}
          </button>
        </form>
      ) : (
        <p className="text-xs leading-5 text-[#75777d]">
          Asesmen sudah dibuka untuk siswa, sehingga publikasinya tidak dapat dibatalkan.
        </p>
      )}
      <Link className={cn(outlineButtonClassName, "w-full")} href={`/${slug}/assessment`}>
        Kembali ke Daftar
      </Link>
    </section>
  );
}

// Ringkasan Asesmen (FR-G-044), computed by the backend from the current questions, plus the publish controls.
export function AssessmentSummaryCard({ slug, assessment }: { slug: string; assessment: AssessmentDetail }) {
  const { summary } = assessment;
  const tagged = summary.totalQuestions - summary.cognitiveLevels.unset;

  return (
    <Card className="rounded-[14px] shadow-none xl:col-span-4">
      <CardContent className="space-y-8 p-5">
        <section className="space-y-6">
          <h2 className="text-[16px] font-medium text-[#1b1b1d]">Ringkasan Asesmen</h2>
          <div className="space-y-5">
            <SummaryRow
              icon={ClipboardIcon}
              label="Total Soal"
              tone="text-[#2170e4]"
              value={`${summary.totalQuestions} Soal`}
            />
            <SummaryRow icon={TimerIcon} label="Estimasi Durasi" value={`${summary.estimatedMinutes} Menit`} />
            <SummaryRow
              icon={TimerIcon}
              label="Durasi Diatur"
              value={assessment.durationMinutes ? `${assessment.durationMinutes} Menit` : "Belum diisi"}
            />
          </div>
        </section>

        <section className="space-y-4 border-t border-[#c5c6cd] pt-6">
          <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#45474c]">Kisi-Kisi</h3>
          <div className="space-y-3 text-sm text-[#1b1b1d]">
            <div className="flex items-center justify-between">
              <span>Pilihan Ganda</span>
              <span className="text-[#5c6470]">{summary.byType.pg} soal</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Uraian</span>
              <span className="text-[#5c6470]">{summary.byType.uraian} soal</span>
            </div>
          </div>

          {summary.blueprint.length > 0 && (
            <ul className="space-y-3">
              {summary.blueprint.map((row) => (
                <li className="space-y-1" key={row.learningObjective.id}>
                  <p className="text-sm text-[#1b1b1d]">
                    {row.learningObjective.code && (
                      <span className="font-semibold">{row.learningObjective.code} </span>
                    )}
                    {row.learningObjective.description}
                    <span className="text-[#5c6470]"> · {row.questionCount} soal</span>
                  </p>
                  {!row.selected && <p className="text-[11px] text-[#c2410c]">Tidak termasuk TP yang dipilih.</p>}
                  <p className="pl-3 text-[11px] leading-4 text-[#75777d]">
                    {row.questionNumbers.length > 0 ? `Soal ${numbers(row.questionNumbers)}` : "Belum ada soal."}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <div className="rounded-[10px] bg-[#f5f3f4] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm text-[#1b1b1d]">
              <SparkIcon className="size-3 text-[#1b1b1d]" />
              Distribusi Kognitif
            </div>
            <div className="flex h-2 overflow-hidden rounded-full bg-[#eae7e9]">
              {(["LOTS", "MOTS", "HOTS"] as const).map((level) => (
                <span
                  className={cognitiveTones[level]}
                  key={level}
                  style={{ width: `${percent(summary.cognitiveLevels[level], tagged)}%` }}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] text-[#75777d]">
              {(["LOTS", "MOTS", "HOTS"] as const).map((level) => (
                <span key={level}>
                  {level} ({percent(summary.cognitiveLevels[level], tagged)}%)
                </span>
              ))}
            </div>
            {summary.cognitiveLevels.unset > 0 && (
              <p className="mt-2 text-[10px] text-[#75777d]">
                {summary.cognitiveLevels.unset} soal belum memiliki level Bloom.
              </p>
            )}
          </div>
        </section>

        {(summary.untaggedQuestionNumbers.length > 0 || summary.unreviewedQuestionNumbers.length > 0) && (
          <section className="space-y-2 rounded-[10px] bg-[#fff7ed] p-4 text-xs leading-5 text-[#9a3412]">
            <p className="font-semibold">Perlu diperbaiki sebelum publikasi</p>
            {summary.untaggedQuestionNumbers.length > 0 && (
              <p>Soal tanpa TP: {numbers(summary.untaggedQuestionNumbers)}</p>
            )}
            {summary.unreviewedQuestionNumbers.length > 0 && (
              <p>Soal belum ditinjau: {numbers(summary.unreviewedQuestionNumbers)}</p>
            )}
          </section>
        )}

        {assessment.status === "draft" ? (
          <DraftActions assessmentId={assessment.id} slug={slug} />
        ) : (
          <PublishedActions assessment={assessment} slug={slug} />
        )}

        <section className="border-t border-[#c5c6cd] pt-6">
          <AiRecommendationNote />
        </section>
      </CardContent>
    </Card>
  );
}
