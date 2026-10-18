"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import { outlineButtonClassName } from "@/components/auth/styles";
import { cn } from "@/components/ui/cn";
import { MaskIcon } from "@/components/ui/mask-icon";
import { SIDEBAR_COLLAPSED, SIDEBAR_COOKIE } from "@/lib/sidebar";

export type NavItem = {
  label: string;
  // Relative to the workspace, e.g. /dashboard under /matematika-x-ipa-1. Null for a page that is not built yet.
  href: string | null;
  icon: string;
};

// Figma New Design 22:4162. Diagnosis is not in the menu; it opens from the dashboard's "Tinjau" link.
const teacherNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "/dashboard/nav-dashboard-active.svg" },
  { label: "Kurikulum", href: "/curriculum", icon: "/dashboard/nav-kurikulum.svg" },
  { label: "Asesmen", href: "/assessment", icon: "/dashboard/nav-asesmen.svg" },
  { label: "Remedial", href: "/remedial", icon: "/dashboard/nav-remedial.svg" },
  { label: "Analisis Soal", href: "/analysis", icon: "/dashboard/nav-analisis.svg" },
];

// Bantuan: FAQ and Pusat Bantuan (SRS FR-X-030), at the bottom of the sidebar.
const helpItem: NavItem = { label: "Bantuan", href: "/help", icon: "/auth/help-circle.svg" };

const itemClassName = "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-base font-semibold leading-normal";

function NavLink({ item, basePath, pathname, collapsed }: { item: NavItem; basePath: string; pathname: string; collapsed: boolean }) {
  const icon = <MaskIcon className="size-6" src={item.icon} />;
  // Collapsed, only the icon shows; the label stays for screen readers and as a tooltip.
  const label = collapsed ? <span className="sr-only">{item.label}</span> : item.label;
  const shape = collapsed && "justify-center px-0";

  if (!item.href) {
    return (
      <span aria-disabled className={cn(itemClassName, shape, "cursor-not-allowed text-[#75777d]")} title={item.label}>
        {icon}
        {label}
        {!collapsed && (
          <span className="ml-auto rounded-3xl bg-[rgba(153,188,229,0.6)] px-2 py-0.5 text-[10px] text-[#004695]">Segera</span>
        )}
      </span>
    );
  }

  const href = `${basePath}${item.href}`;
  // Nested pages, e.g. /{slug}/assessment/{id}, keep their menu item highlighted.
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        itemClassName,
        shape,
        "transition-colors",
        active ? "bg-[#0058be] text-[#f5f3f4]" : "text-[#1b1b1d] hover:bg-[#e6eff9] hover:text-[#0058be]",
      )}
      href={href}
      title={collapsed ? item.label : undefined}
    >
      {icon}
      {label}
    </Link>
  );
}

// The workspace sidebar. Teachers get their menu under /{slug}; the student workspace passes its own items, base
// path (/student/{slug}), subject list and help item.
export function AppSidebar({
  initialCollapsed = false,
  items = teacherNavItems,
  basePath,
  homeHref = "/choose-subject",
  help = helpItem,
}: {
  initialCollapsed?: boolean;
  items?: NavItem[];
  basePath?: string;
  homeHref?: string;
  // The Bantuan item at the bottom, relative to the base path like the menu items.
  help?: NavItem;
}) {
  const pathname = usePathname();
  const { subject } = useParams<{ subject: string }>();
  const base = basePath ?? `/${subject}`;
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${SIDEBAR_COOKIE}=${next ? SIDEBAR_COLLAPSED : "expanded"}; path=/; max-age=31536000; samesite=lax`;
  }

  const toggleButton = (
    <button
      aria-expanded={!collapsed}
      aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
      className="grid size-9 shrink-0 place-items-center rounded-xl text-[#45474c] transition-colors hover:bg-[#e6eff9] hover:text-[#0058be]"
      onClick={toggle}
      title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
      type="button"
    >
      <MaskIcon className={cn("size-6", collapsed && "rotate-180")} src="/assessment/chevron-left.svg" />
    </button>
  );

  return (
    <aside
      className={cn(
        "relative z-10 flex w-full shrink-0 flex-col gap-6 bg-[#fafbfd] px-4 py-4 transition-[width] duration-100 ease-out motion-reduce:transition-none md:sticky md:top-0 md:h-[calc(100vh/var(--app-zoom))] md:justify-between md:py-6",
        collapsed ? "md:w-24 md:px-4" : "md:w-[312px] md:px-8",
      )}
    >
      <div className="flex flex-col gap-4 md:gap-9">
        <div className={cn("flex items-center justify-between gap-2", collapsed && "md:flex-col md:justify-start")}>
          <Link className="flex items-center gap-2 px-2 py-2 md:py-4" href={homeHref} title="EduInsight">
            <Image alt="" className="size-10 shrink-0" height={40} src="/auth/logo.svg" width={40} />
            <span className={cn("text-xl font-bold leading-normal text-[#1b1b1d]", collapsed && "md:sr-only")}>EduInsight</span>
          </Link>
          {toggleButton}
        </div>
        <nav className={cn("flex flex-col gap-2", collapsed && "max-md:hidden")}>
          {items.map((item) => (
            <NavLink basePath={base} collapsed={collapsed} item={item} key={item.label} pathname={pathname} />
          ))}
        </nav>
      </div>
      <div className={cn("flex flex-col gap-[19px]", collapsed && "max-md:hidden")}>
        {/* Back to the subject select (Figma New Design 22:4162); Logout moved to the top bar's account menu. */}
        <Link
          className={cn(outlineButtonClassName, "w-full gap-3", collapsed && "px-0")}
          href={homeHref}
          title={collapsed ? "Halaman Mapel" : undefined}
        >
          <MaskIcon className="size-5.5" src="/assessment/arrow-left.svg" />
          {collapsed ? <span className="sr-only">Halaman Mapel</span> : "Halaman Mapel"}
        </Link>
        <NavLink basePath={base} collapsed={collapsed} item={help} pathname={pathname} />
      </div>
    </aside>
  );
}
