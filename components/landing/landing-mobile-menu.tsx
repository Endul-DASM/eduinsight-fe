"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";
import type { LandingNavLink } from "./landing-shell";

// The hamburger menu of the landing top bar on phones (Figma New Design 19:1684).
export function LandingMobileMenu({ links, actions }: { links: LandingNavLink[]; actions: LandingNavLink[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const pathname = usePathname();
  const [openedAt, setOpenedAt] = useState(pathname);

  if (open && openedAt !== pathname) setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="md:hidden" ref={rootRef}>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        aria-label={open ? "Tutup menu" : "Buka menu"}
        className="grid size-10 place-items-center rounded-xl text-[#1b1b1d] hover:bg-[#e6eff9]"
        onClick={() => {
          setOpenedAt(pathname);
          setOpen((value) => !value);
        }}
        type="button"
      >
        <svg aria-hidden className="size-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={2} viewBox="0 0 24 24">
          {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>
      {open && (
        <div
          className="absolute inset-x-4 top-[calc(100%+8px)] z-30 flex flex-col gap-1 rounded-2xl bg-[#fafbfd] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
          id={panelId}
        >
          {links.map((link) => (
            <Link
              aria-current={link.active ? "page" : undefined}
              className={cn(
                "rounded-xl px-3 py-2.5 text-base font-semibold hover:bg-[#e6eff9]",
                link.active ? "text-[#0058be]" : "text-[#1b1b1d]",
              )}
              href={link.href}
              key={link.label}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-[#eae7e9] pt-3">
            {actions.map((action) => (
              <Link
                className={cn(
                  "truncate rounded-xl px-4 py-2.5 text-center text-base font-semibold",
                  action.primary ? "bg-[#0058be] text-[#f5f3f4]" : "border-2 border-[#0058be] text-[#0058be]",
                )}
                href={action.href}
                key={action.label}
                onClick={() => setOpen(false)}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
