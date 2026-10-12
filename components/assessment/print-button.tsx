"use client";

import Image from "next/image";
import { ghostButtonClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";

// "Unduh Soal" (Figma New Design 61:7050). The backend has no export yet, so it opens the browser's print dialog,
// where the teacher can save the print layout as PDF.
export function PrintButton({ disabled }: { disabled?: boolean }) {
  return (
    <button
      className={cn(ghostButtonClassName, "gap-3 shadow-none")}
      disabled={disabled}
      onClick={() => window.print()}
      title="Simpan sebagai PDF lewat dialog cetak"
      type="button"
    >
      <Image alt="" height={24} src="/assessment/file-down.svg" width={24} />
      Unduh Soal
    </button>
  );
}
