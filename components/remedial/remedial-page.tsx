import Image from "next/image";
import Link from "next/link";
import { primaryButtonClassName } from "@/components/auth/styles";
import { AssessmentCard } from "@/components/assessment/assessment-card";
import { sectionClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import type { AssessmentCard as Card } from "@/lib/assessment-list";
import { formatScore } from "@/lib/assessment-results";
import type { MaterialReference, RemedialPair } from "@/lib/remedial";
import { PairSelect } from "./pair-select";
import { TargetsCard } from "./targets-card";

function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section className={cn(sectionClassName, "items-center py-12 text-center")}>
      <p className="text-base font-semibold text-[#1b1b1d]">{title}</p>
      {children && <div className="max-w-[560px] text-sm leading-normal text-[#45474c]">{children}</div>}
    </section>
  );
}

function ReferencesCard({ slug, references }: { slug: string; references: MaterialReference[] }) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-base font-semibold leading-normal text-[#1b1b1d]">
          <Image alt="" height={22} src="/materials/book.svg" width={22} />
          Rujukan materi sesuai TP yang belum tercapai
        </h3>
        <Link
          className="rounded-3xl bg-[rgba(153,188,229,0.6)] px-2 py-1 text-xs font-semibold text-[#004695] hover:bg-[rgba(153,188,229,0.85)]"
          href={`/${slug}/curriculum?tab=materi`}
        >
          Resource Library
        </Link>
      </div>
      {references.length === 0 ? (
        <p className="py-4 text-sm text-[#45474c]">Rata-rata TP siswa target sudah mencapai KKM, jadi tidak ada TP yang perlu dirujuk.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-separate border-spacing-0 text-left text-xs leading-normal">
            <thead className="text-[#45474c]">
              <tr>
                <th className="border-b border-[#eae7e9] px-2 py-3 font-semibold">Tujuan pembelajaran</th>
                <th className="border-b border-[#eae7e9] px-2 py-3 font-semibold">Bab / Subbab terpetakan</th>
                <th className="border-b border-[#eae7e9] px-2 py-3 font-semibold">Materi & bagian spesifik</th>
              </tr>
            </thead>
            <tbody>
              {references.map((reference) => (
                <tr className="align-top" key={reference.objectiveId}>
                  <td className="w-[38%] border-b border-[#eae7e9] px-2 py-4 text-[#1b1b1d]">
                    <span className="font-semibold">TP {reference.objectiveNumber}</span> · {reference.objectiveDescription}
                    <span className="block text-[#dc2626]">Rata-rata siswa target {formatScore(reference.average)}</span>
                  </td>
                  <td className="border-b border-[#eae7e9] px-2 py-4 text-[#1b1b1d]">{reference.location}</td>
                  <td className="border-b border-[#eae7e9] px-2 py-4">
                    {reference.materials.length === 0 ? (
                      <span className="text-[#75777d]">Belum ada materi yang dipetakan ke TP ini.</span>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {reference.materials.map((material) => (
                          <li key={material.id}>
                            <a
                              className="font-semibold text-[#0058be] hover:underline"
                              href={`/api/materials/${material.id}/file`}
                              rel="noopener"
                              target="_blank"
                            >
                              {material.title} ↗
                            </a>
                            {material.sections.length > 0 && (
                              <span className="block text-[#75777d]">Bagian: {material.sections.join("; ")}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// Pantau Remedial (PRD 5.5.3, SRS FR-G-100 – 107; Figma New Design 65:16207). The backend has no remedial module
// yet, so the page is assembled from the source assessment's results, the remedial assessment's attempts and
// results, and the materials mapped to the weak TPs.
export function RemedialPage({
  slug,
  pair,
  references,
  cards,
}: {
  slug: string;
  pair: RemedialPair;
  references: MaterialReference[];
  // Assessments of type remedial, as Daftar Asesmen cards.
  cards: Card[];
}) {
  const query = new URLSearchParams();
  if (pair.source) query.set("source", pair.source.id);
  if (pair.remedial) query.set("remedial", pair.remedial.id);
  const scheduleHref = `/${slug}/remedial/jadwal?${query}`;
  const newRemedialHref = `/${slug}/assessment/new?method=ketik&type=remedial`;

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8">
      <div className="leading-normal">
        <h2 className="text-2xl font-bold text-[#1b1b1d] sm:text-[32px]">Pantau Remedial</h2>
        <p className="text-base text-[#45474c]">Berikan soal terpersonalisasi terhadap siswa yang butuh remedial.</p>
      </div>

      {pair.sources.length === 0 ? (
        <Empty title="Belum ada asesmen yang bisa memicu remedial.">
          Siswa target diambil dari post-test, ulangan harian, UTS, atau UAS yang sudah dipublikasikan dan dikerjakan.
        </Empty>
      ) : (
        <>
          <PairSelect
            remedialId={pair.remedial?.id ?? null}
            remedials={pair.remedials}
            sourceId={pair.source?.id ?? null}
            sources={pair.sources}
          />

          {!pair.sourceResults ? (
            <Empty title="Hasil asesmen asal belum tersedia." />
          ) : pair.targets.length === 0 ? (
            <Empty title="Tidak ada siswa yang perlu remedial.">
              Semua siswa yang sudah dinilai pada {pair.source?.title} mencapai KKM {pair.sourceResults.assessment.kkm}.
            </Empty>
          ) : (
            <>
              <TargetsCard
                kkm={pair.sourceResults.assessment.kkm}
                remedialChosen={Boolean(pair.remedial)}
                scheduleHref={scheduleHref}
                sourceTitle={pair.source?.title ?? ""}
                targets={pair.targets}
              />
              <ReferencesCard references={references} slug={slug} />
            </>
          )}

          <Link className={cn(primaryButtonClassName, "gap-3 self-start")} href={`${scheduleHref}#riwayat`}>
            Lihat Hasil Remedial Sebelumnya
            <Image alt="" height={24} src="/assessment/arrow-right.svg" width={24} />
          </Link>
        </>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-semibold leading-normal text-[#1b1b1d]">Soal Remedial yang sudah di-generate</h3>
        <Link className="text-sm font-semibold text-[#0058be] hover:underline" href={newRemedialHref}>
          + Buat Soal Remedial
        </Link>
      </div>
      {cards.length === 0 ? (
        <Empty title="Belum ada soal remedial.">
          Buat asesmen berjenis Remedial lewat Buat Asesmen; pembuatan soal remedial dengan AI (FR-G-103) segera tersedia.
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <AssessmentCard card={card} key={card.assessment.id} slug={slug} />
          ))}
        </div>
      )}
    </div>
  );
}
