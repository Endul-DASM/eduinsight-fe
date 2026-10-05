import { Poppins } from "next/font/google";
import type { ReactNode } from "react";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicTopNav } from "@/components/layout/public-top-nav";
import { cn } from "@/components/ui/cn";

// The auth designs use Poppins; it is scoped to these pages so the rest of the app keeps its font.
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className={cn(poppins.className, "flex min-h-screen flex-col bg-[#fbf8fa]")}>
      <PublicTopNav />
      <main className="relative flex flex-1 items-center overflow-hidden px-4 py-16 sm:px-6 md:py-[91px] lg:px-10">
        <div className="absolute -left-48 -top-48 size-96 rounded-full bg-[rgba(216,226,255,0.3)] blur-[32px]" />
        <div className="absolute -bottom-[107px] -right-[107px] size-80 rounded-full bg-[rgba(216,226,252,0.2)] blur-[32px]" />
        <div className="relative mx-auto flex w-full max-w-[80rem] flex-col items-center gap-8">{children}</div>
      </main>
      <PublicFooter />
    </div>
  );
}
