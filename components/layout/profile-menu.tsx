"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";
import { logout } from "@/lib/actions/auth";
import type { CurrentUser } from "@/lib/api/types";
import { firstName } from "@/lib/display-name";
import { profilePhotoUrl } from "@/lib/profile-form";

const itemClassName =
  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#1b1b1d] transition-colors hover:bg-[#e6eff9]";

function UserIcon() {
  return (
    <svg aria-hidden className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg aria-hidden className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="m10 17 5-5-5-5" />
      <path d="M15 12H3" />
    </svg>
  );
}

// Account menu of the teacher and student top bars (Figma New Design 22:4162, popup 187:10090): Profile and Logout.
export function ProfileMenu({
  profileHref,
  subjectLabel,
  user,
}: {
  profileHref: string;
  subjectLabel: string;
  user: CurrentUser;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const pathname = usePathname();
  const photo = profilePhotoUrl(user.photoUpdatedAt);
  const [openedAt, setOpenedAt] = useState(pathname);

  // Close when the page changes.
  if (open && openedAt !== pathname) {
    setOpen(false);
  }

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
    <div className="relative" ref={rootRef}>
      <button
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-3 rounded-2xl py-1 pl-1 pr-2 text-left transition-colors hover:bg-[#e6eff9]"
        onClick={() => {
          setOpenedAt(pathname);
          setOpen((value) => !value);
        }}
        type="button"
      >
        <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[#e6eff9] text-base font-bold text-[#004695]">
          {photo ? (
            // Served by app/api/me/photo with the session token; next/image would fetch it without the cookie.
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="size-full object-cover" src={photo} />
          ) : (
            user.initials
          )}
        </span>
        <span className="hidden max-w-[200px] leading-tight text-[#1b1b1d] sm:block">
          <span className="block truncate text-lg font-semibold">{firstName(user.name)}</span>
          <span className="block truncate text-xs">{subjectLabel}</span>
        </span>
        <Image
          alt=""
          className={cn("transition-transform", open && "rotate-180")}
          height={20}
          src="/assessment/chevron-down.svg"
          width={20}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] z-30 flex w-[240px] flex-col gap-1 rounded-2xl bg-[#fafbfd] p-2 shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
          id={menuId}
          role="menu"
        >
          <Link className={itemClassName} href={profileHref} role="menuitem">
            <UserIcon />
            Profile
          </Link>
          <form action={logout}>
            <button className={itemClassName} role="menuitem" type="submit">
              <LogoutIcon />
              Logout
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
