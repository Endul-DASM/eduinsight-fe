"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/components/ui/cn";
import { assessmentFilterChips } from "@/lib/assessment-form";

const tones = {
  grey: "bg-[#d9d9d9] text-[#45474c]",
  red: "bg-[#fecaca] text-[#dc2626]",
  orange: "bg-[#ffedd5] text-[#c2410c]",
} as const;

const activeBorders = { grey: "border-[#45474c]", red: "border-[#dc2626]", orange: "border-[#c2410c]" } as const;

// Filters of Daftar Asesmen (FR-G-040, Figma New Design 54:7817), kept in the URL so the list renders on the
// server: ?tab=daftar&type=uts or ?tab=daftar&status=draft.
export function AssessmentFilterChips() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const status = searchParams.get("status");

  const activeId =
    assessmentFilterChips.find((chip) => ("type" in chip && chip.type === type) || ("status" in chip && chip.status === status))
      ?.id ?? "semua";

  function choose(chip: (typeof assessmentFilterChips)[number]) {
    const params = new URLSearchParams({ tab: "daftar" });
    if ("type" in chip) params.set("type", chip.type);
    if ("status" in chip) params.set("status", chip.status);
    router.replace(`${pathname}?${params}`, { scroll: false });
  }

  return (
    <div aria-label="Filter asesmen" className="flex flex-wrap items-center gap-3" role="group">
      {assessmentFilterChips.map((chip) => {
        const active = chip.id === activeId;
        return (
          <button
            aria-pressed={active}
            className={cn(
              "rounded-3xl border px-2 py-1 text-xs font-semibold leading-normal transition-opacity hover:opacity-80",
              tones[chip.tone],
              active ? activeBorders[chip.tone] : "border-transparent",
            )}
            key={chip.id}
            onClick={() => choose(chip)}
            type="button"
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
