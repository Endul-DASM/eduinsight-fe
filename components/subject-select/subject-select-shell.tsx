import { Poppins } from "next/font/google";
import type { ReactNode } from "react";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicTopNav } from "@/components/layout/public-top-nav";
import { cn } from "@/components/ui/cn";
import { logout } from "@/lib/actions/auth";

// The design uses Poppins; it is scoped to these pages so the rest of the app keeps its font.
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

// The page around the subject cards, shared by teachers (Figma 167:722) and students (Figma 236:3420).
export function SubjectSelectShell({
  userName,
  subtitle,
  children,
}: {
  userName: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className={cn(poppins.className, "flex min-h-screen flex-col bg-white")}>
      <PublicTopNav />
      <main className="relative flex flex-1 items-center overflow-hidden bg-[rgba(251,248,250,0.5)] px-4 py-16 sm:px-6 md:py-28 lg:px-10">
        <div className="absolute -left-48 -top-48 size-96 rounded-full bg-[rgba(216,226,255,0.3)] blur-[32px]" />
        <div className="absolute -bottom-20 -right-20 size-80 rounded-full bg-[rgba(216,226,252,0.2)] blur-[32px]" />
        <div className="relative mx-auto flex w-full max-w-[80rem] flex-col items-center gap-8">
          <div className="flex max-w-[32rem] flex-col items-center gap-2 text-center">
            <h1 className="text-3xl leading-10 tracking-[-0.32px] text-black sm:text-[32px]">
              Selamat Datang, {userName}
            </h1>
            <p className="text-sm text-[#45474c]">{subtitle}</p>
            <form action={logout}>
              <button className="text-xs font-semibold text-[#085ac0] hover:underline" type="submit">
                Bukan Anda? Keluar
              </button>
            </form>
          </div>
          {children}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
