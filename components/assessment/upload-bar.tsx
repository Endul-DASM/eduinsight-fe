"use client";

import Image from "next/image";
import { useRef } from "react";
import { cn } from "@/components/ui/cn";

// "Upload Dokumen" input bar (Figma New Design 61:9950): file icon, name, and an upload arrow that opens the picker.
export function UploadBar({
  id,
  accept,
  fileName,
  placeholder,
  disabled,
  invalid,
  onFile,
}: {
  id: string;
  accept: string;
  fileName?: string;
  placeholder: string;
  disabled?: boolean;
  invalid?: boolean;
  onFile: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={cn(
        "flex h-[50px] items-center gap-3 rounded-xl border bg-[#fbf8fa] px-[13px]",
        invalid ? "border-[#dc2626]" : "border-[#c5c6cd]",
        disabled && "opacity-60",
      )}
    >
      <Image alt="" height={24} src="/materials/title-upload.svg" width={24} />
      <button
        className={cn("min-w-0 flex-1 truncate text-left text-base", fileName ? "text-[#1b1b1d]" : "text-[#75777d]")}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        {fileName ?? placeholder}
      </button>
      <button
        aria-label="Pilih berkas"
        className="grid size-8 place-items-center rounded-lg text-xl leading-none text-[#1b1b1d] hover:bg-[#e6eff9]"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        ↑
      </button>
      <input
        accept={accept}
        className="hidden"
        id={id}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          event.target.value = "";
        }}
        ref={inputRef}
        type="file"
      />
    </div>
  );
}
