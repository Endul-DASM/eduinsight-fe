"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { CurrentUser } from "@/lib/api/types";
import { ProfileMenu } from "./profile-menu";

type Crumb = { label: string; href?: string };

// Page title per section of the student workspace, e.g. /student/{slug}/dashboard → "Dashboard".
const sectionTitles: Record<string, string> = {
  dashboard: "Dashboard",
  profile: "Profile",
  help: "Bantuan",
};

function useCrumbs(slug: string): Crumb[] {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const section = pathname.split("/")[3] ?? "dashboard";
  const crumbs: Crumb[] = [{ label: sectionTitles[section] ?? "Dashboard", href: `/student/${slug}/${section}` }];
  if (section === "dashboard" && searchParams.get("detail") === "penguasaan") {
    crumbs.push({ label: "Level Penguasaan Materi" });
  }
  return crumbs;
}

// Top bar of the student workspace (Figma New Design 175:32037), in the style of the teacher's.
export function StudentTopHeader({ slug, subjectLabel, user }: { slug: string; subjectLabel: string; user: CurrentUser }) {
  const crumbs = useCrumbs(slug);

  return (
    <header className="sticky top-0 z-20 flex min-h-18 items-center justify-between gap-4 border-b border-[#c5c6cd] bg-[rgba(250,251,253,0.6)] px-4 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-xs sm:px-8">
      <div className="flex min-w-0 flex-col gap-0.5">
        <h1 className="truncate text-xl font-semibold leading-normal text-black">{crumbs[0].label}</h1>
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
        {/* Notifications (FR-X-040) are not built yet. */}
        <span aria-hidden className="hidden sm:block">
          <Image alt="" height={24} src="/dashboard/bell-dot.svg" width={24} />
        </span>
        <div className="border-l-2 border-[#75777d] pl-3">
          <ProfileMenu profileHref={`/student/${slug}/profile`} subjectLabel={subjectLabel} user={user} />
        </div>
      </div>
    </header>
  );
}
