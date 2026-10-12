import Image from "next/image";
import Link from "next/link";
import { primaryButtonClassName } from "@/components/auth/styles";
import { cn } from "@/components/ui/cn";

const options = [
  {
    title: "Template",
    description: "Unduh template CSV atau excel untuk memudahkan pembuatan soal.",
    icon: "/assessment/sheet.svg",
    action: "Unduh Template",
    method: "template",
  },
  {
    title: "Ketik di EduInsight",
    description: "Buat soal manual secara langsung di platform EduInsight.",
    icon: "/assessment/clipboard-blue.svg",
    action: "Buat Soal",
    method: "ketik",
  },
];

// Buat Soal Manual (Figma New Design 61:7728). Template downloads the file and imports it in langkah 2.
export function ManualPicker({ slug }: { slug: string }) {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8">
      <h2 className="text-2xl font-semibold leading-normal text-[#003264]">Buat Soal Manual</h2>
      <div className="flex flex-wrap gap-6">
        {options.map((option) => (
          <div
            className="flex w-full flex-col items-center gap-3 rounded-3xl bg-[#fafbfd] p-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.1)] sm:w-[232px]"
            key={option.method}
          >
            <span className="grid place-items-center rounded-full bg-[rgba(153,188,229,0.6)] p-3">
              <Image alt="" height={40} src={option.icon} width={40} />
            </span>
            <div className="flex flex-1 flex-col leading-normal">
              <p className="text-base font-semibold text-[#1b1b1d]">{option.title}</p>
              <p className="text-xs text-[#45474c]">{option.description}</p>
            </div>
            <Link
              className={cn(primaryButtonClassName, "w-full gap-3")}
              href={`/${slug}/assessment/new?method=${option.method}`}
            >
              {option.action}
              <Image alt="" height={24} src="/assessment/arrow-right.svg" width={24} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
