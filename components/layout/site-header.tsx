import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

function HelpLink() {
  return (
    <Link
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-base font-semibold leading-6 text-[#1b1b1d] transition-colors hover:bg-[#eef2f7]"
      href="#"
    >
      <Image alt="" height={24} src="/auth/help-circle.svg" width={24} />
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
        "relative z-10 flex min-h-[84px] items-center justify-between gap-4 bg-[#fafbfd] px-4 py-3 drop-shadow-[0_8px_12px_rgba(0,0,0,0.08)] sm:px-8 lg:px-16",
        className,
      )}
    >
      <Link className="flex items-center gap-3" href="/">
        <Image alt="" className="size-10 sm:size-[50px]" height={50} src="/auth/logo.svg" width={50} />
        <span className="text-2xl font-semibold leading-normal text-[#1b1b1d] sm:text-[32px]">EduInsight</span>
      </Link>
      {action}
    </header>
  );
}
