import { Poppins } from "next/font/google";
import type { ReactNode } from "react";
import { outlineButtonClassName } from "@/components/auth/styles";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { cn } from "@/components/ui/cn";
import { logout } from "@/lib/actions/auth";
import { firstName } from "@/lib/display-name";

// The design uses Poppins; it is scoped to these pages so the rest of the app keeps its font.
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

function LogoutButton() {
  return (
    <form action={logout}>
      <button className={outlineButtonClassName} type="submit">
        Logout
      </button>
    </form>
  );
}

// The page around the subject cards, shared by teachers and students (header, greeting and footer from Figma New
// Design 22:3475).
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
      <SiteHeader action={<LogoutButton />} className="bg-[#f5f3f4] sm:py-6" />
      <main className="relative flex flex-1 items-center overflow-hidden bg-[rgba(251,248,250,0.5)] px-4 py-16 sm:px-6 md:py-28 lg:px-10">
        <div className="absolute -left-48 -top-48 size-96 rounded-full bg-[rgba(216,226,255,0.3)] blur-[32px]" />
        <div className="absolute -bottom-20 -right-20 size-80 rounded-full bg-[rgba(216,226,252,0.2)] blur-[32px]" />
        <div className="relative mx-auto flex w-full max-w-[80rem] flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-[32px] font-bold leading-normal text-[#1b1b1d] sm:text-5xl">
              Selamat Datang Kembali, {firstName(userName)}
            </h1>
            <p className="text-base leading-normal text-[#75777d]">{subtitle}</p>
          </div>
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
