import type { ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

// Same look as FormField (components/subject-select/form-field.tsx), for a native <select>.
export function SelectField({
  label,
  name,
  error,
  children,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; name: string; error?: string; children: ReactNode }) {
  const errorId = `${name}-error`;

  return (
    <div className="flex w-full flex-col gap-[9px]">
      <label className="text-base leading-6 text-[#111c2d]" htmlFor={name}>
        {label}
      </label>
      <select
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        className={cn(
          "h-[50px] w-full rounded-lg border bg-[#fbf8fa] px-[13px] text-base leading-6 text-[#111c2d] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[rgba(0,88,190,0.15)]",
          error ? "border-[#ba1a1a]" : "border-[#c5c6cd]",
          className,
        )}
        id={name}
        name={name}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-sm text-[#ba1a1a]" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}

export function FormAlert({ children, tone = "error" }: { children: ReactNode; tone?: "error" | "success" }) {
  return (
    <div
      className={cn(
        "rounded-lg px-4 py-3 text-sm leading-5",
        tone === "error" ? "bg-[#ffdad6] text-[#93000a]" : "bg-[#ecfdf3] text-[#166534]",
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
