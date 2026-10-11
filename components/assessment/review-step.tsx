"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { outlineButtonClassName, primaryButtonClassName } from "@/components/auth/styles";
import { ConfirmModal } from "@/components/curriculum/confirm-modal";
import { greyButtonClassName, iconButtonClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import {
  deleteAssessmentAction,
  publishAction,
  type PublishState,
  removeQuestionAction,
  unpublishAction,
} from "@/lib/actions/assessments";
import type { AssessmentDetail, Question } from "@/lib/api/types";
import { assessmentStatusLabels, type BuilderMethod, builderPath } from "@/lib/assessment-form";
import { claimPendingSummaryPreference, useSummaryPreference } from "@/lib/summary-preference";
import { AssessmentSummary } from "./assessment-summary";
import { FormMessage, InfoMessage } from "./builder-fields";
import { BuilderWait } from "./builder-shell";
import { QuestionCard } from "./question-card";

function Problems({ state }: { state: PublishState }) {
  if (state?.status !== "error") return null;
  return (
    <FormMessage>
      <p>{state.message}</p>
      {state.problems && state.problems.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {state.problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}
    </FormMessage>
  );
}

// Langkah 3 Review (Figma New Design 61:5079, 61:7934): every question as students will see it, the summary, and
// publishing (FR-G-050, FR-G-051). A published assessment is shown read-only.
export function ReviewStep({
  slug,
  method,
  assessment,
}: {
  slug: string;
  method: BuilderMethod;
  assessment: AssessmentDetail;
}) {
  const router = useRouter();
  const draft = assessment.status === "draft";
  const showSummary = useSummaryPreference(assessment.id);
  const [state, setState] = useState<PublishState>();
  const [removing, setRemoving] = useState<Question | null>(null);
  const [removeError, setRemoveError] = useState<string>();
  const [deleting, setDeleting] = useState(false);
  const [publishing, startPublish] = useTransition();
  const [pending, startTransition] = useTransition();

  // A choice of "Tampilkan Ringkasan" made before the draft existed now belongs to it.
  useEffect(() => claimPendingSummaryPreference(assessment.id), [assessment.id]);

  function publish() {
    setState(undefined);
    startPublish(async () => {
      const result = await publishAction(slug, assessment.id);
      if (result?.status === "saved") router.push(builderPath(slug, assessment.id, method, "selesai"));
      else setState(result);
    });
  }

  function confirmRemove() {
    if (!removing) return;
    const remaining = assessment.questions.filter((question) => question.id !== removing.id).map((question) => question.id);
    setRemoveError(undefined);
    startTransition(async () => {
      const result = await removeQuestionAction(slug, assessment.id, removing.id, remaining);
      if (result.status === "saved") setRemoving(null);
      else setRemoveError(result.message);
    });
  }

  if (publishing) return <BuilderWait description="Harap tunggu sebentar" title="Soal sedang dipublikasi..." />;

  const editHref = builderPath(slug, assessment.id, method, "soal");

  return (
    <div className="flex flex-col gap-6">
      {!draft && (
        <InfoMessage>
          Asesmen ini sudah dipublikasikan ({assessmentStatusLabels[assessment.status]}) sehingga tidak dapat diubah.
          {assessment.status === "scheduled" && " Batalkan publikasi untuk mengubahnya sebelum jadwal buka."}
        </InfoMessage>
      )}

      {assessment.questions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-[#c5c6cd] px-6 py-10 text-center">
          <p className="text-sm text-[#45474c]">Belum ada soal di asesmen ini.</p>
          {draft && (
            <Link className={outlineButtonClassName} href={editHref}>
              Tambah Soal
            </Link>
          )}
        </div>
      ) : (
        <div className="flex max-h-[720px] flex-col gap-4 overflow-y-auto pr-1">
          {assessment.questions.map((question, index) => (
            <QuestionCard
              actions={
                draft && (
                  <>
                    <Link aria-label={`Ubah soal ${index + 1}`} className={iconButtonClassName} href={editHref} title="Ubah soal">
                      <Image alt="" height={20} src="/curriculum/pencil.svg" width={20} />
                    </Link>
                    <button
                      aria-label={`Hapus soal ${index + 1}`}
                      className={iconButtonClassName}
                      onClick={() => setRemoving(question)}
                      title="Hapus soal"
                      type="button"
                    >
                      <Image alt="" height={20} src="/assessment/trash.svg" width={20} />
                    </button>
                  </>
                )
              }
              answer={question.answerKey}
              badge={
                question.status !== "approved" && (
                  <span className="rounded-3xl bg-[rgba(254,215,170,0.6)] px-2 py-0.5 text-[10px] font-semibold text-[#c2410c]">
                    Menunggu ACC
                  </span>
                )
              }
              chips={
                question.learningObjectives.length > 0
                  ? question.learningObjectives.map((objective) => `Berdasarkan TP ${objective.number}`)
                  : ["Belum ada TP"]
              }
              key={question.id}
              options={question.options}
              stem={question.stem}
              title={`Soal ${index + 1}`}
            />
          ))}
        </div>
      )}

      {showSummary && <AssessmentSummary assessment={assessment} />}

      <Problems state={state} />

      {draft ? (
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            className="mr-auto rounded-xl px-4 py-3 text-sm font-semibold text-[#dc2626] hover:bg-[#ffeded]"
            onClick={() => setDeleting(true)}
            type="button"
          >
            Hapus Draf
          </button>
          <Link className={greyButtonClassName} href={`/${slug}/assessment?tab=daftar`}>
            Simpan Draft
          </Link>
          <button
            className={primaryButtonClassName}
            disabled={assessment.questions.length === 0}
            onClick={publish}
            type="button"
          >
            Publikasikan
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap justify-end gap-3">
          {assessment.status === "scheduled" && (
            <button
              className={outlineButtonClassName}
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await unpublishAction(slug, assessment.id);
                  // Back to a draft, which would otherwise open at Spesifikasi when the URL has no step.
                  if (result?.status === "saved") router.replace(builderPath(slug, assessment.id, method, "review"));
                  else setState(result);
                })
              }
              type="button"
            >
              {pending ? "Membatalkan..." : "Batalkan Publikasi"}
            </button>
          )}
          <Link className={primaryButtonClassName} href={`/${slug}/assessment?tab=daftar`}>
            Kembali ke Daftar Asesmen
          </Link>
        </div>
      )}

      <ConfirmModal
        description="Soal dikeluarkan dari asesmen ini dan dihapus dari Bank Soal bila tidak dipakai asesmen lain."
        error={removeError}
        onClose={() => {
          setRemoving(null);
          setRemoveError(undefined);
        }}
        onConfirm={confirmRemove}
        open={Boolean(removing)}
        pending={pending}
        title="Apakah Anda yakin ingin menghapus soal ini?"
      />
      <ConfirmModal
        description={`Draf "${assessment.title}" akan dihapus permanen. Soal yang sudah dibuat tetap ada di Bank Soal.`}
        error={state?.status === "error" && deleting ? state.message : undefined}
        onClose={() => setDeleting(false)}
        onConfirm={() =>
          startTransition(async () => {
            const result = await deleteAssessmentAction(slug, assessment.id);
            if (result?.status === "error") setState(result);
          })
        }
        open={deleting}
        pending={pending}
        title="Apakah Anda yakin ingin menghapus draf asesmen ini?"
      />
    </div>
  );
}

// "Asesmen Berhasil Dipublikasi!" (Figma New Design 61:6911).
export function PublishDone({ slug }: { slug: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-2xl font-bold leading-normal text-[#1b1b1d]">Asesmen Berhasil Dipublikasi!</p>
      <p className="max-w-[300px] text-sm leading-normal text-[#1b1b1d]">
        Kembali ke Daftar Asesmen untuk melihat semua asesmen
      </p>
      <Link className={cn(primaryButtonClassName, "mt-2 w-full max-w-[308px] gap-3")} href={`/${slug}/assessment?tab=daftar`}>
        <span aria-hidden>←</span>
        Kembali ke Daftar Asesmen
      </Link>
    </div>
  );
}
