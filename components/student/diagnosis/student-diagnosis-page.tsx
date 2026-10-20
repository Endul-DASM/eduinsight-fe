import Link from "next/link";
import type { ReactNode } from "react";
import { primaryButtonClassName } from "@/components/auth/styles";
import { SubjectHero } from "@/components/student/dashboard/student-dashboard-page";
import { cn } from "@/components/ui/cn";
import type { MyDashboard, MyDiagnosis, MyObjectiveDiagnosis } from "@/lib/api/student";
import type { Subject } from "@/lib/api/types";
import { activityStatusLabels, activityTime, activityTitle, formatPoints, formatSize } from "@/lib/student-dashboard";
import {
  gapText,
  itemsText,
  lowestItem,
  masteryStatus,
  objectiveById,
  overallMastery,
  sortedObjectives,
} from "@/lib/student-diagnosis";
import { PrintButton } from "./print-button";
import { NarrativePanel } from "./narrative-panel";

const card = "rounded-3xl bg-[#fafbfd] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)] break-inside-avoid print:shadow-none print:border print:border-[#c5c6cd]";
const chip = "rounded-3xl px-2 py-0.5 text-xs font-semibold";

const percent = (score: number | null) => (score === null ? "–" : `${formatPoints(score)}%`);
const objectiveTitle = (objective: MyObjectiveDiagnosis) =>
  `TP ${objective.learningObjective.number}: ${objective.learningObjective.description}`;

// Penguasaan Keseluruhan: a ring of the mean TP score.
function MasteryRing({ diagnosis }: { diagnosis: MyDiagnosis }) {
  const overall = overallMastery(diagnosis);
  const status = masteryStatus(overall.label);
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const gap = gapText(overall.comparedScore, overall.classAverage);
  return (
    <section className={cn(card, "flex flex-col gap-4")}>
      <h2 className="text-base font-semibold leading-normal text-[#1b1b1d]">Penguasaan Keseluruhan</h2>
      <div className="relative mx-auto size-[168px]">
        <svg aria-hidden className="size-full -rotate-90" viewBox="0 0 168 168">
          <circle className="stroke-[#e6eff9]" cx="84" cy="84" fill="none" r={radius} strokeWidth="12" />
          <circle
            className="stroke-[#0058be]"
            cx="84"
            cy="84"
            fill="none"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - (overall.score ?? 0) / 100)}
            strokeLinecap="round"
            strokeWidth="12"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <p className="text-[32px] font-bold leading-none text-[#003264]">{percent(overall.score)}</p>
          <span className={cn(chip, status.chip)}>{overall.label ? status.level : status.label}</span>
        </div>
      </div>
      <p className="text-xs leading-normal text-[#45474c]">
        {overall.score === null
          ? "Belum ada TP yang dinilai."
          : `Rata-rata dari ${overall.scoredCount} TP yang sudah dinilai. ${gap ? `${gap}.` : "Rata-rata kelas belum tersedia."}`}
      </p>
    </section>
  );
}

function MetricCard({ label, value, note }: { label: string; value: ReactNode; note: string }) {
  return (
    <div className={cn(card, "flex flex-col gap-1 leading-normal")}>
      <p className="text-base text-[#45474c]">{label}</p>
      <div className="text-[32px] font-bold text-[#1b1b1d]">{value}</div>
      <p className="text-xs text-[#004695]">{note}</p>
    </div>
  );
}

// TP terkuat dan terlemah (FR-S-042).
function TopicCard({
  objective,
  tone,
  label,
  note,
  empty,
}: {
  objective: MyObjectiveDiagnosis | null;
  tone: string;
  label: string;
  note: string;
  empty: [title: string, note: string];
}) {
  return (
    <div className={cn(card, "flex flex-col gap-3 leading-normal")}>
      <span className={cn(chip, "self-start", tone)}>{label}</span>
      <p className="text-base font-semibold text-[#1b1b1d]">{objective ? objectiveTitle(objective) : empty[0]}</p>
      <p className="text-xs text-[#45474c]">{objective ? `${note} Skor ${percent(objective.score)}.` : empty[1]}</p>
    </div>
  );
}

function Summary({ diagnosis }: { diagnosis: MyDiagnosis }) {
  const overall = overallMastery(diagnosis);
  const weakest = objectiveById(diagnosis, diagnosis.weakest);
  const strongest = objectiveById(diagnosis, diagnosis.strongest);
  // "Perlu perhatian" only for a TP labelled Cukup or Kurang.
  const needsWork = weakest && (weakest.label === "c" || weakest.label === "k") ? weakest : null;
  const gap = overall.comparedScore === null || overall.classAverage === null ? null : overall.comparedScore - overall.classAverage;
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.1fr)]">
      <MasteryRing diagnosis={diagnosis} />
      <div className="grid gap-6 sm:grid-cols-2">
        <MetricCard
          label="Dibanding rata-rata kelas"
          note={overall.classAverage === null ? "Rata-rata kelas belum tersedia" : `Rata-rata kelas ${percent(overall.classAverage)}`}
          value={gap === null ? "–" : `${gap >= 0 ? "+" : "−"}${formatPoints(Math.abs(gap))} poin`}
        />
        <MetricCard label="Asesmen dinilai" note="Masuk dalam diagnosis ini" value={diagnosis.assessments.length} />
        <TopicCard
          label="Perlu perhatian"
          empty={["Tidak ada", "Semua TP yang dinilai sudah Baik atau Sangat Baik."]}
          note="Topik yang paling perlu kamu latih."
          objective={needsWork}
          tone="bg-[#fee2e2] text-[#dc2626]"
        />
        <TopicCard
          empty={["Belum ada nilai", "Muncul setelah asesmenmu dinilai."]}
          label="Dikuasai"
          note="Topik terkuatmu. Pertahankan!"
          objective={strongest}
          tone="bg-[#dcfce7] text-[#16a34a]"
        />
      </div>
    </div>
  );
}

// Analisis Kompetensi Terperinci: one row per TP with its SB/B/C/K label (FR-S-040).
function CompetencyCard({ subject, diagnosis }: { subject: Subject; diagnosis: MyDiagnosis }) {
  const objectives = sortedObjectives(diagnosis.learningObjectives);
  return (
    <section className={cn(card, "flex flex-col gap-2 print:break-inside-auto")}>
      <div className="leading-normal">
        <h2 className="text-2xl font-semibold text-[#1b1b1d]">Analisis Kompetensi Terperinci</h2>
        <p className="text-xs text-[#45474c]">Rincian penguasaanmu di setiap TP {subject.name}.</p>
      </div>
      <ul className="flex flex-col">
        {objectives.map((objective) => {
          const status = masteryStatus(objective.label);
          return (
            <li
              className="grid break-inside-avoid gap-3 border-t border-[#eae7e9] py-4 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)_auto] md:items-center md:gap-6"
              key={objective.learningObjective.id}
            >
              <div className="min-w-0 leading-normal">
                <p className="text-base font-semibold text-[#1b1b1d]">TP {objective.learningObjective.number}</p>
                <p className="text-xs text-[#45474c]">{objective.learningObjective.description}</p>
                <p className="text-xs text-[#75777d]">
                  Bab {objective.chapterNumber}: {objective.chapterName}
                </p>
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3 text-xs leading-normal">
                  <span className="text-[#45474c]">
                    {status.level}
                    {objective.items.length > 0 && `, ${itemsText(objective)}`}
                    {objective.limitedData && ", data masih sedikit"}
                  </span>
                  <span className="font-semibold text-[#1b1b1d]">{percent(objective.score)}</span>
                </div>
                <span className="h-2.5 rounded-full bg-[#e6eff9]">
                  <span className={cn("block h-full rounded-full", status.bar)} style={{ width: `${objective.score ?? 0}%` }} />
                </span>
              </div>
              <span className={cn(chip, "justify-self-start md:self-center md:justify-self-end", status.chip)}>{status.label}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// Wawasan untuk {nama}: the strongest and weakest TP from the scores. The AI explanation per Cukup/Kurang TP
// (FR-S-041) is the NarrativePanel below it.
function InsightCard({ diagnosis, studentName }: { diagnosis: MyDiagnosis; studentName: string }) {
  const strongest = objectiveById(diagnosis, diagnosis.strongest);
  const weakest = objectiveById(diagnosis, diagnosis.weakest);
  const lowest = weakest ? lowestItem(weakest) : null;
  return (
    <section className="flex break-inside-avoid flex-col gap-4 rounded-3xl bg-[#e6eff9] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)] print:shadow-none">
      <h2 className="text-2xl font-bold leading-normal text-[#003264]">Wawasan untuk {studentName}</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2 leading-normal">
          <span className={cn(chip, "self-start bg-[#dcfce7] text-[#16a34a]")}>Kekuatan utama</span>
          {strongest ? (
            <>
              <p className="text-base font-semibold text-[#1b1b1d]">{objectiveTitle(strongest)}</p>
              <p className="text-sm text-[#45474c]">
                Skormu {percent(strongest.score)} dari {itemsText(strongest)}. Pertahankan dengan terus berlatih.
              </p>
            </>
          ) : (
            <p className="text-sm text-[#45474c]">Belum ada TP yang dinilai.</p>
          )}
        </div>
        <div className="flex flex-col gap-2 leading-normal">
          <span className={cn(chip, "self-start bg-[#ffedd5] text-[#c2410c]")}>Peluang berkembang</span>
          {weakest && weakest.learningObjective.id !== strongest?.learningObjective.id ? (
            <>
              <p className="text-base font-semibold text-[#1b1b1d]">{objectiveTitle(weakest)}</p>
              <p className="text-sm text-[#45474c]">
                Skormu {percent(weakest.score)} dari {itemsText(weakest)}.
                {lowest && ` Skor terendahmu di soal ${lowest.number} pada ${lowest.assessmentTitle} (${formatPoints(lowest.score)}).`}{" "}
                Pelajari lagi materinya lalu coba soal serupa.
              </p>
            </>
          ) : (
            <p className="text-sm text-[#45474c]">Belum ada TP yang perlu dikejar. Terus pertahankan!</p>
          )}
        </div>
      </div>
    </section>
  );
}

// Rekomendasi Jalur Belajar: the materials of the student's approved remedial package (as on the dashboard).
function PathCard({ dashboard }: { dashboard: MyDashboard | null }) {
  const materials = dashboard?.recommendedMaterials ?? [];
  return (
    <section className={cn(card, "flex flex-col gap-4")}>
      <h2 className="text-2xl font-semibold leading-normal text-[#1b1b1d]">Rekomendasi Jalur Belajar</h2>
      {materials.length === 0 ? (
        <p className="text-sm leading-normal text-[#45474c]">
          Belum ada rekomendasi. Rekomendasi muncul setelah guru menyetujui paket remedial untukmu.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {materials.map((material) => (
            <li className="flex flex-col gap-2 rounded-2xl border border-[#c5c6cd] p-4 leading-normal" key={material.id}>
              <p className="text-base font-semibold text-[#1b1b1d]">{material.title}</p>
              <p className="text-xs text-[#45474c]">
                <span className="uppercase">{material.format}</span>, {formatSize(material.sizeBytes)}
                {material.recommendedFor.length > 0 &&
                  `. Membantu ${material.recommendedFor.map((objective) => `TP ${objective.number}`).join(", ")}`}
              </p>
              <a
                className={cn(primaryButtonClassName, "self-start px-4 py-2 text-sm print:hidden")}
                href={`/api/my-materials/${encodeURIComponent(material.id)}/file`}
                rel="noopener noreferrer"
                target="_blank"
              >
                Buka Materi
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// Aktivitas Terakhir (FR-S-004 data), in place of Catatan Guru which the backend does not have.
function ActivityCard({ dashboard }: { dashboard: MyDashboard | null }) {
  const activities = dashboard?.recentActivity.slice(0, 3) ?? [];
  return (
    <section className={cn(card, "flex flex-col gap-3")}>
      <h2 className="text-xs font-semibold uppercase leading-normal text-[#45474c]">Aktivitas Terakhir</h2>
      {activities.length === 0 ? (
        <p className="text-sm text-[#45474c]">Belum ada aktivitas.</p>
      ) : (
        <ul className="flex flex-col">
          {activities.map((activity, index) => {
            const status = activity.status ? activityStatusLabels[activity.status] : null;
            return (
              <li
                className="flex flex-col gap-1 border-b border-[#eae7e9] py-3 leading-normal first:pt-0 last:border-b-0 last:pb-0"
                key={`${activity.kind}-${activity.attemptId ?? activity.material?.id}-${index}`}
              >
                <p className="text-base font-semibold text-[#1b1b1d]">{activityTitle(activity)}</p>
                <p className="text-xs text-[#004695]">
                  {activity.kind === "assessment" && activity.score !== null && `Skor ${formatPoints(activity.score)}, `}
                  {activityTime(activity.at)}
                </p>
                {status && <span className={cn(chip, "self-start", status.className)}>{status.label}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// Diagnosis Belajar siswa (PRD S-DIA-01, SRS FR-S-040, 042; Figma New Design 175:33279).
export function StudentDiagnosisPage({
  slug,
  subject,
  studentName,
  diagnosis,
  dashboard,
}: {
  slug: string;
  subject: Subject;
  studentName: string;
  diagnosis: MyDiagnosis | null;
  dashboard: MyDashboard | null;
}) {
  const hero = (
    <SubjectHero
      description="Lihat kekuatanmu, pahami bagian yang perlu dilatih, dan temukan langkah belajar berikutnya."
      subject={subject}
      title={`Kenali cara belajarmu, ${studentName}`}
    />
  );

  if (!diagnosis || diagnosis.learningObjectives.every((objective) => objective.score === null)) {
    return (
      <div className="flex flex-col gap-6 px-4 py-6 sm:px-8">
        {hero}
        <div className={cn(card, "flex flex-col items-start gap-4")}>
          <p className="text-sm leading-normal text-[#45474c]">
            {diagnosis
              ? "Diagnosis muncul setelah asesmenmu dinilai. Kerjakan asesmen untuk melihat kekuatan dan bagian yang perlu kamu latih."
              : "Diagnosis belum tersedia dari server. Coba lagi beberapa saat lagi."}
          </p>
          <Link className={cn(primaryButtonClassName, "px-4 py-2.5 text-sm")} href={`/student/${slug}/assessment`}>
            Lihat Daftar Asesmen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8 print:p-0">
      {hero}
      <div className="flex justify-end print:hidden">
        <PrintButton />
      </div>
      <Summary diagnosis={diagnosis} />
      <CompetencyCard diagnosis={diagnosis} subject={subject} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <InsightCard diagnosis={diagnosis} studentName={studentName} />
          <NarrativePanel
            objectives={diagnosis.learningObjectives.filter((objective) => objective.label === "c" || objective.label === "k")}
            slug={slug}
            subjectId={subject.id}
          />
          <PathCard dashboard={dashboard} />
        </div>
        <div className="print:hidden">
          <ActivityCard dashboard={dashboard} />
        </div>
      </div>
    </div>
  );
}
