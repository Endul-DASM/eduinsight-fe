import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Subject } from "@/lib/api/types";
import { diagnosisLabels, type DashboardData } from "@/lib/dashboard/compute";
import { toActivityViews } from "@/lib/dashboard/format";
import { ActivityCard } from "./activity-card";
import { DiagnosisCard, ObjectiveTable } from "./diagnosis-card";
import { JoinCodeCopy } from "./join-code-copy";

// The greeting banner (Figma New Design 32:4595).
function Hero({ subject, teacherName }: { subject: Subject; teacherName: string }) {
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
        <div className="max-w-[489px]">
          <p className="text-2xl font-bold leading-normal text-[#1b1b1d] sm:text-[32px]">Halo, {teacherName}!</p>
          <p className="text-base leading-normal text-[#45474c]">
            Semangat mengajarnya hari ini! Semoga pemimpin yang hebat kelak datang dari anak didik Anda.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex min-w-[230px] flex-col gap-1.5 rounded-3xl bg-[rgba(245,243,244,0.6)] p-6 text-[#003264]">
            <p className="text-2xl font-bold leading-normal">{subject.name}</p>
            <p className="whitespace-pre-wrap text-base leading-normal">
              {subject.class.name}
              {"  |  "}
              {subject.class.academicYear}
            </p>
          </div>
          <JoinCodeCopy code={subject.joinCode ?? null} />
        </div>
      </div>
    </section>
  );
}

function StatCard({
  icon,
  chipClassName,
  iconSize,
  label,
  value,
  note,
}: {
  icon: string;
  chipClassName: string;
  iconSize: number;
  label: string;
  value: ReactNode;
  note: ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center gap-5 rounded-3xl bg-[#fafbfd] p-3 drop-shadow-[0_8px_12px_rgba(0,0,0,0.08)] sm:justify-center">
      <span className={`grid size-[86px] shrink-0 place-items-center rounded-[14px] ${chipClassName}`}>
        <Image alt="" height={iconSize} src={icon} width={iconSize} />
      </span>
      <div className="min-w-0 leading-normal text-[#45474c]">
        <p className="text-base">{label}</p>
        <div className="font-bold">{value}</div>
        <div className="text-xs text-[#0058be]">{note}</div>
      </div>
    </div>
  );
}

const trendNotes = {
  up: "Meningkat dari pekan lalu",
  down: "Menurun dari pekan lalu",
  same: "Sama seperti pekan lalu",
};

// Performance Overview (FR-G-010) and Top Miskonsepsi (FR-G-012).
function StatCards({ data, diagnosisHref }: { data: DashboardData; diagnosisHref: string }) {
  const { average, remedial, topMisconception } = data;

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <StatCard
        chipClassName="bg-[rgba(153,188,229,0.6)]"
        icon="/dashboard/stat-chart.svg"
        iconSize={48}
        label="Rata-rata nilai"
        note={average ? (average.trend ? trendNotes[average.trend] : "Belum ada data pekan lalu") : "Belum ada nilai siswa"}
        value={<span className="text-[32px]">{average ? Math.round(average.value) : "—"}</span>}
      />
      <StatCard
        chipClassName="bg-[rgba(254,202,202,0.6)]"
        icon="/dashboard/stat-alert.svg"
        iconSize={58}
        label="Butuh remedial"
        note={
          remedial ? (
            <span title={`Berdasarkan ${remedial.assessmentTitle}`}>
              {remedial.count > 0 ? "Perlu intervensi segera" : "Semua siswa tuntas"}
            </span>
          ) : (
            "Belum ada asesmen yang dinilai"
          )
        }
        value={
          <span className="flex items-baseline gap-1">
            <span className="text-[32px]">{remedial ? remedial.count : "—"}</span>
            {remedial && <span className="text-base">Siswa</span>}
          </span>
        }
      />
      <StatCard
        chipClassName="bg-[rgba(254,215,170,0.6)]"
        icon="/dashboard/stat-misconception.svg"
        iconSize={58}
        label="Top miskonsepsi"
        note={
          topMisconception ? (
            <>
              {topMisconception.percent}% siswa mengalami kendala.{" "}
              <Link className="underline hover:text-[#004695]" href={diagnosisHref}>
                Tinjau
              </Link>
            </>
          ) : (
            "Belum ada pola kesalahan"
          )
        }
        value={<span className="block truncate text-base">{topMisconception?.tag ?? "—"}</span>}
      />
    </div>
  );
}

// Dashboard Guru (Figma New Design 22:4162). With ?bab={number} it shows Detail Bab instead (37:5316).
export function DashboardPage({
  subject,
  teacherName,
  data,
  error,
  chapterNumber,
}: {
  subject: Subject;
  teacherName: string;
  data: DashboardData | null;
  error?: string;
  chapterNumber: number | null;
}) {
  const baseHref = `/${subject.slug}/dashboard`;
  const chapter = data?.chapters.find((entry) => entry.number === chapterNumber) ?? null;
  const hasScores =
    data?.chapters.some((entry) => diagnosisLabels.some((label) => entry.students[label].length > 0)) ?? false;

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8">
      <Hero subject={subject} teacherName={teacherName} />

      {!data ? (
        <p className="rounded-3xl bg-[#ffdad6] px-6 py-4 text-sm leading-normal text-[#93000a]" role="alert">
          {error ?? "Data dashboard belum dapat dimuat."}
        </p>
      ) : chapter ? (
        <>
          <DiagnosisCard
            baseHref={baseHref}
            chapters={data.chapters}
            hasScores={hasScores}
            selectedNumber={chapter.number}
            studentCount={data.studentCount}
          />
          <ObjectiveTable baseHref={baseHref} chapter={chapter} />
        </>
      ) : (
        <>
          <StatCards data={data} diagnosisHref={`/${subject.slug}/diagnosis`} />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,611fr)_minmax(0,419fr)] lg:items-start">
            <DiagnosisCard
              baseHref={baseHref}
              chapters={data.chapters}
              hasScores={hasScores}
              selectedNumber={null}
              studentCount={data.studentCount}
            />
            <ActivityCard activities={toActivityViews(data.activities)} />
          </div>
        </>
      )}
    </div>
  );
}
