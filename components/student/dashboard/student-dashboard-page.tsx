import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { outlineButtonClassName, primaryButtonClassName } from "@/components/auth/styles";
import { cn } from "@/components/ui/cn";
import { MaskIcon } from "@/components/ui/mask-icon";
import type { MyDashboard, StudentChapter } from "@/lib/api/student";
import type { Subject } from "@/lib/api/types";
import { assessmentTypeLabels, formatLongSchedule } from "@/lib/assessment-form";
import {
  activityStatusLabels,
  activityTime,
  activityTitle,
  classGap,
  formatPoints,
  formatSize,
  weakestChapter,
} from "@/lib/student-dashboard";

const card = "rounded-3xl bg-[#fafbfd] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)]";
const chip = "rounded-3xl px-2 py-0.5 text-xs font-semibold";
export const softButtonClassName =
  "rounded-xl bg-[rgba(153,188,229,0.6)] px-4 py-2.5 text-sm font-semibold text-[#004695] hover:bg-[rgba(153,188,229,0.85)]";

// A button to a page that is not built yet (Asesmen, Diagnosis, Remedial, riwayat lengkap).
function SoonButton({ label, className }: { label: string; className?: string }) {
  return (
    <span
      aria-disabled
      className={cn(
        "inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#e3e2e6] px-4 py-2.5 text-sm font-semibold text-[#75777d]",
        className,
      )}
      title="Segera tersedia"
    >
      {label}
      <span className="rounded-3xl bg-white/70 px-1.5 py-0.5 text-[10px] text-[#45474c]">Segera</span>
    </span>
  );
}

// The greeting card on top of the student pages, with the subject on the right (Figma New Design 175:32037, 175:33279).
export function SubjectHero({ subject, title, description }: { subject: Subject; title: string; description: string }) {
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
      <Image
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-[-15px] left-[54%] hidden lg:block"
        height={66}
        src="/dashboard/cloud-round.svg"
        width={119}
      />
      <div className="relative flex flex-col gap-6 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="max-w-[640px]">
          <p className="text-2xl font-bold leading-normal text-[#1b1b1d] sm:text-[32px]">{title}</p>
          <p className="text-base leading-normal text-[#45474c]">{description}</p>
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

function Hero({ subject, studentName, chapters }: { subject: Subject; studentName: string; chapters: StudentChapter[] }) {
  const weakest = weakestChapter(chapters);
  return (
    <SubjectHero
      description={
        !weakest
          ? `Kerjakan asesmen ${subject.name} untuk melihat perkembangan belajarmu di sini.`
          : weakest.label === "sb" || weakest.label === "b"
            ? "Hebat! Semua Bab yang sudah dinilai kamu kuasai dengan baik. Pertahankan semangatmu!"
            : `Lanjutkan semangatmu untuk menguasai Bab ${weakest.number}: ${weakest.name}!`
      }
      subject={subject}
      title={`Halo, ${studentName}! Siap untuk belajar?`}
    />
  );
}

function StatCard({ icon, tone, label, value }: { icon: string; tone: string; label: string; value: ReactNode }) {
  return (
    <div className="flex flex-1 items-center gap-5 rounded-3xl bg-[#fafbfd] p-3 drop-shadow-[0_8px_12px_rgba(0,0,0,0.08)] sm:justify-center">
      <span className={cn("grid size-[86px] shrink-0 place-items-center rounded-[14px]", tone)}>
        <MaskIcon className="size-12" src={icon} />
      </span>
      <div className="min-w-0 leading-normal text-[#45474c]">
        <p className="text-base">{label}</p>
        <div className="text-[32px] font-bold text-[#1b1b1d]">{value}</div>
      </div>
    </div>
  );
}

function ChapterRow({ chapter }: { chapter: StudentChapter }) {
  const gap = classGap(chapter);
  return (
    <li className="flex flex-col gap-2">
      <span className={cn(chip, "self-start bg-[rgba(153,188,229,0.6)] text-[#004695]")}>Bab {chapter.number}</span>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-base font-semibold text-[#1b1b1d]">{chapter.name}</p>
        <p className="text-base font-semibold text-[#0058be]">{chapter.score === null ? "–" : `${formatPoints(chapter.score)}%`}</p>
      </div>
      <span className="h-2 rounded-full bg-[#e6eff9]">
        <span className="block h-full rounded-full bg-[#0058be]" style={{ width: `${chapter.score ?? 0}%` }} />
      </span>
      <p className="text-xs text-[#45474c]">{chapter.score === null ? "Belum ada nilai" : (gap ?? "Rata-rata kelas belum tersedia")}</p>
    </li>
  );
}

// Level Penguasaan Materi (FR-S-001): the student's score per Bab against the class average.
export function MasteryCard({ chapters, detailHref }: { chapters: StudentChapter[]; detailHref?: string }) {
  return (
    <section className={cn(card, "flex flex-col gap-6")}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold leading-normal text-[#1b1b1d]">Level Penguasaan Materi</h2>
        {detailHref && (
          <Link className={cn(outlineButtonClassName, "px-4 py-2 text-sm")} href={detailHref}>
            Lihat Detail
          </Link>
        )}
      </div>
      {chapters.length === 0 ? (
        <p className="text-sm text-[#45474c]">Belum ada Bab yang dinilai di mapel ini.</p>
      ) : (
        <ul className="flex flex-col gap-8">
          {chapters.map((chapter) => (
            <ChapterRow chapter={chapter} key={chapter.chapterId} />
          ))}
        </ul>
      )}
    </section>
  );
}

// Rekomendasi AI (FR-S-032): for now the materials of the student's approved remedial package.
function RecommendationCard({ dashboard }: { dashboard: MyDashboard }) {
  const materials = dashboard.recommendedMaterials;
  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-[#e6eff9] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <h2 className="text-2xl font-semibold leading-normal text-[#003264]">Rekomendasi AI</h2>
      {materials.length === 0 ? (
        <p className="text-sm leading-normal text-[#45474c]">
          Belum ada rekomendasi. Rekomendasi muncul setelah guru menyetujui paket remedial untukmu.
        </p>
      ) : (
        <>
          <p className="text-xs text-[#45474c]">Berdasarkan asesmen terakhir, yuk perkuat materi ini:</p>
          <ul className="flex flex-col gap-4">
            {materials.map((material) => (
              <li className="flex flex-col gap-3 rounded-2xl bg-[#fafbfd] p-4" key={material.id}>
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[rgba(153,188,229,0.6)] text-[10px] font-bold uppercase text-[#004695]">
                    {material.format}
                  </span>
                  <div className="min-w-0 leading-normal">
                    <p className="text-base font-semibold text-[#1b1b1d]">{material.title}</p>
                    <p className="text-xs uppercase text-[#0058be]">
                      {material.format}, {formatSize(material.sizeBytes)}
                    </p>
                    {material.recommendedFor.length > 0 && (
                      <p className="text-xs text-[#45474c]">
                        Membantu {material.recommendedFor.map((objective) => `TP ${objective.number}`).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
                <a
                  className={cn(primaryButtonClassName, "w-full py-2.5 text-sm")}
                  href={`/api/my-materials/${encodeURIComponent(material.id)}/file`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Mulai Belajar Sekarang
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

// Upcoming Test (FR-S-002): scheduled or ongoing assessments.
function UpcomingTests({ slug, dashboard }: { slug: string; dashboard: MyDashboard }) {
  const tests = dashboard.upcoming;
  return (
    <section className="flex flex-col gap-4">
      {/* Inset like the card titles, so the heading lines up with "Level Penguasaan Materi" and "Aktivitas Terbaru". */}
      <div className="flex flex-wrap items-end justify-between gap-2 px-6">
        <h2 className="text-2xl font-semibold leading-normal text-[#1b1b1d]">Upcoming Test</h2>
        <span className="text-xs text-[#0058be]">{tests.length} asesmen</span>
      </div>
      {tests.length === 0 ? (
        <p className={cn(card, "text-sm text-[#45474c]")}>Belum ada asesmen terjadwal.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tests.map((test) => (
            <li className={cn(card, "flex flex-col gap-3 p-5")} key={test.id}>
              <p className="text-base font-semibold leading-normal text-[#1b1b1d]">{test.title}</p>
              <p className="text-xs text-[#45474c]">{formatLongSchedule(test.opensAt)}</p>
              <p className="text-xs leading-normal text-[#0058be]">
                Jenis: {assessmentTypeLabels[test.type]}
                {test.learningObjectives.length > 0 &&
                  `, TP fokus: ${test.learningObjectives.map((objective) => objective.number).join(", ")}`}
              </p>
              <Link className={cn(outlineButtonClassName, "mt-auto w-full py-2 text-sm")} href={`/student/${slug}/assessment/${test.id}`}>
                Lihat Detail
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// Aktivitas Terbaru (FR-S-004): submitted assessments and opened materials, newest first.
function RecentActivity({ slug, dashboard }: { slug: string; dashboard: MyDashboard }) {
  const activities = dashboard.recentActivity;
  return (
    <section className={cn(card, "flex flex-col")}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c5c6cd] pb-4">
        <h2 className="text-2xl font-semibold leading-normal text-[#1b1b1d]">Aktivitas Terbaru</h2>
        <SoonButton label="Lihat Semua Riwayat" />
      </div>
      {activities.length === 0 ? (
        <p className="pt-4 text-sm text-[#45474c]">Belum ada aktivitas. Aktivitas muncul setelah kamu mengerjakan asesmen atau membuka materi.</p>
      ) : (
        <ul className="flex flex-col">
          {activities.map((activity, index) => {
            const status = activity.status ? activityStatusLabels[activity.status] : null;
            return (
              <li
                className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eae7e9] py-5 last:border-b-0"
                key={`${activity.kind}-${activity.attemptId ?? activity.material?.id}-${index}`}
              >
                <div className="flex min-w-0 flex-col gap-1 leading-normal">
                  <p className="text-base font-semibold text-[#1b1b1d]">{activityTitle(activity)}</p>
                  <p className="text-xs text-[#45474c]">{activityTime(activity.at)}</p>
                  {status && <span className={cn(chip, "self-start", status.className)}>{status.label}</span>}
                </div>
                <div className="flex items-center gap-6">
                  {activity.kind === "assessment" && (
                    <div className="text-center leading-normal">
                      <p className="text-[10px] text-[#45474c]">SKOR</p>
                      <p className="text-base font-bold text-[#003264]">
                        {activity.score === null ? "--/--" : `${formatPoints(activity.score)}/100`}
                      </p>
                    </div>
                  )}
                  {activity.kind === "material" && activity.material ? (
                    <a
                      className={softButtonClassName}
                      href={`/api/my-materials/${encodeURIComponent(activity.material.id)}/file`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Buka Lagi
                    </a>
                  ) : activity.status === "belum_tuntas" ? (
                    <Link className={softButtonClassName} href={`/student/${slug}/remedial`}>
                      Lihat Remedial
                    </Link>
                  ) : (
                    <Link className={softButtonClassName} href={`/student/${slug}/diagnosis`}>
                      Lihat Diagnosis
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// Dashboard Siswa (PRD 6.1, SRS FR-S-001 – 004; Figma New Design 175:32037).
export function StudentDashboardPage({
  slug,
  subject,
  studentName,
  dashboard,
}: {
  slug: string;
  subject: Subject;
  studentName: string;
  dashboard: MyDashboard | null;
}) {
  if (!dashboard) {
    return (
      <div className="flex flex-col gap-6 px-4 py-6 sm:px-8">
        <p className={cn(card, "text-sm text-[#45474c]")}>Dashboard belum tersedia dari server. Coba lagi beberapa saat lagi.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8">
      <Hero chapters={dashboard.chapters} studentName={studentName} subject={subject} />
      <div className="flex flex-col gap-4 md:flex-row">
        <StatCard icon="/assessment/clipboard-check.svg" label="Asesmen Selesai" tone="bg-[#dcfce7] text-[#16a34a]" value={dashboard.completedAssessments} />
        <StatCard
          icon="/auth/badge-check.svg"
          label="TP Dikuasai (SB/B)"
          tone="bg-[rgba(153,188,229,0.6)] text-[#0058be]"
          value={
            <span className="flex items-baseline gap-1">
              {dashboard.masteredObjectives}
              <span className="text-base font-semibold text-[#45474c]">/ {dashboard.totalObjectives} TP</span>
            </span>
          }
        />
        <StatCard
          icon="/dashboard/stat-alert.svg"
          label="Remedial Aktif (Perlu Remedial)"
          tone="bg-[rgba(254,202,202,0.6)] text-[#dc2626]"
          value={dashboard.activeRemedials}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
        <MasteryCard chapters={dashboard.chapters.slice(0, 3)} detailHref={`/student/${slug}/dashboard?detail=penguasaan`} />
        <RecommendationCard dashboard={dashboard} />
      </div>
      <UpcomingTests dashboard={dashboard} slug={slug} />
      <RecentActivity dashboard={dashboard} slug={slug} />
    </div>
  );
}

// Lihat detail level penguasaan materi (Figma New Design 181:7514): every Bab.
export function StudentMasteryDetailPage({ dashboard }: { dashboard: MyDashboard | null }) {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8">
      {dashboard ? (
        <MasteryCard chapters={dashboard.chapters} />
      ) : (
        <p className={cn(card, "text-sm text-[#45474c]")}>Dashboard belum tersedia dari server. Coba lagi beberapa saat lagi.</p>
      )}
    </div>
  );
}
