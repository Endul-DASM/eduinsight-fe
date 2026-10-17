import Image from "next/image";
import Link from "next/link";
import { outlineButtonClassName, primaryButtonClassName } from "@/components/auth/styles";
import { fieldLabelClassName, sectionClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import { assessmentTypeLabels, formatSchedule } from "@/lib/assessment-form";
import { formatPercent } from "@/lib/assessment-results";
import type { MaterialReference, RemedialPair } from "@/lib/remedial";
import { REMEDIAL_SOURCE_TYPES, weakObjectives } from "@/lib/remedial-figures";
import { SourceSelect } from "./source-select";

const card = "flex flex-col gap-3 rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]";
const chip = "rounded-md px-2 py-0.5 text-xs font-semibold";
const note = "flex items-start gap-3 rounded-xl bg-[#e6eff9] px-4 py-3 text-xs leading-normal text-[#1b1b1d]";

function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section className={cn(sectionClassName, "items-center py-12 text-center")}>
      <p className="text-base font-semibold text-[#1b1b1d]">{title}</p>
      {children && <div className="max-w-[560px] text-sm leading-normal text-[#45474c]">{children}</div>}
    </section>
  );
}

function Stat({ title, value, caption }: { title: string; value: string; caption: string }) {
  return (
    <section className="flex flex-col gap-1 rounded-2xl bg-[#fafbfd] p-5 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
      <p className="text-xs font-semibold text-[#1b1b1d]">{title}</p>
      <p className="text-[28px] font-bold leading-tight text-[#0058be]">{value}</p>
      <p className="text-xs text-[#45474c]">{caption}</p>
    </section>
  );
}

// Analisis Remedial (PRD 5.5.3, SRS FR-G-100 – 107; Figma New Design 85:8869). The backend has no remedial module
// (no grouping, no AI recommendation, no ACC, no source ↔ remedial link), so the targets come from the source
// assessment's results and the chosen remedial's results; the AI parts are marked as coming soon.
export function RemedialAnalysisPage({
  slug,
  pair,
  references,
}: {
  slug: string;
  pair: RemedialPair;
  references: MaterialReference[];
}) {
  if (pair.sources.length === 0) {
    return (
      <Empty title="Belum ada asesmen yang bisa memicu remedial.">
        Siswa target diambil dari post-test, ulangan harian, UTS, atau UAS yang sudah dipublikasikan dan dikerjakan.
      </Empty>
    );
  }

  const { source, sourceResults, targets } = pair;
  const performance = sourceResults?.classPerformance;
  const pending = targets.filter((target) => target.mastery === "perlu_remedial").length;
  const mastered = targets.length - pending;
  const drafts = pair.remedials.filter((assessment) => assessment.status === "draft");
  const draft = drafts[0] ?? null;
  const weak = sourceResults ? weakObjectives(sourceResults, targets) : [];
  const materialCount = new Set(references.flatMap((reference) => reference.materials.map((material) => material.id))).size;
  const query = new URLSearchParams();
  if (source) query.set("source", source.id);
  if (pair.remedial) query.set("remedial", pair.remedial.id);

  return (
    <div className="flex flex-col gap-6">
      <section className={card}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-[#1b1b1d]">Asesmen sumber</h3>
          {source?.opensAt && <span className="text-xs text-[#45474c]">{formatSchedule(source.opensAt)}</span>}
        </div>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_120px]">
          <SourceSelect remedialId={pair.remedial?.id ?? null} slug={slug} sourceId={source?.id ?? null} sources={pair.sources} />
          <div className="flex flex-col gap-2">
            <span className={fieldLabelClassName}>KKM</span>
            <span className="flex h-[48px] items-center rounded-xl border border-[#c5c6cd] bg-white px-4 text-sm text-[#1b1b1d]">
              {source?.kkm ?? "–"}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-[#45474c]">Jenis asesmen</span>
          {REMEDIAL_SOURCE_TYPES.map((type) => (
            <span
              className={cn(
                "rounded-full px-3 py-1 font-semibold",
                type === source?.type ? "bg-[rgba(153,188,229,0.6)] text-[#004695]" : "text-[#0058be]",
              )}
              key={type}
            >
              {assessmentTypeLabels[type]}
            </span>
          ))}
          {performance && <span className="text-[#45474c]">{performance.submitted} siswa mengerjakan</span>}
        </div>
        {sourceResults && source && (
          <p className={note}>
            <Image alt="" className="mt-0.5" height={16} src="/assessment/link.svg" width={16} />
            <span>
              Target otomatis: {targets.length} siswa dengan skor &lt; KKM {source.kkm}. Data tersinkron dari Hasil Asesmen
              {pair.remedial
                ? `; ${mastered} siswa sudah tuntas setelah ${pair.remedial.title}.`
                : "; belum ada asesmen remedial untuk dibandingkan."}
            </span>
          </p>
        )}
      </section>

      {!sourceResults ? (
        <Empty title="Hasil asesmen sumber belum tersedia.">Server belum menyediakan hasil untuk asesmen ini.</Empty>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat caption="Skor asesmen di bawah KKM" title="Target awal" value={`${targets.length} / ${performance?.submitted ?? 0}`} />
            <Stat caption="Masih memerlukan tindak lanjut" title="Perlu Remedial" value={String(pending)} />
            <Stat caption={`Skor remedial ≥ ${source?.kkm ?? "KKM"}`} title="Sudah tuntas" value={String(mastered)} />
            <Stat caption="Asesmen remedial berstatus draf" title="Draf menunggu ACC" value={String(drafts.length)} />
          </div>

          <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-base font-semibold text-[#1b1b1d]">
                <Image alt="" height={22} src="/assessment/brain.svg" width={22} />
                Kelompok belajar
              </h3>
              <span className={cn(chip, "bg-[#e6eff9] text-[#0058be]")}>Analisis AI · segera tersedia</span>
            </div>
            <p className="text-xs text-[#45474c]">
              AI akan mengelompokkan siswa target menjadi Belum Paham, Butuh Latihan, dan Pengayaan berdasarkan pola kesalahan per TP,
              bukan skor akhir saja (FR-G-101). Guru dapat memindahkan siswa sebelum ACC.
            </p>
            <section className={card}>
              <p className="text-sm font-semibold text-[#1b1b1d]">TP yang belum tercapai siswa target</p>
              {weak.length === 0 ? (
                <p className="text-xs text-[#45474c]">
                  {targets.length === 0 ? "Tidak ada siswa di bawah KKM." : "Rata-rata TP siswa target sudah mencapai KKM."}
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {weak.map(({ objective, average }) => (
                    <li className="flex flex-wrap items-baseline justify-between gap-2 text-xs" key={objective.learningObjective.id}>
                      <span className="text-[#1b1b1d]">
                        <span className="font-semibold">TP {objective.learningObjective.number}</span> ·{" "}
                        {objective.learningObjective.description}
                      </span>
                      <span className="font-semibold text-[#dc2626]">{formatPercent(average)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-base font-semibold text-[#1b1b1d]">Rekomendasi AI · tindak lanjut berikutnya</h3>
            <div className="grid gap-4 lg:grid-cols-2">
              <section className={card}>
                <div className="flex items-center justify-between gap-2">
                  <h4 className="flex items-center gap-2 text-base font-semibold text-[#1b1b1d]">
                    <Image alt="" height={22} src="/assessment/clipboard-pen.svg" width={22} />
                    Latihan per kelompok
                  </h4>
                  <span className={cn(chip, "bg-[#e6eff9] text-[#0058be]")}>Segera tersedia</span>
                </div>
                <p className="text-xs text-[#1b1b1d]">
                  Draf soal latihan per kelompok dari AI belum tersedia (FR-G-102). Rujukan materi sudah bisa dipakai.
                </p>
                <p className="text-xs leading-normal text-[#45474c]">
                  {references.length === 0
                    ? "Belum ada TP yang perlu rujukan materi."
                    : `Rujukan Resource Library: ${materialCount} materi untuk ${references.length} TP (${references
                        .map((reference) => `TP ${reference.objectiveNumber}`)
                        .join(", ")}).`}
                </p>
                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                  <span className="text-xs text-[#45474c]">Belum terlihat siswa</span>
                  <Link className={cn(outlineButtonClassName, "px-4 py-2 text-sm")} href={`/${slug}/remedial?${query}`}>
                    Lihat rujukan
                  </Link>
                </div>
              </section>

              <section className={card}>
                <div className="flex items-center justify-between gap-2">
                  <h4 className="flex items-center gap-2 text-base font-semibold text-[#1b1b1d]">
                    <Image alt="" height={22} src="/assessment/clipboard-check.svg" width={22} />
                    Remedial resmi
                  </h4>
                  {draft && <span className={cn(chip, "bg-[#ffedd5] text-[#9a3412]")}>Draf</span>}
                </div>
                {draft ? (
                  <>
                    <p className="text-xs text-[#1b1b1d]">
                      {draft.questionCount} soal · {draft.title} · jenis: remedial
                    </p>
                    <p className="text-xs leading-normal text-[#45474c]">
                      Khusus {pending} siswa berstatus Perlu Remedial pada {source?.title}. Siswa yang tuntas tidak akan melihat soal ini
                      (BR-08).
                    </p>
                  </>
                ) : (
                  <p className="text-xs leading-normal text-[#45474c]">
                    Belum ada draf remedial. Draf soal remedial resmi dari AI (FR-G-103) belum tersedia; buat remedial secara manual
                    terlebih dahulu.
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                  <span className="text-xs text-[#45474c]">Belum terlihat siswa</span>
                  <Link
                    className={cn(primaryButtonClassName, "px-4 py-2 text-sm")}
                    href={
                      draft
                        ? `/${slug}/assessment/${draft.id}?method=ketik&step=review`
                        : `/${slug}/assessment/new?method=ketik&type=remedial`
                    }
                  >
                    {draft ? "Review & ACC" : "Buat remedial"}
                  </Link>
                </div>
              </section>
            </div>
          </section>

          <p className={note}>
            <Image alt="" className="mt-0.5" height={16} src="/assessment/check-circle.svg" width={16} />
            Konten baru hanya tampil setelah guru menekan ACC. Naskah, opsi, kunci jawaban, dan anggota kelompok dapat diedit terlebih
            dahulu.
          </p>
        </>
      )}
    </div>
  );
}
