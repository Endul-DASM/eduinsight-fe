"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { outlineButtonClassName, primaryButtonClassName } from "@/components/auth/styles";
import { cn } from "@/components/ui/cn";
import { formatScore } from "@/lib/assessment-results";
import { masteryLabels, progressLabels, type TargetRow } from "@/lib/remedial-figures";

const headCell = "border-b border-[#eae7e9] px-2 py-3 text-left text-xs font-semibold leading-normal text-[#45474c]";
const bodyCell = "border-b border-[#eae7e9] px-2 py-3 text-xs leading-normal text-[#1b1b1d]";
const chip = "whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-semibold";

// Siswa Butuh Remedial (FR-G-100, FR-G-106, FR-G-107; Figma New Design 65:16207). Kelompok AI and ACC peserta wait
// for the backend (FR-G-101, FR-G-104), so they are shown but disabled.
export function TargetsCard({
  targets,
  kkm,
  sourceTitle,
  remedialChosen,
  scheduleHref,
}: {
  targets: TargetRow[];
  kkm: number;
  sourceTitle: string;
  remedialChosen: boolean;
  scheduleHref: string;
}) {
  const [query, setQuery] = useState("");
  const [onlyPending, setOnlyPending] = useState(false);
  const pending = targets.filter((target) => target.mastery === "perlu_remedial");
  const shown = (onlyPending ? pending : targets).filter((target) =>
    target.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <section className="flex flex-col gap-5 rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
      <div className="leading-normal">
        <h3 className="text-base font-semibold text-[#1b1b1d]">Siswa Butuh Remedial</h3>
        <p className="text-xs text-[#45474c]">
          Siswa dengan skor di bawah KKM {kkm} pada {sourceTitle}.
          {!remedialChosen && " Pilih asesmen remedial untuk melihat progres dan hasil reassessment."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex h-[44px] w-full items-center gap-3 rounded-xl border border-[#c5c6cd] bg-white px-3 focus-within:border-[#0058be] sm:w-[240px]">
          <input
            aria-label="Cari nama siswa"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#75777d]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama siswa..."
            value={query}
          />
          <Image alt="" height={20} src="/assessment/search.svg" width={20} />
        </label>
        <div className="flex gap-2 text-xs font-semibold">
          <button
            aria-pressed={!onlyPending}
            className={cn("rounded-3xl px-2 py-1", !onlyPending ? "bg-[rgba(153,188,229,0.6)] text-[#004695]" : "text-[#004695]")}
            onClick={() => setOnlyPending(false)}
            type="button"
          >
            Semua target ({targets.length})
          </button>
          <button
            aria-pressed={onlyPending}
            className={cn("rounded-3xl px-2 py-1", onlyPending ? "bg-[rgba(153,188,229,0.6)] text-[#004695]" : "text-[#004695]")}
            onClick={() => setOnlyPending(true)}
            type="button"
          >
            Perlu Remedial ({pending.length})
          </button>
        </div>
        <Link className={cn(primaryButtonClassName, "ml-auto")} href={scheduleHref}>
          Jadwalkan Remedial
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className={headCell}>
                <span className="sr-only">Pilih</span>
              </th>
              <th className={headCell}>Siswa</th>
              <th className={headCell}>Skor awal</th>
              <th className={headCell}>Kelompok AI</th>
              <th className={headCell}>Progres remedial</th>
              <th className={headCell}>Reassessment</th>
              <th className={headCell}>Ketuntasan</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((target) => (
              <tr key={target.studentId}>
                <td className={cn(bodyCell, "w-8")}>
                  <input
                    aria-label={`Pilih ${target.name} (segera tersedia)`}
                    className="size-4 accent-[#0058be]"
                    disabled
                    title="Memilih peserta remedial butuh dukungan backend"
                    type="checkbox"
                  />
                </td>
                <td className={bodyCell}>{target.name}</td>
                <td className={cn(bodyCell, "font-semibold text-[#dc2626]")}>{formatScore(target.initialScore)}</td>
                <td className={cn(bodyCell, "text-[#9aa1ae]")} title="Pengelompokan siswa dengan AI (FR-G-101) segera tersedia">
                  —
                </td>
                <td className={bodyCell}>
                  {target.progress ? (
                    <span className={cn(chip, progressLabels[target.progress].className)}>{progressLabels[target.progress].label}</span>
                  ) : (
                    <span className="text-[#9aa1ae]">—</span>
                  )}
                </td>
                <td className={bodyCell}>
                  {target.newScore !== null ? `${formatScore(target.newScore)} / 100` : target.awaitingGrade ? "Menunggu penilaian" : "Belum dinilai"}
                </td>
                <td className={bodyCell}>
                  <span className={cn(chip, masteryLabels[target.mastery].className)}>{masteryLabels[target.mastery].label}</span>
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-[#45474c]" colSpan={7}>
                  Tidak ada siswa yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs leading-normal text-[#75777d]">
          Menampilkan {shown.length} dari {targets.length} target. Ketuntasan mengikuti hasil reassessment (skor ≥ KKM),
          bukan progres latihan.
        </p>
        <button
          className={cn(outlineButtonClassName, "px-4 py-2 text-sm")}
          disabled
          title="ACC peserta remedial (FR-G-104) butuh dukungan backend"
          type="button"
        >
          Acc Peserta Remedial
        </button>
      </div>
    </section>
  );
}
