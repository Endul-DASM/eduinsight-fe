"use client";

import { useParams, usePathname } from "next/navigation";
import { AppSidebar, type NavItem } from "./app-sidebar";

// Student menu (Figma New Design 175:32037). Pages that are not built yet have no href and show as "Segera".
const studentNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "/dashboard/nav-dashboard-active.svg" },
  { label: "Diagnosis", href: "/diagnosis", icon: "/dashboard/nav-remedial.svg" },
  { label: "Asesmen", href: "/assessment", icon: "/dashboard/nav-asesmen.svg" },
  { label: "Remedial", href: "/remedial", icon: "/dashboard/nav-remedial.svg" },
  // UAT MAT-H08 (Figma New Design 256:8213).
  { label: "Materi", href: "/materials", icon: "/dashboard/nav-materi.svg" },
];

// FAQ and Pusat Bantuan (SRS FR-X-030).
const help: NavItem = { label: "Bantuan", href: "/help", icon: "/auth/help-circle.svg" };

export function StudentSidebar({ initialCollapsed }: { initialCollapsed?: boolean }) {
  const { subject } = useParams<{ subject: string }>();
  const pathname = usePathname();

  // Persiapan, Pengerjaan and Selesai of Asesmen and Remedial are full-width, without the sidebar (Figma New Design
  // 181:8150).
  // Soal Latihan (/remedial/latihan/…) is a study page and keeps the sidebar (UAT REM-H05).
  if (/^\/student\/[^/]+\/(assessment|remedial)\/(?!latihan\/)[^/]+/.test(pathname)) return null;

  return (
    <AppSidebar basePath={`/student/${subject}`} help={help} homeHref="/student" initialCollapsed={initialCollapsed} items={studentNavItems} />
  );
}
