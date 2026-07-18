import Link from "next/link";
import type { SVGProps } from "react";

const teacherIllustration =
  "https://www.figma.com/api/mcp/asset/6f4e42d5-8e19-4eca-9871-fb7cbaaa8209";

function SparkleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M12 3.5 14 9l5.5 2-5.5 2L12 18.5 10 13 4.5 11 10 9 12 3.5Z" fill="currentColor" />
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

function PlayCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10.3 9.2v5.6l4.6-2.8-4.6-2.8Z" fill="currentColor" />
    </svg>
  );
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="m8.3 12.3 2.4 2.4 5-5.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

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

function RocketIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M12 3c3 1 5 4 5 8.5-1.2 1-2.3 1.8-5 3-2.7-1.2-3.8-2-5-3C7 7 9 4 12 3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
      <circle cx="12" cy="9.5" r="1.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 14.5 6.5 17M15 14.5l2.5 2.5M10 18.5l.8 2M13.2 18.5l-.8 2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 8v4l2.8 2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
}

function BarChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M5 19V10M12 19V5M19 19v-6" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function TwitterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M20 6.5c-.6.3-1.3.5-2 .6a3.5 3.5 0 0 0-6 3.2A9.9 9.9 0 0 1 4.8 6.2a3.5 3.5 0 0 0 1.1 4.7 3.4 3.4 0 0 1-1.6-.4v.1a3.5 3.5 0 0 0 2.8 3.4 3.5 3.5 0 0 1-1.6.06 3.5 3.5 0 0 0 3.3 2.4A7 7 0 0 1 4 17.7a9.9 9.9 0 0 0 5.4 1.6c6.5 0 10-5.4 10-10v-.5c.7-.5 1.3-1.1 1.8-1.8Z" fill="currentColor" />
    </svg>
  );
}

function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10.5v6M8 7.8v.1M11.5 16.5v-3.8c0-1.3.9-2.2 2.1-2.2 1.2 0 1.9.8 1.9 2.2v3.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  );
}

const navLinks = [
  { label: "Home", href: "/", active: true },
  { label: "About", href: "#", active: false },
];

const socialProof = [
  { initials: "JD", tone: "bg-[#eae7e9]" },
  { initials: "AS", tone: "bg-[#adc6ff]" },
  { initials: "KM", tone: "bg-[#f9dfb8]" },
];

const featureCards = [
  {
    icon: RocketIcon,
    badge: "NEW",
    title: "AI-Powered Insights",
    description:
      "Analisis data mendalam menggunakan algoritma AI terbaru untuk memahami perilaku belajar siswa.",
  },
  {
    icon: ClockIcon,
    title: "Time-Saving Automation",
    description:
      "Kurangi beban administratif guru hingga 40% dengan otomatisasi penilaian dan pelaporan.",
  },
  {
    icon: BarChartIcon,
    title: "Data-Driven Results",
    description:
      "Keputusan akademik yang didasarkan pada data konkret untuk meningkatkan skor kelulusan.",
  },
];

const roleCards = [
  {
    title: "Untuk Guru",
    icon: GraduationCapIcon,
    iconTone: "bg-[#d8e2ff] text-[#085ac0]",
    features: [
      { label: "AI Assessment Builder:", description: "Buat soal evaluasi cerdas hanya dalam hitungan detik." },
      { label: "Automated Diagnosis:", description: "Identifikasi area kelemahan siswa secara instan." },
      { label: "Remedial Planning:", description: "Rencana tindak lanjut otomatis yang disesuaikan per siswa." },
    ],
    cta: "Daftar sebagai Guru",
  },
  {
    title: "Untuk Siswa",
    icon: StudentIcon,
    iconTone: "bg-[#f9dfb8] text-[#8a6b38]",
    features: [
      { label: "Personalized Paths:", description: "Belajar sesuai kecepatan dan gaya belajarmu sendiri." },
      { label: "Instant Feedback:", description: "Koreksi langsung dan penjelasan mendalam untuk setiap jawaban." },
      { label: "Gamified Remedial:", description: "Selesaikan tantangan belajar dengan sistem poin dan lencana." },
    ],
    cta: "Daftar sebagai Siswa",
  },
];

const footerColumns = [
  {
    heading: "Perusahaan",
    links: ["Tentang Kami", "Karir", "Blog", "Kontak"],
  },
  {
    heading: "Produk",
    links: ["Fitur Utama", "Harga", "Keamanan", "Integrasi"],
  },
  {
    heading: "Dukungan",
    links: ["Help Center", "Privacy Policy", "Terms of Service", "Status Layanan"],
  },
];

function TopNavBar() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-center border-b border-[rgba(197,198,205,0.3)] bg-[rgba(251,248,250,0.8)] shadow-[0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-[6px] md:h-20">
      <div className="flex w-full max-w-[80rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <span className="text-xl font-semibold tracking-[-0.02em] text-black md:text-2xl">
          EduInsight
        </span>
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              className={
                link.active
                  ? "border-b-2 border-[#085ac0] pb-1.5 text-sm font-semibold text-[#085ac0]"
                  : "text-sm text-[#45474c]"
              }
              href={link.href}
              key={link.label}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            className="rounded-full px-3 py-2 text-sm font-semibold text-[#45474c] sm:px-6 sm:text-base"
            href="/dashboard"
          >
            Login
          </Link>
          <Link
            className="rounded-full bg-[#085ac0] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_15px_-3px_rgba(8,90,192,0.2),0_4px_6px_-4px_rgba(8,90,192,0.2)] sm:px-6 sm:py-2.5 sm:text-base"
            href="/dashboard"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16 lg:py-24">
      <div className="absolute -right-32 -top-64 size-[600px] rounded-full bg-[rgba(8,90,192,0.05)] blur-[60px]" />
      <div className="absolute -left-48 bottom-48 size-96 rounded-full bg-[rgba(249,223,184,0.1)] blur-[50px]" />
      <div className="relative mx-auto flex max-w-[80rem] flex-col items-center gap-10 px-4 sm:px-6 lg:flex-row lg:gap-12 lg:px-10">
        <div className="flex flex-1 flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(216,226,255,0.5)] px-4 py-1">
            <SparkleIcon className="size-3.5 text-[#004395]" />
            <span className="text-xs font-semibold uppercase tracking-[0.05em] text-[#004395]">
              Pendidikan Masa Depan
            </span>
          </div>
          <h1 className="max-w-[42rem] text-3xl font-bold leading-[1.25] tracking-[-0.02em] text-black sm:text-4xl lg:text-5xl">
            Diagnosis Pembelajaran Cerdas
          </h1>
          <p className="max-w-[32rem] text-base leading-6 text-[#45474c]">
            EduInsight membantu guru mendeteksi hambatan belajar secara otomatis dan memberikan
            jalur pembelajaran personal bagi setiap siswa untuk hasil maksimal.
          </p>
          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
            <Link
              className="flex items-center justify-center gap-3 rounded-xl bg-[#085ac0] px-8 py-4 text-base font-semibold text-white shadow-[0_20px_25px_-5px_rgba(8,90,192,0.25),0_8px_10px_-6px_rgba(8,90,192,0.25)]"
              href="/dashboard"
            >
              Coba Sekarang Gratis
              <ArrowRightIcon className="size-5" />
            </Link>
            <Link
              className="flex items-center justify-center gap-2 rounded-xl bg-[#eae7e9] px-8 py-4 text-base font-semibold text-[#1b1b1d] sm:py-5"
              href="/dashboard"
            >
              <PlayCircleIcon className="size-5" />
              Lihat Demo
            </Link>
          </div>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center">
              {socialProof.map((person, index) => (
                <span
                  className={`grid size-10 place-items-center rounded-full border-2 border-[#fbf8fa] text-xs font-semibold text-[#1b1b1d] ${person.tone} ${index > 0 ? "-ml-3" : ""}`}
                  key={person.initials}
                >
                  {person.initials}
                </span>
              ))}
            </div>
            <p className="text-sm">
              <span className="font-bold text-[#1b1b1d]">2,500+</span>{" "}
              <span className="text-[#45474c]">Guru telah bergabung</span>
            </p>
          </div>
        </div>
        <div className="relative flex flex-1 items-center justify-center">
          <div className="absolute size-56 rounded-full bg-white/40 blur-[32px] sm:size-72" />
          <div className="absolute -right-6 -top-6 size-16 rotate-12 rounded-2xl bg-[rgba(8,90,192,0.1)] sm:size-24" />
          <div className="absolute -bottom-6 -left-4 size-20 rounded-full bg-[rgba(249,223,184,0.2)] sm:size-32" />
          <div className="relative size-56 shadow-[0_25px_25px_rgba(0,0,0,0.15)] sm:size-72 md:size-80 lg:size-[28rem]">
            <img
              alt="3D teacher character holding a tablet"
              className="size-full object-contain"
              src={teacherIllustration}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function RoleCard({ card }: { card: (typeof roleCards)[number] }) {
  const Icon = card.icon;

  return (
    <div className="flex flex-1 flex-col items-start rounded-[24px] border border-[rgba(197,198,205,0.5)] bg-white p-6 md:p-8">
      <div className="mb-8 flex items-center gap-4">
        <div className={`grid size-14 shrink-0 place-items-center rounded-2xl md:size-16 ${card.iconTone}`}>
          <Icon className="size-6 md:size-7" />
        </div>
        <h3 className="text-2xl font-semibold tracking-[-0.01em] text-black md:text-[32px]">
          {card.title}
        </h3>
      </div>
      <ul className="mb-10 flex w-full flex-col gap-5">
        {card.features.map((feature) => (
          <li className="flex items-start gap-3" key={feature.label}>
            <CheckIcon className="mt-1 size-5 shrink-0 text-[#22c55e]" />
            <p className="text-base leading-6 text-[#1b1b1d]">
              <span className="font-semibold">{feature.label}</span>{" "}
              <span className="text-[#45474c]">{feature.description}</span>
            </p>
          </li>
        ))}
      </ul>
      <Link
        className="w-full rounded-xl border-2 border-[#085ac0] py-[18px] text-center text-lg font-bold text-[#085ac0]"
        href="/dashboard"
      >
        {card.cta}
      </Link>
    </div>
  );
}

function RoleSelectionSection() {
  return (
    <section className="bg-[rgba(246,243,245,0.5)] py-16 lg:py-24">
      <div className="mx-auto flex max-w-[80rem] flex-col gap-10 px-4 sm:px-6 lg:gap-16 lg:px-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold tracking-[-0.02em] text-black sm:text-4xl lg:text-5xl">
            Siap untuk Memulai?
          </h2>
          <p className="max-w-[42rem] text-base leading-6 text-[#45474c]">
            Pilih profil Anda untuk menyesuaikan pengalaman belajar mengajar yang lebih cerdas
            dengan teknologi AI terintegrasi.
          </p>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row">
          {roleCards.map((card) => (
            <RoleCard card={card} key={card.title} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="mx-auto grid max-w-[75rem] grid-cols-1 gap-8 px-4 pb-24 pt-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-10 lg:pb-48 lg:pt-24">
      {featureCards.map((feature) => {
        const Icon = feature.icon;

        return (
          <div className="flex flex-col items-center gap-6 rounded-[24px] p-6 text-center md:p-8" key={feature.title}>
            <div className="relative grid size-20 place-items-center rounded-full bg-[rgba(173,198,255,0.2)]">
              <Icon className="size-7 text-[#085ac0]" />
              {feature.badge ? (
                <span className="absolute -right-2 -top-2 rounded-full bg-[#085ac0] px-2 py-1 text-[10px] font-bold text-white">
                  {feature.badge}
                </span>
              ) : null}
            </div>
            <div className="space-y-3">
              <h4 className="text-xl font-semibold text-black">{feature.title}</h4>
              <p className="text-sm leading-5 text-[#45474c]">{feature.description}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}

function CTABannerSection() {
  return (
    <section className="mx-auto max-w-[75rem] px-4 pb-16 sm:px-6 lg:px-10 lg:pb-24">
      <div className="relative overflow-hidden rounded-[32px] bg-[#111c2e] p-8 md:p-12 lg:p-16">
        <div className="absolute inset-0 bg-gradient-to-l from-[rgba(8,90,192,0.1)] to-transparent" />
        <SparkleIcon className="absolute -bottom-16 -right-4 size-64 text-white/5" />
        <div className="relative flex max-w-[42rem] flex-col items-start gap-6 lg:gap-8">
          <h2 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-white sm:text-4xl lg:text-5xl">
            Mulai Revolusi Belajar Sekarang
          </h2>
          <p className="text-base leading-6 text-[#7a849b]">
            Bergabunglah dengan ribuan sekolah yang telah bertransformasi dengan EduInsight.
            Tingkatkan efisiensi pengajaran dan kebahagiaan belajar siswa hari ini.
          </p>
          <div className="flex w-full flex-col items-stretch gap-4 sm:w-auto sm:flex-row sm:items-center">
            <Link
              className="rounded-xl bg-[#085ac0] px-8 py-[17px] text-center text-lg font-bold text-white shadow-[0_10px_15px_-3px_rgba(8,90,192,0.4),0_4px_6px_-4px_rgba(8,90,192,0.4)]"
              href="/dashboard"
            >
              Mulai Trial 14 Hari
            </Link>
            <Link
              className="rounded-xl border border-[#c5c6cd] px-8 py-[17px] text-center text-lg font-bold text-white"
              href="#"
            >
              Jadwalkan Konsultasi
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="flex flex-col items-center gap-10 bg-[#f6f3f5] py-8 lg:gap-16">
      <div className="flex w-full max-w-[80rem] flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:gap-6 lg:px-10">
        <div className="flex flex-1 flex-col items-start gap-4">
          <p className="text-xl font-bold text-black">EduInsight</p>
          <p className="text-sm leading-5 text-[#45474c]">
            AI untuk pendidikan yang lebih personal, inklusif, dan efektif bagi masa depan
            generasi bangsa.
          </p>
          <div className="flex items-center gap-4">
            <span className="grid size-8 place-items-center rounded-full bg-[#e4e2e3] text-[#45474c]">
              <TwitterIcon className="size-3" />
            </span>
            <span className="grid size-8 place-items-center rounded-full bg-[#e4e2e3] text-[#45474c]">
              <LinkedinIcon className="size-3" />
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:flex lg:flex-1 lg:gap-6">
          {footerColumns.map((column) => (
            <div className="flex flex-1 flex-col items-start gap-4" key={column.heading}>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#1b1b1d]">
                {column.heading}
              </h4>
              <nav className="flex flex-col items-start gap-2">
                {column.links.map((link) => (
                  <Link className="text-sm text-[#45474c] underline" href="#" key={link}>
                    {link}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full max-w-[80rem] border-t border-[rgba(197,198,205,0.2)] px-4 pt-8 sm:px-6 lg:px-10">
        <p className="text-sm text-[#45474c]">© 2026 EduInsight AI Platform. All rights reserved.</p>
      </div>
    </footer>
  );
}

export function DesktopLandingPage() {
  return (
    <div className="bg-white">
      <TopNavBar />
      <HeroSection />
      <RoleSelectionSection />
      <FeaturesSection />
      <CTABannerSection />
      <FooterSection />
    </div>
  );
}
