import Link from "next/link";
import { sectionClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import { formatLongSchedule } from "@/lib/assessment-form";
import { formatScore } from "@/lib/assessment-results";
import type { RemedialHistoryRow, RemedialPair } from "@/lib/remedial";
import { masteryLabels, progressLabels } from "@/lib/remedial-figures";
import { PairSelect } from "./pair-select";
import { ScheduleForm } from "./schedule-form";

const chip = "whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-semibold";
const card = "flex flex-col gap-4 rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]";

function Reassessment({ pair }: { pair: RemedialPair }) {
  const done = pair.targets.filter((target) => target.progress === "selesai");
  const kkm = pair.sourceResults?.assessment.kkm ?? 75;
  return (
    <section className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="leading-normal">
          <h3 className="text-base font-semibold text-[#1b1b1d]">Hasil reassessment sebelumnya</h3>
          <p className="text-xs text-[#45474c]">
            {pair.remedial?.title} · {formatLongSchedule(pair.remedial?.opensAt ?? null)} · {done.length} peserta selesai ·
            hasil dari Hasil Asesmen
          </p>
        </div>
        {pair.remedial && (
          <span className={cn("rounded-3xl px-2 py-1 text-xs font-semibold", progressLabels.selesai.className)}>
            {done.length}/{pair.targets.length} selesai
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-separate border-spacing-0 text-left text-xs leading-normal">
          <thead className="bg-[#f5f3f4] text-[#45474c]">
            <tr>
              <th className="px-3 py-3 font-semibold">Siswa</th>
              <th className="px-3 py-3 font-semibold">Skor awal</th>
              <th className="px-3 py-3 font-semibold">Skor baru</th>
              <th className="px-3 py-3 font-semibold">Progres</th>
              <th className="px-3 py-3 font-semibold">Ketuntasan diperbarui</th>
            </tr>
          </thead>
          <tbody>
            {pair.targets.map((target) => (
              <tr key={target.studentId}>
                <td className="border-b border-[#eae7e9] px-3 py-3 font-medium text-[#1b1b1d]">{target.name}</td>
                <td className="border-b border-[#eae7e9] px-3 py-3 text-[#45474c]">{formatScore(target.initialScore)}</td>
                <td
                  className={cn(
                    "border-b border-[#eae7e9] px-3 py-3 text-sm font-semibold",
                    target.newScore === null ? "text-[#9aa1ae]" : target.newScore >= kkm ? "text-[#16a34a]" : "text-[#dc2626]",
                  )}
                >
                  {target.newScore === null ? (target.awaitingGrade ? "Menunggu penilaian" : "–") : `${formatScore(target.newScore)} / 100`}
                </td>
                <td className="border-b border-[#eae7e9] px-3 py-3">
                  {target.progress && <span className={cn(chip, progressLabels[target.progress].className)}>{progressLabels[target.progress].label}</span>}
                </td>
                <td className="border-b border-[#eae7e9] px-3 py-3">
                  <span className={cn(chip, masteryLabels[target.mastery].className)}>{masteryLabels[target.mastery].label}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="rounded-xl bg-[#e6eff9] px-4 py-3 text-xs leading-normal text-[#004695]">
        Skor baru ≥ KKM {kkm} → status Tuntas. Skor di bawah KKM tetap Perlu Remedial dan masuk tindak lanjut berikutnya.
      </p>
    </section>
  );
}

function History({ slug, rows }: { slug: string; rows: RemedialHistoryRow[] }) {
  return (
    <section className={card} id="riwayat">
      <h3 className="text-base font-semibold leading-normal text-[#1b1b1d]">Riwayat Remedial</h3>
      {rows.length === 0 ? (
        <p className="py-4 text-sm text-[#45474c]">Belum ada asesmen remedial yang dipublikasikan.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-separate border-spacing-0 text-xs leading-normal">
            <thead className="bg-[#f5f3f4] text-[#45474c]">
              <tr>
                <th className="px-3 py-3 text-left font-semibold">Judul Remedial</th>
                <th className="px-3 py-3 font-semibold">Rata-rata perubahan skor</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Ketuntasan</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {rows.map((row) => (
                <tr key={row.assessment.id}>
                  <td className="border-b border-[#eae7e9] px-3 py-3 text-left">
                    <Link
                      className="font-semibold text-[#1b1b1d] hover:text-[#0058be] hover:underline"
                      href={`/${slug}/assessment?tab=hasil&assessment=${row.assessment.id}`}
                    >
                      {row.assessment.title}
                    </Link>
                  </td>
                  <td className="border-b border-[#eae7e9] px-3 py-3">
                    {row.averageChange === null ? (
                      <span className="text-[#9aa1ae]">–</span>
                    ) : (
                      <span className={row.averageChange >= 0 ? "text-[#16a34a]" : "text-[#dc2626]"}>
                        {row.averageChange >= 0 ? "↑" : "↓"} {formatScore(Math.abs(row.averageChange))} poin
                        <span className="text-[#75777d]"> ({row.compared} siswa)</span>
                      </span>
                    )}
                  </td>
                  <td className="border-b border-[#eae7e9] px-3 py-3">
                    <span className={cn(chip, row.assessment.status === "closed" ? progressLabels.selesai.className : progressLabels.mengerjakan.className)}>
                      {row.assessment.status === "closed" ? "Selesai" : row.assessment.status === "ongoing" ? "Berlangsung" : "Terjadwal"}
                    </span>
                  </td>
                  <td className="border-b border-[#eae7e9] px-3 py-3">
                    {row.finals > 0 ? `${row.mastered}/${row.finals} tuntas` : <span className="text-[#9aa1ae]">Belum dinilai</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-[#75777d]">Perubahan skor dihitung terhadap asesmen asal yang dipilih, untuk siswa yang mengerjakan keduanya.</p>
    </section>
  );
}

// Jadwalkan Remedial (FR-G-107; Figma New Design 86:10467, 86:11683): schedule the remedial assessment, then the
// reassessment result against the source and the history of remedial assessments.
export function SchedulePage({ slug, pair, history }: { slug: string; pair: RemedialPair; history: RemedialHistoryRow[] }) {
  const newRemedialHref = `/${slug}/assessment/new?method=ketik&type=remedial`;

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8">
      <div className="leading-normal">
        <h2 className="text-2xl font-bold text-[#1b1b1d] sm:text-[32px]">Jadwalkan Remedial</h2>
        <p className="text-base text-[#45474c]">Berikan soal terpersonalisasi terhadap siswa yang butuh remedial.</p>
      </div>

      <PairSelect
        remedialId={pair.remedial?.id ?? null}
        remedials={pair.remedials}
        sourceId={pair.source?.id ?? null}
        sources={pair.sources}
      />

      {pair.remedial && pair.remedial.status !== "draft" && (
        <p className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#dcfce7] px-4 py-3 text-xs leading-normal text-[#14532d]">
          <span>
            Remedial sudah dipublikasikan · buka {formatLongSchedule(pair.remedial.opensAt)} untuk{" "}
            {pair.targets.filter((target) => target.mastery === "perlu_remedial").length} siswa yang masih Perlu Remedial.
          </span>
          <span className={cn(chip, "bg-[#bbf7d0] text-[#16a34a]")}>Dipublikasikan</span>
        </p>
      )}

      {pair.remedial ? (
        <ScheduleForm key={pair.remedial.id} remedial={pair.remedial} remedials={pair.remedials} slug={slug} sourceId={pair.source?.id ?? null} />
      ) : (
        <section className={cn(sectionClassName, "items-center py-10 text-center")}>
          <p className="text-base font-semibold text-[#1b1b1d]">Belum ada asesmen remedial.</p>
          <Link className="text-sm font-semibold text-[#0058be] hover:underline" href={newRemedialHref}>
            Buat Soal Remedial
          </Link>
        </section>
      )}

      {pair.remedial && pair.remedial.status !== "draft" && pair.targets.length > 0 && <Reassessment pair={pair} />}
      <History rows={history} slug={slug} />
    </div>
  );
}
