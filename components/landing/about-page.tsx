import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import { Chip } from "./home-page";

// About (Figma New Design 187:9563, mobile 19:1687).

const cardClassName = "flex flex-col gap-4 rounded-3xl border border-[#c5c6cd] bg-white p-6 lg:p-8";

function IconBubble({ src, size = "size-14" }: { src: string; size?: string }) {
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full bg-[rgba(173,198,255,0.2)]", size)}>
      <Image alt="" height={24} src={src} width={24} />
    </span>
  );
}

function Section({ title, lead, tone, children }: { title: string; lead?: string; tone?: "grey"; children: ReactNode }) {
  return (
    <section className={cn("py-16 lg:py-24", tone === "grey" && "bg-[rgba(246,243,245,0.5)]")}>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 sm:px-8 lg:gap-12 lg:px-[120px]">
        <div className="flex flex-col items-center gap-4 text-center leading-normal">
          <h2 className="text-[28px] font-bold text-[#1b1b1d] lg:text-[32px]">{title}</h2>
          {lead && <p className="max-w-[760px] text-sm text-[#75777d] lg:text-base">{lead}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

const summary = [
  { icon: "/landing/book.svg", label: "Mata Pelajaran", value: "Semua mata pelajaran, semua jenjang kelas" },
  { icon: "/landing/notebook-text.svg", label: "Kurikulum", value: "Kurikulum Merdeka (CP dan TP)" },
  { icon: "/landing/users-round.svg", label: "Pengguna", value: "Guru dan siswa" },
  { icon: "/landing/badge-check-sm.svg", label: "Persetujuan AI", value: "Setiap keluaran AI ditinjau guru sebelum diterima siswa" },
];

function Hero() {
  return (
    <section className="mx-auto grid max-w-[1440px] items-center gap-10 px-4 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_520px] lg:gap-16 lg:px-16 lg:py-28">
      <div className="flex flex-col items-start gap-6">
        <Chip icon="/landing/astroid.svg">Tentang EduInsight</Chip>
        <h1 className="text-[32px] font-bold leading-normal text-[#1b1b1d] lg:text-[40px]">
          Diagnosis Pembelajaran Berbasis Tujuan Pembelajaran
        </h1>
        <p className="text-sm leading-normal text-[#45474c] lg:text-base">
          EduInsight membantu guru semua mata pelajaran dan jenjang kelas mengidentifikasi Tujuan Pembelajaran yang belum tercapai,
          menemukan miskonsepsi yang paling umum, dan menyusun remedial yang sesuai. Siswa melihat hasil diagnosisnya sendiri dan
          mendapat latihan sesuai bagian yang belum dikuasai.
        </p>
        <Link
          className="flex items-center gap-3 rounded-xl bg-[#0058be] px-4 py-3 text-base font-semibold leading-normal text-[#f5f3f4] drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)] transition-colors hover:bg-[#004695]"
          href="/#mulai"
        >
          Coba Sekarang
          <Image alt="" height={24} src="/landing/arrow-right.svg" width={24} />
        </Link>
      </div>
      <div className="flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)] lg:p-8">
        <h2 className="text-xl font-semibold leading-normal text-[#1b1b1d]">Ringkasan Platform</h2>
        <ul className="flex flex-col">
          {summary.map((row, index) => (
            <li className={cn("flex items-center gap-4 py-4", index > 0 && "border-t border-[#eae7e9]")} key={row.label}>
              <IconBubble size="size-12" src={row.icon} />
              <div className="flex min-w-0 flex-col gap-0.5 leading-normal">
                <span className="text-xs text-[#75777d]">{row.label}</span>
                <span className="text-base font-semibold text-[#1b1b1d]">{row.value}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const challenges = [
  {
    icon: "/landing/circle-alert.svg",
    title: "Nilai belum menunjukkan letak kesulitan",
    body: "Nilai akhir tidak menunjukkan konsep atau langkah yang keliru, sehingga guru sulit menindaklanjuti dan siswa tidak tahu bagian mana yang perlu dipelajari ulang.",
  },
  {
    icon: "/landing/users-round.svg",
    title: "Remedial belum terarah",
    body: "Remedial umumnya diberikan dengan materi dan soal yang sama untuk semua siswa, meskipun kebutuhan belajarnya berbeda.",
  },
  {
    icon: "/landing/clock.svg",
    title: "Analisis memerlukan waktu",
    body: "Menyusun soal, mengoreksi, dan menganalisis kualitas butir soal secara manual menyita waktu guru.",
  },
];

const steps = [
  {
    title: "Susun Kurikulum",
    body: "Impor Capaian Pembelajaran resmi sesuai Fase atau tambahkan sendiri, lalu rumuskan Tujuan Pembelajaran di setiap Bab.",
  },
  {
    title: "Buat Asesmen",
    body: "Tambahkan soal dengan mengetik, mengunggah template, memindai dokumen, atau membuat draf soal dengan AI berdasarkan materi Anda.",
  },
  {
    title: "Diagnosis per TP",
    body: "Ketercapaian setiap TP diberi label Sangat Baik, Baik, Cukup, atau Kurang, dilengkapi analisis pola kesalahan. Siswa juga dapat melihat diagnosisnya sendiri.",
  },
  {
    title: "Remedial dan Reassessment",
    body: "Siswa dikelompokkan berdasarkan pola kesalahannya, lalu mengerjakan materi dan soal remedial yang disetujui guru hingga reassessment.",
  },
];

const principles = [
  {
    icon: "/landing/user-check.svg",
    title: "Guru sebagai pengambil keputusan akhir",
    body: "Soal, pengelompokan, dan rekomendasi dari AI berstatus Menunggu ACC dan baru tampil ke siswa setelah disetujui guru.",
  },
  {
    icon: "/landing/book-search-sm.svg",
    title: "Hasil dapat ditelusuri",
    body: "Setiap label diagnosis dapat ditelusuri hingga ke Tujuan Pembelajaran dan butir soal sumbernya.",
  },
  {
    icon: "/landing/eye-off.svg",
    title: "Privasi data siswa",
    body: "Nama dan identitas siswa tidak dikirim ke layanan AI. Data hanya dapat diakses sesuai peran pengguna.",
  },
  {
    icon: "/landing/clipboard-pen-line.svg",
    title: "Tetap berfungsi tanpa AI",
    body: "Input soal manual, hasil asesmen, dan materi tetap dapat digunakan ketika layanan AI tidak tersedia.",
  },
];

const missions = [
  "Menyediakan diagnosis ketercapaian TP dan miskonsepsi yang akurat serta mudah dipahami.",
  "Membantu guru menyusun remedial yang sesuai dengan kebutuhan setiap kelompok siswa.",
  "Mengurangi beban administratif guru dalam penyusunan dan analisis asesmen.",
  "Membantu siswa memahami bagian yang belum dikuasai dan belajar sesuai kebutuhannya.",
];

const team = ["Alyssa Layla Sasti", "Siti Shofi Nadhifa", "Dery Andreas Tampubolon", "Marwa Muhlashon"];

const initialsOf = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

export function AboutPage() {
  return (
    <>
      <Hero />

      <Section
        lead="Hasil asesmen sering berhenti sebagai angka, padahal guru dan siswa membutuhkan informasi yang lebih rinci untuk menentukan langkah berikutnya."
        title="Tantangan dalam Evaluasi Pembelajaran"
        tone="grey"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {challenges.map((item) => (
            <div className={cardClassName} key={item.title}>
              <IconBubble src={item.icon} />
              <h3 className="text-lg font-semibold leading-normal text-[#1b1b1d] lg:text-xl">{item.title}</h3>
              <p className="text-sm leading-normal text-[#45474c] lg:text-base">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section lead="Empat tahap yang membentuk satu siklus pembelajaran, dari penyusunan kurikulum hingga reassessment." title="Cara Kerja EduInsight">
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li className={cardClassName} key={step.title}>
              <span className="grid size-10 place-items-center rounded-full bg-[#0058be] text-sm font-semibold text-white">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-lg font-semibold leading-normal text-[#1b1b1d]">{step.title}</h3>
              <p className="text-sm leading-normal text-[#45474c]">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section lead="Teknologi AI di EduInsight dirancang untuk mendukung keputusan guru, bukan menggantikannya." title="Prinsip Pengembangan" tone="grey">
        <div className="grid gap-6 md:grid-cols-2">
          {principles.map((item) => (
            <div className={cn(cardClassName, "flex-row items-start gap-4")} key={item.title}>
              <IconBubble src={item.icon} />
              <div className="flex flex-col gap-2 leading-normal">
                <h3 className="text-lg font-semibold text-[#1b1b1d] lg:text-xl">{item.title}</h3>
                <p className="text-sm text-[#45474c] lg:text-base">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Visi dan Misi">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-3xl bg-[#0058be] p-6 text-white lg:p-8">
            <p className="text-base font-semibold">Visi</p>
            <p className="text-xl font-semibold leading-normal lg:text-2xl">
              Mewujudkan pembelajaran yang ditindaklanjuti berdasarkan ketercapaian Tujuan Pembelajaran setiap siswa.
            </p>
          </div>
          <div className={cardClassName}>
            <p className="text-base font-semibold text-[#085ac0]">Misi</p>
            <ol className="flex flex-col gap-4">
              {missions.map((mission, index) => (
                <li className="flex items-start gap-4" key={mission}>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e6eff9] text-xs font-semibold text-[#085ac0]">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-normal text-[#1b1b1d] lg:text-base">{mission}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      <Section
        lead="EduInsight dikembangkan oleh mahasiswa Universitas Indonesia sebagai karya Lomba Inovasi Digital Mahasiswa (LIDM) 2026, Divisi Inovasi Teknologi Digital Pendidikan."
        title="Tim Pengembang"
      >
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((name) => (
            <li className={cn(cardClassName, "items-center text-center")} key={name}>
              <span className="grid size-[88px] place-items-center rounded-full bg-[#d8e2ff] text-2xl font-bold text-[#085ac0]">
                {initialsOf(name)}
              </span>
              <p className="text-base font-semibold leading-normal text-[#1b1b1d]">{name}</p>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
