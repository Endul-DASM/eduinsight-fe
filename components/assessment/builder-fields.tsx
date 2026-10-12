import Image from "next/image";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { fieldLabelClassName, inputBoxClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";

// Field pieces of the Buat Asesmen forms, in the Input Bar style of Figma New Design 65:11718.

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <label className={fieldLabelClassName} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="flex items-start gap-2 text-xs font-semibold leading-normal text-[#dc2626]" role="alert">
          <Image alt="" className="mt-px shrink-0" height={16} src="/auth/alert-triangle.svg" width={16} />
          {error}
        </p>
      ) : (
        hint && <p className="text-[10px] leading-normal text-[#75777d]">{hint}</p>
      )}
    </div>
  );
}

export function TextInput({ invalid, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        inputBoxClassName,
        "h-[50px] disabled:cursor-not-allowed disabled:bg-[#f0edef] disabled:text-[#45474c]",
        invalid && "border-[#dc2626]",
        className,
      )}
      {...props}
    />
  );
}

export function SelectInput({
  invalid,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <select
        aria-invalid={invalid || undefined}
        className={cn(
          inputBoxClassName,
          "h-[50px] appearance-none pr-12 disabled:cursor-not-allowed disabled:bg-[#f0edef]",
          !props.value && "text-[#75777d]",
          invalid && "border-[#dc2626]",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <Image
        alt=""
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
        height={24}
        src="/assessment/chevron-down.svg"
        width={24}
      />
    </div>
  );
}

export function FormMessage({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm leading-5 text-[#93000a]" role="alert">
      {children}
    </div>
  );
}

export function InfoMessage({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-[#99bce5] bg-[#e6eff9] px-4 py-3 text-sm leading-normal text-[#004695]" role="status">
      {children}
    </div>
  );
}
