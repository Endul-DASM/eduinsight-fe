import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import type { StudentAssessment } from "@/lib/api/student";
import type { Subject } from "@/lib/api/types";
import { assessmentTypeLabels, formatLongSchedule } from "@/lib/assessment-form";
import { type AttemptSection, cardState, cardStateLabels, sectionNames, topicOf } from "@/lib/student-assessment";
import { StartButton } from "./start-button";

const statCard = "flex flex-col gap-1 rounded-3xl bg-[#fafbfd] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)]";
const infoCard = "flex flex-col gap-1 rounded-2xl bg-[#e6eff9] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)]";

const checklist = [
  "Pastikan koneksi internet stabil selama pengerjaan.",
  "Siapkan alat tulis dan kertas buram untuk berhitung.",
  "Cari tempat yang tenang agar fokus tidak terganggu.",
];

const tips = [
  "Baca setiap soal sampai selesai sebelum memilih jawaban.",
  "Kerjakan soal yang kamu yakini dulu, lalu tandai soal yang masih ragu.",
  "Periksa kembali soal yang ditandai sebelum mengumpulkan.",
];

function Tips() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-[#003264] p-5 text-white">
      <p className="flex items-center gap-2 text-xl font-semibold">
        <Image alt="" className="invert" height={22} src="/assessment/check-circle.svg" width={22} />
        Tips Mengerjakan
      </p>
      <ul className="flex list-disc flex-col gap-1 pl-5 text-sm leading-normal text-white/90">
        {tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </div>
  );
}

// Persiapan Asesmen (PRD 6.2, SRS FR-S-010; Figma New Design 181:8150), also Persiapan Remedial (FR-S-050) where
// `aside` shows the remedial package in place of the tips.
export function AssessmentIntroPage({
  slug,
  section = "assessment",
  subject,
  assessment,
  aside,
}: {
  slug: string;
  section?: AttemptSection;
  subject: Subject;
  assessment: StudentAssessment;
  aside?: ReactNode;
}) {
  const { title } = sectionNames[section];
  const state = cardState(assessment);
  const startable = state === "available" || state === "resume";
  const left = Math.max(0, assessment.maxAttempts - assessment.attemptsUsed);

  // Informasi Penting: under the tips on Asesmen (Figma 181:8150); on Remedial the package fills the right column, so
  // it sits under the start button, side by side.
  const wide = aside !== undefined;
  const infoItem = cn(infoCard, wide && "sm:flex-1 sm:basis-0");
  const info = (
    <div className="flex flex-col gap-4">
      <p className="text-xl font-semibold text-[#1b1b1d]">Informasi Penting</p>
      <div className={cn("flex flex-col gap-4", wide && "sm:flex-row")}>
        <div className={infoItem}>
          <p className="text-base font-semibold text-[#45474c]">Batas Waktu</p>
          <p className="text-sm text-[#1b1b1d]">
            Ditutup {formatLongSchedule(assessment.closesAt)}. Pengerjaan berakhir otomatis jika waktu habis.
          </p>
        </div>
        <div className={infoItem}>
          <p className="text-base font-semibold text-[#45474c]">Pengulangan</p>
          <p className="text-sm text-[#1b1b1d]">
            {assessment.maxAttempts === 1
              ? `${title} ini hanya dapat dikerjakan satu kali.`
              : `Dapat dikerjakan ${assessment.maxAttempts} kali; sisa ${left} kesempatan.`}
          </p>
        </div>
        {/* On Remedial the type is always Remedial, so only Batas Waktu and Pengulangan, side by side. */}
        {!wide && (
          <div className={infoItem}>
            <p className="text-base font-semibold text-[#45474c]">Jenis</p>
            <p className="text-sm text-[#1b1b1d]">{assessmentTypeLabels[assessment.type]}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-8 px-4 py-10 sm:px-8 lg:py-16">
      <Link className="self-start text-sm font-semibold text-[#0058be] hover:underline" href={`/student/${slug}/${section}`}>
        ← Daftar {title}
      </Link>
      <h2 className="text-[32px] font-bold leading-tight text-[#1b1b1d] lg:text-5xl">
        {title} {subject.name}:
        <br />
        <span className="text-[#0058be]">{assessment.title}</span>
      </h2>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className={statCard}>
              <p className="text-base text-[#45474c]">Jumlah Soal</p>
              <p className="text-[28px] font-bold text-[#1b1b1d]">{assessment.questionCount}</p>
            </div>
            <div className={statCard}>
              <p className="text-base text-[#45474c]">Durasi Pengerjaan</p>
              <p className="text-[28px] font-bold text-[#1b1b1d]">
                {assessment.durationMinutes ? `${assessment.durationMinutes} menit` : "Bebas"}
              </p>
            </div>
            <div className={statCard}>
              <p className="text-base text-[#45474c]">Fokus Materi</p>
              <p className="text-xl font-bold leading-snug text-[#1b1b1d]" title={assessment.learningObjectives.map((tp) => tp.description).join("\n")}>
                {topicOf(assessment)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="leading-normal">
              <h3 className="text-xl font-semibold text-[#1b1b1d]">Persiapan {title}</h3>
              <p className="text-sm text-[#45474c]">Pastikan kamu sudah siap sebelum menekan tombol mulai di bawah.</p>
            </div>
            <ul className="flex flex-col gap-3">
              {checklist.map((item) => (
                <li className="flex items-center gap-3 text-sm text-[#1b1b1d]" key={item}>
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[rgba(153,188,229,0.6)] text-xs text-[#0058be]">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            {!startable && (
              <p className={cn("self-start rounded-3xl px-3 py-1 text-xs font-semibold", cardStateLabels[state].className)}>
                {state === "not_opened"
                  ? `${title} dibuka ${formatLongSchedule(assessment.opensAt)}`
                  : state === "offline"
                    ? `${title} ini dikerjakan secara luring di kelas`
                    : state === "closed"
                      ? `${title} sudah ditutup`
                      : "Kesempatan mengerjakan sudah habis"}
              </p>
            )}
            <StartButton
              assessmentId={assessment.id}
              disabled={!startable}
              resume={state === "resume"}
              section={section}
              slug={slug}
            />
          </div>
          {wide && info}
        </div>

        <div className="flex flex-col gap-6">
          {aside ?? (
            <>
              <Tips />
              {info}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
