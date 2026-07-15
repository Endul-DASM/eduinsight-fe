"use client";

import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import {
  BookIcon,
  ClipboardIcon,
  GridIcon,
  LifeBuoyIcon,
  PlusIcon,
  RadarIcon,
  SettingsIcon,
} from "@/components/ui/icons";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const primaryNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: GridIcon },
  { label: "Diagnosis", href: "/diagnosis", icon: RadarIcon },
  { label: "Asesmen", href: "/assessment", icon: ClipboardIcon },
  { label: "Remedial", href: "/remedial", icon: LifeBuoyIcon },
  { label: "Analisis Soal", href: "/analysis", icon: BookIcon },
];

const secondaryNav: NavItem[] = [
  { label: "Settings", href: "#", icon: SettingsIcon },
  { label: "Help", href: "#", icon: LifeBuoyIcon },
];

function BrandLogo() {
  return (
    <div className="flex items-center gap-3 px-2 py-4">
      <div className="flex size-10 items-center justify-center rounded-[10px] bg-[#0058be] text-white">
        <GridIcon className="size-5" />
      </div>
      <div>
        <p className="text-xl font-bold text-[#1b1b1d]">EduInsight</p>
        <p className="text-[10px] text-[#45474c]">AI Learning Partner</p>
      </div>
    </div>
  );
}

function NavLink({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex w-full items-center gap-4 rounded-[10px] px-4 py-2 text-left transition-colors",
        active
          ? "bg-[#2170e4] text-white"
          : "text-[#222222] hover:bg-white hover:text-[#0058be]",
      )}
      href={item.href}
    >
      <Icon className="size-[18px]" />
      <span className="text-xs font-semibold tracking-[0.04em]">{item.label}</span>
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col gap-6 border-b border-[#c5c6cd] bg-[#f5f3f4] px-4 py-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <BrandLogo />
      <nav className="flex flex-1 flex-col gap-8 pt-2">
        <div className="space-y-1">
          {primaryNav.map((item) => (
            <NavLink item={item} active={pathname === item.href} key={item.label} />
          ))}
        </div>
        <div className="mt-auto space-y-6">
          <Button className="w-full justify-center" size="md">
            <PlusIcon className="size-4" />
            Buat Asesmen
          </Button>
          <div className="space-y-1 border-t border-[#c5c6cd] pt-4">
            {secondaryNav.map((item) => (
              <NavLink item={item} active={false} key={item.label} />
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
