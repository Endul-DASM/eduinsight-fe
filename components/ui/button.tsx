import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#0058be] text-white shadow-[0_10px_25px_-12px_rgba(0,88,190,0.55)] hover:bg-[#00479b]",
  secondary: "bg-white text-[#0058be] hover:bg-[#eef5ff]",
  outline:
    "border border-[#c5c6cd] bg-white text-[#091426] hover:border-[#0058be] hover:text-[#0058be]",
  ghost: "bg-transparent text-[#45474c] hover:bg-[#eef2f7] hover:text-[#091426]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 rounded-[10px] px-3 text-xs font-semibold tracking-[0.02em]",
  md: "h-10 rounded-[12px] px-4 text-xs font-bold tracking-[0.04em]",
  lg: "h-12 rounded-[12px] px-6 text-sm font-semibold",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  size = "md",
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
