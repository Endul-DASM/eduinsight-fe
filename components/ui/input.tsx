import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/components/ui/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
  wrapperClassName?: string;
};

export function Input({
  className,
  icon,
  wrapperClassName,
  ...props
}: InputProps) {
  return (
    <label
      className={cn(
        "flex h-11 w-full items-center gap-3 rounded-full border border-[#c5c6cd] bg-[#f5f3f4] px-4 text-sm text-[#6b7280]",
        wrapperClassName,
      )}
    >
      {icon}
      <input
        className={cn(
          "w-full border-0 bg-transparent text-sm text-[#091426] outline-none placeholder:text-[#6b7280]",
          className,
        )}
        {...props}
      />
    </label>
  );
}
