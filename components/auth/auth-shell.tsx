import { Poppins } from "next/font/google";
import Image from "next/image";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { cn } from "@/components/ui/cn";

// The auth designs use Poppins; it is scoped to these pages so the rest of the app keeps its font.
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

// The blue ellipses behind the content (Figma New Design 19:1689 and 22:2834). They keep their design size and are
// cropped by the page, so narrow screens show the middle of them.
const curveClassName = "pointer-events-none absolute left-1/2 max-w-none -translate-x-1/2 select-none";

function Curves({ variant }: { variant: "picker" | "form" }) {
  if (variant === "form") {
    return (
      <Image
        alt=""
        className={cn(curveClassName, "top-[-252px] h-[1052px] w-[1680px]")}
        height={1052}
        src="/auth/bg-curve.svg"
        width={1680}
      />
    );
  }
  return (
    <>
      {/* Mirrored, so the darker end is on the left as in the design. */}
      <Image
        alt=""
        className={cn(curveClassName, "top-[-157px] h-[820px] w-[1680px] -scale-x-100")}
        height={820}
        src="/auth/bg-curve-wide.svg"
        width={1680}
      />
      <Image
        alt=""
        className={cn(curveClassName, "bottom-[-645px] h-[820px] w-[1680px]")}
        height={820}
        src="/auth/bg-curve-wide.svg"
        width={1680}
      />
    </>
  );
}

// variant "picker" is the role picker; "form" is every page with a single card (sign in, sign up).
export function AuthShell({ children, variant = "form" }: { children: ReactNode; variant?: "picker" | "form" }) {
  return (
    <div className={cn(poppins.className, "relative flex min-h-screen flex-col overflow-hidden bg-[#fafbfd]")}>
      <Curves variant={variant} />
      <SiteHeader />
      <main className="relative flex flex-1 items-center justify-center px-4 py-12 sm:px-6 md:py-20">
        <div className="flex w-full max-w-[80rem] flex-col items-center gap-8">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
