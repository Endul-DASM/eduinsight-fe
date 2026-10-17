import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

const tabs = [
  { id: "diagnosis", label: "Diagnosis" },
  { id: "soal", label: "Analisis Soal" },
  { id: "remedial", label: "Analisis Remedial" },
] as const;

export type AnalysisTab = (typeof tabs)[number]["id"];

export function analysisTabOf(value: unknown): AnalysisTab {
  return tabs.find((tab) => tab.id === value)?.id ?? "diagnosis";
}

// Analisis (PRD 5.5; Figma New Design 65:15809): Diagnosis, Analisis Soal and Analisis Remedial as tabs.
export function AnalysisShell({ slug, tab, children }: { slug: string; tab: AnalysisTab; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8">
      <div className="leading-normal">
        <h2 className="text-2xl font-bold text-[#1b1b1d] sm:text-[32px]">Analisis mendalam mengenai performa siswa</h2>
        <p className="text-base text-[#45474c]">Analisis mendalam mengenai performa siswa.</p>
      </div>

      <nav aria-label="Tab Analisis" className="flex gap-6 overflow-x-auto border-b border-[#c5c6cd]">
        {tabs.map((item) => {
          const active = item.id === tab;
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "-mb-px shrink-0 border-b-2 pb-3 text-base",
                active ? "border-[#0058be] font-semibold text-[#0058be]" : "border-transparent font-medium text-[#6b7280] hover:text-[#1b1b1d]",
              )}
              href={`/${slug}/analysis?tab=${item.id}`}
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
