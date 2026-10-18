"use client";

import { outlineButtonClassName } from "@/components/auth/styles";
import { cn } from "@/components/ui/cn";
import { MaskIcon } from "@/components/ui/mask-icon";

// Unduh PDF: the backend has no PDF export yet, so the browser's print dialog saves the page ("Simpan sebagai PDF").
export function PrintButton() {
  return (
    <button className={cn(outlineButtonClassName, "gap-2 px-4 py-2.5 text-sm print:hidden")} onClick={() => window.print()} type="button">
      Unduh PDF
      <MaskIcon className="size-5" src="/assessment/file-down.svg" />
    </button>
  );
}
