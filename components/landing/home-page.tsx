import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

// Home (Figma New Design 1:1318, mobile 19:1684). The hero statistics of the design are left out: the backend has
// no public figures to back them.

const primaryButton =
  "flex items-center justify-center gap-3 rounded-xl bg-[#0058be] px-4 py-3 text-base font-semibold leading-normal text-[#f5f3f4] drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)] transition-colors hover:bg-[#004695]";
const softButton =
  "flex items-center justify-center rounded-xl bg-[rgba(153,188,229,0.6)] px-4 py-3 text-base font-semibold leading-normal text-[#004695] shadow-[0_4px_8px_rgba(0,0,0,0.15)] transition-colors hover:bg-[rgba(153,188,229,0.85)]";
const outlineButton =
  "flex w-full items-center justify-center rounded-xl border-2 border-[#085ac0] px-2 py-4 text-base font-bold leading-7 text-[#085ac0] transition-colors hover:bg-[#e6eff9] sm:text-lg";

export function Chip({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-3xl bg-[rgba(153,188,229,0.6)] px-2 py-1 text-xs font-semibold leading-normal text-[#004695]">
      <Image alt="" height={20} src={icon} width={20} />
      {children}
    </span>
  );
}

function FloatingChip({ icon, label, className }: { icon: string; label: string; className: string }) {
  return (
    <div
      className={cn(
        "absolute flex items-center gap-2.5 rounded-t-3xl rounded-bl-3xl bg-[#f5f3f4] px-3 py-2 drop-shadow-[0_3px_3px_rgba(0,0,0,0.15)]",
        className,
      )}
    >
      <span className="grid place-items-center rounded-[29px] bg-[rgba(153,188,229,0.6)] px-2.5 py-1.5">
        <Image alt="" className="size-5 lg:size-6" height={24} src={icon} width={24} />
      </span>
      <span className="whitespace-nowrap text-sm font-semibold leading-normal text-[#003264] lg:text-xl">{label}</span>
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className="relative mx-auto aspect-[734/567] w-full max-w-[734px]">
      <span className="absolute left-[70%] top-0 size-[12%] rotate-[21deg] rounded-[20px] bg-[#e6eff9]" />
      <span className="absolute left-[11%] top-[78%] size-[12%] -rotate-[16deg] rounded-[20px] bg-[#e6eff9]" />
      <div className="absolute left-[15.5%] top-[6.8%] w-[64.5%]">
        <Image
          alt="Ilustrasi guru memegang tablet EduInsight"
          className="h-auto w-full"
          height={512}
          priority
          sizes="(min-width: 1024px) 474px, 64vw"
          src="/landing/teacher-3d.png"
          width={512}
        />
      </div>
      <FloatingChip className="left-[54%] top-[42%]" icon="/landing/brain.svg" label="Remedial Instan" />
      <FloatingChip className="left-[63%] top-[56%]" icon="/landing/book-search.svg" label="Analisis Soal" />
      <div className="absolute left-0 top-[73%] flex max-w-[64%] items-center gap-2.5 rounded-t-3xl rounded-br-3xl bg-[#e6eff9] p-2.5 drop-shadow-[0_3px_3px_rgba(0,0,0,0.15)] lg:p-3">
        <span className="grid shrink-0 place-items-center rounded-[36px] bg-[rgba(153,188,229,0.6)] px-2.5 py-1.5 lg:px-3 lg:py-2">
          <Image alt="" className="size-5 lg:size-[30px]" height={30} src="/landing/badge-check.svg" width={30} />
        </span>
        <span className="text-xs font-semibold leading-normal text-[#003264] lg:text-base">
          Diagnosis per TP langsung dari jawaban siswa
        </span>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-[1440px] items-center gap-8 px-4 pb-12 pt-8 sm:px-8 lg:min-h-[791px] lg:grid-cols-2 lg:gap-3 lg:px-16 lg:py-0">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-start gap-3">
          <Chip icon="/landing/astroid.svg">Your Personal Learning Assistant</Chip>
          <h1 className="text-[32px] font-bold leading-normal text-[#1b1b1d] lg:text-[40px]">
            Pahami Letak Buntu Belajar di Tiap Butir Soal
          </h1>
          <p className="text-sm leading-normal text-[#75777d] lg:text-base">
            EduInsight memadukan AI untuk melacak miskonsepsi langkah demi langkah. Guru mendapat diagnosis dan rekomendasi remedial
            yang pas sasaran, siswa mendapat umpan balik dan latihan sesuai bagian yang belum dikuasai.
          </p>
        </div>
        {/* On phones the illustration sits between the text and the buttons (Figma New Design 19:1684). */}
        <div className="lg:hidden">
          <HeroIllustration />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link className={cn(primaryButton, "sm:flex-1")} href="/#mulai">
            Coba Sekarang
            <Image alt="" height={24} src="/landing/arrow-right.svg" width={24} />
          </Link>
          <Link className={cn(softButton, "sm:flex-1")} href="/about">
            Jelajahi Fitur
          </Link>
        </div>
      </div>
      <div className="hidden lg:block">
        <HeroIllustration />
      </div>
    </section>
  );
}

function RoleCard({
  title,
  icon,
  iconTone,
  deco,
  items,
  cta,
  href,
}: {
  title: string;
  icon: string;
  iconTone: string;
  deco: { src: string; width: number; height: number };
  items: { title: string; body: string }[];
  cta: string;
  href: string;
}) {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden rounded-3xl border border-[rgba(197,198,205,0.5)] bg-white p-6 sm:p-[33px]">
      <Image
        alt=""
        className="pointer-events-none absolute right-0 top-0 h-auto w-[110px] sm:w-auto"
        height={deco.height}
        src={deco.src}
        width={deco.width}
      />
      <div className="relative flex items-center gap-4 pb-8">
        <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl sm:size-16", iconTone)}>
          <Image alt="" height={30} src={icon} width={30} />
        </span>
        <h3 className="text-2xl font-semibold leading-10 tracking-[-0.32px] text-black sm:text-[32px]">{title}</h3>
      </div>
      <ul className="relative flex flex-1 flex-col gap-5 pb-10">
        {items.map((item) => (
          <li className="flex items-start gap-3" key={item.title}>
            <Image alt="" className="mt-1 shrink-0" height={23} src="/landing/check.svg" width={20} />
            <p className="text-sm leading-6 text-[#45474c] sm:text-base">
              <span className="font-semibold text-[#1b1b1d]">{item.title}:</span> {item.body}
            </p>
          </li>
        ))}
      </ul>
      <Link className={cn(outlineButton, "relative")} href={href}>
        {cta}
      </Link>
    </div>
  );
}

function GetStarted() {
  return (
    <section className="scroll-mt-20 bg-[rgba(246,243,245,0.5)] py-16 lg:py-24" id="mulai">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-4 sm:px-10 lg:gap-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-[32px] font-bold leading-tight tracking-[-0.96px] text-black lg:text-5xl lg:leading-[56px]">
            Siap untuk Memulai?
          </h2>
          <p className="max-w-[672px] text-sm leading-6 text-[#45474c] lg:text-base">
            Pilih profil Anda untuk menyesuaikan pengalaman belajar mengajar yang lebih cerdas dengan teknologi AI terintegrasi.
          </p>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row">
          <RoleCard
            cta="Daftar sebagai Guru"
            deco={{ src: "/landing/teacher-deco.svg", width: 174, height: 154 }}
            href="/register/teacher"
            icon="/landing/teacher-icon.svg"
            iconTone="bg-[#d8e2ff]"
            items={[
              { title: "AI Assessment Builder", body: "Buat soal evaluasi cerdas hanya dalam hitungan detik." },
              { title: "Automated Diagnosis", body: "Identifikasi area kelemahan siswa secara instan." },
              { title: "Remedial Planning", body: "Rencana tindak lanjut otomatis yang disesuaikan per siswa." },
            ]}
            title="Untuk Guru"
          />
          <RoleCard
            cta="Daftar sebagai Siswa"
            deco={{ src: "/landing/student-deco.svg", width: 144, height: 144 }}
            href="/register/student"
            icon="/landing/student-icon.svg"
            iconTone="bg-[#f9dfb8]"
            items={[
              { title: "Personalized Paths", body: "Belajar sesuai kecepatan dan gaya belajarmu sendiri." },
              { title: "Instant Feedback", body: "Koreksi langsung dan penjelasan mendalam untuk setiap jawaban." },
              { title: "Gamified Remedial", body: "Selesaikan tantangan belajar dengan sistem poin dan lencana." },
            ]}
            title="Untuk Siswa"
          />
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    title: "AI-Powered Insights",
    body: "AI membaca pola jawaban untuk menunjukkan bagian yang sudah dan belum dikuasai setiap siswa.",
    icon: { src: "/landing/rocket.svg", width: 30, height: 30 },
    isNew: true,
  },
  {
    title: "Time-Saving Automation",
    body: "Penilaian dan pelaporan otomatis menghemat waktu guru, dan siswa langsung tahu hasil serta langkah berikutnya.",
    icon: { src: "/landing/timer.svg", width: 27, height: 32 },
  },
  {
    title: "Data-Driven Results",
    body: "Guru dan siswa mengambil langkah belajar berikutnya berdasarkan data, bukan tebakan.",
    icon: { src: "/landing/chart.svg", width: 27, height: 27 },
  },
];

function Features() {
  return (
    <section className="mx-auto grid max-w-[1200px] gap-8 px-4 py-16 sm:px-8 md:grid-cols-3">
      {features.map((feature) => (
        <div className="flex flex-col items-center gap-6 rounded-3xl p-4 text-center lg:p-8" key={feature.title}>
          <span className="relative grid size-20 place-items-center rounded-full bg-[rgba(173,198,255,0.2)]">
            <Image alt="" height={feature.icon.height} src={feature.icon.src} width={feature.icon.width} />
            {feature.isNew && (
              <span className="absolute -right-2 -top-2 rounded-full bg-[#085ac0] px-2 py-1 text-[10px] font-bold leading-[15px] text-white">
                NEW
              </span>
            )}
          </span>
          <div className="flex flex-col gap-3">
            <h3 className="text-xl font-semibold leading-7 text-black">{feature.title}</h3>
            <p className="mx-auto max-w-[320px] text-sm leading-5 text-[#45474c]">{feature.body}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

function CallToAction() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-8 lg:p-16">
      <div className="relative overflow-hidden rounded-xl bg-[#111c2e] p-8 lg:p-16">
        <div className="absolute inset-y-0 left-1/2 right-0 bg-gradient-to-l from-[rgba(8,90,192,0.1)] to-transparent" />
        <Image
          alt=""
          className="pointer-events-none absolute -bottom-[150px] -right-[10px] size-[260px] opacity-80 lg:size-[458px]"
          height={367}
          src="/landing/stars.svg"
          width={367}
        />
        <div className="relative flex max-w-[672px] flex-col gap-8">
          <h2 className="text-[32px] font-bold leading-tight tracking-[-0.96px] text-white lg:text-5xl lg:leading-[56px]">
            Mulai Revolusi Belajar Sekarang
          </h2>
          <p className="text-sm leading-6 text-[#7a849b] lg:text-base">
            Bergabunglah dengan EduInsight sebagai guru maupun siswa. Tingkatkan efisiensi pengajaran dan kebahagiaan belajar
            mulai hari ini.
          </p>
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <>
      <Hero />
      <GetStarted />
      <Features />
      <CallToAction />
    </>
  );
}
