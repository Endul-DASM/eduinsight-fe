import Image from "next/image";
import Link from "next/link";
import { primaryButtonClassName } from "@/components/auth/styles";
import { cn } from "@/components/ui/cn";
import type { ActivityStatus, StudentAssessment } from "@/lib/api/student";
import type { Subject } from "@/lib/api/types";
import { formatPoints } from "@/lib/student-dashboard";
import {
  cardState,
  cardStateLabels,
  isDone,
  resultState,
  resultStateLabels,
  semesterOf,
  shortDate,
  topicOf,
} from "@/lib/student-assessment";
import { type AssessmentTab, ListControls } from "./list-controls";

const card = "rounded-3xl bg-[#fafbfd] shadow-[0_8px_24px_rgba(0,0,0,0.08)]";
const chip = "rounded-3xl px-2 py-0.5 text-xs font-semibold";

function Hero({ subject, studentName }: { subject: Subject; studentName: string }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(125deg,#ffffff_8%,#99bce5_132%)] shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <Image
        alt=""
        aria-hidden
        className="pointer-events-none absolute -top-4 right-[-76px] hidden lg:block"
        height={104}
        src="/dashboard/cloud-front.svg"
        width={216}
      />
      <div className="relative flex flex-col gap-6 px-6 py-8 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="max-w-[720px]">
          <h2 className="text-2xl font-bold leading-normal text-[#1b1b1d] sm:text-[32px]">Daftar Asesmen Semester {semesterOf()}</h2>
          <p className="text-base leading-normal text-[#45474c]">
            Tetap semangat, {studentName}! Lihat hasil asesmenmu dan lanjutkan evaluasi untuk memperkuat pemahamanmu.
          </p>
        </div>
        <div className="flex min-w-[230px] flex-col gap-1.5 rounded-3xl bg-[rgba(245,243,244,0.6)] p-6 text-[#003264]">
          <p className="text-2xl font-bold leading-normal">{subject.name}</p>
          <p className="whitespace-pre-wrap text-base leading-normal">
            {subject.class.name}
            {"  |  "}
            {subject.class.academicYear}
          </p>
        </div>
      </div>
    </section>
  );
}

function ClipboardIcon() {
  return (
    <span className="grid size-24 shrink-0 place-items-center rounded-2xl bg-[#e6eff9] max-sm:hidden">
      <Image alt="" height={44} src="/student/clipboard-check.svg" width={44} />
    </span>
  );
}

// Belum Dikerjakan: start, resume, or why it cannot be started yet.
function PendingCard({ slug, assessment }: { slug: string; assessment: StudentAssessment }) {
  const state = cardState(assessment);
  const label = cardStateLabels[state];
  const href = `/student/${slug}/assessment/${assessment.id}`;
  const actionable = state === "available" || state === "resume";

  return (
    <li className={cn(card, "flex flex-wrap items-center gap-6 p-6")}>
      <ClipboardIcon />
      <div className="flex min-w-0 flex-1 flex-col gap-2 leading-normal">
        <div className="flex flex-wrap items-center gap-3">
          <span className={cn(chip, label.className)}>{label.label}</span>
          <span className="text-xs text-[#45474c]">
            {state === "not_opened" ? `Dibuka: ${shortDate(assessment.opensAt)}` : `Batas waktu: ${shortDate(assessment.closesAt)}`}
          </span>
        </div>
        <p className="text-2xl font-bold text-[#1b1b1d]">{assessment.title}</p>
        <p className="text-base text-[#45474c]">Topik: {topicOf(assessment)}</p>
      </div>
      {actionable ? (
        <Link className={cn(primaryButtonClassName, "px-4 py-2.5")} href={href}>
          {state === "resume" ? "Lanjutkan" : "Kerjakan"}
        </Link>
      ) : (
        <span aria-disabled className="cursor-not-allowed rounded-xl bg-[#c5c6cd] px-4 py-2.5 text-base font-semibold text-[#45474c]">
          Kerjakan
        </span>
      )}
    </li>
  );
}

// Sudah Selesai: the result of the best attempt.
function DoneCard({ assessment, statuses }: { assessment: StudentAssessment; statuses: Map<string, ActivityStatus> }) {
  const state = resultStateLabels[resultState(assessment, statuses)];
  return (
    <li className={cn(card, "flex flex-wrap items-center gap-6 p-6")}>
      <ClipboardIcon />
      <div className="flex min-w-0 flex-1 flex-col gap-2 leading-normal">
        <span className={cn(chip, "self-start", state.className)}>{state.label}</span>
        <p className="text-2xl font-bold text-[#1b1b1d]">{assessment.title}</p>
        <p className="text-base text-[#45474c]">Topik: {topicOf(assessment)}</p>
        <p className="text-xs text-[#45474c]">
          {assessment.bestScore === null ? "Menunggu penilaian guru" : `Skor terakhir: ${formatPoints(assessment.bestScore)}/100`}
          {`, ${assessment.attemptsUsed} dari ${assessment.maxAttempts} percobaan`}
        </p>
      </div>
      <span
        aria-disabled
        className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-[#e3e2e6] px-4 py-2.5 text-sm font-semibold text-[#75777d]"
        title="Segera tersedia"
      >
        Lihat Diagnosis
        <span className="rounded-3xl bg-white/70 px-1.5 py-0.5 text-[10px] text-[#45474c]">Segera</span>
      </span>
    </li>
  );
}

// Daftar Asesmen siswa (PRD 6.2, SRS FR-G-051; Figma New Design 175:32308, 181:7800).
export function StudentAssessmentListPage({
  slug,
  subject,
  studentName,
  assessments,
  statuses,
  tab,
  query,
}: {
  slug: string;
  subject: Subject;
  studentName: string;
  assessments: StudentAssessment[];
  statuses: Map<string, ActivityStatus>;
  tab: AssessmentTab;
  query: string;
}) {
  const needle = query.trim().toLowerCase();
  const matches = (assessment: StudentAssessment) =>
    !needle || `${assessment.title} ${topicOf(assessment)}`.toLowerCase().includes(needle);
  const pending = assessments.filter((assessment) => !isDone(assessment));
  const done = assessments.filter(isDone);
  const shown = (tab === "selesai" ? done : pending).filter(matches);
  const attention = pending.filter((assessment) => ["available", "resume"].includes(cardState(assessment))).length;
  const passed = done.filter((assessment) => resultState(assessment, statuses) === "lulus").length;
  const graded = done.filter((assessment) => assessment.bestScore !== null);

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8">
      <Hero studentName={studentName} subject={subject} />
      <div className="flex flex-wrap gap-2">
        <span className={cn(chip, "bg-[rgba(153,188,229,0.6)] text-[#004695]")}>
          Semester {semesterOf()} {subject.class.academicYear}
        </span>
        <span className={cn(chip, "bg-[#ffedd5] text-[#9a3412]")}>{attention} perlu perhatian</span>
        <span className={cn(chip, "bg-[#dcfce7] text-[#166534]")}>{passed} asesmen tuntas</span>
      </div>
      <ListControls query={query} tab={tab} />

      {shown.length === 0 ? (
        <p className={cn(card, "p-6 text-sm text-[#45474c]")}>
          {needle
            ? "Tidak ada asesmen yang cocok dengan pencarian."
            : tab === "selesai"
              ? "Belum ada asesmen yang kamu selesaikan."
              : "Belum ada asesmen untuk dikerjakan. Asesmen muncul setelah gurumu mempublikasikannya."}
        </p>
      ) : (
        <ul className="flex flex-col gap-6">
          {shown.map((assessment) =>
            tab === "selesai" ? (
              <DoneCard assessment={assessment} key={assessment.id} statuses={statuses} />
            ) : (
              <PendingCard assessment={assessment} key={assessment.id} slug={slug} />
            ),
          )}
        </ul>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold leading-normal text-[#1b1b1d]">Hasil asesmenmu</h2>
        {graded.length === 0 ? (
          <p className={cn(card, "p-6 text-sm text-[#45474c]")}>Belum ada asesmen yang dinilai di mapel ini.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {graded.map((assessment) => {
              const state = resultState(assessment, statuses);
              const label = resultStateLabels[state];
              return (
                <li className={cn(card, "flex flex-col gap-3 p-6")} key={assessment.id}>
                  <span className={cn(chip, "self-start", label.className)}>{state === "lulus" ? "Tuntas" : label.label}</span>
                  <p className="text-base font-semibold text-[#1b1b1d]">{assessment.title}</p>
                  <p className="text-xs text-[#45474c]">
                    {state === "perlu_remedial" ? "Perlu remedial" : state === "lulus" ? "Asesmen tuntas" : "Sudah dinilai"}
                  </p>
                  <p className="text-[28px] font-bold text-[#003264]">{formatPoints(assessment.bestScore!)}/100</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
