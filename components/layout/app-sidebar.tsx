"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { outlineButtonClassName } from "@/components/auth/styles";
import { cn } from "@/components/ui/cn";
import { MaskIcon } from "@/components/ui/mask-icon";
import { logout } from "@/lib/actions/auth";

type NavItem = {
  label: string;
  // Relative to the current subject, e.g. /matematika-x-ipa-1/dashboard. Null for a page that is not built yet.
  href: string | null;
  icon: string;
};

// Figma New Design 22:4162. Diagnosis is not in the menu; it opens from the dashboard's "Tinjau" link.
const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "/dashboard/nav-dashboard-active.svg" },
  { label: "Kurikulum", href: null, icon: "/dashboard/nav-kurikulum.svg" },
  { label: "Asesmen", href: "/assessment", icon: "/dashboard/nav-asesmen.svg" },
  { label: "Remedial", href: "/remedial", icon: "/dashboard/nav-remedial.svg" },
  { label: "Analisis Soal", href: "/analysis", icon: "/dashboard/nav-analisis.svg" },
];

const itemClassName = "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-base font-semibold leading-normal";

function NavLink({ item, subject, pathname }: { item: NavItem; subject: string; pathname: string }) {
  const icon = <MaskIcon className="size-6" src={item.icon} />;

  if (!item.href) {
    return (
      <span aria-disabled className={cn(itemClassName, "cursor-not-allowed text-[#75777d]")}>
        {icon}
        {item.label}
        <span className="ml-auto rounded-3xl bg-[rgba(153,188,229,0.6)] px-2 py-0.5 text-[10px] text-[#004695]">
          Segera
        </span>
      </span>
    );
  }

  const href = `/${subject}${item.href}`;
  // Nested pages, e.g. /{slug}/assessment/{id}, keep their menu item highlighted.
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        itemClassName,
        "transition-colors",
        active ? "bg-[#0058be] text-[#f5f3f4]" : "text-[#1b1b1d] hover:bg-[#e6eff9] hover:text-[#0058be]",
      )}
      href={href}
    >
      {icon}
      {item.label}
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { subject } = useParams<{ subject: string }>();

  return (
    <aside className="relative z-10 flex w-full shrink-0 flex-col gap-6 bg-[#fafbfd] px-4 py-4 md:sticky md:top-0 md:h-[calc(100vh/var(--app-zoom))] md:w-[312px] md:justify-between md:px-8 md:py-6">
      <div className="flex flex-col gap-4 md:gap-9">
        <Link className="flex items-center gap-2 px-2 py-2 md:py-4" href="/choose-subject">
          <Image alt="" className="size-10" height={40} src="/auth/logo.svg" width={40} />
          <span className="text-xl font-bold leading-normal text-[#1b1b1d]">EduInsight</span>
        </Link>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink item={item} key={item.label} pathname={pathname} subject={subject} />
          ))}
        </nav>
      </div>
      <div className="flex flex-col gap-[19px]">
        <form action={logout}>
          <button className={cn(outlineButtonClassName, "w-full")} type="submit">
            Logout
          </button>
        </form>
        <Link className={cn(itemClassName, "text-[#1b1b1d] hover:bg-[#e6eff9]")} href="#">
          <MaskIcon className="size-6" src="/auth/help-circle.svg" />
          Help
        </Link>
      </div>
    </aside>
  );
}
