"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { outlineButtonClassName } from "@/components/auth/styles";
import { ConfirmModal } from "@/components/curriculum/confirm-modal";
import { ghostButtonClassName, iconButtonClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import { deleteAssessmentAction, unpublishAction } from "@/lib/actions/assessments";
import type { AssessmentCard as Card } from "@/lib/assessment-list";
import { assessmentTypeLabels, cardStatus, formatLongSchedule } from "@/lib/assessment-form";

function InfoRow({ icon, children }: { icon: string; children: string }) {
  return (
    <p className="flex items-center gap-2 text-xs leading-normal text-[#45474c]">
      <Image alt="" className="shrink-0" height={24} src={icon} width={24} />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

function MenuLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      className="rounded-xl px-3 py-2 text-sm font-semibold text-[#1b1b1d] hover:bg-[#e6eff9] focus-visible:bg-[#e6eff9] focus-visible:outline-none"
      href={href}
      role="menuitem"
    >
      {children}
    </Link>
  );
}

// One assessment in Daftar Asesmen (Figma New Design 54:7817, 59:3682). The ⋮ menu is not designed; it holds the
// actions the backend allows for the status.
export function AssessmentCard({ slug, card }: { slug: string; card: Card }) {
  const { assessment } = card;
  const status = cardStatus[assessment.status];
  const editHref = `/${slug}/assessment/${assessment.id}`;
  const questionsHref = `/${slug}/assessment/${assessment.id}/soal`;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();

  // The menu closes on Escape or a click elsewhere.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    const onClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [menuOpen]);

  function unpublish() {
    setMenuOpen(false);
    setMessage(undefined);
    startTransition(async () => {
      const result = await unpublishAction(slug, assessment.id);
      if (result?.status === "error") setMessage(result.message);
    });
  }

  function remove() {
    setMessage(undefined);
    startTransition(async () => {
      // Redirects to the list on success.
      const result = await deleteAssessmentAction(slug, assessment.id);
      if (result?.status === "error") setMessage(result.message);
    });
  }

  return (
    <article className="flex min-h-[390px] flex-col justify-between gap-6 rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className={cn("rounded-3xl px-2 py-1 text-xs font-semibold leading-normal", status.className)}>
            {status.label}
          </span>
          <div className="relative" ref={menuRef}>
            <button
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label={`Aksi untuk ${assessment.title}`}
              className={iconButtonClassName}
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              <Image alt="" height={20} src="/assessment/ellipsis-vertical.svg" width={20} />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-full z-10 mt-1 flex w-52 flex-col gap-1 rounded-2xl border border-[#c5c6cd] bg-[#fafbfd] p-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                role="menu"
              >
                {assessment.status === "draft" ? (
                  <>
                    <MenuLink href={editHref}>Lanjut Edit</MenuLink>
                    <MenuLink href={questionsHref}>Lihat Soal</MenuLink>
                    <button
                      className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#dc2626] hover:bg-[#ffeded]"
                      onClick={() => {
                        setMenuOpen(false);
                        setDeleting(true);
                      }}
                      role="menuitem"
                      type="button"
                    >
                      Hapus Draf
                    </button>
                  </>
                ) : (
                  <>
                    <MenuLink href={questionsHref}>Lihat Soal</MenuLink>
                    {assessment.status === "scheduled" && (
                      <button
                        className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#1b1b1d] hover:bg-[#e6eff9]"
                        disabled={pending}
                        onClick={unpublish}
                        role="menuitem"
                        type="button"
                      >
                        Batalkan Publikasi
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <h3 className="text-xl font-bold leading-normal text-[#1b1b1d]">{assessment.title}</h3>

        <div className="flex flex-col gap-2">
          <InfoRow icon="/assessment/clipboard-check.svg">{assessmentTypeLabels[assessment.type]}</InfoRow>
          <InfoRow icon="/assessment/calendar-days.svg">{formatLongSchedule(assessment.opensAt)}</InfoRow>
          <InfoRow icon="/assessment/file-text.svg">{card.chapters.length > 0 ? card.chapters.join(", ") : "Belum ada Bab"}</InfoRow>
          <InfoRow icon="/assessment/notebook-text.svg">
            {card.objectiveNumbers.length > 0 ? `TP ${card.objectiveNumbers.join(", ")}` : "Belum ada TP"}
          </InfoRow>
        </div>

        {card.activeStudents !== null && card.activeStudents > 0 && (
          <p className="flex items-center gap-1 text-xs font-bold uppercase leading-normal text-[#0058be]">
            <span aria-hidden className="size-2 rounded-full bg-[#0058be]" />
            {card.activeStudents} siswa sedang mengerjakan
          </p>
        )}
        {message && (
          <p className="rounded-lg bg-[#ffdad6] px-3 py-2 text-xs leading-5 text-[#93000a]" role="alert">
            {message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {assessment.status === "draft" ? (
          <Link className={cn(ghostButtonClassName, "w-full")} href={editHref}>
            Lanjut Edit
          </Link>
        ) : (
          <Link className={cn(outlineButtonClassName, "w-full")} href={questionsHref}>
            Lihat Soal
          </Link>
        )}
        {assessment.status === "closed" && (
          <Link className={cn(ghostButtonClassName, "w-full")} href={`/${slug}/assessment?tab=hasil`}>
            Lihat Hasil
          </Link>
        )}
      </div>

      <ConfirmModal
        description={`Draf "${assessment.title}" akan dihapus permanen. Soal yang sudah dibuat tetap ada di Bank Soal.`}
        error={deleting ? message : undefined}
        onClose={() => setDeleting(false)}
        onConfirm={remove}
        open={deleting}
        pending={pending}
        title="Apakah Anda yakin ingin menghapus draf asesmen ini?"
      />
    </article>
  );
}
