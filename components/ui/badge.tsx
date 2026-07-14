import type { HTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

type BadgeVariant = "neutral" | "positive" | "warning" | "danger" | "info";

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-[#eef2f7] text-[#45474c]",
  positive: "bg-[#ecfdf3] text-[#16a34a]",
  warning: "bg-[#fff7ed] text-[#ea580c]",
  danger: "bg-[#fef2f2] text-[#dc2626]",
  info: "bg-[rgba(255,255,255,0.2)] text-white",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
