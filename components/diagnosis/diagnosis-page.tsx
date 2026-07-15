import type { SVGProps } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import {
  GridIcon,
} from "@/components/ui/icons";

function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="m12 4 2.2 4.45 4.9.71-3.55 3.46.84 4.88L12 15.8 7.6 17.5l.84-4.88L4.9 9.16l4.9-.71L12 4Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CheckBadgeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <rect x="5" y="4" width="14" height="16" rx="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m9.5 12 2 2 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function TargetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 4v3M20 12h-3M12 20v-3M4 12h3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
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

function FilterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function MessageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M6 17.5 4.5 20V6.5A2.5 2.5 0 0 1 7 4h10A2.5 2.5 0 0 1 19.5 6.5v8A2.5 2.5 0 0 1 17 17H6Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M8 9.5h8M8 13h5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

const statCards = [
  {
    title: "Rata-Rata Nilai",
    value: "84.2",
    note: "Sangat Baik (B+)",
    badge: { label: "+2.4%", variant: "info" as const, className: "bg-[#eef5ff] text-[#2170e4]" },
    icon: StarIcon,
    iconTone: "bg-[#eef5ff] text-[#2170e4]",
  },
  {
    title: "Tingkat Ketuntasan",
    value: "88%",
    note: "Stabil",
    badge: { label: "Stable", variant: "neutral" as const },
    icon: CheckBadgeIcon,
    iconTone: "bg-[#fff7e8] text-[#8a6b38]",
    progress: 88,
  },
  {
    title: "Miskonsepsi",
    value: "3 Pola",
    note: "Perlu Intervensi Segera",
    badge: { label: "-15%", variant: "danger" as const, className: "bg-[#fef2f2] text-[#ef4444]" },
    icon: TargetIcon,
    iconTone: "bg-[#fff1f2] text-[#ef4444]",
  },
  {
    title: "Reliabilitas Soal",
    value: "0.89",
    note: "Instrumen Valid & Reliabel",
    badge: { label: "High", variant: "info" as const, className: "bg-[#eef5ff] text-[#2170e4]" },
    icon: ShieldIcon,
    iconTone: "bg-[#eef2ff] text-[#4f46e5]",
  },
];

const competencyBars = [
  { label: "Bilangan", value: 100, tone: "bg-[#22c55e]", textTone: "text-[#22c55e]" },
  { label: "Aljabar", value: 60, tone: "bg-[#facc15]", textTone: "text-[#eab308]" },
  { label: "Geometri", value: 80, tone: "bg-[#2170e4]", textTone: "text-[#2170e4]" },
  { label: "Statistika", value: 30, tone: "bg-[#dc2626]", textTone: "text-[#dc2626]" },
];

const studentMatrix = [
  {
    name: "Ahmad Andi",
    initials: "AA",
    tone: "bg-[#e5ecff] text-[#5b6a8a]",
    values: ["green", "green", "yellow", "green"] as const,
  },
  {
    name: "Bella Siska",
    initials: "BS",
    tone: "bg-[#e9eef9] text-[#667492]",
    values: ["red", "yellow", "green", "yellow"] as const,
  },
  {
    name: "Cahyo Putra",
    initials: "CP",
    tone: "bg-[#fff1dc] text-[#8d6a3d]",
    values: ["green", "green", "green", "green"] as const,
  },
  {
    name: "Dina Maria",
    initials: "DM",
    tone: "bg-[#edf2f8] text-[#6d788a]",
    values: ["yellow", "red", "red", "yellow"] as const,
  },
];

const cellToneMap = {
  green: "bg-[#4fd07d]",
  yellow: "bg-[#ffd037]",
  red: "bg-[#cb3838]",
} as const;

const heatmapRows = [
  { name: "Aditya Pratama", values: [92, 85, 60, 98, 82] },
  { name: "Bunga Citra", values: [54, 65, 42, 70, 58] },
  { name: "Dimas Anggara", values: [100, 94, 98, 100, 92] },
  { name: "Eka Kurniawan", values: [78, 81, 79, 88, 84] },
];

const scoreBands = [
  { label: "< 60", count: "2 Siswa (8%)", display: "2", bar: "h-[66px] bg-[rgba(186,26,26,0.2)] border-t-2 border-[#ba1a1a]", text: "text-[#ba1a1a]" },
  { label: "60-75", count: "5 Siswa (20%)", display: "5", bar: "h-[85px] bg-[rgba(250,223,184,0.4)] border-t-2 border-[#564427]", text: "text-[#564427]" },
  { label: "75-90", count: "12 Siswa (48%)", display: "12", bar: "h-[120px] bg-[rgba(0,88,190,0.16)] border-t-2 border-[#0058be]", text: "text-[#0058be]" },
  { label: "90+", count: "8 Siswa (32%)", display: "8", bar: "h-[47px] bg-[rgba(9,20,38,0.2)] border-t-2 border-[#091426]", text: "text-[#091426]" },
];

function PageIntro() {
  return (
    <section className="space-y-1">
      <h1 className="text-[clamp(2rem,5vw,2.5rem)] font-semibold tracking-[-0.04em] text-[#091426]">
        Diagnosis Pembelajaran
      </h1>
      <p className="text-sm text-[#5c6470]">
        Analisis mendalam performa siswa pada modul Matematika - Pecahan
      </p>
    </section>
  );
}

function FilterPanel() {
  return (
    <Card className="rounded-[14px] shadow-none">
      <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          <FilterField label="Kelas" value="X - MIPA 1" />
          <FilterField label="Mata Pelajaran" value="Matematika - Pecahan" />
          <FilterField label="Semester" value="Ganjil 2023" />
        </div>
        <div className="flex items-center justify-end gap-4">
          <button className="text-xs font-semibold text-[#2170e4]" type="button">
            Reset
          </button>
          <Button size="md">
            <FilterIcon className="size-4" />
            Terapkan Filter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.06em] text-[#75777d]">
        {label}
      </label>
      <div className="flex h-10 items-center justify-between rounded-[10px] border border-[#c5c6cd] bg-white px-3 text-sm text-[#45474c]">
        <span className="truncate">{value}</span>
        <span className="ml-2 text-[#8f96a3]">⌄</span>
      </div>
    </div>
  );
}

function DiagnosisStatCard({
  title,
  value,
  note,
  badge,
  icon: Icon,
  iconTone,
  progress,
}: (typeof statCards)[number]) {
  return (
    <Card className="rounded-[14px]">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className={cn("grid size-8 place-items-center rounded-[10px]", iconTone)}>
            <Icon className="size-[18px]" />
          </div>
          <Badge className={badge.className} variant={badge.variant}>
            {badge.label}
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#45474c]">
            {title}
          </p>
          <p className="text-[40px] font-semibold leading-none tracking-[-0.04em] text-[#091426]">
            {value}
          </p>
          <p className="text-sm text-[#5c6470]">{note}</p>
        </div>
        {progress ? (
          <div className="h-2 rounded-full bg-[#ebedf0]">
            <div
              className="h-2 rounded-full bg-[#0058be]"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function CompetencyOverview() {
  return (
    <Card className="rounded-[14px]">
      <CardHeader className="border-b-0 pb-2">
        <div className="flex items-center gap-2 text-[#1b1b1d]">
          <GridIcon className="size-[18px] text-[#2170e4]" />
          <h2 className="text-[20px] font-semibold">Visualisasi Kompetensi Kelas</h2>
        </div>
        <p className="text-xs text-[#75777d]">Rata-rata Penguasaan Materi</p>
      </CardHeader>
      <CardContent className="space-y-5 pt-1">
        <div className="grid gap-4 lg:grid-cols-4">
          {competencyBars.map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-semibold text-[#45474c]">{item.label}</span>
                <span className={cn("font-semibold", item.textTone)}>{item.value}%</span>
              </div>
              <div className="h-[6px] rounded-full bg-[#edf1f6]">
                <div className={cn("h-[6px] rounded-full", item.tone)} style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-[#5c6470]">
          <span className="mr-1 text-[#ef4444]">△</span>
          Perhatian khusus diperlukan untuk materi <span className="text-[#dc2626]">Statistika</span> dan <span className="text-[#f59e0b]">Aljabar</span>.
        </p>
      </CardContent>
    </Card>
  );
}

function StudentCompetencyMatrix() {
  return (
    <Card className="rounded-[14px] lg:col-span-8">
      <CardHeader className="border-b-0 pb-4">
        <div className="flex items-center gap-2 text-[#1b1b1d]">
          <GridIcon className="size-[18px] text-[#2170e4]" />
          <h2 className="text-[20px] font-semibold">Matriks Kompetensi Siswa</h2>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-semibold uppercase text-[#75777d]">
          <LegendDot color="bg-[#4fd07d]" label="Paham" />
          <LegendDot color="bg-[#ffd037]" label="Parsial" />
          <LegendDot color="bg-[#cb3838]" label="Miskonsepsi" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <div className="min-w-[540px]">
            <div className="grid grid-cols-[1.7fr_repeat(4,1fr)] gap-4 border-b border-[#e7eaef] px-2 py-3 text-xs text-[#75777d]">
              <span>Nama Siswa</span>
              <span>Bilangan</span>
              <span>Aljabar</span>
              <span>Geometri</span>
              <span>Statistika</span>
            </div>
            {studentMatrix.map((student) => (
              <div
                className="grid grid-cols-[1.7fr_repeat(4,1fr)] items-center gap-4 border-b border-[#eef2f6] px-2 py-4 last:border-b-0"
                key={student.name}
              >
                <div className="flex items-center gap-3">
                  <span className={cn("grid size-6 place-items-center rounded-full text-[8px] font-bold", student.tone)}>
                    {student.initials}
                  </span>
                  <span className="text-sm font-medium text-[#1b1b1d]">{student.name}</span>
                </div>
                {student.values.map((value, index) => (
                  <span
                    className={cn("block h-5 rounded-[4px]", cellToneMap[value])}
                    key={`${student.name}-${index}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-2 rounded-full", color)} />
      {label}
    </span>
  );
}

function MainMisconceptionCard() {
  return (
    <Card className="rounded-[14px] lg:col-span-4">
      <CardContent className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-1 grid size-5 place-items-center rounded-full bg-[#cb3838] text-white">
              <span className="text-[11px] font-bold">!</span>
            </div>
            <div>
              <h2 className="text-[20px] font-semibold leading-7 text-[#cb3838]">
                Miskonsepsi
                <br />
                Utama
              </h2>
            </div>
          </div>
          <Badge className="bg-[#eef5ff] text-[#2170e4]" variant="info">
            Berdasarkan Analisis Pola Jawaban
          </Badge>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#091426]">
            Pertanyaan #8: Penjumlahan Pecahan
          </p>
          <p className="text-sm leading-6 text-[#5c6470]">
            <span className="font-semibold text-[#ef4444]">32 Siswa</span> gagal karena tidak menyamakan penyebut.
          </p>
        </div>
        <div className="rounded-[8px] border border-[#f3d3d3] bg-[#fff7f7] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#75777d]">
            Akar Masalah (AI Insight)
          </p>
          <p className="mt-2 text-sm italic leading-6 text-[#5c6470]">
            “Siswa menganggap pembilang dan penyebut sebagai angka terpisah yang dijumlahkan secara independen.”
          </p>
        </div>
        <button className="text-sm font-semibold text-[#2170e4]" type="button">
          Lihat daftar siswa terlibat →
        </button>
      </CardContent>
    </Card>
  );
}

function HeatmapCard() {
  return (
    <Card className="rounded-[14px] lg:col-span-8">
      <CardHeader>
        <h2 className="text-[20px] font-semibold text-[#1b1b1d]">
          Heatmap Penguasaan Kompetensi (CP)
        </h2>
        <div className="flex items-center gap-4 text-[10px] font-semibold uppercase text-[#75777d]">
          <LegendDot color="bg-[#dbeafe]" label="Rendah" />
          <LegendDot color="bg-[#0b63ce]" label="Tinggi" />
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-[1.6fr_repeat(5,1fr)] gap-1 px-4 py-3 text-[10px] text-[#75777d]">
              <span>Nama Siswa</span>
              <span>CP.1</span>
              <span>CP.2</span>
              <span>CP.3</span>
              <span>CP.4</span>
              <span>CP.5</span>
            </div>
            {heatmapRows.map((row) => (
              <div
                className="grid grid-cols-[1.6fr_repeat(5,1fr)] items-center gap-1 border-t border-[#edf1f6] px-4 py-3"
                key={row.name}
              >
                <span className="text-sm font-medium text-[#1b1b1d]">{row.name}</span>
                {row.values.map((value, index) => (
                  <span
                    className={cn(
                      "grid h-8 place-items-center rounded-[4px] text-xs font-bold",
                      value >= 90
                        ? "bg-[#2170e4] text-white"
                        : value >= 75
                          ? "bg-[#4a88d8] text-white"
                          : value >= 60
                            ? "bg-[#93bbea] text-white"
                            : "bg-[#b6d2ef] text-[#7b8798]",
                    )}
                    key={`${row.name}-${index}`}
                  >
                    {value}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreDistributionCard() {
  return (
    <Card className="rounded-[14px] lg:col-span-4">
      <CardHeader className="border-b-0">
        <h2 className="text-[20px] font-semibold text-[#1b1b1d]">Distribusi Nilai Kelas</h2>
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        <div className="flex min-h-[224px] items-end justify-between gap-5 px-2 pt-6">
          {scoreBands.map((band) => (
            <div className="flex w-full flex-col items-center gap-2 text-center" key={band.label}>
              <div className="group relative flex h-[128px] items-end">
                <div className={cn("relative w-[52px] rounded-t-[4px]", band.bar)}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-[4px] bg-[#303032] px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {band.count}
                  </div>
                </div>
              </div>
              <span className={cn("text-[10px] font-bold", band.text)}>{band.label}</span>
            </div>
          ))}
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[#5c6470]">Modus (Paling Sering)</span>
            <span className="font-bold text-[#2170e4]">82.5</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#5c6470]">Standar Deviasi</span>
            <span className="font-bold text-[#1b1b1d]">6.12</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DiagnosisFloatingAction() {
  return (
    <div className="fixed bottom-8 right-6 z-20">
      <button
        className="group relative grid size-14 place-items-center rounded-full bg-[#0058be] text-white shadow-[0_10px_20px_rgba(15,23,42,0.16)] transition-transform hover:scale-[1.03]"
        type="button"
      >
        <MessageIcon className="size-6" />
        <span className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 rounded-[8px] bg-[#1e293b] px-3 py-1.5 text-sm whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
          Tanya AI EduInsight
        </span>
      </button>
    </div>
  );
}

export function DiagnosisPage() {
  return (
    <div className="min-h-screen bg-white text-[#091426]">
      <div className="md:flex">
        <main className="min-w-0 flex-1">
          <div className="space-y-8 px-5 py-6 sm:px-6 lg:px-10 lg:py-10">
            <PageIntro />
            <FilterPanel />

            <section className="grid gap-4 xl:grid-cols-4">
              {statCards.map((card) => (
                <DiagnosisStatCard key={card.title} {...card} />
              ))}
            </section>

            <CompetencyOverview />

            <section className="grid gap-4 xl:grid-cols-12">
              <StudentCompetencyMatrix />
              <MainMisconceptionCard />
            </section>

            <section className="grid gap-4 xl:grid-cols-12">
              <HeatmapCard />
              <ScoreDistributionCard />
            </section>
          </div>
        </main>
      </div>
      <DiagnosisFloatingAction />
    </div>
  );
}
