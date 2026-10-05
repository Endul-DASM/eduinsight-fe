import type { InputHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

// Labelled input from the subject modals (Figma 236:2076).
export function FormField({
  label,
  name,
  error,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; error?: string }) {
  const errorId = `${name}-error`;

  return (
    <div className="flex w-full flex-col gap-[9px]">
      <label className="text-base leading-6 text-[#111c2d]" htmlFor={name}>
        {label}
      </label>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        className={cn(
          "h-[50px] w-full rounded-lg border bg-[#fbf8fa] px-[13px] text-base leading-6 text-[#111c2d] outline-none placeholder:text-[#75777d] focus:border-[#0058be] focus:ring-2 focus:ring-[rgba(0,88,190,0.15)]",
          error ? "border-[#ba1a1a]" : "border-[#c5c6cd]",
          className,
        )}
        id={name}
        name={name}
        {...props}
      />
      {error && (
        <p className="text-sm text-[#ba1a1a]" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}

export const primaryButtonClassName =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#0058be] px-6 py-2 text-base font-semibold leading-4 tracking-[0.6px] text-white transition-colors hover:bg-[#00479b] disabled:cursor-not-allowed disabled:opacity-60";

export const outlineButtonClassName =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#0058be] bg-[#fefcff] px-6 py-2 text-base font-semibold leading-4 tracking-[0.6px] text-[#0058be] transition-colors hover:bg-[#eef5ff] disabled:cursor-not-allowed disabled:opacity-60";

export const dangerButtonClassName =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#ba1a1a] px-6 py-2 text-base font-semibold leading-4 tracking-[0.6px] text-white transition-colors hover:bg-[#93000a] disabled:cursor-not-allowed disabled:opacity-60";
