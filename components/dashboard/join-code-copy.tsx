"use client";

import Image from "next/image";
import { useState } from "react";

// The "Kode" card of the dashboard hero: students join the subject with this code.
export function JoinCodeCopy({ code }: { code: string | null }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2000);
  }

  return (
    <div className="flex min-w-0 flex-col justify-center gap-1.5 rounded-3xl bg-[rgba(245,243,244,0.6)] p-4 text-[#003264] sm:p-6 lg:min-w-[161px]">
      <p className="text-base leading-normal">Kode</p>
      <div className="flex items-center gap-1.5">
        <span className="text-xl font-bold leading-normal sm:text-2xl">{code ?? "—"}</span>
        {code && (
          <button
            aria-label="Salin kode kelas"
            className="grid place-items-center rounded-md p-1 transition-colors hover:bg-[rgba(0,88,190,0.1)]"
            onClick={copy}
            type="button"
          >
            <Image alt="" height={20} src="/dashboard/copy.svg" width={20} />
          </button>
        )}
      </div>
      <p aria-live="polite" className="min-h-4 text-xs leading-normal text-[#0058be]">
        {state === "copied" ? "Kode disalin." : state === "failed" ? "Gagal menyalin." : ""}
      </p>
    </div>
  );
}
