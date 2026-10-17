import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import type { CurrentUser } from "@/lib/api/types";
import { SUPPORT_EMAIL } from "@/lib/help";
import { dashboardPathOf } from "@/lib/landing";
import { LandingMobileMenu } from "./landing-mobile-menu";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

export type LandingNavLink = { label: string; href: string; active?: boolean; primary?: boolean };

const footerLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Contact Support", href: `mailto:${SUPPORT_EMAIL}` },
];

// The two wide ellipses behind the page (Figma New Design 1:1318, 187:9563), at their design size.
function Background() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <Image
        alt=""
        className="absolute left-1/2 top-[-713px] h-[1444px] w-[1867px] max-w-none -translate-x-1/2"
        height={1444}
        priority
        src="/landing/bg-ellipse.svg"
        width={1867}
      />
      <div className="absolute left-[calc(50%+380px)] top-[700px] flex h-[1444px] w-[1867px] -translate-x-1/2 items-center justify-center">
        <div className="flex-none -scale-y-100 rotate-[107deg]">
          <Image alt="" className="h-[1644px] w-[1007px] max-w-none" height={1644} src="/landing/bg-curve.svg" width={1007} />
        </div>
      </div>
    </div>
  );
}

// Top bar of Home and About (Figma New Design 13:135). Signed in, Login and Sign Up become "Ke Dashboard".
function LandingHeader({ page, user }: { page: "home" | "about"; user: CurrentUser | null }) {
  const links: LandingNavLink[] = [
    { label: "Home", href: "/", active: page === "home" },
    { label: "About", href: "/about", active: page === "about" },
  ];
  const actions: LandingNavLink[] = user
    ? [{ label: "Ke Dashboard", href: dashboardPathOf(user), primary: true }]
    : [
        { label: "Login", href: "/login" },
        { label: "Sign Up", href: "/#mulai", primary: true },
      ];

  return (
    <header className="sticky top-0 z-20 bg-[#f5f3f4] drop-shadow-[0_8px_12px_rgba(0,0,0,0.08)]">
      <div className="relative mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-4 px-4 py-2 sm:px-8 lg:px-16">
        <Link className="flex items-center gap-2" href="/">
          <Image alt="" className="size-9" height={36} src="/auth/logo.svg" width={36} />
          <span className="text-lg font-semibold leading-normal text-[#1b1b1d]">EduInsight</span>
        </Link>
        <nav aria-label="Navigasi utama" className="hidden items-center gap-4 md:flex">
          {links.map((link) => (
            <Link
              aria-current={link.active ? "page" : undefined}
              className={cn(
                "text-sm leading-normal",
                link.active ? "font-semibold text-[#0058be] underline" : "text-[#45474c] hover:text-[#1b1b1d]",
              )}
              href={link.href}
              key={link.label}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {actions.map((action) => (
            <Link
              className={cn(
                "rounded-xl px-4 py-1.5 text-sm font-semibold leading-normal drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)] transition-colors",
                action.primary
                  ? "bg-[#0058be] text-[#f5f3f4] hover:bg-[#004695]"
                  : "border-2 border-[#0058be] bg-[#f5f3f4] py-1 text-[#0058be] hover:bg-[#e6eff9]",
              )}
              href={action.href}
              key={action.label}
            >
              {action.label}
            </Link>
          ))}
        </div>
        <LandingMobileMenu actions={actions} links={links} />
      </div>
    </header>
  );
}

function LandingFooter() {
  return (
    <footer className="relative z-10 bg-[rgba(245,243,244,0.6)] shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-xs">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-16">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Image alt="" className="size-10" height={40} src="/auth/logo.svg" width={40} />
            <span className="text-xl font-semibold leading-normal text-[#1b1b1d]">EduInsight</span>
          </div>
          <p className="text-xs leading-normal text-[#45474c]">© 2026 EduInsight AI. Systematic &amp; Encouraging Learning.</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-2 text-xs leading-normal text-[#45474c]">
          {footerLinks.map((link) => (
            <Link className="underline hover:text-[#1b1b1d]" href={link.href} key={link.label}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

// The frame of the public pages: background, top bar, content and footer.
export function LandingShell({ page, user, children }: { page: "home" | "about"; user: CurrentUser | null; children: ReactNode }) {
  return (
    <div className={cn(poppins.className, "relative flex min-h-screen flex-col overflow-x-clip bg-[#fafbfd] text-[#1b1b1d]")}>
      <Background />
      <LandingHeader page={page} user={user} />
      <main className="relative flex-1">{children}</main>
      <LandingFooter />
    </div>
  );
}
