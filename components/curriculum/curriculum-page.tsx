import Link from "next/link";
import { cn } from "@/components/ui/cn";
import type { Material } from "@/lib/api/materials";
import type { CurriculumTree, Subject } from "@/lib/api/types";
import { MaterialsBoard } from "@/components/materials/materials-board";
import { CurriculumBoard } from "./curriculum-board";

const tabs = [
  { id: "kurikulum", label: "Kurikulum" },
  { id: "materi", label: "Upload Materi" },
] as const;

export type CurriculumTab = (typeof tabs)[number]["id"];

// Kurikulum (PRD 5.3.1 – 5.3.2; Figma New Design 93:6201, 50:3478, 54:6193).
export function CurriculumPage({
  subject,
  teacherName,
  tab,
  tree,
  error,
  selectedChapterId,
  materials,
}: {
  subject: Subject;
  teacherName: string;
  tab: CurriculumTab;
  tree: CurriculumTree | null;
  error?: string;
  selectedChapterId: string | null;
  // Only loaded for the Upload Materi tab, with the confirmed TP numbers of each material.
  materials?: { items: Material[]; objectiveNumbers: Record<string, string[]> };
}) {
  const baseHref = `/${subject.slug}/curriculum`;

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8">
      <div className="leading-normal">
        <h2 className="text-2xl font-bold text-[#1b1b1d] sm:text-[32px]">Kelola Kurikulum &amp; Materi Bersama {teacherName}</h2>
        <p className="text-base text-[#45474c]">
          Atur Capaian Pembelajaran, bab, serta Tujuan Pembelajaran dari mata pelajaran untuk memudahkan identifikasi
          ketercapaian TP siswa.
        </p>
      </div>

      <nav aria-label="Tab Kurikulum" className="flex gap-6 border-b border-[#c5c6cd]">
        {tabs.map((item) => {
          const active = item.id === tab;
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "-mb-px border-b-2 pb-3 text-base",
                active ? "border-[#0058be] font-semibold text-[#0058be]" : "border-transparent font-medium text-[#6b7280] hover:text-[#1b1b1d]",
              )}
              href={item.id === "kurikulum" ? baseHref : `${baseHref}?tab=${item.id}`}
              key={item.id}
              scroll={false}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {tab === "materi" && tree && materials ? (
        <MaterialsBoard
          chapters={tree.chapters}
          classLabel={subject.class.name}
          materials={materials.items}
          objectiveNumbers={materials.objectiveNumbers}
          slug={subject.slug}
          subjectId={subject.id}
        />
      ) : !tree ? (
        <p className="rounded-3xl bg-[#ffdad6] px-6 py-4 text-sm leading-normal text-[#93000a]" role="alert">
          {error ?? "Kurikulum belum dapat dimuat."}
        </p>
      ) : (
        <CurriculumBoard
          selectedChapterId={selectedChapterId}
          slug={subject.slug}
          subjectId={subject.id}
          subjectName={subject.name}
          subtitle={`${subject.name}  |  ${subject.class.name}`}
          tree={tree}
        />
      )}
    </div>
  );
}
