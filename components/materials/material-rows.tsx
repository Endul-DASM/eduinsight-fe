"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import type { Material } from "@/lib/api/materials";
import { iconButtonClassName } from "@/components/curriculum/styles";

// "24 Okt 2026, 10:30" in WIB.
const dateFormat = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Jakarta",
});

export function formatUploadedAt(iso: string) {
  return dateFormat.format(new Date(iso)).replace(/\./g, ":").replace(" pukul", ",");
}

export const formatLabels: Record<Material["format"], string> = {
  pdf: "PDF Document",
  docx: "Word Document",
  pptx: "PowerPoint Presentation",
};

export function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// One row of the material tables (Figma New Design 54:6193; the student's Materi, 256:8213): file, TP, class, date,
// actions.
export function MaterialRow({
  material,
  objectives,
  classLabel,
  tone = "normal",
  leading,
  badge,
  href = `/api/materials/${material.id}/file`,
  actions,
}: {
  // The student's materials have a title but no file name.
  material: Pick<Material, "id" | "title" | "createdAt"> & { originalFilename?: string };
  // TP numbers, e.g. "TP 1.1, 1.2".
  objectives: string;
  classLabel: string;
  tone?: "normal" | "processing" | "failed";
  leading?: ReactNode;
  // After the name, e.g. "Direkomendasikan".
  badge?: ReactNode;
  // Opens the file; the teacher's by default.
  href?: string;
  actions: ReactNode;
}) {
  const name = material.originalFilename ?? material.title;
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4 text-sm leading-normal md:flex-nowrap",
        tone === "failed" && "rounded-xl bg-[#ffeded]",
        tone === "normal" && "border-b border-[#c5c6cd] last:border-b-0",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 md:basis-[420px] md:flex-none">
        {leading}
        <Image
          alt=""
          className="h-9 w-8 shrink-0"
          height={36}
          src={tone === "failed" ? "/materials/file-failed.svg" : tone === "processing" ? "/materials/file-faded.svg" : "/materials/file.svg"}
          width={32}
        />
        {tone === "normal" ? (
          <a
            className="min-w-0 truncate font-medium text-[#1b1b1d] hover:text-[#0058be] hover:underline"
            href={href}
            rel="noopener"
            target="_blank"
            title={material.title}
          >
            {name}
          </a>
        ) : (
          <p
            className={cn(
              "min-w-0 truncate font-medium",
              tone === "failed" ? "text-[#bf2626] line-through" : "text-[#1b1b1d] opacity-60",
            )}
          >
            {name}
          </p>
        )}
        {badge}
      </div>
      <p className={cn("w-[160px] truncate text-[#45474c]", tone === "processing" && "opacity-60")} title={objectives}>
        {objectives || "-"}
      </p>
      <p className={cn("whitespace-nowrap text-[#45474c]", tone === "processing" && "opacity-60")}>{classLabel}</p>
      <p className={cn("w-[180px] text-[#45474c]", tone === "processing" && "opacity-60")}>
        {formatUploadedAt(material.createdAt)}
      </p>
      <div className="ml-auto flex w-[110px] shrink-0 items-center justify-end gap-1">{actions}</div>
    </div>
  );
}

export function RowIconButton({
  label,
  icon,
  size = 16,
  onClick,
  disabled,
}: {
  label: string;
  icon: string;
  size?: number;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button aria-label={label} className={cn(iconButtonClassName, "disabled:opacity-35")} disabled={disabled} onClick={onClick} title={label} type="button">
      <Image alt="" height={size} src={icon} width={size} />
    </button>
  );
}
