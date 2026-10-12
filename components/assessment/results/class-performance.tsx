import Image from "next/image";
import Link from "next/link";
import { primaryButtonClassName } from "@/components/auth/styles";
import { cn } from "@/components/ui/cn";
import type { AssessmentResults } from "@/lib/api/results";
import { finalStudents, followUp, formatPercent, formatScore, scoreRanges } from "@/lib/assessment-results";

const cardClassName = "flex flex-col gap-1 rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]";

function StatCard({ label, value, note, tone }: { label: string; value: string; note: string; tone?: string }) {
  return (
    <div className={cardClassName}>
      <p className="text-xs font-semibold leading-normal text-[#45474c]">{label}</p>
      <p className={cn("text-[32px] leading-normal text-[#003264]", tone)}>{value}</p>
      <p className="text-xs leading-normal text-[#45474c]">{note}</p>
    </div>
  );
}

// Performa Kelas (FR-G-070; Figma New Design 65:13118). Averages and mastery count final scores only.
export function ClassPerformanceView({ slug, results }: { slug: string; results: AssessmentResults }) {
  const { classPerformance: stats, assessment } = results;
  const finals = finalStudents(results).length;
  const below = finals - stats.masteredCount;
  const ranges = scoreRanges(results);
  const highest = Math.max(1, ...ranges.map((range) => range.count));
  const { below: belowStudents, weakest } = followUp(results);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Rata-rata kelas" note={`Skala 0–100 · KKM ${assessment.kkm}`} value={formatScore(stats.average)} />
        <StatCard
          label="Tingkat ketuntasan"
          note={`${stats.masteredCount} dari ${finals} siswa mencapai KKM`}
          tone="text-[#16a34a]"
          value={formatPercent(stats.masteryRate)}
        />
        <StatCard
          label="Belum tuntas"
          note={`${formatPercent(finals ? (below / finals) * 100 : null)} siswa memiliki skor < ${assessment.kkm}`}
          value={`${below} Siswa`}
        />
        <StatCard
          label="Rentang nilai"
          note={`Terendah ${formatScore(stats.min)} · Tertinggi ${formatScore(stats.max)}`}
          value={stats.min === null ? "–" : `${formatScore(stats.min)} – ${formatScore(stats.max)}`}
        />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="leading-normal">
          <h3 className="text-2xl font-semibold text-[#1b1b1d]">Performa kelas</h3>
          <p className="text-xs text-[#45474c]">
            Ringkasan capaian pada asesmen terpilih. Ketuntasan dihitung menggunakan skor ≥ KKM.
            {stats.gradingPending > 0 && ` ${stats.gradingPending} siswa masih menunggu penilaian uraian dan belum dihitung.`}
            {stats.notAttempted > 0 && ` ${stats.notAttempted} siswa belum mengerjakan.`}
          </p>
        </div>
        <span className="rounded-lg bg-[#e6eff9] px-2 py-1 text-xs font-semibold text-[#004695]">
          {stats.submitted} dari {stats.enrolled} siswa
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="flex flex-col gap-6 rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
          <h4 className="flex items-center gap-3 border-b border-[rgba(153,188,229,0.6)] pb-4 text-xl font-semibold leading-normal text-[#1b1b1d]">
            <Image alt="" height={24} src="/assessment/chart.svg" width={24} />
            Sebaran nilai
          </h4>
          <div className="grid h-[180px] grid-cols-4 items-end gap-4 sm:gap-10" role="img" aria-label="Sebaran nilai siswa">
            {ranges.map((range) => (
              <div className="flex h-full flex-col items-center justify-end gap-2" key={range.label}>
                <span className={cn("text-xs font-semibold", range.passing ? "text-[#0058be]" : "text-[#45474c]")}>
                  {range.count} siswa
                </span>
                <span
                  className={cn("w-full max-w-[80px] rounded-t-sm", range.passing ? "bg-[#0058be]" : "bg-[#c5c6cd]")}
                  style={{ height: `${Math.max(2, (range.count / highest) * 110)}px` }}
                />
                <span className="text-xs text-[#1b1b1d]">{range.label}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-between gap-2 text-xs leading-normal">
            <span className="text-[#45474c]">Interval nilai pada skala 0–100</span>
            <span className="font-semibold text-[#1b1b1d]">
              {ranges.at(-1)?.label}: tuntas (≥ KKM)
            </span>
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-3xl bg-[rgba(214,229,246,0.7)] p-6 text-sm leading-normal text-[#45474c]">
          <span className="self-start rounded-3xl bg-[#fecaca] px-2 py-1 text-xs font-semibold text-[#dc2626]">
            Fokus Tindak Lanjut
          </span>
          {belowStudents.length === 0 ? (
            <p className="text-xl font-semibold text-[#003264]">Semua siswa yang dinilai sudah tuntas</p>
          ) : (
            <>
              <p className="text-xl font-semibold text-[#003264]">{belowStudents.length} siswa membutuhkan penguatan</p>
              <p className="text-xs">
                {belowStudents.map((student) => student.student.name).join(", ")} belum mencapai KKM.
                {weakest &&
                  ` Prioritaskan TP ${weakest.learningObjective.number} yang memiliki rata-rata terendah: ${formatScore(weakest.classAverage)}.`}
              </p>
            </>
          )}
          <p className="border-t border-[rgba(153,188,229,0.8)] pt-3 text-xs text-[#75777d]">
            Rata-rata dan ketuntasan dihitung dari {finals} siswa dengan nilai final; skor tiap TP = persentase skor
            butir ber-tag TP itu.
          </p>
          <Link className={cn(primaryButtonClassName, "mt-auto gap-3 self-end")} href={`/${slug}/remedial`}>
            Menuju Remedial
            <Image alt="" height={24} src="/assessment/arrow-right.svg" width={24} />
          </Link>
        </section>
      </div>
    </div>
  );
}
