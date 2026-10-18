"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/components/ui/cn";

export type AssessmentTab = "belum" | "selesai";

const assessmentTabs = [
  { id: "belum", label: "Belum Dikerjakan" },
  { id: "selesai", label: "Sudah Selesai" },
];

// Search and the two status tabs, kept in the URL: Belum Dikerjakan / Sudah Selesai on Asesmen (Figma New Design
// 175:32308, 181:7800), Perlu Remedial / Sudah Tuntas on Remedial (175:33620).
export function ListControls({
  tab,
  query,
  tabs = assessmentTabs,
  placeholder = "Cari asesmen atau TP...",
}: {
  tab: string;
  query: string;
  tabs?: { id: string; label: string }[];
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(query);

  // Update ?q= shortly after typing stops.
  useEffect(() => {
    if (value === query) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (value.trim()) params.set("q", value.trim());
      else params.delete("q");
      router.replace(`${pathname}?${params}`, { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [value, query, pathname, router, searchParams]);

  const tabHref = (next: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", next);
    return `${pathname}?${params}`;
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <label className="flex h-[50px] w-full items-center gap-3 rounded-xl border border-[#c5c6cd] bg-[#fbf8fa] px-3 focus-within:border-[#0058be] sm:max-w-[400px]">
        <Image alt="" height={22} src="/assessment/search.svg" width={22} />
        <input
          aria-label={placeholder.replace("...", "")}
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#75777d]"
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
      </label>
      <nav aria-label="Status" className="flex gap-2">
        {tabs.map((item) => (
          <Link
            aria-current={tab === item.id ? "page" : undefined}
            className={cn(
              "rounded-xl px-3 py-2 text-base font-semibold transition-colors",
              tab === item.id ? "bg-[#0058be] text-[#f5f3f4]" : "text-[#1b1b1d] hover:bg-[#e6eff9]",
            )}
            href={tabHref(item.id)}
            key={item.id}
            replace
            scroll={false}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
