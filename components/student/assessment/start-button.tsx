"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { primaryButtonClassName } from "@/components/auth/styles";
import { cn } from "@/components/ui/cn";
import { startAttemptAction } from "@/lib/actions/student-assessments";

// Mulai / Lanjutkan Asesmen (FR-S-010). The Server Function opens the attempt, or returns why it cannot start.
export function StartButton({ slug, assessmentId, resume, disabled }: { slug: string; assessmentId: string; resume: boolean; disabled: boolean }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        className={cn(primaryButtonClassName, "px-4 py-2.5", disabled && "cursor-not-allowed bg-[#c5c6cd] text-[#45474c] hover:bg-[#c5c6cd]")}
        disabled={disabled || pending}
        onClick={() =>
          startTransition(async () => {
            const result = await startAttemptAction(slug, assessmentId);
            setMessage(result?.message);
          })
        }
        type="button"
      >
        {pending ? "Membuka asesmen..." : resume ? "Lanjutkan Asesmen" : "Mulai Asesmen"}
        {!pending && <Image alt="" height={24} src="/assessment/arrow-right.svg" width={24} />}
      </button>
      {message && (
        <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm leading-5 text-[#93000a]" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}
