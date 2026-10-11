import Image from "next/image";
import Link from "next/link";
import { cn } from "@/components/ui/cn";
import type { CurriculumTree, Subject } from "@/lib/api/types";
import { CurriculumBoard } from "./curriculum-board";
import { sectionClassName } from "./styles";

const tabs = [
  { id: "kurikulum", label: "Kurikulum" },
  { id: "materi", label: "Upload Materi" },
] as const;

export type CurriculumTab = (typeof tabs)[number]["id"];

// Kurikulum (PRD 5.3.1; Figma New Design 93:6201, 50:3478). The Upload Materi tab comes in a later change.
export function CurriculumPage({
  subject,
  teacherName,
  tab,
  tree,
  error,
  selectedChapterId,
}: {
  subject: Subject;
  teacherName: string;
  tab: CurriculumTab;
  tree: CurriculumTree | null;
  error?: string;
  selectedChapterId: string | null;
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

      {tab === "materi" ? (
        <section className={cn(sectionClassName, "items-center py-12 text-center")}>
          <span className="grid size-24 place-items-center rounded-full bg-[#e6eff9]">
            <Image alt="" height={48} src="/curriculum/chapter-list.svg" width={48} />
          </span>
          <p className="text-xl font-semibold text-[#1b1b1d]">Unggah materi segera tersedia</p>
          <p className="max-w-[520px] text-sm leading-normal text-[#45474c]">
            Di sini nanti Anda bisa mengunggah PDF, DOCX, atau PPTX, lalu mengaitkannya ke Bab dan TP.
          </p>
        </section>
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
