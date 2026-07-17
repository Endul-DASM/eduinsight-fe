import Link from "next/link";
import { cn } from "@/components/ui/cn";

const teacherIllustration =
  "https://www.figma.com/api/mcp/asset/dbd2842b-372b-4bd8-bc5e-80b419df71d7";

function EduInsightMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-[10px] bg-white shadow-[0_10px_20px_rgba(9,20,38,0.12)]">
        <svg
          aria-hidden="true"
          className="size-6 text-[#0058be]"
          fill="none"
          viewBox="0 0 24 24"
        >
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
          <path
            d="M20 9v5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      </div>
      <span className="text-[clamp(1.9rem,2vw,2.2rem)] font-bold tracking-[-0.04em] text-white">
        EduInsight
      </span>
    </div>
  );
}

function LandingBackground() {
  return (
    <>
      <div className="absolute inset-x-0 top-0 h-[42rem] bg-[linear-gradient(180deg,#2170e4_0%,#0058be_70%,#1666d6_100%)] md:h-[32rem] lg:h-[34rem]" />
      <div className="absolute inset-x-0 top-[20rem] h-32 rounded-t-[45%] bg-white md:top-[22rem] md:h-36 lg:top-[23rem]" />
      <div className="absolute -left-20 top-10 size-72 rounded-full bg-white/10 blur-[60px]" />
      <div className="absolute right-[-4rem] top-40 size-40 rounded-full bg-[#d8e2ff]/35 blur-[10px]" />
      <div className="absolute bottom-32 left-[-5rem] h-24 w-5 rounded-full bg-[#c5c6cd]/15 blur-sm" />
      <div className="absolute left-8 top-20 size-10 rounded-[10px] border-2 border-white/15" />
      <div className="absolute bottom-0 left-0 right-0 h-[18rem] bg-[radial-gradient(circle_at_bottom,#dbe8ff_0%,rgba(219,232,255,0.55)_35%,rgba(255,255,255,0)_75%)]" />
    </>
  );
}

function HeroIllustrationCard() {
  return (
    <div className="relative mx-auto w-full max-w-[21rem] pb-6 md:max-w-[24rem] lg:max-w-[28rem] lg:pb-0">
      <div className="absolute left-1/2 top-1/2 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0058be]/10 blur-[24px]" />
      <div className="absolute left-3 top-5 h-[92%] w-[92%] rotate-3 rounded-[2rem] border border-[#c5c6cd]/30 bg-white/45 shadow-[0_18px_40px_rgba(9,20,38,0.08)]" />
      <div className="absolute right-3 top-2 h-[96%] w-[96%] -rotate-3 rounded-[2rem] border border-[#c5c6cd]/30 bg-white/10 shadow-[0_10px_24px_rgba(9,20,38,0.12)]" />
      <div className="relative overflow-hidden rounded-[2rem] bg-white p-4 shadow-[0_22px_50px_rgba(9,20,38,0.16)]">
        <div className="rounded-[1.5rem] bg-[#f4f0ec]">
          <img
            alt="3D teacher character holding EduInsight tablet"
            className="mx-auto aspect-square w-full object-contain"
            src={teacherIllustration}
          />
        </div>
      </div>
    </div>
  );
}

function LandingCopy() {
  return (
    <div className="mx-auto flex w-full max-w-[24rem] flex-col items-center gap-5 text-center lg:mx-0 lg:max-w-[32rem] lg:items-start lg:text-left">
      <div className="inline-flex rounded-full bg-[#d8e2ff]/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
        AI Analysis Suite
      </div>
      <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.05em] text-[#091426]">
        Diagnosis
        <br />
        Pembelajaran
        <br />
        Cerdas
      </h1>
      <p className="max-w-[22rem] text-lg leading-8 text-[#45474c] md:max-w-[30rem]">
        Partner AI Anda untuk analisis kompetensi siswa yang mendalam.
      </p>
    </div>
  );
}

function LandingCTA() {
  return (
    <div className="mx-auto flex w-full max-w-[24rem] flex-col items-center gap-6 lg:mx-0 lg:max-w-[32rem] lg:items-start">
      <Link
        className={cn(
          "group flex w-full items-center justify-between rounded-[1.25rem] bg-gradient-to-r from-[#2170e4] to-[#80ade9] px-6 py-5 text-white shadow-[0_18px_30px_rgba(0,88,190,0.2)] transition-transform hover:scale-[1.01]",
          "md:max-w-[26rem]",
        )}
        href="/dashboard"
      >
        <span className="pl-2 text-2xl font-semibold tracking-[-0.03em]">
          Mulai Sekarang
        </span>
        <span className="grid size-12 place-items-center rounded-[0.95rem] bg-white/20 transition-colors group-hover:bg-white/28">
          <svg
            aria-hidden="true"
            className="size-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M5 12h14m-5-5 5 5-5 5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </span>
      </Link>
      <div className="flex items-center gap-4 opacity-40">
        <span className="size-[7px] rounded-full bg-[#091426]" />
        <span className="size-[7px] rounded-full bg-[#75777d]" />
        <span className="size-[7px] rounded-full bg-[#75777d]" />
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      <LandingBackground />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[80rem] flex-col justify-between px-4 pb-8 pt-8 sm:px-6 md:px-8 md:pb-12 md:pt-10 lg:px-10 lg:pb-16 lg:pt-12">
        <header className="flex justify-center lg:justify-start">
          <div className="flex flex-col items-center gap-4 lg:items-start">
            <EduInsightMark />
            <div className="rounded-full bg-[#d8e2ff]/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm lg:hidden">
              AI Analysis Suite
            </div>
          </div>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center gap-10 pt-8 md:gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:pt-12">
          <div className="order-1 lg:order-2 lg:w-[44%]">
            <HeroIllustrationCard />
          </div>
          <div className="order-2 flex w-full flex-col items-center gap-8 lg:order-1 lg:w-[48%] lg:items-start">
            <div className="hidden lg:block">
              <div className="rounded-full bg-[#d8e2ff]/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
                AI Analysis Suite
              </div>
            </div>
            <LandingCopy />
            <LandingCTA />
          </div>
        </section>
      </div>
    </main>
  );
}
