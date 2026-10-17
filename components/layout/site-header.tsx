import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

function HelpLink() {
  return (
    <Link
      className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold leading-6 text-[#1b1b1d] transition-colors hover:bg-[#eef2f7]"
      href="#"
    >
      <Image alt="" height={20} src="/auth/help-circle.svg" width={20} />
      Help
    </Link>
  );
}

// The top bar of the pages outside a subject (Figma New Design 22:2837, 22:3476): the logo, and Help unless the page
// puts something else on the right, such as Logout.
export function SiteHeader({ action = <HelpLink />, className }: { action?: ReactNode; className?: string }) {
  return (
    <header
      className={cn(
        "relative z-10 flex min-h-16 items-center justify-between gap-4 bg-[#fafbfd] px-4 py-2 drop-shadow-[0_8px_12px_rgba(0,0,0,0.08)] sm:px-8 lg:px-16",
        className,
      )}
    >
      <Link className="flex items-center gap-2" href="/">
        <Image alt="" className="size-9" height={36} src="/auth/logo.svg" width={36} />
        <span className="text-lg font-semibold leading-normal text-[#1b1b1d]">EduInsight</span>
      </Link>
      {action}
    </header>
  );
}
