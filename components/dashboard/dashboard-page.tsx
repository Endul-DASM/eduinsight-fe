import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarIcon,
  ClockIcon,
  DownloadIcon,
  EllipsisIcon,
  GridIcon,
  RadarIcon,
  SettingsIcon,
  SparkIcon,
  UserPlusIcon,
  WarningIcon,
} from "@/components/ui/icons";

const statCards = [
  {
    title: "Rata-Rata Nilai",
    value: "78",
    note: "Meningkat dari pekan lalu",
    icon: GridIcon,
    accent: "text-[#2170e4]",
    badge: { label: "+2.4%", variant: "positive" as const },
  },
  {
    title: "Siswa Butuh Remedial",
    value: "12",
    note: "Perlu intervensi segera",
    icon: WarningIcon,
    accent: "text-[#ef4444]",
    badge:
     { label: "Penting", variant: "danger" as const },
  },
  {
    title: "Top Miskonsepsi",
    value: "Konsep Pecahan",
    note: "65% siswa mengalami kendala",
    icon: RadarIcon,
    accent: "text-[#9a7b51]",
    progress: 65,
  },
  {
    title: "Kualitas Soal",
    value: "Baik",
    note: "Berdasarkan validitas butir",
    icon: SettingsIcon,
    accent: "text-[#0058be]",
    toggle: true,
  },
];

const matrixColumns = [
  "Paham",
  "Paham Sebagian",
  "Miskonsepsi",
  "Tidak Paham",
];

const matrixRows = [
  { topic: "Bilangan", values: [18, 10, 4, 2] },
  { topic: "Aljabar", values: [12, 15, 5, 3] },
  { topic: "Geometri", values: [5, 8, 16, 6] },
  { topic: "Statistika", values: [22, 7, 3, 1] },
];

const matrixCellClasses = [
  "bg-[#4fd07d] text-white",
  "bg-[#b5edc6] text-[#091426]",
  "bg-[#ffe9c6] text-[#091426]",
  "bg-[#f8dada] text-[#091426]",
];

const matrixLegend = [
  { label: "Optimal", color: "bg-[#22c55e]" },
  { label: "Perlu Perhatian", color: "bg-[#fb923c]" },
  { label: "Kritis", color: "bg-[#f87171]" },
];

const activities = [
  {
    title: "Asesmen Formatif: Aljabar Linear Selesai",
    description: "32 siswa telah mengumpulkan jawaban mereka.",
    time: "15 MENIT YANG LALU",
    icon: SparkIcon,
    tone: "bg-[rgba(33,112,228,0.12)] text-[#2170e4]",
  },
  {
    title: "Laporan Mingguan Dihasilkan",
    description: "Analisis trend kompetensi 8A siap diunduh.",
    time: "2 JAM YANG LALU",
    icon: ClockIcon,
    tone: "bg-[#1e293b] text-white",
  },
  {
    title: "Anomali Terdeteksi: Geometri",
    description: "Penurunan rata-rata nilai sebesar 12% pada sub-topik Sudut.",
    time: "4 JAM YANG LALU",
    icon: WarningIcon,
    tone: "bg-[rgba(248,113,113,0.16)] text-[#ef4444]",
  },
  {
    title: "Profil Baru Siswa Ditambahkan",
    description: "Siswa mutasi (Rina Kartika) telah masuk ke basis data 8A.",
    time: "KEMARIN",
    icon: UserPlusIcon,
    tone: "bg-[rgba(33,112,228,0.16)] text-[#2170e4]",
  },
];

function MetricCard({
  icon: Icon,
  title,
  value,
  note,
  accent,
  badge,
  progress,
  toggle,
}: (typeof statCards)[number]) {
  return (
    <Card className="min-h-[164px] rounded-[14px]">
      <CardContent className="flex h-full flex-col gap-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className={`flex size-8 items-center justify-center rounded-[10px] bg-[#f5f3f4] ${accent}`}>
            <Icon className="size-[18px]" />
          </div>
          {badge ? <Badge variant={badge.variant}>{badge.label}</Badge> : null}
          {toggle ? (
            <div className="mt-1 flex items-center gap-1">
              <span className="size-4 rounded-full bg-[#22c55e]" />
              <span className="size-4 rounded-full bg-[#86efac]" />
            </div>
          ) : null}
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#45474c]">
            {title}
          </p>
          <p
            className={
              progress
                ? "text-[30px] font-semibold leading-tight tracking-[-0.03em] text-[#091426]"
                : "text-[42px] font-semibold leading-none tracking-[-0.04em] text-[#091426]"
            }
          >
            {value}
          </p>
        </div>
        {progress ? (
          <div className="space-y-2">
            <div className="h-2 rounded-full bg-[#ebedf0]">
              <div
                className="h-2 rounded-full bg-[#2170e4]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-[#75777d]">{note}</p>
          </div>
        ) : (
          <p className="max-w-[16rem] text-sm leading-5 text-[#5c6470]">{note}</p>
        )}
      </CardContent>
    </Card>
  );
}

function CompetencyMatrix() {
  return (
    <Card className="lg:col-span-7">
      <CardHeader>
        <div className="flex items-center gap-2 text-[#1b1b1d]">
          <GridIcon className="size-[18px] text-[#2170e4]" />
          <h2 className="text-[20px] font-semibold">Diagnosis Cepat Kompetensi</h2>
        </div>
        <button className="text-xs font-semibold text-[#2170e4]" type="button">
          Lihat Detail
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table className="border-separate border-spacing-x-1 border-spacing-y-2">
          <TableHead>
            <TableRow>
              <TableHeaderCell className="w-28 text-left text-[#75777d]" />
              {matrixColumns.map((column) => (
                <TableHeaderCell key={column}>{column}</TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {matrixRows.map((row) => (
              <TableRow key={row.topic}>
                <TableCell className="pr-3 text-left text-xs font-semibold text-[#1b1b1d]">
                  {row.topic}
                </TableCell>
                {row.values.map((value, index) => (
                  <TableCell key={`${row.topic}-${matrixColumns[index]}`}>
                    <div
                      className={`grid h-16 min-w-[78px] place-items-center rounded-[6px] text-base font-bold ${matrixCellClasses[index]}`}
                    >
                      {value}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex flex-wrap items-center justify-center gap-6 pt-1">
          {matrixLegend.map((item) => (
            <div className="flex items-center gap-2" key={item.label}>
              <span className={`size-3 rounded-full ${item.color}`} />
              <span className="text-[10px] font-semibold uppercase text-[#45474c]">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityFeed() {
  return (
    <Card className="overflow-hidden lg:col-span-5">
      <CardHeader>
        <div className="flex items-center gap-2 text-[#1b1b1d]">
          <ClockIcon className="size-[18px] text-[#2170e4]" />
          <h2 className="text-[20px] font-semibold">Aktivitas Terbaru</h2>
        </div>
        <button className="rounded-[4px] p-1 text-[#45474c]" type="button">
          <EllipsisIcon className="size-4" />
        </button>
      </CardHeader>
      <CardContent className="space-y-5 px-6 py-6">
        {activities.map((activity, index) => {
          const Icon = activity.icon;

          return (
            <div className="flex gap-4" key={activity.title}>
              <div className="flex flex-col items-center">
                <div className={`grid size-8 place-items-center rounded-full ${activity.tone}`}>
                  <Icon className="size-4" />
                </div>
                {index < activities.length - 1 ? (
                  <span className="mt-1 h-full w-px bg-[#d5d7dc]" />
                ) : null}
              </div>
              <div className="pb-2">
                <p className="text-xs font-semibold tracking-[0.04em] text-[#091426]">
                  {activity.title}
                </p>
                <p className="max-w-sm text-sm leading-6 text-[#45474c]">
                  {activity.description}
                </p>
                <p className="pt-1 text-[10px] font-bold uppercase text-[#75777d]">
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
      <div className="border-t border-[#ebecef] bg-[#f5f3f4] px-4 py-4 text-center">
        <button className="text-xs font-semibold tracking-[0.04em] text-[#45474c]" type="button">
          Tampilkan Semua Aktivitas
        </button>
      </div>
    </Card>
  );
}

function RecommendationBanner() {
  return (
    <section className="relative overflow-hidden rounded-[20px] bg-[#2170e4] px-6 py-8 text-white shadow-[0_20px_45px_-24px_rgba(33,112,228,0.55)] sm:px-8 lg:flex lg:items-center lg:justify-between">
      <div className="absolute -left-10 -top-10 size-48 rounded-full bg-white/5 blur-[20px]" />
      <div className="absolute -bottom-10 -right-10 size-64 rounded-full bg-white/5 blur-[32px]" />
      <div className="relative max-w-[38rem]">
        <Badge className="mb-4 bg-white/15 text-white" variant="info">
          Rekomendasi AI
        </Badge>
        <h2 className="text-[clamp(2rem,4vw,2.3rem)] font-semibold leading-tight tracking-[-0.03em]">
          Butuh materi remedial Pecahan?
        </h2>
        <p className="mt-3 text-base leading-7 text-white/80">
          Kami telah menyiapkan modul intervensi khusus untuk 12 siswa Anda berdasarkan miskonsepsi yang terdeteksi.
        </p>
      </div>
      <div className="relative mt-6 flex flex-wrap gap-3 lg:mt-0">
        <Button className="min-w-32" variant="secondary">
          Lihat Modul
        </Button>
        <Button
          className="min-w-28 border-white/40 bg-transparent text-white hover:bg-white/10"
          variant="outline"
        >
          Abaikan
        </Button>
      </div>
    </section>
  );
}

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-white text-[#091426]">
      <div className="md:flex">
        <AppSidebar />
        <main className="min-w-0 flex-1">
          <TopHeader />
          <div className="space-y-8 px-5 py-6 sm:px-6 lg:px-10 lg:py-10">
            <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-[clamp(2rem,5vw,3rem)] font-semibold tracking-[-0.04em] text-[#091426]">
                  Selamat pagi, Bu Mayla!
                </h1>
                <p className="mt-2 text-base text-[#45474c]">
                  Analisis terbaru untuk Kelas 9 sudah siap untuk Anda tinjau hari ini.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" variant="outline">
                  <CalendarIcon className="size-4" />
                  Mei 2024
                </Button>
                <Button size="sm">
                  <DownloadIcon className="size-4" />
                  Ekspor Laporan
                </Button>
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-4">
              {statCards.map((card) => (
                <MetricCard key={card.title} {...card} />
              ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-12">
              <CompetencyMatrix />
              <ActivityFeed />
            </section>

            <RecommendationBanner />
          </div>
        </main>
      </div>
    </div>
  );
}
