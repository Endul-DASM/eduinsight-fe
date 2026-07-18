import Link from "next/link";
import type { SVGProps } from "react";
import { HelpIcon } from "@/components/ui/icons";

function GraduationCapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M12 5 2.5 9.5 12 14l9.5-4.5L12 5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
      <path d="M6.5 11.8v4.2c0 1.4 2.46 2.9 5.5 2.9s5.5-1.5 5.5-2.9v-4.2" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
      <path d="M21 10v5.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
}

function StudentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5.5 19a6.5 6.5 0 0 1 13 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
}

function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

const navLinks = [
  { label: "Fitur", href: "#" },
  { label: "Tentang Kami", href: "#" },
];

const roleCards = [
  {
    title: "Untuk Guru",
    icon: GraduationCapIcon,
    iconTone: "bg-[rgba(216,226,255,0.5)] text-[#085ac0]",
    description: "Kelola asesmen dan pantau perkembangan siswa secara cerdas dengan dashboard analitik AI.",
    cta: "Masuk sebagai Guru",
    href: "/dashboard",
    buttonTone: "bg-[#085ac0] text-white",
  },
  {
    title: "Untuk Siswa",
    icon: StudentIcon,
    iconTone: "bg-[rgba(216,226,252,0.5)] text-black",
    description: "Lihat hasil diagnosis dan kerjakan latihan personal kamu untuk mengasah kemampuan akademik.",
    cta: "Masuk sebagai Siswa",
    href: "/dashboard",
    buttonTone: "bg-black text-white",
  },
];

const footerLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Contact Support", href: "#" },
];

function TopNavBar() {
  return (
    <header className="flex items-center justify-between gap-4 bg-[rgba(251,248,250,0.8)] px-4 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-[6px] sm:px-6 lg:px-10">
      <Link className="text-xl font-semibold tracking-[-0.02em] text-black sm:text-2xl" href="/">
        EduInsight
      </Link>
      <div className="flex items-center gap-4 sm:gap-6">
        <nav className="hidden items-center gap-8 sm:flex">
          {navLinks.map((link) => (
            <Link className="text-sm text-[#45474c]" href={link.href} key={link.label}>
              {link.label}
            </Link>
          ))}
        </nav>
        <span className="grid size-8 place-items-center rounded-full text-[#085ac0]">
          <HelpIcon className="size-5" />
        </span>
      </div>
    </header>
  );
}

function RoleCard({ card }: { card: (typeof roleCards)[number] }) {
  const Icon = card.icon;

  return (
    <div className="relative flex flex-1 flex-col items-center rounded-xl border border-white/30 bg-white/70 p-8 text-center shadow-[0_10px_40px_-10px_rgba(8,90,192,0.15)] backdrop-blur-[6px]">
      <div className={`mb-4 grid size-20 place-items-center rounded-full ${card.iconTone}`}>
        <Icon className="size-8" />
      </div>
      <h2 className="mb-2 text-xl font-semibold text-black">{card.title}</h2>
      <p className="mb-8 max-w-[20rem] text-sm leading-5 text-[#45474c]">{card.description}</p>
      <Link
        className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-4 text-lg font-semibold ${card.buttonTone}`}
        href={card.href}
      >
        {card.cta}
        <ArrowRightIcon className="size-4" />
      </Link>
    </div>
  );
}

function Footer() {
  return (
    <footer className="flex flex-col items-center gap-4 bg-[#f6f3f5] px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
      <div className="flex flex-col items-center gap-2 sm:items-start">
        <p className="text-xl font-black text-black">EduInsight</p>
        <p className="text-xs font-semibold tracking-[0.05em] text-[#45474c] opacity-90">
          © 2026 EduInsight AI. Systematic &amp; Encouraging Learning.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        {footerLinks.map((link) => (
          <Link
            className="text-xs font-semibold tracking-[0.05em] text-[rgba(69,71,76,0.7)] underline"
            href={link.href}
            key={link.label}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}

export function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopNavBar />
      <main className="relative flex flex-1 items-center overflow-hidden bg-[rgba(251,248,250,0.5)] px-4 py-16 sm:px-6 md:py-20 lg:px-10">
        <div className="absolute -left-48 -top-48 size-96 rounded-full bg-[rgba(216,226,255,0.3)] blur-[32px]" />
        <div className="absolute -bottom-20 -right-20 size-80 rounded-full bg-[rgba(216,226,252,0.2)] blur-[32px]" />
        <div className="relative mx-auto flex w-full max-w-[80rem] flex-col items-center gap-8 md:gap-10">
          <div className="flex max-w-[32rem] flex-col items-center gap-2 text-center">
            <h1 className="text-3xl font-semibold tracking-[-0.02em] text-black sm:text-4xl">
              Selamat Datang Kembali
            </h1>
            <p className="text-sm text-[#45474c]">
              Silakan pilih peran Anda untuk melanjutkan pengalaman belajar yang cerdas dan
              terstruktur bersama EduInsight.
            </p>
          </div>
          <div className="flex w-full max-w-[56rem] flex-col gap-6 sm:flex-row">
            {roleCards.map((card) => (
              <RoleCard card={card} key={card.title} />
            ))}
          </div>
          <p className="text-xs font-semibold tracking-[0.05em] text-[rgba(69,71,76,0.7)]">
            Belum punya akun?{" "}
            <Link className="text-[#085ac0]" href="#">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
