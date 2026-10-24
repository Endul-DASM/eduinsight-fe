import { cn } from "@/components/ui/cn";
import type { AssessmentDetail } from "@/lib/api/types";
import { formatSchedule } from "@/lib/assessment-form";

const cognitiveTones = { LOTS: "bg-[#0058be]", MOTS: "bg-[#99bce5]", HOTS: "bg-[#003264]" } as const;

function percent(count: number, total: number) {
  return total ? Math.round((count / total) * 100) : 0;
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#c5c6cd] py-2 text-sm last:border-b-0">
      <dt className="text-[#45474c]">{label}</dt>
      <dd className={cn("text-right font-semibold text-[#1b1b1d]", tone)}>{value}</dd>
    </div>
  );
}

// Ringkasan otomatis (FR-G-044), computed by the backend from the current questions: totals, estimated duration,
// kisi-kisi per TP and the LOTS/MOTS/HOTS spread. Shown in Review when "Tampilkan Ringkasan" is Ya.
export function AssessmentSummary({ assessment }: { assessment: AssessmentDetail }) {
  const { summary } = assessment;
  const tagged = summary.totalQuestions - summary.cognitiveLevels.unset;

  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-[#d9d9d9] bg-[rgba(250,251,253,0.6)] p-6">
      <h3 className="text-base font-semibold leading-normal text-[#1b1b1d]">Ringkasan Asesmen</h3>
      <div className="grid gap-6 lg:grid-cols-2">
        <dl>
          <Row label="Total Soal" tone="text-[#0058be]" value={`${summary.totalQuestions} soal`} />
          <Row
            label="Pilihan Ganda / Benar-Salah"
            value={`${summary.byType.pg} / ${summary.byType.benar_salah ?? 0}`}
          />
          {/* Only an assessment that still has essays from before they were retired. */}
          {summary.byType.uraian > 0 && <Row label="Essay" value={`${summary.byType.uraian}`} />}
          <Row label="Estimasi Durasi" value={`${summary.estimatedMinutes} menit`} />
          <Row
            label="Durasi Diatur"
            value={assessment.durationMinutes ? `${assessment.durationMinutes} menit` : "Belum diisi"}
          />
          <Row label="Jadwal Buka" value={formatSchedule(assessment.opensAt)} />
          <Row label="Jadwal Tutup" value={formatSchedule(assessment.closesAt)} />
          <Row label="KKM / Percobaan" value={`${assessment.kkm} / ${assessment.maxAttempts}×`} />
        </dl>

        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#45474c]">Kisi-kisi per TP</p>
            {summary.blueprint.length === 0 ? (
              <p className="text-sm text-[#75777d]">Belum ada TP.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {summary.blueprint.map((row) => (
                  <li className="text-sm leading-normal text-[#1b1b1d]" key={row.learningObjective.id}>
                    <span className="font-semibold">TP {row.learningObjective.number}</span>{" "}
                    {row.learningObjective.description}
                    <span className="text-[#45474c]"> ({row.questionCount} soal)</span>
                    {row.questionNumbers.length > 0 && (
                      <span className="block text-xs text-[#75777d]">Soal {row.questionNumbers.join(", ")}</span>
                    )}
                    {!row.selected && <span className="block text-xs text-[#c2410c]">Tidak termasuk TP yang dipilih.</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl bg-[#f5f3f4] p-4">
            <p className="mb-3 text-sm text-[#1b1b1d]">Distribusi Kognitif</p>
            <div className="flex h-2 overflow-hidden rounded-full bg-[#eae7e9]">
              {(["LOTS", "MOTS", "HOTS"] as const).map((level) => (
                <span
                  className={cognitiveTones[level]}
                  key={level}
                  style={{ width: `${percent(summary.cognitiveLevels[level], tagged)}%` }}
                />
              ))}
            </div>
            <div className="mt-3 flex justify-between text-[10px] text-[#75777d]">
              {(["LOTS", "MOTS", "HOTS"] as const).map((level) => (
                <span key={level}>
                  {level} ({percent(summary.cognitiveLevels[level], tagged)}%)
                </span>
              ))}
            </div>
            {summary.cognitiveLevels.unset > 0 && (
              <p className="mt-2 text-[10px] text-[#75777d]">{summary.cognitiveLevels.unset} soal belum memiliki level Bloom.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
