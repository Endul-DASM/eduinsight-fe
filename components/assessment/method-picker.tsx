"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { outlineButtonClassName } from "@/components/auth/styles";
import { sectionClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import { QuestionCard } from "./question-card";

const methods = [
  {
    title: "AI Generated",
    description: "Buat soal otomatis dengan AI berdasarkan materi yang di-upload, lalu modifikasi bila perlu.",
    icon: "/assessment/brain.svg",
    href: "new?method=ai",
    card: "bg-[rgba(230,239,249,0.6)]",
    chip: "bg-[rgba(153,188,229,0.6)]",
    button: "bg-[#0058be] hover:bg-[#004695]",
  },
  {
    title: "Manual",
    description: "Buat soal manual dengan menggunakan template excel yang kami sediakan, maupun mengetik manual.",
    icon: "/assessment/clipboard-pen.svg",
    href: "manual",
    card: "bg-[rgba(255,237,213,0.6)]",
    chip: "bg-[rgba(254,215,170,0.6)]",
    button: "bg-[#f97316] hover:bg-[#ea580c]",
  },
  {
    title: "OCR (Scan)",
    description:
      "Upload hasil scan dari soal yang sudah ada, baik hasil scan soal yang sudah diprint, maupun soal pdf yang sudah jadi.",
    icon: "/assessment/scan.svg",
    href: "new?method=ocr",
    card: "bg-[rgba(220,252,231,0.6)]",
    chip: "bg-[rgba(187,247,208,0.6)]",
    button: "bg-[#22c55e] hover:bg-[#16a34a]",
  },
];

// What an AI draft looks like (Figma 60:4158). These are fixed examples, not generated from this subject.
const examples = [
  {
    chips: ["Berdasarkan Materi Bab 1: Eksponen dan Logaritma", "Berdasarkan TP 1.1"],
    stem: "Jika sebuah taman berbentuk lingkaran memiliki jari-jari 14 m, dan sebuah jalan setapak selebar 2 m dibangun mengelilingi bagian luar taman tersebut. Berapakah selisih luas jalan setapak dengan luas taman awal?",
    options: ["176 m²", "210 m²", "154 m²", "198 m²"],
    answer: 1,
  },
  {
    chips: ["Berdasarkan Materi Bab 1: Eksponen dan Logaritma", "Berdasarkan TP 1.1"],
    stem: "Bentuk sederhana dari (2³ × 2⁵) ÷ 2⁴ adalah …",
    options: ["2²", "2⁴", "2⁶", "2¹²"],
    answer: 1,
  },
  {
    chips: ["Berdasarkan Materi Bab 1: Eksponen dan Logaritma", "Berdasarkan TP 1.2"],
    stem: "Jika ²log 8 = a, maka nilai ²log 32 adalah …",
    options: ["a + 1", "a + 2", "2a", "a²"],
    answer: 1,
  },
];

// Tab Buat Asesmen: how to make the questions (Figma New Design 60:4158).
export function MethodPicker({ slug }: { slug: string }) {
  const [index, setIndex] = useState(0);
  const example = examples[index];

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-xl font-semibold leading-normal text-black">Pilih bagaimana mau membuat asesmen</h3>
      <div className="grid gap-6 md:grid-cols-3 md:gap-9">
        {methods.map((method) => (
          <div
            className={cn(
              "flex flex-col items-center gap-3 rounded-3xl p-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-xs",
              method.card,
            )}
            key={method.title}
          >
            <span className={cn("grid place-items-center rounded-full p-3", method.chip)}>
              <Image alt="" height={40} src={method.icon} width={40} />
            </span>
            <div className="flex flex-1 flex-col leading-normal">
              <p className="text-base font-semibold text-[#1b1b1d]">{method.title}</p>
              <p className="text-xs text-[#45474c]">{method.description}</p>
            </div>
            <Link
              className={cn(
                "flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-base font-semibold text-[#f5f3f4] shadow-[0_4px_4px_rgba(0,0,0,0.15)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0058be]",
                method.button,
              )}
              href={`/${slug}/assessment/${method.href}`}
            >
              Buat Soal
              <Image alt="" height={24} src="/assessment/arrow-right.svg" width={24} />
            </Link>
          </div>
        ))}
      </div>

      <section className={cn(sectionClassName, "gap-6")}>
        <h3 className="flex items-center gap-2.5 rounded-xl bg-[#0058be] p-2.5 text-xl font-semibold leading-normal text-[#e6eff9]">
          <Image alt="" height={24} src="/assessment/sparkle-light.svg" width={24} />
          Contoh soal dengan AI Generated
        </h3>
        <div className="flex items-center justify-between rounded-xl border border-[#c5c6cd] bg-[#fafbfd] px-2 py-3">
          <button
            aria-label="Contoh sebelumnya"
            className="grid size-8 place-items-center rounded-lg hover:bg-[#e6eff9] disabled:opacity-35"
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
            type="button"
          >
            <Image alt="" height={24} src="/assessment/chevron-left.svg" width={24} />
          </button>
          <p className="text-base font-bold text-[#1b1b1d]">Soal {index + 1}</p>
          <button
            aria-label="Contoh berikutnya"
            className="grid size-8 place-items-center rounded-lg hover:bg-[#e6eff9] disabled:opacity-35"
            disabled={index === examples.length - 1}
            onClick={() => setIndex(index + 1)}
            type="button"
          >
            <Image alt="" height={24} src="/assessment/chevron-right.svg" width={24} />
          </button>
        </div>
        <QuestionCard
          answer={String.fromCharCode(65 + example.answer)}
          bare
          chips={example.chips}
          options={example.options.map((text, option) => ({ key: String.fromCharCode(65 + option), text }))}
          stem={example.stem}
        />
        <div className="flex justify-end border-b border-[rgba(153,188,229,0.6)] pb-6">
          <Link className={cn(outlineButtonClassName, "gap-3")} href={`/${slug}/assessment/new?method=ai`}>
            Buat lebih lengkap
            <Image alt="" height={24} src="/assessment/sparkle.svg" width={24} />
          </Link>
        </div>
      </section>
    </div>
  );
}
