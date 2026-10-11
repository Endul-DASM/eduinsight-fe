import Image from "next/image";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  error?: string;
  // Content at the end of the input box, e.g. the show-password button.
  trailing?: ReactNode;
};

// Input Bar from the auth designs (Figma New Design 22:3103), with its warning line under the box.
export function TextField({ label, name, error, trailing, id, className, readOnly, ...props }: TextFieldProps) {
  const inputId = id ?? name;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex w-full flex-col gap-2">
      <label className="text-xs font-semibold leading-normal text-[#1b1b1d]" htmlFor={inputId}>
        {label}
      </label>
      <div
        className={cn(
          "flex h-[50px] w-full items-center gap-3 rounded-xl border px-[13px]",
          readOnly
            ? "bg-[#f0edef]"
            : "bg-[#fbf8fa] focus-within:border-[#0058be] focus-within:ring-2 focus-within:ring-[rgba(0,88,190,0.15)]",
          error ? "border-[#dc2626]" : "border-[#c5c6cd]",
        )}
      >
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-base leading-normal text-[#1b1b1d] outline-none placeholder:text-[#75777d]",
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
        <p className="flex items-start gap-2 text-xs font-semibold leading-normal text-[#dc2626]" id={errorId}>
          <Image alt="" className="mt-px shrink-0" height={16} src="/auth/alert-triangle.svg" width={16} />
          {error}
        </p>
      )}
    </div>
  );
}
