import Image from "next/image";
import { outlineButtonClassName } from "@/components/auth/styles";
import { sectionClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import type { AssessmentAnalysis } from "@/lib/api/analysis";
import type { Assessment } from "@/lib/api/types";
import {
  attentionItems,
  correctOf,
  difficultyCounts,
  difficultyLabels,
  difficultyOrder,
  formatCoefficient,
  issueLabels,
  itemLabels,
  numberList,
  objectiveNumbers,
  reliabilityMethods,
  thresholds,
  validityCounts,
  validityLabels,
} from "@/lib/question-analysis";
import { AnalysisAssessmentSelect } from "./analysis-assessment-select";

const card = "flex flex-col gap-3 rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]";
const chip = "rounded-md px-2 py-0.5 text-xs font-semibold";

function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section className={cn(sectionClassName, "items-center py-12 text-center")}>
      <p className="text-base font-semibold text-[#1b1b1d]">{title}</p>
      {children && <div className="max-w-[560px] text-sm leading-normal text-[#45474c]">{children}</div>}
    </section>
  );
}

function MetricCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className={card}>
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold text-[#1b1b1d]">{title}</h4>
        <Image alt="" height={24} src={icon} width={24} />
      </div>
      {children}
    </section>
  );
}

function BigNumber({ value, caption }: { value: string; caption: string }) {
  return (
    <p className="flex items-baseline gap-2">
      <span className="text-[32px] font-bold leading-tight text-[#003d84]">{value}</span>
      <span className="text-xs text-[#45474c]">{caption}</span>
    </p>
  );
}

function QualityCards({ analysis }: { analysis: AssessmentAnalysis }) {
  const { summary, items } = analysis;
  const difficulty = difficultyCounts(items);
  const graded = difficultyOrder.reduce((sum, key) => sum + difficulty[key], 0);
  const pValues = items.flatMap((item) => (item.pValue === null ? [] : [item.pValue]));
  const validity = validityCounts(items);
  const reliability = summary.reliability;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <MetricCard icon="/assessment/chart.svg" title="Difficulty">
        <BigNumber caption="rata-rata P-index" value={formatCoefficient(summary.averagePValue)} />
        <div className="flex h-2 gap-1">
          {difficultyOrder.map((key) =>
            difficulty[key] ? (
              <span
                className={cn("rounded-full", difficultyLabels[key].bar)}
                key={key}
                style={{ width: `${(difficulty[key] / graded) * 100}%` }}
              />
            ) : null,
          )}
        </div>
        <div className="flex justify-between text-xs font-semibold text-[#1b1b1d]">
          {difficultyOrder.map((key) => (
            <span key={key}>
              {difficulty[key]} {difficultyLabels[key].label}
            </span>
          ))}
        </div>
        <p className="text-xs leading-normal text-[#45474c]">
          {pValues.length > 0 && `P per butir: ${formatCoefficient(Math.min(...pValues))}–${formatCoefficient(Math.max(...pValues))}. `}
          Komposisi kesulitan membantu menilai tujuan asesmen.
        </p>
      </MetricCard>

      <MetricCard icon="/assessment/check-circle.svg" title="Validity">
        <BigNumber caption="butir sesuai" value={`${validity.sesuai}/${items.length}`} />
        <div className="flex flex-wrap gap-2">
          <span className={cn(chip, validityLabels.sesuai.className)}>{validity.sesuai} Sesuai</span>
          <span className={cn(chip, validityLabels.perlu_ditinjau.className)}>{validity.perluDitinjau} Perlu Ditinjau</span>
          {validity.limited > 0 && <span className={cn(chip, "bg-[#eef1f5] text-[#45474c]")}>{validity.limited} Data terbatas</span>}
        </div>
        <p className="text-xs leading-normal text-[#45474c]">Point-biserial terhadap skor total TP terkait, bukan total seluruh asesmen.</p>
        <p className="text-xs font-semibold text-[#0058be]">Sesuai bila r ≥ {formatCoefficient(thresholds.validity)}</p>
      </MetricCard>

      <MetricCard icon="/assessment/clipboard-check.svg" title="Reliability">
        {reliability ? (
          <>
            <BigNumber caption={reliabilityMethods[reliability.method]} value={formatCoefficient(reliability.value)} />
            <span
              className={cn(
                chip,
                "self-start",
                reliability.reliable ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#b91c1c]",
              )}
            >
              {reliability.reliable ? "Reliabel" : "Belum reliabel"}
            </span>
            <p className="text-xs leading-normal text-[#45474c]">
              Tingkat asesmen, {items.length} butir {reliability.method === "kr20" ? "dikotomis" : "campuran"}. Bukan ukuran
              reliabilitas tiap butir.
            </p>
          </>
        ) : (
          <>
            <BigNumber caption="KR-20 / Cronbach" value="–" />
            <p className="text-xs leading-normal text-[#45474c]">
              Data belum cukup: perlu minimal 2 siswa dan 2 butir dengan skor total yang bervariasi.
            </p>
          </>
        )}
        <p className="text-xs font-semibold text-[#0058be]">Reliabel bila ≥ {formatCoefficient(thresholds.reliability)}</p>
      </MetricCard>
    </div>
  );
}

function AttentionBanner({ analysis }: { analysis: AssessmentAnalysis }) {
  const { labelCounts, problemCount } = analysis.summary;
  const { priority, revise } = attentionItems(analysis.items);
  const advice = [
    priority.length > 0 && `prioritaskan butir ${numberList(priority)}`,
    revise.length > 0 && `revisi butir ${numberList(revise)}`,
  ].filter(Boolean);

  return (
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#fafbfd] px-5 py-4 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
      <div className="leading-normal">
        <p className="text-base font-semibold text-[#1b1b1d]">
          Item Analysis: {problemCount ? `${problemCount} butir perlu perhatian` : "semua butir dalam ambang"}
        </p>
        <p className="text-xs text-[#45474c]">
          {advice.length
            ? `${advice.join("; ").replace(/^./, (letter) => letter.toUpperCase())} berdasarkan aturan label FR-G-093.`
            : "Tidak ada butir berlabel Revisi atau Perlu Ditinjau."}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className={cn(chip, itemLabels.baik.className)}>{labelCounts.baik} Baik</span>
        <span className={cn(chip, itemLabels.revisi.className)}>{labelCounts.revisi} Revisi</span>
        <span className={cn(chip, itemLabels.perlu_ditinjau.className)}>{labelCounts.perluDitinjau} Perlu Ditinjau</span>
      </div>
    </section>
  );
}

function ItemTable({ analysis }: { analysis: AssessmentAnalysis }) {
  const { summary, items } = analysis;
  const objectives = [
    ...new Map(items.flatMap((item) => item.learningObjectives).map((objective) => [objective.id, objective])).values(),
  ].sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
  const heads = ["No.", "TP", "Benar/N", "P-index", "Difficulty", "r point-biserial", "Validity", "Metrik di luar ambang", "Label item"];

  return (
    <section className="flex flex-col overflow-hidden rounded-3xl bg-[#fafbfd] shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
      <div className="flex flex-wrap items-start justify-between gap-4 p-6 pb-4">
        <div className="leading-normal">
          <h3 className="text-xl font-semibold text-[#1b1b1d]">Analisis butir soal</h3>
          <p className="text-xs text-[#45474c]">{items.length} butir, metrik difficulty, validity, dan label kualitas</p>
        </div>
        <a
          className={cn(outlineButtonClassName, "px-5 py-2 text-sm")}
          download
          href={`/api/assessments/${encodeURIComponent(analysis.assessment.id)}/analysis-report`}
        >
          Unduh laporan
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-separate border-spacing-0 text-left text-xs leading-normal">
          <thead className="bg-[#e6eff9] text-[#1b1b1d]">
            <tr>
              {heads.map((head) => (
                <th className="px-4 py-3 font-semibold" key={head}>
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const correct = correctOf(item);
              return (
                <tr className={item.label === "perlu_ditinjau" ? "bg-[#fff7f7]" : undefined} key={item.questionId} title={item.stem}>
                  <td className="border-b border-[#eae7e9] px-4 py-3 font-semibold text-[#003d84]">
                    {String(item.number).padStart(2, "0")}
                  </td>
                  <td className="border-b border-[#eae7e9] px-4 py-3 text-[#45474c]">{objectiveNumbers(item)}</td>
                  <td className="border-b border-[#eae7e9] px-4 py-3 text-[#45474c]">
                    {correct === null ? "Uraian" : `${correct}/${summary.analyzedStudents}`}
                  </td>
                  <td className="border-b border-[#eae7e9] px-4 py-3 font-semibold text-[#003d84]">{formatCoefficient(item.pValue)}</td>
                  <td className="border-b border-[#eae7e9] px-4 py-3 text-[#45474c]">
                    {item.difficulty ? difficultyLabels[item.difficulty].label : "–"}
                  </td>
                  <td className="border-b border-[#eae7e9] px-4 py-3 font-semibold text-[#003d84]">
                    {formatCoefficient(item.pointBiserial)}
                  </td>
                  <td className="border-b border-[#eae7e9] px-4 py-3">
                    {item.validity ? (
                      <span className={cn(chip, validityLabels[item.validity].className)}>{validityLabels[item.validity].label}</span>
                    ) : (
                      <span className="text-[#75777d]" title="Tidak ada butir lain pada TP yang sama, atau skor tidak bervariasi.">
                        Data terbatas
                      </span>
                    )}
                  </td>
                  <td
                    className="border-b border-[#eae7e9] px-4 py-3 text-[#45474c]"
                    title={item.issues.map((issue) => issueLabels[issue]).join(", ") || undefined}
                  >
                    {item.label === null ? "–" : item.issues.length}
                    {item.issues.length > 0 && (
                      <span className="ml-1 text-[10px] text-[#75777d]">({item.issues.map((issue) => issueLabels[issue]).join("; ")})</span>
                    )}
                  </td>
                  <td className="border-b border-[#eae7e9] px-4 py-3">
                    {item.label ? <span className={cn(chip, itemLabels[item.label].className)}>{itemLabels[item.label].label}</span> : "–"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-1 px-6 py-4 text-xs leading-normal">
        <p className="font-semibold text-[#1b1b1d]">
          Menampilkan seluruh {items.length} butir, N = {summary.analyzedStudents} siswa dengan nilai akhir
          {summary.gradingPending > 0 && `, ${summary.gradingPending} siswa menunggu penilaian uraian, belum dihitung`}
        </p>
        {objectives.length > 0 && (
          <p className="text-[#75777d]">
            {objectives.map((objective) => `TP ${objective.number}: ${objective.description}`).join("; ")}
          </p>
        )}
      </div>
    </section>
  );
}

function MethodSection() {
  const rules = [
    { issues: "0 (semua dalam ambang)", label: itemLabels.baik },
    { issues: "1 (satu metrik keluar)", label: itemLabels.revisi },
    { issues: "≥2 (dua atau lebih)", label: itemLabels.perlu_ditinjau },
  ];
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-xl font-semibold leading-normal text-[#1b1b1d]">Metode &amp; aturan interpretasi</h3>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className={card}>
          <h4 className="text-base font-semibold text-[#1b1b1d]">Cara membaca metrik</h4>
          {[
            {
              title: "Difficulty (P-index)",
              body: "P = rata-rata skor butir (untuk PG: jumlah jawaban benar / jumlah siswa). Mudah: P > 0,70; Sedang: 0,30–0,70 (inklusif); Sulit: P < 0,30.",
            },
            {
              title: "Validity (point-biserial)",
              body: "Korelasi skor butir dengan skor total TP-nya, bukan skor total seluruh asesmen. Sesuai: r ≥ 0,30; Perlu Ditinjau: r < 0,30.",
            },
            {
              title: "Reliability (tingkat asesmen)",
              body: "KR-20 untuk butir dikotomis (0/1); Cronbach's Alpha untuk non-dikotomis. Reliabel bila ≥ 0,70. Butir yang menaikkan reliabilitas bila dibuang dihitung sebagai satu metrik di luar ambang.",
            },
          ].map((entry) => (
            <div className="text-xs leading-normal" key={entry.title}>
              <p className="font-semibold text-[#0058be]">{entry.title}</p>
              <p className="text-[#45474c]">{entry.body}</p>
            </div>
          ))}
        </section>
        <section className={card}>
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-base font-semibold text-[#1b1b1d]">Aturan label item</h4>
            <span className={cn(chip, "bg-[#e6eff9] text-[#0058be]")}>Perlu konfirmasi</span>
          </div>
          <p className="text-xs leading-normal text-[#45474c]">
            Label per butir mengikuti FR-G-093. Ambang P 0,30–0,70, r ≥ 0,30, dan reliabilitas ≥ 0,70 masih default (OI-12) sampai
            dikonfirmasi guru mapel.
          </p>
          <table className="w-full border-separate border-spacing-0 text-left text-xs">
            <thead className="bg-[#e6eff9] text-[#1b1b1d]">
              <tr>
                <th className="px-3 py-2 font-semibold">Metrik di luar ambang</th>
                <th className="px-3 py-2 font-semibold">Label item</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.issues}>
                  <td className="border-b border-[#eae7e9] px-3 py-2.5 text-[#1b1b1d]">{rule.issues}</td>
                  <td className="border-b border-[#eae7e9] px-3 py-2.5">
                    <span className={cn(chip, rule.label.className)}>{rule.label.label}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs leading-normal text-[#45474c]">
            Mudah atau Sulit tidak selalu berarti soal buruk. Pertimbangkan tujuan asesmen sebelum merevisi.
          </p>
        </section>
      </div>
    </section>
  );
}

// Analisis Soal (PRD 5.5.2, SRS FR-G-090 – 093; Figma New Design 65:16039).
export function QuestionAnalysisPage({
  slug,
  assessments,
  selectedId,
  analysis,
}: {
  slug: string;
  assessments: Assessment[];
  selectedId: string | null;
  analysis: AssessmentAnalysis | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <AnalysisAssessmentSelect assessments={assessments} selectedId={selectedId} slug={slug} />

      {assessments.length === 0 ? (
        <Empty title="Belum ada asesmen yang terbit.">Analisis soal muncul setelah asesmen dipublikasikan dan dikerjakan siswa.</Empty>
      ) : !analysis ? (
        <Empty title="Analisis soal belum tersedia.">Server belum menyediakan analisis untuk asesmen ini. Pastikan backend sudah versi terbaru.</Empty>
      ) : analysis.summary.analyzedStudents === 0 ? (
        <Empty title="Belum ada jawaban yang bisa dianalisis.">
          Analisis dihitung dari siswa yang sudah punya nilai akhir.
          {analysis.summary.gradingPending > 0 &&
            ` ${analysis.summary.gradingPending} siswa masih menunggu penilaian uraian.`}
        </Empty>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h3 className="text-xl font-semibold leading-normal text-[#1b1b1d]">Kualitas instrumen</h3>
            <span className="text-xs text-[#75777d]">
              Ringkasan {analysis.summary.itemCount} butir, {analysis.summary.analyzedStudents} siswa
            </span>
          </div>
          <QualityCards analysis={analysis} />
          <AttentionBanner analysis={analysis} />
          <ItemTable analysis={analysis} />
          <MethodSection />
        </>
      )}
    </div>
  );
}
