import { Poppins } from "next/font/google";
import Image from "next/image";
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

// The blurred shapes and the wide ellipse behind the cards (Figma New Design 22:3475), at their design size.
function Decorations() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -bottom-[582px] -right-[392px] size-[912px] rounded-full bg-[rgba(216,226,255,0.6)] blur-3xl" />
      {/* A tall ellipse turned on its side, so its lighter end is at the top. */}
      <Image
        alt=""
        className="absolute left-1/2 top-[19.5px] h-[1644px] w-[1007px] max-w-none -translate-x-1/2 rotate-90"
        height={1644}
        src="/subjects/bg-curve.svg"
        width={1007}
      />
      <div className="absolute -left-[244px] -top-[130px] size-[456px] rounded-full bg-[rgba(216,226,255,0.6)] blur-[32px]" />
      <Image alt="" className="absolute -left-[180px] top-[420px]" height={140} src="/subjects/bg-circle.svg" width={140} />
    </div>
  );
}

// The page around the subject cards, shared by teachers and students (Figma New Design 22:3475).
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
    <div className={cn(poppins.className, "relative flex min-h-screen flex-col overflow-hidden bg-white")}>
      <Decorations />
      <SiteHeader action={<LogoutButton />} className="bg-[#f5f3f4] sm:py-6" />
      <main className="relative flex flex-1 items-center px-4 py-16 sm:px-6 md:py-24 lg:px-10">
        <div className="mx-auto flex w-full max-w-[1291px] flex-col items-center gap-12 md:gap-[76px]">
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
