"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { outlineButtonClassName, primaryButtonClassName } from "@/components/auth/styles";
import { redOutlineButtonClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import { useAiJob } from "@/lib/ai-job";
import {
  approveGroupAction,
  deleteRemedialItemAction,
  generateGroupsAction,
  practiceAction,
  refreshRemedialAction,
  rejectGroupAction,
  type RemedialActionResult,
  setGroupMaterialsAction,
  setGroupStudentsAction,
} from "@/lib/actions/remedial";
import type { RemedialGroup, RemedialGroups } from "@/lib/api/remedial";
import type { MaterialReference } from "@/lib/remedial";
import { levelLabels } from "@/lib/remedial-figures";

const card = "flex flex-col gap-4 rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]";
const chip = "whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-semibold";
const subhead = "text-xs font-semibold text-[#1b1b1d]";
const select = "h-[32px] rounded-lg border border-[#c5c6cd] bg-white px-2 text-xs text-[#1b1b1d] disabled:opacity-60";
const smallButton = "px-3 py-1.5 text-xs";

const approvalLabels = {
  pending: { label: "Menunggu ACC", className: "bg-[#ffedd5] text-[#9a3412]" },
  approved: { label: "Disetujui", className: "bg-[#dcfce7] text-[#166534]" },
  rejected: { label: "Ditolak", className: "bg-[#ffdad6] text-[#93000a]" },
} as const;

type Run = (action: () => Promise<RemedialActionResult>) => void;

// Kelompok belajar (FR-G-101, 102, 104; AI-12, AI-13): the backend groups the targets by their TP scores and
// misconceptions and suggests the weak TPs' materials; the teacher moves students, edits the materials, asks AI for
// practice questions and approves each group. Nothing reaches the students before the group's ACC.
export function GroupsBoard({
  slug,
  sourceId,
  groups,
  references,
}: {
  slug: string;
  sourceId: string;
  groups: RemedialGroups;
  references: MaterialReference[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();
  const anyApproved = groups.groups.some((group) => group.approvalStatus === "approved");

  const run: Run = (action) => {
    setMessage(undefined);
    startTransition(async () => {
      const result = await action();
      if (result.status === "error") setMessage(result.message);
      else router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {message && <p className="rounded-lg bg-[#ffdad6] px-3 py-2 text-xs text-[#93000a]">{message}</p>}
      {groups.groups.length === 0 ? (
        <section className={cn(card, "items-start")}>
          <p className="text-xs leading-normal text-[#45474c]">
            Belum ada kelompok. Siswa target dikelompokkan menjadi Belum Paham, Paham Sebagian, dan Butuh Latihan berdasarkan nilai per
            TP dan pola miskonsepsinya, lalu tiap kelompok mendapat usulan materi dari TP yang belum tercapai.
          </p>
          <button
            className={cn(primaryButtonClassName, "gap-2 px-4 py-2 text-sm")}
            disabled={pending}
            onClick={() => run(() => generateGroupsAction(slug, sourceId))}
            type="button"
          >
            <Image alt="" height={20} src="/assessment/sparkle.svg" width={20} />
            Kelompokkan siswa
          </button>
        </section>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#45474c]">
            <span>
              Siklus {groups.cycle} · {groups.groups.length} kelompok
            </span>
            {!anyApproved && (
              <button
                className="font-semibold text-[#0058be] hover:underline disabled:opacity-60"
                disabled={pending}
                onClick={() => run(() => generateGroupsAction(slug, sourceId))}
                type="button"
              >
                Kelompokkan ulang
              </button>
            )}
          </div>
          {groups.ungrouped.length > 0 && (
            <p className="rounded-xl bg-[#e6eff9] px-4 py-3 text-xs text-[#1b1b1d]">
              Belum masuk kelompok: {groups.ungrouped.map((student) => student.name).join(", ")}. Pindahkan lewat kartu kelompok, atau
              kelompokkan ulang selama belum ada yang di-ACC.
            </p>
          )}
          <div className="grid gap-4 xl:grid-cols-2">
            {groups.groups.map((group) => (
              <GroupCard
                busy={pending}
                group={group}
                groups={groups}
                key={group.id}
                onError={setMessage}
                references={references}
                run={run}
                slug={slug}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function GroupCard({
  slug,
  group,
  groups,
  references,
  busy,
  run,
  onError,
}: {
  slug: string;
  group: RemedialGroup;
  groups: RemedialGroups;
  references: MaterialReference[];
  busy: boolean;
  run: Run;
  onError: (message: string) => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const locked = group.approvalStatus === "approved";
  const approval = approvalLabels[group.approvalStatus];
  const materials = group.items.flatMap((item) => (item.kind === "materi" ? [item.material] : []));
  const practice = group.items.flatMap((item) => (item.kind === "latihan" && item.question ? [{ id: item.id, question: item.question }] : []));
  const materialIds = materials.map((material) => material.id);
  const addable = [
    ...new Map(references.flatMap((reference) => reference.materials).map((material) => [material.id, material])).values(),
  ].filter((material) => !materialIds.includes(material.id));
  const others = groups.groups.filter((other) => other.id !== group.id && other.approvalStatus !== "approved");
  const disabled = busy || locked;

  function moveTo(studentId: string, targetId: string) {
    const target = groups.groups.find((other) => other.id === targetId);
    if (!target) return;
    run(() => setGroupStudentsAction(slug, target.id, [...target.students.map((student) => student.id), studentId]));
  }

  return (
    <section className={card}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-base font-semibold text-[#1b1b1d]">{levelLabels[group.level]}</h4>
        <div className="flex flex-wrap gap-2">
          <span className={cn(chip, "bg-[#e6eff9] text-[#0058be]")}>{group.method === "kmeans" ? "K-Means" : "Aturan skor"}</span>
          {group.autoGenerated && <span className={cn(chip, "bg-[#e6eff9] text-[#0058be]")}>Otomatis</span>}
          <span className={cn(chip, approval.className)}>{approval.label}</span>
        </div>
      </div>
      {group.approvalStatus === "rejected" && group.reviewNote && (
        <p className="rounded-lg bg-[#ffdad6] px-3 py-2 text-xs text-[#93000a]">Catatan: {group.reviewNote}</p>
      )}

      <div className="flex flex-col gap-2">
        <p className={subhead}>Siswa ({group.students.length})</p>
        {group.students.length === 0 ? (
          <p className="text-xs text-[#75777d]">Belum ada siswa.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {group.students.map((student) => (
              <li className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#1b1b1d]" key={student.id}>
                {student.name}
                {!locked && others.length > 0 && (
                  <select
                    aria-label={`Pindahkan ${student.name}`}
                    className={select}
                    disabled={disabled}
                    onChange={(event) => moveTo(student.id, event.target.value)}
                    value=""
                  >
                    <option value="">Pindah ke…</option>
                    {others.map((other) => (
                      <option key={other.id} value={other.id}>
                        {levelLabels[other.level]}
                      </option>
                    ))}
                  </select>
                )}
              </li>
            ))}
          </ul>
        )}
        {!locked && groups.ungrouped.length > 0 && (
          <select
            aria-label={`Tambah siswa ke ${levelLabels[group.level]}`}
            className={cn(select, "self-start")}
            disabled={disabled}
            onChange={(event) =>
              event.target.value &&
              run(() => setGroupStudentsAction(slug, group.id, [...group.students.map((student) => student.id), event.target.value]))
            }
            value=""
          >
            <option value="">+ Tambah siswa…</option>
            {groups.ungrouped.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {group.weakObjectives.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className={subhead}>TP yang belum tercapai</p>
          <p className="text-xs leading-normal text-[#45474c]">
            {group.weakObjectives.map((weak) => `TP ${weak.learningObjective.number}`).join(", ")}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className={subhead}>Materi ({materials.length})</p>
        {materials.length === 0 && <p className="text-xs text-[#75777d]">Belum ada materi.</p>}
        <ul className="flex flex-col gap-1.5">
          {materials.map((material) => (
            <li className="flex items-start justify-between gap-2 text-xs" key={material.id}>
              <a className="font-semibold text-[#0058be] hover:underline" href={`/api/materials/${material.id}/file`} rel="noopener" target="_blank">
                {material.title} ↗
              </a>
              {!locked && (
                <button
                  aria-label={`Hapus ${material.title}`}
                  className="text-[#dc2626] hover:underline disabled:opacity-60"
                  disabled={disabled}
                  onClick={() => run(() => setGroupMaterialsAction(slug, group.id, materialIds.filter((id) => id !== material.id)))}
                  type="button"
                >
                  Hapus
                </button>
              )}
            </li>
          ))}
        </ul>
        {!locked && addable.length > 0 && (
          <select
            aria-label="Tambah materi"
            className={cn(select, "self-start")}
            disabled={disabled}
            onChange={(event) => event.target.value && run(() => setGroupMaterialsAction(slug, group.id, [...materialIds, event.target.value]))}
            value=""
          >
            <option value="">+ Tambah materi…</option>
            {addable.map((material) => (
              <option key={material.id} value={material.id}>
                {material.title}
              </option>
            ))}
          </select>
        )}
      </div>

      <PracticeSection busy={busy} groupId={group.id} locked={locked} onError={onError} practice={practice} run={run} slug={slug} />

      {!locked && (
        <div className="mt-auto flex flex-col gap-2 border-t border-[#eae7e9] pt-3">
          {rejecting ? (
            <>
              <textarea
                aria-label="Catatan penolakan"
                className="min-h-[64px] rounded-xl border border-[#c5c6cd] bg-white p-3 text-xs outline-none focus:border-[#0058be]"
                maxLength={1000}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Catatan untuk perbaikan (opsional)"
                value={note}
              />
              <div className="flex justify-end gap-2">
                <button className={cn(outlineButtonClassName, smallButton)} onClick={() => setRejecting(false)} type="button">
                  Batal
                </button>
                <button
                  className={cn(redOutlineButtonClassName, smallButton)}
                  disabled={busy}
                  onClick={() => {
                    setRejecting(false);
                    run(() => rejectGroupAction(slug, group.id, note));
                  }}
                  type="button"
                >
                  Tolak
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {group.approvalStatus !== "rejected" && (
                <button className={cn(redOutlineButtonClassName, smallButton)} disabled={busy} onClick={() => setRejecting(true)} type="button">
                  Tolak
                </button>
              )}
              <button
                className={cn(primaryButtonClassName, smallButton)}
                disabled={busy || group.students.length === 0}
                onClick={() => run(() => approveGroupAction(slug, group.id))}
                type="button"
              >
                ACC paket
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// Soal latihan AI (AI-13, FR-G-102): drafts on the group's weak TPs aimed at its misconceptions, approved with the
// group. Students answer them as self-check and see the key and the explanation.
function PracticeSection({
  slug,
  groupId,
  practice,
  locked,
  busy,
  run,
  onError,
}: {
  slug: string;
  groupId: string;
  practice: { id: string; question: NonNullable<RemedialGroup["items"][number]["question"]> }[];
  locked: boolean;
  busy: boolean;
  run: Run;
  onError: (message: string) => void;
}) {
  const router = useRouter();
  const [count, setCount] = useState(5);
  const [jobId, setJobId] = useState<string | null>(null);
  const [requesting, startTransition] = useTransition();
  const job = useAiJob(jobId, {
    onDone: async () => {
      await refreshRemedialAction(slug);
      setJobId(null);
      router.refresh();
    },
    onFailed: (failure) => {
      setJobId(null);
      onError(failure);
    },
  });
  const waiting = requesting || (Boolean(jobId) && job.status !== "failed");

  function request() {
    startTransition(async () => {
      const result = await practiceAction(groupId, count, "C2");
      if (result.status === "queued") setJobId(result.jobId);
      else onError(result.message);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={subhead}>Soal latihan AI ({practice.length})</p>
        <span className="flex items-center gap-1 text-[10px] font-semibold uppercase text-[#004695]">
          <Image alt="" height={14} src="/assessment/sparkle.svg" width={14} />
          Draf AI, tampil setelah ACC
        </span>
      </div>
      {practice.length > 0 && (
        <ol className="flex flex-col gap-3">
          {practice.map(({ id, question }, index) => (
            <li className="flex flex-col gap-1 rounded-xl border border-[#eae7e9] bg-white p-3 text-xs leading-normal" key={id}>
              <div className="flex items-start justify-between gap-2">
                <p className="whitespace-pre-line text-[#1b1b1d]">
                  <span className="font-semibold">{index + 1}.</span> {question.stem}
                </p>
                {!locked && (
                  <button
                    aria-label={`Hapus soal latihan ${index + 1}`}
                    className="shrink-0 text-[#dc2626] hover:underline disabled:opacity-60"
                    disabled={busy || waiting}
                    onClick={() => run(() => deleteRemedialItemAction(slug, id))}
                    type="button"
                  >
                    Hapus
                  </button>
                )}
              </div>
              <ul className="flex flex-col gap-0.5 pl-4">
                {(question.options ?? []).map((option) => (
                  <li className={cn(option.key === question.answerKey ? "font-semibold text-[#166534]" : "text-[#45474c]")} key={option.key}>
                    {option.key}. {option.text}
                  </li>
                ))}
              </ul>
              {question.keyCheck === "mismatch" && (
                <span className={cn(chip, "self-start bg-[#ffedd5] text-[#9a3412]")}>Perlu cek kunci</span>
              )}
              {question.explanation && <p className="text-[#45474c]">Pembahasan: {question.explanation}</p>}
            </li>
          ))}
        </ol>
      )}
      {!locked &&
        (waiting ? (
          <p className="flex items-center gap-2 text-xs text-[#45474c]">
            <span className="size-4 animate-spin rounded-full border-2 border-[#99bce5] border-t-[#0058be]" role="status" />
            AI sedang menyusun soal latihan...
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-[#45474c]">
              Jumlah
              <input
                className="h-[32px] w-16 rounded-lg border border-[#c5c6cd] bg-white px-2 text-xs"
                max={10}
                min={1}
                onChange={(event) => setCount(Number(event.target.value))}
                type="number"
                value={count}
              />
            </label>
            <button className={cn(outlineButtonClassName, "gap-2", smallButton)} disabled={busy} onClick={request} type="button">
              <Image alt="" height={16} src="/assessment/sparkle.svg" width={16} />
              {practice.length > 0 ? "Buat ulang soal latihan" : "Buat soal latihan"}
            </button>
          </div>
        ))}
    </div>
  );
}
