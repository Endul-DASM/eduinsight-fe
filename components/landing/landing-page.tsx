import Link from "next/link";
import type { SVGProps } from "react";
import { DesktopLandingPage } from "@/components/landing/landing-page-desktop";
import { cn } from "@/components/ui/cn";

const teacherIllustration = "/characterimage.svg";

function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M5 12h14m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function GraduationCapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M12 5 2.5 9.5 12 14l9.5-4.5L12 5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
      <path
        d="M6.5 11.8v4.2c0 1.4 2.46 2.9 5.5 2.9s5.5-1.5 5.5-2.9v-4.2"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path d="M21 10v5.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
}

function BackpackIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M9 4.5h6a1 1 0 0 1 1 1V7c1.66.5 3 2.02 3 4v8.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V11c0-1.98 1.34-3.5 3-4V5.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="M9 4.5V8h6V4.5M9 13h6M10 13v3.5M14 13v3.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function EduInsightMark() {
  return (
    <Link className="flex items-center gap-2" href="/">
      <div className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-white shadow-[0_10px_20px_rgba(9,20,38,0.12)]">
        <svg aria-hidden="true" className="size-[22px] text-[#0058be]" fill="none" viewBox="0 0 24 24">
          <path
            d="M4 8.5 12 5l8 3.5-8 3.5L4 8.5Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <path
            d="M7 10.2v4.3c0 .5.29.95.74 1.17L12 17.8l4.26-2.12c.45-.22.74-.67.74-1.17v-4.3"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <path d="M20 9v5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      </div>
      <span className="text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.03em] text-white">
        EduInsight
      </span>
    </Link>
  );
}

function LandingBackground() {
  return (
    <>
      <img
        alt=""
        aria-hidden="true"
        className="absolute left-[-73.63vw] top-[-19.15vw] w-[213vw] max-w-none"
        src="/landing/hero-wave-top.png"
      />
      <img
        alt=""
        aria-hidden="true"
        className="absolute -scale-y-100 left-[-73.63vw] bottom-[-39.95vw] w-[213vw] max-w-none"
        src="/landing/hero-wave-bottom.png"
      />
      <div className="absolute -left-[10%] top-[15%] h-[29%] w-[65.64%] rounded-full bg-[rgba(0,88,190,0.05)] blur-[32px]" />
      <div className="absolute left-[32.95%] top-[43.8%] h-[36.2%] w-[82.05%] rounded-full bg-[rgba(9,20,38,0.05)] blur-[32px]" />
      <div className="absolute left-[1.875rem] top-[4.375rem] size-[2rem] rounded-[0.5rem] border-2 border-[rgba(197,198,205,0.2)]" />
      <div className="absolute right-[3.625rem] top-[9.375rem] size-[3rem] rounded-full bg-[rgba(216,226,255,0.3)]" />
      <div className="absolute bottom-[16.625rem] left-[4.375rem] h-[1rem] w-[4rem] rounded-full bg-[rgba(216,227,251,0.2)]" />
      <div className="absolute left-[1rem] top-[calc(50%+2.5rem)] h-[5rem] w-[0.5rem] -translate-y-1/2 rounded-full bg-[rgba(197,198,205,0.1)]" />
    </>
  );
}

function HeroIllustrationCard() {
  return (
    <div className="relative mx-auto w-fit">
      <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0058be]/10 blur-3xl" />
      <div className="absolute left-2 top-4 h-full w-full rotate-[2deg] rounded-[28px] border border-white/60 bg-white/45 shadow-[0_14px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm" />
      <div className="absolute right-0.5 top-1 h-full w-full -rotate-[2deg] rounded-[28px] border border-white/70 bg-white/20 shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm" />
      <div className="relative flex aspect-square w-[17.5rem] items-center justify-center overflow-hidden rounded-[28px] shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
        <img
          src={teacherIllustration}
          alt="3D teacher character holding EduInsight tablet"
          className="h-[90%] w-[90%] object-contain"
        />
      </div>
    </div>
  );
}

function LandingCopy() {
  return (
    <div className="mx-auto flex w-full max-w-[22rem] flex-col items-center gap-4 text-center sm:max-w-[26rem]">
      <h1 className="text-[clamp(1.75rem,4vw,3.25rem)] font-semibold leading-[1.2] tracking-[-0.03em] text-[#091426]">
        Diagnosis Pembelajaran
        <br />
        Cerdas
      </h1>
      <p className="max-w-[20rem] text-base leading-6 text-[#45474c] sm:max-w-[24rem] sm:text-lg sm:leading-7">
        Partner AI Anda untuk analisis kompetensi siswa yang mendalam.
      </p>
    </div>
  );
}

const ctaOptions = [
  {
    label: "Mulai Sekarang sebagai Guru",
    href: "/login",
    icon: GraduationCapIcon,
    variant: "primary" as const,
  },
  {
    label: "Mulai Sekarang sebagai Siswa",
    href: "/login",
    icon: BackpackIcon,
    variant: "secondary" as const,
  },
];

function CTAButton({ label, href, icon: Icon, variant }: (typeof ctaOptions)[number]) {
  const isPrimary = variant === "primary";

  return (
    <Link
      className={cn(
        "group flex w-full items-center justify-between rounded-[1.25rem] px-5 py-4 transition-transform hover:scale-[1.01] sm:px-6",
        isPrimary
          ? "bg-gradient-to-r from-[#2170e4] to-[#80ade9] text-white shadow-[0_18px_30px_rgba(0,88,190,0.2)]"
          : "border-2 border-[#0058be]/25 bg-white text-[#0058be] shadow-[0_10px_20px_rgba(9,20,38,0.06)]",
      )}
      href={href}
    >
      <span className="flex items-center gap-3 pl-1 text-base font-semibold tracking-[-0.02em] sm:text-lg">
        <Icon className="size-5 shrink-0" />
        {label}
      </span>
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-[0.85rem] transition-colors",
          isPrimary ? "bg-white/20 group-hover:bg-white/28" : "bg-[#eef5ff] group-hover:bg-[#d8e2ff]",
        )}
      >
        <ArrowIcon className="size-5" />
      </span>
    </Link>
  );
}

function LandingCTA() {
  return (
    <div className="mx-auto flex w-full max-w-[24rem] flex-col items-center gap-3 sm:max-w-[28rem]">
      {ctaOptions.map((option) => (
        <CTAButton key={option.label} {...option} />
      ))}
    </div>
  );
}

function MobileLandingHero() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      <LandingBackground />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[40rem] flex-col items-center justify-between px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-10">
        <header className="flex flex-col items-center gap-2">
          <EduInsightMark />
          <div className="rounded-full bg-[#d8e2ff]/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
            AI Analysis Suite
          </div>
        </header>

        <section className="flex flex-col items-center gap-8 py-8 sm:gap-10">
          <HeroIllustrationCard />
          <LandingCopy />
        </section>

        <div className="w-full">
          <LandingCTA />
        </div>
      </div>
    </main>
  );
}

export function LandingPage() {
  return (
    <>
      <div className="md:hidden">
        <MobileLandingHero />
      </div>
      <div className="hidden md:block">
        <DesktopLandingPage />
      </div>
    </>
  );
}
