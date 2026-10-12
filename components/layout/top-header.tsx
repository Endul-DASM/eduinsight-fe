"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import type { CurrentUser } from "@/lib/api/types";
import { builderMethodOf, builderMethods } from "@/lib/assessment-form";
import { firstName } from "@/lib/display-name";

// Page title per section of the subject workspace, e.g. /{slug}/assessment → "Asesmen".
const sectionTitles: Record<string, string> = {
  dashboard: "Dashboard",
  curriculum: "Kurikulum",
  assessment: "Asesmen",
  remedial: "Remedial",
  analysis: "Analisis Soal",
  diagnosis: "Diagnosis",
};

type Crumb = { label: string; href?: string };

function useCrumbs(): Crumb[] {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { subject } = useParams<{ subject: string }>();
  const [, , section = "dashboard", detail] = pathname.split("/");
  const title = sectionTitles[section] ?? "Dashboard";
  const crumbs: Crumb[] = [{ label: title, href: `/${subject}/${section}` }];

  // Detail Bab on the dashboard (?bab={number}) and the Buat Asesmen pages (/assessment/{manual,new,id}).
  const chapter = section === "dashboard" ? searchParams.get("bab") : null;
  if (chapter) crumbs.push({ label: `Detail Bab ${chapter}` });
  if (section === "curriculum" && searchParams.get("tab") === "materi") crumbs.push({ label: "Upload Materi" });
  if (section === "curriculum" && searchParams.get("bab")) crumbs.push({ label: "Detail Bab" });
  if (section === "assessment" && detail) {
    // Buat Asesmen: "Asesmen > Buat Soal Manual > Ketik di EduInsight" (Figma New Design 61:8772).
    if (detail === "manual") {
      crumbs.push({ label: "Buat Soal Manual" });
    } else {
      const method = builderMethodOf(searchParams.get("method"));
      const [first, second] = builderMethods[method].crumbs;
      crumbs.push({ label: first, href: second ? `/${subject}/assessment/manual` : undefined });
      if (second) crumbs.push({ label: second });
      if (searchParams.get("step") === "selesai") crumbs.push({ label: "Succeed" });
    }
  }
  return crumbs;
}

// Figma New Design 22:4162 (top bar of the subject workspace).
export function TopHeader({ subjectLabel, user }: { subjectLabel: string; user: CurrentUser }) {
  const crumbs = useCrumbs();

  return (
    <header className="sticky top-0 z-20 flex min-h-[93px] items-center justify-between gap-4 border-b border-[#c5c6cd] bg-[rgba(250,251,253,0.6)] px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-xs sm:px-8">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="truncate text-xl font-semibold leading-normal text-black sm:text-2xl">{crumbs[0].label}</h1>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs leading-normal">
          {crumbs.map((crumb, index) => {
            const last = index === crumbs.length - 1;
            return (
              <span className="flex items-center gap-1" key={crumb.label}>
                {index > 0 && <span className="text-[#75777d]">›</span>}
                {crumb.href && !last ? (
                  <Link className="text-[#75777d] hover:text-[#0058be]" href={crumb.href}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current={last ? "page" : undefined} className="text-[#0058be]">
                    {crumb.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        {/* Notifications (FR-X-041) are not built yet. */}
        <span aria-hidden className="hidden sm:block">
          <Image alt="" height={30} src="/dashboard/bell-dot.svg" width={30} />
        </span>
        <div className="flex items-center gap-3 border-l-2 border-[#75777d] pl-4 sm:gap-6">
          <div className="grid size-12 place-items-center rounded-full bg-[#e6eff9] text-base font-bold text-[#004695] sm:size-[65px] sm:text-xl">
            {user.initials}
          </div>
          <div className="hidden max-w-[220px] leading-normal text-[#1b1b1d] sm:block">
            <p className="truncate text-xl font-semibold lg:text-2xl">{firstName(user.name)}</p>
            <p className="truncate text-sm lg:text-base">{subjectLabel}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
