import Image from "next/image";
import Link from "next/link";
import { primaryButtonClassName } from "@/components/auth/styles";
import { ListHero } from "@/components/student/assessment/assessment-list-page";
import { ListControls } from "@/components/student/assessment/list-controls";
import { softButtonClassName } from "@/components/student/dashboard/student-dashboard-page";
import { cn } from "@/components/ui/cn";
import type { MyRemedial, StudentAssessment } from "@/lib/api/student";
import type { Subject } from "@/lib/api/types";
import { semesterOf, shortDate } from "@/lib/student-assessment";
import { formatPoints } from "@/lib/student-dashboard";
import {
  completion,
  doneCards,
  isActive,
  nextAssessment,
  remedialStatusLabels,
  topicOf,
  waitingReason,
} from "@/lib/student-remedial";

export type RemedialTab = "perlu" | "tuntas";

const card = "rounded-3xl bg-[#fafbfd] shadow-[0_8px_24px_rgba(0,0,0,0.08)]";
const chip = "rounded-3xl px-2 py-0.5 text-xs font-semibold";

const tabs = [
  { id: "perlu", label: "Perlu Remedial" },
  { id: "tuntas", label: "Sudah Tuntas" },
];

function BrainIcon() {
  return (
    <span className="grid size-24 shrink-0 place-items-center rounded-2xl bg-[#e6eff9] text-[#1b1b1d] max-sm:hidden">
      <Image alt="" height={48} src="/assessment/brain.svg" width={48} />
    </span>
  );
}

// Perlu Remedial: open the remedial assessment, or say what the student waits for.
function ActiveCard({ slug, remedial }: { slug: string; remedial: MyRemedial }) {
  const next = nextAssessment(remedial);
  const startable = next !== null && (next.openAttemptId !== null || next.canStart);
  const status = remedialStatusLabels[remedial.status];
  const materials = remedial.package?.materials ?? [];

  return (
    <li className={cn(card, "flex flex-col gap-4 p-6")}>
      <div className="flex flex-wrap items-center gap-6">
        <BrainIcon />
        <div className="flex min-w-0 flex-1 flex-col gap-2 leading-normal">
          <div className="flex flex-wrap items-center gap-3">
            <span className={cn(chip, status.className)}>{status.label}</span>
            {next && (
              <span className="text-xs text-[#45474c]">
                {next.status === "scheduled" ? `Dibuka: ${shortDate(next.opensAt)}` : `Batas waktu: ${shortDate(next.closesAt)}`}
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-[#1b1b1d]">{remedial.sourceAssessment.title}</p>
          <p className="text-base text-[#45474c]">Topik: {topicOf(remedial)}</p>
          <p className="text-xs text-[#45474c]">
            Skor tertinggi: {formatPoints(remedial.sourceScore)}/100, KKM {remedial.sourceAssessment.kkm}
            {remedial.cycle > 1 && `, siklus ${remedial.cycle}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* UAT REM-H05: the practice questions of the approved package have their own page. */}
          {(remedial.package?.practice.length ?? 0) > 0 && (
            <Link className={softButtonClassName} href={`/student/${slug}/remedial/latihan/${remedial.sourceAssessment.id}`}>
              Kerjakan Latihan
            </Link>
          )}
          {next && startable ? (
            <Link className={cn(primaryButtonClassName, "px-4 py-2.5")} href={`/student/${slug}/remedial/${next.id}`}>
              {next.openAttemptId ? "Lanjutkan" : "Kerjakan Sekarang"}
            </Link>
          ) : (
            <span aria-disabled className="cursor-not-allowed rounded-xl bg-[#c5c6cd] px-4 py-2.5 text-sm font-semibold text-[#45474c]">
              {next ? "Belum dibuka" : waitingReason(remedial)}
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-[#45474c]">
        Mulai dari materi yang belum kamu kuasai, lalu kerjakan evaluasi ulang untuk mencapai ketuntasan.
      </p>
      {!next && materials.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {materials.map((material) => (
            <a
              className={softButtonClassName}
              href={`/api/my-materials/${encodeURIComponent(material.id)}/file`}
              key={material.id}
              rel="noopener noreferrer"
              target="_blank"
            >
              Buka Materi: {material.title}
            </a>
          ))}
        </div>
      )}
    </li>
  );
}

// Sudah Tuntas: the final score after remedial (FR-S-051).
function TuntasCard({ remedial }: { remedial: MyRemedial }) {
  return (
    <li className={cn(card, "flex flex-wrap items-center gap-6 p-6")}>
      <BrainIcon />
      <div className="flex min-w-0 flex-1 flex-col gap-2 leading-normal">
        <span className={cn(chip, "self-start", remedialStatusLabels.tuntas.className)}>Tuntas</span>
        <p className="text-2xl font-bold text-[#1b1b1d]">{remedial.sourceAssessment.title}</p>
        <p className="text-base text-[#45474c]">Topik: {topicOf(remedial)}</p>
        <p className="text-xs text-[#45474c]">
          Skor awal {formatPoints(remedial.sourceScore)}/100, nilai akhir {formatPoints(remedial.finalScore)}/100, KKM{" "}
          {remedial.sourceAssessment.kkm}
        </p>
      </div>
    </li>
  );
}

// Daftar Remedial siswa (PRD S-REM-01, SRS FR-S-050, 051; Figma New Design 175:33620), for one subject.
export function RemedialListPage({
  slug,
  subject,
  studentName,
  remedials,
  assessments,
  tab,
  query,
}: {
  slug: string;
  subject: Subject;
  studentName: string;
  remedials: MyRemedial[];
  assessments: StudentAssessment[];
  tab: RemedialTab;
  query: string;
}) {
  const needle = query.trim().toLowerCase();
  const matches = (remedial: MyRemedial) =>
    !needle || `${remedial.sourceAssessment.title} ${topicOf(remedial)}`.toLowerCase().includes(needle);
  const active = remedials.filter(isActive);
  const shown = (tab === "tuntas" ? remedials.filter((remedial) => !isActive(remedial)) : active).filter(matches);
  const done = doneCards(remedials, assessments);
  const progress = completion(remedials, assessments);

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8">
      <ListHero
        description={`Tetap semangat, ${studentName}! Selesaikan remedial untuk meningkatkan pemahamanmu dan raih hasil maksimal di evaluasi mendatang.`}
        subject={subject}
        title={`Daftar Remedial Semester ${semesterOf()}`}
      />
      <div className="flex flex-wrap gap-2">
        <span className={cn(chip, "bg-[rgba(153,188,229,0.6)] text-[#004695]")}>
          Semester {semesterOf()} {subject.class.academicYear}
        </span>
        <span className={cn(chip, "bg-[#fee2e2] text-[#dc2626]")}>{active.length} perlu perhatian</span>
        <span className={cn(chip, "bg-[#dcfce7] text-[#166534]")}>{done.length} asesmen tuntas</span>
      </div>
      <ListControls placeholder="Cari asesmen atau TP..." query={query} tab={tab} tabs={tabs} />

      {shown.length === 0 ? (
        <p className={cn(card, "p-6 text-sm text-[#45474c]")}>
          {needle
            ? "Tidak ada remedial yang cocok dengan pencarian."
            : tab === "tuntas"
              ? "Belum ada remedial yang tuntas."
              : "Tidak ada remedial. Kamu sudah mencapai KKM di semua asesmen yang dinilai."}
        </p>
      ) : (
        <ul className="flex flex-col gap-6">
          {shown.map((remedial) =>
            tab === "tuntas" ? (
              <TuntasCard key={remedial.sourceAssessment.id} remedial={remedial} />
            ) : (
              <ActiveCard key={remedial.sourceAssessment.id} remedial={remedial} slug={slug} />
            ),
          )}
        </ul>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold leading-normal text-[#1b1b1d]">Asesmen yang sudah tuntas</h2>
        {done.length === 0 ? (
          <p className={cn(card, "p-6 text-sm text-[#45474c]")}>Belum ada asesmen yang tuntas di mapel ini.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {done.map((entry) => (
              <li className={cn(card, "flex flex-col gap-3 p-6")} key={entry.id}>
                <span className={cn(chip, "self-start", remedialStatusLabels.tuntas.className)}>Tuntas</span>
                <p className="text-base font-semibold text-[#1b1b1d]">{entry.title}</p>
                <p className="text-xs text-[#45474c]">{entry.note}</p>
                <p className="text-[28px] font-bold text-[#003264]">{formatPoints(entry.score)}/100</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {progress.total > 0 && (
        <section className={cn(card, "flex flex-col gap-4 p-6")}>
          <h2 className="text-2xl font-semibold leading-normal text-[#1b1b1d]">Persentase Ketuntasan</h2>
          <span className="h-2.5 rounded-full bg-[#e6eff9]">
            <span className="block h-full rounded-full bg-[#0058be]" style={{ width: `${progress.percent}%` }} />
          </span>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-base font-semibold text-[#1b1b1d]">
              {progress.percent}% selesai, {progress.done}/{progress.total} asesmen
            </p>
            <p className="text-xs font-semibold text-[#0058be]">
              {progress.done === progress.total
                ? `Semua tuntas, ${studentName}!`
                : progress.total - progress.done === 1
                  ? `Satu lagi, ${studentName}!`
                  : `${progress.total - progress.done} lagi, ${studentName}!`}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
