import type { ReactElement, SVGProps } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import {
  ClipboardIcon,
  DownloadIcon,
  PlusIcon,
  SearchIcon,
} from "@/components/ui/icons";

function CloudImportIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M7 18.5h9a4 4 0 0 0 .55-7.96A5.5 5.5 0 0 0 6.1 8.7 3.5 3.5 0 0 0 7 18.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M12 8.5v7m0 0-2.5-2.5M12 15.5l2.5-2.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function FormIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 9.5h7M8.5 13h5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function ChecklistIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8.5 9.5 1.4 1.4 2.6-2.6M8.5 14.5l1.4 1.4 2.6-2.6M14.5 9.5h1M14.5 14.5h1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function GraduationIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M3.5 9 12 5l8.5 4-8.5 4-8.5-4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M7 11.2v3.4c0 .7.4 1.32 1.04 1.63L12 18.2l3.96-1.97c.64-.31 1.04-.94 1.04-1.63v-3.4" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function SheetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 8.5h8M8 12h8M8 15.5h8M10.5 8.5v7" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function TimerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="13" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 13V9.5M9 3.5h6M15.5 5.5l1.5-1.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function SparkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M12 3.5 14 9l5.5 2-5.5 2L12 18.5 10 13 4.5 11 10 9 12 3.5Z" fill="currentColor" />
    </svg>
  );
}

function CheckCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function RefreshIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M20 6v5h-5M4 18v-5h5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M19 11a7 7 0 0 0-12-3M5 13a7 7 0 0 0 12 3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function LightbulbIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M9 17.5h6M10 20h4M8 9.5a4 4 0 1 1 8 0c0 1.62-.73 2.78-1.8 3.83-.76.75-1.2 1.5-1.2 2.67h-2c0-1.17-.44-1.92-1.2-2.67C8.73 12.28 8 11.12 8 9.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

type SourceCard = {
  title: string;
  description: string;
  icon: (props: SVGProps<SVGSVGElement>) => ReactElement;
  tone: string;
};

const sourceCards: SourceCard[] = [
  {
    title: "Google Forms",
    description: "Sinkronisasi respons siswa otomatis.",
    icon: FormIcon,
    tone: "text-[#2170e4]",
  },
  {
    title: "Microsoft Forms",
    description: "Hubungkan akun Office 365 Anda.",
    icon: ChecklistIcon,
    tone: "text-[#2170e4]",
  },
  {
    title: "Moodle (LMS)",
    description: "Impor data dari aktivitas kuis.",
    icon: GraduationIcon,
    tone: "text-[#ef8f33]",
  },
  {
    title: "Excel / CSV",
    description: "Unggah file data terstruktur.",
    icon: SheetIcon,
    tone: "text-[#4b8f62]",
  },
];

const bloomLevels = [
  { label: "C1", subtitle: "Mengingat", active: true },
  { label: "C2", subtitle: "Memahami" },
  { label: "C3", subtitle: "Menerapkan" },
  { label: "C4", subtitle: "Menganalisis" },
  { label: "C5", subtitle: "Mengevaluasi" },
  { label: "C6", subtitle: "Mencipta" },
];

const questionOptions = [
  "A. 176 m²",
  "B. 210 m²",
  "C. 154 m²",
  "D. 198 m²",
];

function PageIntro() {
  return (
    <section className="space-y-2">
      <h1 className="text-[clamp(2rem,4vw,2.75rem)] font-semibold tracking-[-0.04em] text-[#1b1b1d]">
        Smart Assessment Builder
      </h1>
      <p className="text-sm text-[#5c6470]">
        Kelola asesmen secara efisien melalui integrasi platform atau mode luring cerdas.
      </p>
    </section>
  );
}

function ImportLink() {
  return (
    <button className="inline-flex items-center gap-2 text-sm font-medium text-[#1f4ca0]" type="button">
      <CloudImportIcon className="size-4" />
      Impor dari Platform Digital
    </button>
  );
}

function PlatformSourceCards() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {sourceCards.map((card) => {
        const Icon = card.icon;

        return (
          <Card className="rounded-[14px] shadow-none" key={card.title}>
            <CardContent className="space-y-4 p-4">
              <div className={cn("grid size-9 place-items-center rounded-[10px] bg-[#f5f3f4]", card.tone)}>
                <Icon className="size-[18px]" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-sm font-medium text-[#1b1b1d]">{card.title}</h2>
                <p className="text-[11px] leading-5 text-[#75777d]">{card.description}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}

function OfflineModeCard() {
  return (
    <Card className="rounded-[14px] border-dashed shadow-none xl:col-span-8">
      <CardContent className="space-y-6 p-4 md:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid size-8 place-items-center rounded-[10px] bg-[#fff7e8] text-[#8a6b38]">
              <CheckCircleIcon className="size-[18px]" />
            </div>
            <div>
              <h2 className="text-[15px] font-medium text-[#1b1b1d]">Mode Asesmen Luring (Offline)</h2>
              <p className="text-[11px] leading-5 text-[#75777d]">
                Lakukan penilaian manual dengan bantuan template Excel.
              </p>
            </div>
          </div>
          <button className="rounded-[8px] p-2 text-[#c0c4cd]" type="button">
            <SearchIcon className="size-4" />
          </button>
        </div>

        <div className="rounded-[10px] bg-[#f5f3f4] p-4 text-sm leading-6 text-[#5c6470]">
          <p>Gunakan mode ini jika Anda memberikan ujian berbasis kertas.</p>
          <p className="mt-1">
            <span className="font-medium text-[#2170e4]">Penting:</span> Untuk melakukan <span className="italic">Learning Diagnosis</span>, AI kami
            memerlukan jawaban per-item (seperti A, B, C, D atau skor individual soal uraian), bukan hanya nilai akhir.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#45474c]">Langkah 1: Unduh</p>
            <Button className="w-full" size="md" variant="outline">
              <DownloadIcon className="size-4" />
              Unduh Template Respons
            </Button>
            <p className="text-[10px] leading-4 text-[#75777d]">
              Format: `.xlsx` berisi daftar siswa & kolom jawaban
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#45474c]">Langkah 2: Unggah</p>
            <Button className="w-full" size="md">
              <CloudImportIcon className="size-4" />
              Unggah Template Terisi
            </Button>
            <p className="text-[10px] leading-4 text-[#75777d]">
              Pastikan semua kolom jawaban siswa telah terisi.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryCard() {
  return (
    <Card className="rounded-[14px] shadow-none xl:col-span-4">
      <CardContent className="space-y-8 p-5">
        <section className="space-y-6">
          <h2 className="text-[16px] font-medium text-[#1b1b1d]">Ringkasan Asesmen</h2>
          <div className="space-y-5">
            <SummaryRow icon={ClipboardIcon} label="Total Soal" value="25 Soal" tone="text-[#2170e4]" />
            <SummaryRow icon={TimerIcon} label="Estimasi Durasi" value="60 Menit" />
          </div>
        </section>

        <section className="space-y-4 border-t border-[#c5c6cd] pt-6">
          <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#45474c]">Kisi-Kisi</h3>
          <div className="space-y-3 text-sm text-[#1b1b1d]">
            <div className="flex items-center justify-between">
              <span>Pilihan Ganda</span>
              <span className="text-[#5c6470]">20 soal</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Uraian</span>
              <span className="text-[#5c6470]">5 soal</span>
            </div>
          </div>

          <div className="rounded-[10px] bg-[#f5f3f4] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm text-[#1b1b1d]">
              <SparkIcon className="size-3 text-[#1b1b1d]" />
              Distribusi Kognitif
            </div>
            <div className="flex h-2 overflow-hidden rounded-full bg-[#eae7e9]">
              <span className="flex-1 bg-[#0058be]" />
              <span className="flex-1 bg-[#adc6ff]" />
              <span className="flex-1 bg-[#091426]" />
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] text-[#75777d]">
              <span>LOTS (33%)</span>
              <span>MOTS (33%)</span>
              <span>HOTS (33%)</span>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <Button className="w-full" size="md">
            Simpan & Publikasi
          </Button>
          <Button className="w-full" size="md" variant="outline">
            Simpan sebagai Draf
          </Button>
        </section>

        <section className="border-t border-[#c5c6cd] pt-6">
          <div className="rounded-[12px] border border-[#d8e3fb] bg-[rgba(216,227,251,0.3)] p-4">
            <div className="flex gap-3">
              <div className="grid size-6 place-items-center text-[#0058be]">
                <LightbulbIcon className="size-5" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#0058be]">AI Recommendation</p>
                <p className="text-xs leading-5 text-[#3c475a]">
                  Siswa di kelas ini cenderung lemah di <span className="font-semibold">Geometri</span>. Tambahkan 2-3
                  soal level C3 untuk penguatan.
                </p>
              </div>
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
  tone = "text-[#1b1b1d]",
}: {
  icon: (props: SVGProps<SVGSVGElement>) => ReactElement;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#c5c6cd] pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-3 text-sm text-[#45474c]">
        <Icon className="size-[18px]" />
        {label}
      </div>
      <span className={cn("text-sm", tone)}>{value}</span>
    </div>
  );
}

function SelectField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-[#5c6470]">{label}</label>
      <div className="flex min-h-12 items-center justify-between rounded-[10px] border border-[#c5c6cd] bg-white px-3 text-sm text-[#1b1b1d]">
        <span>{value}</span>
        <span className="text-[#8f96a3]">⌄</span>
      </div>
    </div>
  );
}

function BloomSelector() {
  return (
    <div className="space-y-3">
      <p className="text-xs text-[#5c6470]">Tentukan Level Bloom</p>
      <div className="rounded-full bg-[#eef2f7] p-1">
        <div className="grid grid-cols-6 gap-1">
          {bloomLevels.map((level) => (
            <div
              className={cn(
                "rounded-full px-2 py-2 text-center",
                level.active ? "bg-white shadow-[0_4px_10px_rgba(15,23,42,0.08)]" : "",
              )}
              key={level.label}
            >
              <p className={cn("text-[10px] font-semibold", level.active ? "text-[#2170e4]" : "text-[#9aa1ae]")}>
                {level.label}
              </p>
              <p className="mt-0.5 text-[8px] uppercase tracking-[0.06em] text-[#b0b6c1]">
                {level.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GenerateQuestionCard() {
  return (
    <Card className="rounded-[14px] shadow-none xl:col-span-8">
      <CardContent className="space-y-5 p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-[#1b1b1d]">
          <SparkIcon className="size-4 text-[#2170e4]" />
          Buat Soal Baru dengan AI
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <SelectField label="Pilih Mata Pelajaran" value="Matematika" />
          <SelectField label="Capaian Pembelajaran (CP)" value="Geometri dan Pengukuran (SMP Kelas 8)" />
        </div>

        <BloomSelector />

        <Button className="h-11 bg-[#091426] px-6 hover:bg-[#0f1f3d]" size="lg">
          <SparkIcon className="size-4" />
          Generate Soal dengan AI
        </Button>
      </CardContent>
    </Card>
  );
}

function PreviewQuestionCard() {
  return (
    <Card className="rounded-[14px] shadow-none xl:col-span-8">
      <CardContent className="space-y-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm text-[#1b1b1d]">Pratinjau Soal (3)</p>
            <Badge className="bg-[#eef5ff] text-[#5d73bf]" variant="info">
              C4 - Analisis
            </Badge>
          </div>
          <button className="inline-flex items-center gap-1 text-sm text-[#2170e4]" type="button">
            <RefreshIcon className="size-4" />
            Regenerate Semua
          </button>
        </div>

        <div className="space-y-4">
          <p className="max-w-[44rem] text-sm leading-6 text-[#1b1b1d]">
            Jika sebuah taman berbentuk lingkaran memiliki jari-jari 14m, dan sebuah jalan setapak selebar 2m
            dibangun mengelilingi bagian luar taman tersebut. Berapakah selisih luas jalan setapak dengan
            luas taman awal?
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            {questionOptions.map((option) => {
              const active = option.startsWith("B.");

              return (
                <button
                  className={cn(
                    "flex h-12 items-center justify-between rounded-[8px] border px-4 text-left text-sm text-[#1b1b1d] transition-colors",
                    active
                      ? "border-[#0058be] bg-[rgba(33,112,228,0.1)]"
                      : "border-[#c5c6cd] bg-white hover:border-[#8ab3f3]",
                  )}
                  key={option}
                  type="button"
                >
                  <span>{option}</span>
                  {active ? <CheckCircleIcon className="size-4 text-[#2170e4]" /> : null}
                </button>
              );
            })}
          </div>
        </div>

        <button className="inline-flex items-center gap-2 pt-1 text-sm text-[#2170e4]" type="button">
          <PlusIcon className="size-3" />
          Buat Variasi
        </button>
      </CardContent>
    </Card>
  );
}

export function AssessmentPage() {
  return (
    <div className="space-y-8 px-5 py-6 sm:px-6 lg:px-10 lg:py-10">
      <PageIntro />
      <ImportLink />
      <PlatformSourceCards />

      <section className="grid gap-4 xl:grid-cols-12">
        <OfflineModeCard />
        <SummaryCard />
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <GenerateQuestionCard />
        <div className="hidden xl:block" />
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <PreviewQuestionCard />
      </section>
    </div>
  );
}
