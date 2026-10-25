"use client";

import Image from "next/image";
import { Modal } from "@/components/ui/modal";
import type { EnrolledStudent } from "@/lib/api/subjects";
import type { StudentRecommendation } from "@/lib/remedial";

// The glass modal of the new design, narrower than the Bab form.
const modalClassName =
  "max-w-[640px] rounded-3xl border border-[#c5c6cd] bg-white/90 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-xs backdrop:bg-[rgba(9,20,38,0.2)] backdrop:backdrop-blur-sm";

// Lihat Materi of Daftar Siswa (UAT SIS-H04): the materials of the student's approved remedial packages, the ones
// the student sees as Direkomendasikan in Materi (FR-S-032).
export function StudentMaterialsModal({
  student,
  materials,
  onClose,
}: {
  student: EnrolledStudent | null;
  materials: StudentRecommendation[];
  onClose: () => void;
}) {
  return (
    <Modal
      align="start"
      className={modalClassName}
      description="Materi dari paket remedial yang sudah di-ACC. Siswa melihatnya di menu Materi sebagai Direkomendasikan."
      onClose={onClose}
      open={Boolean(student)}
      showClose
      title={student ? `Materi Rekomendasi ${student.name}` : ""}
    >
      {materials.length === 0 ? (
        <p className="py-4 text-center text-sm leading-normal text-[#45474c]">
          Belum ada materi rekomendasi untuk siswa ini. Materi muncul setelah paket remedial kelompoknya di-ACC.
        </p>
      ) : (
        <ul className="flex max-h-[60vh] flex-col overflow-y-auto">
          {materials.map(({ material, sources, objectiveNumbers }) => (
            <li className="flex items-center gap-3 border-b border-[#c5c6cd] py-3 last:border-b-0" key={material.id}>
              <Image alt="" className="h-9 w-8 shrink-0" height={36} src="/materials/file.svg" width={32} />
              <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm leading-normal">
                <a
                  className="truncate font-medium text-[#1b1b1d] hover:text-[#0058be] hover:underline"
                  href={`/api/materials/${encodeURIComponent(material.id)}/file`}
                  rel="noopener"
                  target="_blank"
                  title={material.title}
                >
                  {material.title}
                </a>
                <p className="text-xs text-[#45474c]">
                  {objectiveNumbers.length > 0 ? `TP ${objectiveNumbers.join(", ")}` : "TP belum ada"}
                  {sources.length > 0 && `, dari ${sources.map((source) => source.title).join(", ")}`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
