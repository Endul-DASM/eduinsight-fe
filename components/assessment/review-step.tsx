"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { outlineButtonClassName, primaryButtonClassName } from "@/components/auth/styles";
import { ConfirmModal } from "@/components/curriculum/confirm-modal";
import { greyButtonClassName, iconButtonClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import { useAiJob } from "@/lib/ai-job";
import {
  approveQuestionAction,
  deleteAssessmentAction,
  generateQuestionsAction,
  publishAction,
  type PublishState,
  refreshAssessmentAction,
  rejectQuestionAction,
  removeQuestionAction,
  unpublishAction,
  variationAction,
} from "@/lib/actions/assessments";
import type { AssessmentDetail, BloomLevel, Question } from "@/lib/api/types";
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

const badgeClassName = "rounded-3xl px-2 py-0.5 text-[10px] font-semibold";
const textButtonClassName =
  "rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

// What Regenerate Semua asks for: as many questions of each type as the AI drafts still waiting, at the level of the
// latest one, on their TPs (FR-G-046).
function regenerateInput(assessment: AssessmentDetail, drafts: Question[]) {
  const targets = new Set(assessment.learningObjectives.map((objective) => objective.id));
  const used = new Set(drafts.flatMap((draft) => draft.learningObjectives.map((objective) => objective.id)));
  const ids = [...used].filter((id) => targets.has(id));
  return {
    learningObjectiveIds: ids.length > 0 ? ids : [...targets],
    counts: {
      pg: drafts.filter((draft) => draft.type === "pg").length,
      uraian: drafts.filter((draft) => draft.type === "uraian").length,
    },
    bloomLevel: (drafts.at(-1)?.bloomLevel ?? "C2") as BloomLevel,
    replacePending: true,
  };
}

// Langkah 3 Review (Figma New Design 61:5079, 61:7934): every question as students will see it, the summary, and
// publishing (FR-G-050, FR-G-051). AI drafts wait here for the teacher's ACC (FR-X-010 – 012), and can be varied or
// regenerated (FR-G-046). A published assessment is shown read-only.
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
  const [rejecting, setRejecting] = useState<Question | null>(null);
  const [aiJobId, setAiJobId] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string>();
  const aiJob = useAiJob(aiJobId, {
    onDone: async () => {
      await refreshAssessmentAction(slug, assessment.id);
      setAiJobId(null);
      router.refresh();
    },
    onFailed: (message) => {
      setAiJobId(null);
      setAiMessage(message);
    },
  });
  const aiBusy = Boolean(aiJobId) && aiJob.status !== "failed";
  const waitingDrafts = assessment.questions.filter(
    (question) => question.origin === "ai" && question.status === "pending_review",
  );

  function queue(request: () => Promise<{ status: "queued"; jobId: string } | { status: "error"; message: string }>) {
    setAiMessage(undefined);
    startTransition(async () => {
      const result = await request();
      if (result.status === "queued") setAiJobId(result.jobId);
      else setAiMessage(result.message);
    });
  }

  function approve(question: Question) {
    setAiMessage(undefined);
    startTransition(async () => {
      const result = await approveQuestionAction(slug, assessment.id, question.id);
      if (result.status === "error") setAiMessage(result.message);
    });
  }

  function confirmReject() {
    if (!rejecting) return;
    const remaining = assessment.questions.filter((question) => question.id !== rejecting.id).map((question) => question.id);
    setRemoveError(undefined);
    startTransition(async () => {
      const result = await rejectQuestionAction(slug, assessment.id, rejecting.id, remaining);
      if (result.status === "saved") setRejecting(null);
      else setRemoveError(result.message);
    });
  }

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

  // AI drafts are edited in the typed-question editor, which shows every question of the assessment.
  const editHref = builderPath(slug, assessment.id, method === "ai" ? "ketik" : method, "soal");

  return (
    <div className="flex flex-col gap-6">
      {!draft && (
        <InfoMessage>
          Asesmen ini sudah dipublikasikan ({assessmentStatusLabels[assessment.status]}) sehingga tidak dapat diubah.
          {assessment.status === "scheduled" && " Batalkan publikasi untuk mengubahnya sebelum jadwal buka."}
        </InfoMessage>
      )}

      {draft && (aiBusy || aiMessage || waitingDrafts.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#c5c6cd] bg-[rgba(250,251,253,0.6)] px-4 py-3">
          <p className="text-sm leading-normal text-[#1b1b1d]">
            {aiBusy
              ? "AI sedang menyusun soal dari materi Anda..."
              : `${waitingDrafts.length} soal AI menunggu ACC. Tinjau dan ubah bila perlu, lalu setujui sebelum publikasi.`}
          </p>
          {!aiBusy && waitingDrafts.length > 0 && (
            <button
              className={cn(outlineButtonClassName, "gap-2")}
              disabled={pending}
              onClick={() => queue(() => generateQuestionsAction(slug, assessment.id, regenerateInput(assessment, waitingDrafts)))}
              type="button"
            >
              <Image alt="" height={20} src="/assessment/sparkle.svg" width={20} />
              Regenerate Semua
            </button>
          )}
          {aiMessage && (
            <div className="w-full">
              <FormMessage>{aiMessage}</FormMessage>
            </div>
          )}
        </div>
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
                    {question.status === "pending_review" && (
                      <>
                        <button
                          className={cn(textButtonClassName, "bg-[#0058be] text-white hover:bg-[#004695]")}
                          disabled={pending || aiBusy}
                          onClick={() => approve(question)}
                          type="button"
                        >
                          ACC
                        </button>
                        <button
                          className={cn(textButtonClassName, "text-[#dc2626] hover:bg-[#ffeded]")}
                          disabled={pending || aiBusy}
                          onClick={() => setRejecting(question)}
                          type="button"
                        >
                          Tolak
                        </button>
                      </>
                    )}
                    {question.origin === "ai" && question.learningObjectives.length > 0 && (
                      <button
                        className={cn(textButtonClassName, "text-[#0058be] hover:bg-[#e6eff9]")}
                        disabled={pending || aiBusy}
                        onClick={() => queue(() => variationAction(slug, assessment.id, question.id))}
                        title="Buat soal setara dengan konteks berbeda"
                        type="button"
                      >
                        Buat Variasi
                      </button>
                    )}
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
                <>
                  {question.origin === "ai" && (
                    <span className={cn(badgeClassName, "bg-[#e6eff9] text-[#004695]")} title="Dibuat dengan AI">
                      AI
                    </span>
                  )}
                  {question.status === "pending_review" && (
                    <span className={cn(badgeClassName, "bg-[rgba(254,215,170,0.6)] text-[#c2410c]")}>Menunggu ACC</span>
                  )}
                  {question.keyCheck === "mismatch" && (
                    <span
                      className={cn(badgeClassName, "bg-[#ffeded] text-[#dc2626]")}
                      title="Pemeriksaan ulang AI memilih jawaban lain. Periksa kunci jawabannya."
                    >
                      Perlu cek kunci
                    </span>
                  )}
                </>
              }
              footer={
                question.explanation && (
                  <p className="rounded-xl bg-[#f4f6fa] px-[13px] py-3 text-sm leading-normal text-[#45474c]">
                    <span className="font-semibold text-[#1b1b1d]">Pembahasan: </span>
                    {question.explanation}
                  </p>
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
        description="Draf soal AI ini ditandai ditolak dan dikeluarkan dari asesmen. Catatannya tetap tersimpan."
        error={removeError}
        onClose={() => {
          setRejecting(null);
          setRemoveError(undefined);
        }}
        onConfirm={confirmReject}
        open={Boolean(rejecting)}
        pending={pending}
        title="Tolak draf soal ini?"
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
