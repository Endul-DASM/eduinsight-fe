import type { SVGProps } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { LifeBuoyIcon, SparkIcon } from "@/components/ui/icons";

function CheckDoubleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="m3 12.5 3.5 3.5L13 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="m11 12.5 3.5 3.5L21 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M12 3.5 18 6v5.6c0 4-2.34 6.85-6 8.9-3.66-2.05-6-4.9-6-8.9V6l6-2.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="m9.5 12 1.75 1.75L14.5 10.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function AlertIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M12 4.5 20 18H4l8-13.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M12 9v4.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="m9 5 7 7-7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function InfoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 11v5.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <circle cx="12" cy="8" r="1" fill="currentColor" />
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

function ClipboardCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <rect x="6" y="5" width="12" height="15" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 5.5h6v-1a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 9 4.5v1Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="m9.3 13 1.8 1.8L14.7 11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function AlertCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.5v6" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <circle cx="12" cy="16.7" r="1.1" fill="currentColor" />
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

function PlayCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10.3 9.2v5.6l4.6-2.8-4.6-2.8Z" fill="currentColor" />
    </svg>
  );
}

const statCards = [
  {
    label: "Asesmen Selesai",
    value: "12",
    icon: CheckDoubleIcon,
    iconTone: "bg-[#d8e2ff] text-[#0058be]",
  },
  {
    label: "Kompetensi Dikuasai",
    value: "8",
    icon: ShieldIcon,
    iconTone: "bg-[#fadfb8] text-[#8a6b38]",
  },
  {
    label: "Remedial Aktif",
    value: "2",
    icon: AlertIcon,
    iconTone: "bg-[#ffdad6] text-[#ba1a1a]",
  },
];

const progressItems = [
  {
    tag: "BILANGAN",
    tagTone: "bg-[#d8e2ff] text-[#001a42]",
    title: "Pecahan & Desimal",
    value: 78,
    valueTone: "text-[#0058be]",
    barTone: "bg-[#0058be]",
  },
  {
    tag: "GEOMETRI",
    tagTone: "bg-[#fadfb8] text-[#271902]",
    title: "Bangun Ruang Dasar",
    value: 92,
    valueTone: "text-[#0058be]",
    barTone: "bg-[#0058be]",
  },
  {
    tag: "ALJABAR",
    tagTone: "bg-[#e4e2e3] text-[#45474c]",
    title: "Pola Bilangan Sederhana",
    value: 45,
    valueTone: "text-[#45474c]",
    barTone: "bg-[#0058be]/50",
  },
];

const activities = [
  {
    title: "Latihan Mandiri: Pecahan Senilai",
    time: "Kemarin, 15:30",
    icon: PencilIcon,
    iconTone: "bg-[#d8e2ff] text-[#0058be]",
    status: { label: "Hasil Offline Diproses", tone: "bg-[#d8e2ff] text-[#001a42]", info: true },
    score: "--/--",
    scoreTone: "text-[#0058be]",
    action: { label: "Lihat Diagnosis", icon: FileTextIcon, disabled: true },
  },
  {
    title: "Asesmen Mingguan: Geometri Dasar",
    time: "2 Hari yang lalu",
    icon: ClipboardCheckIcon,
    iconTone: "bg-[#fadfb8] text-[#8a6b38]",
    status: { label: "Lulus", tone: "bg-[#dcfce7] text-[#15803d]" },
    score: "92/100",
    scoreTone: "text-[#0058be]",
    action: { label: "Lihat Diagnosis", icon: FileTextIcon },
  },
  {
    title: "Pre-test: Operasi Pembagian",
    time: "3 Hari yang lalu",
    icon: AlertCircleIcon,
    iconTone: "bg-[#ffdad6] text-[#ba1a1a]",
    status: { label: "Perlu Remedial", tone: "bg-[#ffedd5] text-[#c2410c]" },
    score: "45/100",
    scoreTone: "text-[#ba1a1a]",
    action: { label: "Mulai Remedial", icon: LifeBuoyIcon },
  },
];

function HeroHeader() {
  return (
    <section className="rounded-[24px] bg-[#091426] p-8">
      <h1 className="text-[clamp(1.75rem,4vw,3rem)] font-bold leading-tight tracking-[-0.02em] text-white">
        Halo, Alya! Siap untuk belajar hari ini?
      </h1>
      <p className="mt-2 max-w-[42rem] text-base leading-6 text-[#8590a6]">
        Kamu sudah berada di 15% teratas dalam progres Matematika minggu ini. Lanjutkan
        semangatmu untuk menguasai Operasi Pecahan!
      </p>
    </section>
  );
}

function StatCard({ label, value, icon: Icon, iconTone }: (typeof statCards)[number]) {
  return (
    <Card className="flex-1 rounded-[16px]">
      <CardContent className="flex items-center gap-6 p-[25px]">
        <div className={cn("grid size-14 shrink-0 place-items-center rounded-[12px]", iconTone)}>
          <Icon className="size-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#45474c]">
            {label}
          </p>
          <p className="text-[40px] font-bold leading-tight tracking-[-0.02em] text-[#1b1b1d]">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function LearningProgressCard() {
  return (
    <Card className="rounded-[16px] xl:col-span-8">
      <CardContent className="space-y-8 p-[25px]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#1b1b1d]">Level Penguasaan Materi</h2>
          <button className="text-xs font-semibold text-[#0058be]" type="button">
            Lihat Detail
          </button>
        </div>
        <div className="space-y-6">
          {progressItems.map((item) => (
            <div key={item.title}>
              <div className="mb-2 flex items-end justify-between">
                <div className="space-y-1">
                  <span
                    className={cn(
                      "inline-flex rounded-[4px] px-1.5 py-0.5 text-[10px] font-bold uppercase",
                      item.tagTone,
                    )}
                  >
                    {item.tag}
                  </span>
                  <p className="text-base font-bold text-[#1b1b1d]">{item.title}</p>
                </div>
                <span className={cn("text-sm font-bold", item.valueTone)}>{item.value}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#e4e2e3]">
                <div
                  className={cn("h-2 rounded-full", item.barTone)}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AiRecommendationCard() {
  return (
    <div className="relative overflow-hidden rounded-[16px] bg-[#1e293b] p-6 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] xl:col-span-4">
      <div className="absolute -right-16 -top-16 size-32 rounded-full bg-[#0058be] opacity-20 blur-[32px]" />
      <div className="relative space-y-4">
        <div className="flex items-center gap-2">
          <SparkIcon className="size-5 text-white" />
          <h2 className="text-xl font-semibold text-white">Rekomendasi AI</h2>
        </div>
        <p className="text-sm leading-5 text-[#8590a6]">
          Berdasarkan asesmen terakhir, yuk perkuat materi ini:
        </p>
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
          <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-[#334155] to-[#0f172a]">
            <PlayCircleIcon className="size-9 text-white" />
          </div>
          <div className="space-y-1 p-4">
            <p className="text-base font-bold text-white">
              Video: Trik Cepat Perkalian Pecahan
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#adc6ff]">
              7 Menit • Matematika
            </p>
          </div>
        </div>
        <button
          className="w-full rounded-xl bg-[#0058be] px-6 py-4 text-xs font-bold uppercase tracking-[0.05em] text-white"
          type="button"
        >
          Mulai Belajar Sekarang
        </button>
      </div>
    </div>
  );
}

function ActivityRow({ activity }: { activity: (typeof activities)[number] }) {
  const Icon = activity.icon;
  const ActionIcon = activity.action.icon;

  return (
    <div className="flex flex-col gap-4 border-t border-[#c5c6cd] p-6 first:border-t-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className={cn("grid size-12 shrink-0 place-items-center rounded-full", activity.iconTone)}>
          <Icon className="size-5" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-bold text-[#1b1b1d]">{activity.title}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-[#45474c]">{activity.time}</span>
            <span className="size-1 rounded-full bg-[#c5c6cd]" />
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                activity.status.tone,
              )}
            >
              {activity.status.label}
              {activity.status.info ? <InfoIcon className="size-3" /> : null}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 sm:pl-6">
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase text-[#45474c]">Skor</p>
          <p className={cn("text-xl font-bold", activity.scoreTone)}>{activity.score}</p>
        </div>
        <button
          className={cn(
            "flex items-center gap-2 rounded-xl border border-[#0058be] px-5 py-3 text-xs font-bold uppercase tracking-[0.05em] text-[#0058be]",
            activity.action.disabled && "opacity-50",
          )}
          disabled={activity.action.disabled}
          type="button"
        >
          <ActionIcon className="size-4" />
          {activity.action.label}
        </button>
      </div>
    </div>
  );
}

function RecentActivityCard() {
  return (
    <Card className="overflow-hidden rounded-[16px] p-0">
      <div className="flex items-center justify-between border-b border-[#c5c6cd] px-6 py-5">
        <h2 className="text-xl font-semibold text-[#1b1b1d]">Aktivitas Terbaru</h2>
        <button className="flex items-center gap-1 text-xs font-semibold text-[#45474c]" type="button">
          Lihat Semua History
          <ChevronRightIcon className="size-3" />
        </button>
      </div>
      <div>
        {activities.map((activity) => (
          <ActivityRow activity={activity} key={activity.title} />
        ))}
      </div>
    </Card>
  );
}

export function StudentDashboardPage() {
  return (
    <div className="space-y-8 px-5 py-6 sm:px-6 lg:px-10 lg:py-10">
      <HeroHeader />

      <section className="flex flex-col gap-4 sm:flex-row">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-12">
        <LearningProgressCard />
        <AiRecommendationCard />
      </section>

      <RecentActivityCard />
    </div>
  );
}
