"use client";

import { cn } from "@/components/ui/cn";

type Tone = "neutral" | "blue" | "orange";

// Pressed and unpressed colors of the status chips (the blue and orange of the old static legend).
const tones: Record<Tone, { on: string; off: string }> = {
  neutral: {
    on: "border-[#003264] bg-[#003264] text-white",
    off: "border-[#c5c6cd] bg-[#fafbfd] text-[#45474c] hover:bg-[#eef1f5]",
  },
  blue: {
    on: "border-[#004695] bg-[#004695] text-white",
    off: "border-[#004695] bg-[rgba(153,188,229,0.6)] text-[#004695] hover:bg-[rgba(153,188,229,0.85)]",
  },
  orange: {
    on: "border-[#c2410c] bg-[#c2410c] text-white",
    off: "border-[#7c2d12] bg-[rgba(254,215,170,0.6)] text-[#c2410c] hover:bg-[rgba(254,215,170,0.9)]",
  },
};

export type StatusFilterOption<T extends string> = { value: T; label: string; tone: Tone };

// The chips above List Bab and Daftar Materi Diunggah, as filters (UAT KUR-H04): "Lihat Semua" and one per status.
export function StatusFilter<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: StatusFilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div aria-label={label} className="flex flex-wrap gap-2" role="group">
      {options.map((option) => (
        <button
          aria-pressed={value === option.value}
          className={cn(
            "rounded-3xl border px-3 py-1 text-xs font-semibold leading-normal transition-colors",
            value === option.value ? tones[option.tone].on : tones[option.tone].off,
          )}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
