import type { ComponentType, SVGProps } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { SparkIcon } from "@/components/ui/icons";

function AlertIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M12 7v6" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
      <circle cx="12" cy="16.7" r="1.15" fill="currentColor" />
    </svg>
  );
}

function TrendUpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="m4 16 5.5-5.5 3.5 3.5L20 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M15 7h5v5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function CheckCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8.5 12.3 2.3 2.3 4.7-4.9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function PlayCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10.3 9.2v5.6l4.6-2.8-4.6-2.8Z" fill="currentColor" />
    </svg>
  );
}

function PencilIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="m14.5 5 4.5 4.5-9.3 9.3-5 .8.8-5L14.5 5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="m12.5 7 4.5 4.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function UsersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <circle cx="9" cy="8.5" r="2.8" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.8 18a5.2 5.2 0 0 1 10.4 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
      <path d="M15.5 6.4a2.8 2.8 0 0 1 0 5.5M17.8 13.4a5.2 5.2 0 0 1 3 4.6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
}

function GalleryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <rect x="3.5" y="5" width="17" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="8.3" cy="9.5" r="1.4" stroke="currentColor" strokeWidth="1.5" />
      <path d="m4.5 16.5 4.5-4.5 3 3 3.5-3.8 4 4.3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
}

function FileTextIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7 3.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
      <path d="M9 12.5h6M9 15.5h6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

function MonitorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <rect x="3.5" y="5" width="17" height="11" rx="1.6" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 20h6M12 16v4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
}

function SendIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M20 4 3.5 10.6c-.9.36-.86 1.65.05 1.96L11 15l2.44 7.45c.31.91 1.6.95 1.96.05L20 4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
      <path d="M20 4 11 15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
}

type Student = { name: string; score: number };

const strugglingStudents: Student[] = [
  { name: "Budi Satria", score: 32 },
  { name: "Siti Aminah", score: 41 },
  { name: "Raka Wijaya", score: 38 },
];

const practiceStudents: Student[] = [
  { name: "Alya Putri", score: 65 },
  { name: "Daffa Ramadhan", score: 68 },
  { name: "Luthfi Aziz", score: 72 },
  { name: "Hana Maulia", score: 70 },
];

const enrichmentStudents: Student[] = [
  { name: "Fahri Alamsyah", score: 95 },
  { name: "Keysha Adinda", score: 92 },
];

const avatarTones = [
  "bg-[#e5ecff] text-[#5b6a8a]",
  "bg-[#fdecd2] text-[#8d6a3d]",
  "bg-[#e0f2fe] text-[#0369a1]",
  "bg-[#fce7f3] text-[#9d174d]",
  "bg-[#ede9fe] text-[#5b21b6]",
  "bg-[#dcfce7] text-[#166534]",
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const mediaItems = [
  {
    type: "video" as const,
    title: "Dasar Operasi Pecahan (Part 1)",
    meta: "Video Animasi • Kemdikbud",
    duration: "05:24",
  },
  {
    type: "simulation" as const,
    title: "Lab Virtual Pecahan Campuran",
    meta: "Simulasi WebGL • PhET",
  },
  {
    type: "document" as const,
    title: "Modul Latihan Intensif Level 2",
    meta: "PDF Document • 12 Halaman",
  },
];

function PageIntro() {
  return (
    <section className="space-y-1">
      <h1 className="text-[clamp(2rem,5vw,2.5rem)] font-semibold tracking-[-0.04em] text-[#091426]">
        Personalized Remedial Planner
      </h1>
      <p className="text-sm text-[#5c6470]">
        Siklus remedial otomatis berdasarkan performa kuis “Operasi Pecahan”.
      </p>
    </section>
  );
}

function GroupTag({ tone, label }: { tone: string; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[4px] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.05em]",
        tone,
      )}
    >
      {label}
    </span>
  );
}

function RecommendationFooter({
  icon: Icon,
  label,
  dashed = true,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  dashed?: boolean;
}) {
  return (
    <div className={cn("w-full pt-4", dashed ? "border-t border-dashed border-[#c5c6cd]" : "border-t border-[#c5c6cd]")}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#45474c]">
        Rekomendasi AI:
      </p>
      <div className="flex items-center gap-2">
        <Icon className="size-5 shrink-0 text-[#0058be]" />
        <p className="text-base font-bold leading-6 text-[#0058be]">{label}</p>
      </div>
    </div>
  );
}

function StrugglingGroupCard() {
  return (
    <Card className="flex flex-col justify-between rounded-[12px] p-[25px] xl:col-span-4">
      <div className="w-full space-y-4 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <GroupTag label="Kelompok A" tone="bg-[rgba(186,26,26,0.1)] text-[#ba1a1a]" />
            <h2 className="text-xl font-semibold text-[#091426]">Belum Paham</h2>
          </div>
          <AlertIcon className="size-[18px] text-[#ba1a1a]" />
        </div>
        <div className="space-y-2">
          {strugglingStudents.map((student, index) => (
            <div
              className="flex items-center gap-3 rounded-[8px] border border-[rgba(197,198,205,0.3)] bg-[#f5f3f4] p-[13px]"
              key={student.name}
            >
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-full border-2 border-white text-xs font-bold shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
                  avatarTones[index % avatarTones.length],
                )}
              >
                {initials(student.name)}
              </span>
              <div>
                <p className="text-base font-semibold text-[#1b1b1d]">{student.name}</p>
                <p className="text-xs text-[#45474c]">Skor: {student.score}/100</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <RecommendationFooter icon={PlayCircleIcon} label="Video Pembelajaran & Demonstrasi" />
    </Card>
  );
}

function PracticeGroupCard() {
  return (
    <Card className="flex flex-col justify-between rounded-[12px] p-[25px] xl:col-span-4">
      <div className="w-full space-y-4 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <GroupTag label="Kelompok B" tone="bg-[#fef3c7] text-[#b45309]" />
            <h2 className="text-xl font-semibold text-[#091426]">Butuh Latihan</h2>
          </div>
          <TrendUpIcon className="size-[18px] text-[#b45309]" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {practiceStudents.map((student, index) => (
            <div
              className="flex flex-col items-center gap-1 rounded-[8px] bg-[#f5f3f4] p-3 text-center"
              key={student.name}
            >
              <span
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-full text-sm font-bold",
                  avatarTones[index % avatarTones.length],
                )}
              >
                {initials(student.name)}
              </span>
              <p className="text-base leading-tight text-[#1b1b1d]">{student.name}</p>
              <p className="text-[10px] text-[#45474c]">{student.score}/100</p>
            </div>
          ))}
        </div>
      </div>
      <RecommendationFooter icon={PencilIcon} label="Latihan Soal Terpandu" />
    </Card>
  );
}

function EnrichmentGroupCard() {
  return (
    <Card className="flex flex-col justify-between rounded-[12px] p-[25px] xl:col-span-4">
      <div className="w-full space-y-4 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <GroupTag label="Kelompok C" tone="bg-[#d1fae5] text-[#047857]" />
            <h2 className="text-xl font-semibold text-[#091426]">Pengayaan</h2>
          </div>
          <CheckCircleIcon className="size-[18px] text-[#047857]" />
        </div>
        <div className="space-y-2">
          {enrichmentStudents.map((student, index) => (
            <div
              className="flex items-center justify-between rounded-[8px] border border-[#d1fae5] bg-[rgba(236,253,245,0.5)] p-[13px]"
              key={student.name}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold",
                    avatarTones[index % avatarTones.length],
                  )}
                >
                  {initials(student.name)}
                </span>
                <p className="text-base text-[#1b1b1d]">{student.name}</p>
              </div>
              <p className="text-xs font-bold text-[#047857]">{student.score}/100</p>
            </div>
          ))}
        </div>
      </div>
      <RecommendationFooter icon={UsersIcon} label="Proyek Mandiri / Tutor Sebaya" />
    </Card>
  );
}

function MediaThumbnail({ item }: { item: (typeof mediaItems)[number] }) {
  if (item.type === "video") {
    return (
      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-[8px] bg-gradient-to-br from-[#94a3b8] to-[#334155]">
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <PlayCircleIcon className="size-8 text-white" />
        </div>
        <span className="absolute bottom-2 right-2 rounded-[4px] bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
          {item.duration}
        </span>
      </div>
    );
  }

  if (item.type === "simulation") {
    return (
      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-[8px] bg-gradient-to-br from-[#bfdbfe] to-[#60a5fa]">
        <MonitorIcon className="size-8 text-white" />
        <span className="absolute left-2 top-2 rounded-[4px] bg-[#0058be] px-1.5 py-0.5 text-[10px] font-bold text-white">
          Interaktif
        </span>
      </div>
    );
  }

  return (
    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-[8px] border border-[#c5c6cd] bg-[#f1f5f9]">
      <FileTextIcon className="size-8 text-[#dc2626]" />
    </div>
  );
}

function MediaRecommendationGallery() {
  return (
    <Card className="rounded-[12px] xl:col-span-8">
      <CardContent className="space-y-6 p-[25px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#091426]">
            <GalleryIcon className="size-5 text-[#1b1b1d]" />
            <h2 className="text-xl font-semibold">Media Recommendation Gallery</h2>
          </div>
          <button className="text-base text-[#0058be]" type="button">
            Lihat Semua
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {mediaItems.map((item) => (
            <div key={item.title}>
              <MediaThumbnail item={item} />
              <p className="mt-2 text-base leading-6 text-[#1b1b1d]">{item.title}</p>
              <p className="text-[10px] text-[#45474c]">{item.meta}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ParentSummaryPreview() {
  return (
    <div className="relative overflow-hidden rounded-[12px] bg-[#0058be] p-6 text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] xl:col-span-4">
      <div className="absolute -right-12 -top-12 size-32 rounded-full bg-white/10 blur-[20px]" />
      <div className="absolute -bottom-12 -left-12 size-48 rounded-full bg-white/20 blur-[32px]" />
      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparkIcon className="size-5" />
            <h2 className="text-xl font-semibold leading-7">
              Parent Summary
              <br />
              Preview
            </h2>
          </div>
          <span className="inline-flex h-5 w-8 items-center rounded-full bg-white/20 p-0.5">
            <span className="ml-auto size-4 rounded-full bg-white" />
          </span>
        </div>
        <div className="space-y-2 rounded-[12px] border border-white/20 bg-white/10 p-[17px] backdrop-blur-[2px]">
          <div className="flex items-center gap-2">
            <span className="grid size-6 shrink-0 place-items-center rounded-full border border-white/40 bg-white/20 text-[10px] font-bold">
              AP
            </span>
            <p className="text-base text-white/80">Laporan untuk Orang Tua Alya</p>
          </div>
          <p className="text-base italic leading-[26px]">
            “Halo Bapak/Ibu, Alya mengalami peningkatan pada kompetensi{" "}
            <span className="font-bold underline decoration-white/40">operasi pecahan</span>
            . Meskipun skor kuisnya 65, Alya sudah memahami konsep dasar dan kini akan
            difokuskan pada latihan soal terpandu untuk mengasah ketelitiannya. Mari kita
            dukung Alya bersama!”
          </p>
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center">
            {["BS", "SA", "RW"].map((label, index) => (
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-full border-2 border-[#0058be] bg-white/20 text-[10px] font-bold",
                  index > 0 && "-ml-2",
                )}
                key={label}
              >
                {label}
              </span>
            ))}
            <span className="-ml-2 grid size-8 place-items-center rounded-full border-2 border-[#0058be] bg-white/20 text-[10px] font-bold">
              +18
            </span>
          </div>
          <Button size="sm" variant="secondary">
            <SendIcon className="size-4" />
            Kirim ke Semua
          </Button>
        </div>
      </div>
    </div>
  );
}

export function RemedialPage() {
  return (
    <div className="space-y-8 px-5 py-6 sm:px-6 lg:px-10 lg:py-10">
      <PageIntro />

      <section className="grid gap-6 xl:grid-cols-12">
        <StrugglingGroupCard />
        <PracticeGroupCard />
        <EnrichmentGroupCard />
      </section>

      <section className="grid gap-6 xl:grid-cols-12">
        <MediaRecommendationGallery />
        <ParentSummaryPreview />
      </section>
    </div>
  );
}
