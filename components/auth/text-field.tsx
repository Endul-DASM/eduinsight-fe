import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  error?: string;
  // Content at the end of the input box, e.g. the show-password button.
  trailing?: ReactNode;
};

export function TextField({ label, name, error, trailing, id, className, readOnly, ...props }: TextFieldProps) {
  const inputId = id ?? name;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex w-full flex-col gap-[9px]">
      <label className="text-base leading-6 text-[#111c2d]" htmlFor={inputId}>
        {label}
      </label>
      <div
        className={cn(
          "flex h-[50px] w-full items-center gap-2 rounded-lg border px-[13px]",
          readOnly
            ? "bg-[#f0edef]"
            : "bg-[#fbf8fa] focus-within:border-[#0058be] focus-within:ring-2 focus-within:ring-[rgba(0,88,190,0.15)]",
          error ? "border-[#ba1a1a]" : "border-[#c5c6cd]",
        )}
      >
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-base leading-6 text-[#111c2d] outline-none placeholder:text-[#75777d]",
            readOnly && "text-[#45474c]",
            className,
          )}
          id={inputId}
          name={name}
          readOnly={readOnly}
          {...props}
        />
        {trailing}
      </div>
      {error && (
        <p className="text-sm text-[#ba1a1a]" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
