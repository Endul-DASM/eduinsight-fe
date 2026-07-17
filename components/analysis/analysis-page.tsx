import type { SVGProps } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import {
  ClipboardIcon,
  DownloadIcon,
  SparkIcon,
  WarningIcon,
} from "@/components/ui/icons";

function TargetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 4v3M20 12h-3M12 20v-3M4 12h3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function ShieldCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M12 3.5 18 6v5.6c0 4-2.34 6.85-6 8.9-3.66-2.05-6-4.9-6-8.9V6l6-2.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="m9.5 12 1.75 1.75L14.5 10.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function AlertTriangleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M12 4.5 20 18H4l8-13.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M12 9v4.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

function LightbulbIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M9 18.5h6M10 21h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M12 3.5a6 6 0 0 0-3.2 11.08c.5.33.7.9.7 1.42h5a1.7 1.7 0 0 1 .7-1.42A6 6 0 0 0 12 3.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
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

function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="m15 5-7 7 7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function FunnelIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function PrinterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M7 8.5V4h10v4.5" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
      <rect x="4.5" y="8.5" width="15" height="8" rx="1.6" stroke="currentColor" strokeWidth="1.7" />
      <path d="M7 14h10v5.5H7V14Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
}

const filterFields = [
  { label: "Kelas", value: "X - MIPA 1" },
  { label: "Mata Pelajaran", value: "Matematika" },
  { label: "Asesmen", value: "Sumatif Tengah Semester" },
];

const summaryCards = [
  {
    lines: ["Total Soal", "Dianalisis"],
    value: "25",
    unit: "Soal",
    valueTone: "text-[#091426]",
    icon: ClipboardIcon,
    iconTone: "bg-[#eef5ff] text-[#2170e4]",
  },
  {
    lines: ["Rata-rata Kesulitan"],
    value: "0.62",
    unit: "(Sedang)",
    valueTone: "text-[#091426]",
    icon: TargetIcon,
    iconTone: "bg-[#fff7e8] text-[#8a6b38]",
  },
  {
    lines: ["Soal Bermasalah"],
    value: "3",
    unit: "(Urgent)",
    valueTone: "text-[#ba1a1a]",
    unitTone: "text-[#93000a]",
    icon: WarningIcon,
    iconTone: "bg-[#fff1f2] text-[#ef4444]",
  },
  {
    lines: ["Reliabilitas", "Instrumen"],
    value: "0.89",
    unit: "(Valid)",
    valueTone: "text-[#091426]",
    unitTone: "text-[#16a34a]",
    icon: ShieldCheckIcon,
    iconTone: "bg-[#eef2ff] text-[#4f46e5]",
  },
];

type Difficulty = "Mudah" | "Sedang" | "Sulit";
type BarTone = "blue" | "gray" | "red";
type DotState = "good" | "bad" | "neutral";
type IndicatorFit = "sesuai" | "review";
type RowStatus = "baik" | "revisi" | "review";

type QuestionRow = {
  no: string;
  difficulty: Difficulty;
  pIndex: number;
  bars: { height: number; tone: BarTone }[];
  distractorDots: DotState[];
  indicatorFit: IndicatorFit;
  status: RowStatus;
  flagged?: "problem" | "ambiguous";
};

const questionRows: QuestionRow[] = [
  {
    no: "01",
    difficulty: "Mudah",
    pIndex: 0.82,
    bars: [
      { height: 100, tone: "blue" },
      { height: 12, tone: "gray" },
      { height: 6, tone: "gray" },
      { height: 4, tone: "gray" },
    ],
    distractorDots: ["good", "good", "good", "neutral"],
    indicatorFit: "sesuai",
    status: "baik",
  },
  {
    no: "05",
    difficulty: "Sedang",
    pIndex: 0.55,
    bars: [
      { height: 100, tone: "blue" },
      { height: 45, tone: "gray" },
      { height: 36, tone: "gray" },
    ],
    distractorDots: ["good", "good", "bad", "bad"],
    indicatorFit: "sesuai",
    status: "revisi",
    flagged: "problem",
  },
  {
    no: "12",
    difficulty: "Sulit",
    pIndex: 0.15,
    bars: [
      { height: 20, tone: "blue" },
      { height: 7, tone: "gray" },
      { height: 100, tone: "red" },
      { height: 4, tone: "gray" },
    ],
    distractorDots: ["good", "bad", "good", "good"],
    indicatorFit: "review",
    status: "review",
    flagged: "ambiguous",
  },
  {
    no: "20",
    difficulty: "Sedang",
    pIndex: 0.61,
    bars: [
      { height: 100, tone: "blue" },
      { height: 20, tone: "gray" },
      { height: 16, tone: "gray" },
      { height: 16, tone: "gray" },
      { height: 11, tone: "gray" },
    ],
    distractorDots: ["good", "good", "good", "good"],
    indicatorFit: "sesuai",
    status: "baik",
  },
];

const difficultyTone: Record<Difficulty, string> = {
  Mudah: "bg-[#dcfce7] text-[#15803d]",
  Sedang: "bg-[#dbeafe] text-[#1d4ed8]",
  Sulit: "bg-[#fee2e2] text-[#b91c1c]",
};

const barTone: Record<BarTone, string> = {
  blue: "bg-[#0058be]",
  gray: "bg-[#c5c6cd]",
  red: "bg-[#ba1a1a]",
};

const dotTone: Record<DotState, string> = {
  good: "bg-[#22c55e]",
  bad: "bg-[#ba1a1a]",
  neutral: "bg-[#d1d5db]",
};

const indicatorFitConfig: Record<IndicatorFit, { label: string; tone: string }> = {
  sesuai: { label: "Sesuai", tone: "bg-[#d8e2ff] text-[#004395]" },
  review: { label: "Perlu Ditinjau", tone: "bg-[#ffdad6] text-[#ba1a1a]" },
};

const statusConfig: Record<RowStatus, { label: string; tone: string }> = {
  baik: { label: "Baik", tone: "bg-[#e4e2e3] text-[#45474c]" },
  revisi: { label: "Revisi", tone: "bg-[#ba1a1a] text-white" },
  review: { label: "Perlu Ditinjau", tone: "bg-[#1e1200] text-white" },
};

const rowFlagTone: Record<NonNullable<QuestionRow["flagged"]>, string> = {
  problem: "bg-[rgba(255,218,214,0.1)]",
  ambiguous: "bg-[rgba(250,223,184,0.1)]",
};

function Chip({ tone, label }: { tone: string; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[4px] px-2 py-[2px] text-[10px] font-bold uppercase tracking-[0.03em]",
        tone,
      )}
    >
      {label}
    </span>
  );
}

function PageIntro() {
  return (
    <section className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div className="space-y-1">
        <h1 className="text-[clamp(2rem,5vw,2.5rem)] font-semibold tracking-[-0.04em] text-[#091426]">
          Analisis Kualitas Soal
        </h1>
        <p className="text-sm text-[#45474c]">
          Evaluasi Instrumen Asesmen - Matematika 8A
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline">Reset</Button>
        <Button>
          <FunnelIcon className="size-4" />
          Apply Filter
        </Button>
      </div>
    </section>
  );
}

function FilterPanel() {
  return (
    <Card className="rounded-[12px] shadow-none">
      <CardContent className="grid gap-4 p-[25px] sm:grid-cols-3">
        {filterFields.map((field) => (
          <div key={field.label}>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.06em] text-[#45474c]">
              {field.label}
            </label>
            <div className="flex h-10 items-center justify-between rounded-[8px] border border-[#c5c6cd] bg-[#f5f3f4] px-[17px] text-sm text-[#1b1b1d]">
              <span className="truncate">{field.value}</span>
              <span className="ml-2 text-[#8f96a3]">⌄</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SummaryCard({
  lines,
  value,
  unit,
  valueTone,
  unitTone = "text-[#45474c]",
  icon: Icon,
  iconTone,
}: (typeof summaryCards)[number]) {
  return (
    <Card className="flex-1 rounded-[12px]">
      <CardContent className="flex items-start justify-between gap-4 p-[25px]">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#45474c]">
            {lines.map((line) => (
              <span className="block" key={line}>
                {line}
              </span>
            ))}
          </p>
          <p className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className={cn("text-[32px] font-semibold tracking-[-0.02em]", valueTone)}>
              {value}
            </span>
            <span className={cn("text-sm", unitTone)}>{unit}</span>
          </p>
        </div>
        <div className={cn("grid size-10 shrink-0 place-items-center rounded-[10px]", iconTone)}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function AiInsightSection() {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <SparkIcon className="size-5 text-[#2170e4]" />
        <h2 className="text-xl font-semibold text-[#091426]">AI Insight - Analisis Instrumen</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="relative flex-1 overflow-hidden rounded-[12px] border border-[#1e293b] bg-[#091426] p-[25px]">
          <div className="absolute -right-8 -top-8 size-32 rounded-full bg-[#0058be] opacity-20 blur-[32px]" />
          <div className="relative flex gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[#2170e4]">
              <AlertTriangleIcon className="size-5 text-white" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#d8e2ff]">
                Soal #12 - Anomali Distribusi
              </p>
              <p className="text-sm leading-6 text-white">
                80% siswa memilih opsi C meski jawaban benar A. Indikasi:{" "}
                <span className="font-bold text-[#adc6ff]">Soal ambigu</span> atau distractor C
                terlalu menjebak (Misleading).
              </p>
              <button className="inline-flex items-center gap-1 text-xs font-semibold text-[#adc6ff]" type="button">
                Lihat Detail Soal
                <ChevronRightIcon className="size-3" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 rounded-[12px] border border-[#c5c6cd] border-l-4 border-l-[#0058be] bg-white p-[25px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <div className="flex gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[#eae7e9]">
              <LightbulbIcon className="size-5 text-[#45474c]" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#45474c]">
                Soal #5 - Optimalisasi Distractor
              </p>
              <p className="text-sm leading-6 text-[#1b1b1d]">
                Distractor D dan E tidak dipilih oleh siswa manapun.{" "}
                <span className="font-bold text-[#0058be]">Rekomendasi:</span> Ganti opsi
                pengecoh dengan yang lebih relevan untuk meningkatkan daya beda soal.
              </p>
              <button className="inline-flex items-center gap-1 text-xs font-semibold text-[#0058be]" type="button">
                Edit Opsi Jawaban
                <ChevronRightIcon className="size-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DistributionBars({ bars }: { bars: QuestionRow["bars"] }) {
  return (
    <div className="flex h-8 w-24 items-end gap-1">
      {bars.map((bar, index) => (
        <div
          className={cn("flex-1 rounded-t-[1px]", barTone[bar.tone])}
          key={index}
          style={{ height: `${bar.height}%` }}
        />
      ))}
    </div>
  );
}

function QuestionTable() {
  return (
    <Card className="overflow-hidden rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between border-b border-[#c5c6cd] bg-[#f5f3f4] px-6 py-4">
        <h2 className="text-xl font-semibold text-[#091426]">Detail Analisis Per Butir Soal</h2>
        <div className="flex items-center gap-2">
          <button className="rounded-[4px] p-2 text-[#45474c] hover:bg-white" type="button">
            <DownloadIcon className="size-4" />
          </button>
          <button className="rounded-[4px] p-2 text-[#45474c] hover:bg-white" type="button">
            <PrinterIcon className="size-4" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[90px_150px_150px_150px_150px_1fr] gap-2 border-b border-[#c5c6cd] px-6 py-4">
            <span className="text-xs font-semibold uppercase tracking-[0.05em] text-[#45474c]">
              No. Soal
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.05em] text-[#45474c]">
              Tingkat Kesulitan
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.05em] text-[#45474c]">
              Distribusi Jawaban
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.05em] text-[#45474c]">
              Efektivitas Distractor
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.05em] text-[#45474c]">
              Kesesuaian Indikator
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.05em] text-[#45474c]">
              Status/Rekomendasi
            </span>
          </div>
          {questionRows.map((row) => (
            <div
              className={cn(
                "grid grid-cols-[90px_150px_150px_150px_150px_1fr] items-center justify-items-start gap-2 border-b border-[#c5c6cd] px-6 py-4 last:border-b-0",
                row.flagged ? rowFlagTone[row.flagged] : undefined,
              )}
              key={row.no}
            >
              <span className="text-sm font-medium text-[#091426]">{row.no}</span>
              <div className="space-y-1">
                <Chip label={row.difficulty.toUpperCase()} tone={difficultyTone[row.difficulty]} />
                <p className="text-[10px] text-[#45474c]">P-Index: {row.pIndex.toFixed(2)}</p>
              </div>
              <DistributionBars bars={row.bars} />
              <div className="flex gap-1">
                {row.distractorDots.map((dot, index) => (
                  <span className={cn("size-4 rounded-full", dotTone[dot])} key={index} />
                ))}
              </div>
              <Chip
                label={indicatorFitConfig[row.indicatorFit].label.toUpperCase()}
                tone={indicatorFitConfig[row.indicatorFit].tone}
              />
              <Chip
                label={statusConfig[row.status].label.toUpperCase()}
                tone={statusConfig[row.status].tone}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between px-6 py-4">
        <p className="text-xs font-semibold text-[#45474c]">Menampilkan 4 dari 25 butir soal</p>
        <div className="flex gap-1">
          <button
            className="grid size-8 place-items-center rounded-[4px] border border-[#c5c6cd] text-[#1b1b1d] opacity-30"
            disabled
            type="button"
          >
            <ChevronLeftIcon className="size-4" />
          </button>
          {[1, 2, 3].map((page) => (
            <button
              className={cn(
                "grid size-8 place-items-center rounded-[4px] border border-[#c5c6cd] text-xs font-semibold",
                page === 1 ? "bg-[#0058be] text-white" : "text-[#1b1b1d]",
              )}
              key={page}
              type="button"
            >
              {page}
            </button>
          ))}
          <button
            className="grid size-8 place-items-center rounded-[4px] border border-[#c5c6cd] text-[#1b1b1d]"
            type="button"
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}

function PageFooter() {
  return (
    <footer className="border-t border-[#c5c6cd] pt-6 text-center text-xs font-semibold text-[#45474c]">
      © 2026 EduInsight AI • Laporan Analisis Kualitas Asesmen Otomatis
    </footer>
  );
}

export function AnalysisPage() {
  return (
    <div className="space-y-8 px-5 py-6 sm:px-6 lg:px-10 lg:py-10">
      <PageIntro />
      <FilterPanel />

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <SummaryCard key={card.lines.join(" ")} {...card} />
        ))}
      </section>

      <AiInsightSection />
      <QuestionTable />
      <PageFooter />
    </div>
  );
}
