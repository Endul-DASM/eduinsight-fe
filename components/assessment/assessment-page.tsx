import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

const tabs = [
  { id: "buat", label: "Buat Asesmen" },
  { id: "daftar", label: "Daftar Asesmen" },
  { id: "hasil", label: "Hasil Asesmen" },
] as const;

export type AssessmentTab = (typeof tabs)[number]["id"];

export function assessmentTabOf(value: unknown): AssessmentTab {
  return tabs.find((tab) => tab.id === value)?.id ?? "buat";
}

// Asesmen (PRD 5.4; Figma New Design 60:4158): Buat Asesmen, Daftar Asesmen and Hasil Asesmen as tabs.
export function AssessmentPage({
  slug,
  teacherName,
  tab,
  children,
}: {
  slug: string;
  teacherName: string;
  tab: AssessmentTab;
  children: ReactNode;
}) {
  const baseHref = `/${slug}/assessment`;

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8">
      <div className="leading-normal">
        <h2 className="text-2xl font-bold text-[#1b1b1d] sm:text-[32px]">Kelola Asesmen Bersama {teacherName}!</h2>
        <p className="text-base text-[#45474c]">
          Atur asesmen untuk mata pelajaran di kelas, sampai menganalisa hasil asesmen.
        </p>
      </div>

      <nav aria-label="Tab Asesmen" className="flex gap-6 overflow-x-auto border-b border-[#c5c6cd]">
        {tabs.map((item) => {
          const active = item.id === tab;
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "-mb-px shrink-0 border-b-2 pb-3 text-base",
                active ? "border-[#0058be] font-semibold text-[#0058be]" : "border-transparent font-medium text-[#6b7280] hover:text-[#1b1b1d]",
              )}
              href={item.id === "buat" ? baseHref : `${baseHref}?tab=${item.id}`}
              key={item.id}
              scroll={false}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
