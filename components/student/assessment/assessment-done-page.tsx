import Image from "next/image";
import Link from "next/link";
import { primaryButtonClassName } from "@/components/auth/styles";
import { cn } from "@/components/ui/cn";
import type { Attempt } from "@/lib/api/student";
import { durationText } from "@/lib/student-assessment";
import { formatPoints } from "@/lib/student-dashboard";

const card = "flex flex-col gap-2 rounded-3xl bg-[#fafbfd] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)]";

// Asesmen Selesai (PRD 6.2, SRS FR-S-013; Figma New Design 175:33141). The AI analysis card of the design is
// replaced by the real result: the PG score, or that essays wait for the teacher.
export function AssessmentDonePage({ slug, studentName, attempt }: { slug: string; studentName: string; attempt: Attempt }) {
  const waiting = (attempt.essaysPending ?? 0) > 0 || attempt.score === null;

  return (
    <div className="mx-auto flex w-full max-w-[1040px] flex-col items-center gap-8 px-4 py-10 text-center sm:px-8">
      <div className="relative">
        <div className="size-48 overflow-hidden rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
          <Image alt="Ilustrasi siswa merayakan asesmen selesai" className="size-full object-cover" height={279} priority src="/student/assessment-done.jpg" width={512} />
        </div>
        <span className="absolute -bottom-4 -right-6 grid size-16 place-items-center rounded-2xl bg-[#fafbfd] shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
          <Image alt="" height={40} src="/student/clipboard-check.svg" width={40} />
        </span>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-[32px] font-bold text-[#003264]">Selesai, Hebat!</h2>
        <p className="max-w-[560px] text-base leading-normal text-[#45474c]">
          Hebat, {studentName}, kamu sudah menyelesaikan asesmen ini!
          {waiting ? " Gurumu akan memberikan nilai untuk jawaban uraianmu segera." : " Lihat hasilmu di bawah ini."}
          {attempt.autoSubmitted && " Jawabanmu dikumpulkan otomatis karena waktu habis."}
        </p>
      </div>

      <div className="grid w-full gap-6 text-left lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className={card}>
          <p className="text-2xl font-semibold text-[#1b1b1d]">Hasil</p>
          {waiting ? (
            <>
              <span className="self-start rounded-3xl bg-[#ffedd5] px-2 py-0.5 text-xs font-semibold text-[#9a3412]">Menunggu penilaian guru</span>
              <p className="text-base text-[#45474c]">
                {attempt.essaysPending ?? 0} jawaban uraian sedang dinilai gurumu.
                {attempt.pgTotal ? ` Pilihan ganda: ${attempt.pgCorrect ?? 0} dari ${attempt.pgTotal} benar.` : ""}
              </p>
            </>
          ) : (
            <>
              <p className="text-[40px] font-bold text-[#0058be]">{formatPoints(attempt.score!)}/100</p>
              {attempt.pgTotal ? (
                <p className="text-base text-[#45474c]">
                  {attempt.pgCorrect ?? 0} dari {attempt.pgTotal} soal pilihan ganda benar.
                </p>
              ) : null}
            </>
          )}
          <p className="text-xs text-[#45474c]">Diagnosis belajarmu diperbarui setelah semua jawaban dinilai.</p>
        </section>
        <div className="flex flex-col gap-6">
          <section className={card}>
            <p className="text-xs text-[#45474c]">ASESMEN</p>
            <p className="text-base font-semibold text-[#1b1b1d]">{attempt.assessmentTitle}</p>
          </section>
          <section className={card}>
            <p className="text-xs text-[#45474c]">WAKTU PENGERJAAN</p>
            <p className="text-base font-semibold text-[#1b1b1d]">{durationText(attempt.startedAt, attempt.submittedAt)}</p>
          </section>
        </div>
      </div>

      <Link className={cn(primaryButtonClassName, "px-4 py-2.5")} href={`/student/${slug}/dashboard`}>
        Kembali ke Dashboard
      </Link>
      <p className="text-xs text-[#45474c]">Jawaban kamu telah tersimpan dengan aman di sistem EduInsight.</p>
    </div>
  );
}
