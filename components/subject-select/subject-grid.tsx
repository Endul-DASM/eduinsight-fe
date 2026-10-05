"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { Subject } from "@/lib/api/types";
import { DeleteSubjectModal } from "./delete-subject-modal";
import { SubjectCard } from "./subject-card";
import { SubjectFormModal } from "./subject-form-modal";

type OpenModal = { kind: "create" } | { kind: "edit"; subject: Subject } | { kind: "delete"; subject: Subject } | null;

export function SubjectGrid({ subjects }: { subjects: Subject[] }) {
  const [modal, setModal] = useState<OpenModal>(null);
  const [toast, setToast] = useState<string>();
  const closeModal = useCallback(() => setModal(null), []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(undefined), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Students join with this link; the backend does not issue join codes yet.
  async function copyJoinLink(subject: Subject) {
    if (!subject.joinCode) {
      setToast("Link join belum tersedia.");
      return;
    }
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/join/${encodeURIComponent(subject.joinCode)}`);
      setToast("Link join disalin.");
    } catch {
      setToast("Gagal menyalin link. Coba lagi.");
    }
  }

  return (
    <>
      {subjects.length === 0 && (
        <p className="text-sm text-[#45474c]">Belum ada mata pelajaran. Buat kelas pertama Anda.</p>
      )}
      {/* The list scrolls once it outgrows the space (Figma note: "Ini bisa scroll"). */}
      <div className="max-h-[374px] w-full overflow-y-auto overflow-x-clip p-1">
        <div className="mx-auto grid w-fit grid-cols-2 gap-4 sm:grid-cols-[repeat(3,214px)] sm:gap-8 lg:grid-cols-[repeat(5,214px)]">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              onCopyLink={() => copyJoinLink(subject)}
              onDelete={() => setModal({ kind: "delete", subject })}
              onEdit={() => setModal({ kind: "edit", subject })}
              subject={subject}
            />
          ))}
          <button
            className="flex min-h-[150px] w-full flex-col items-center justify-center gap-1 rounded-xl border border-[#c5c6cd] bg-white p-3 text-[#45474c] transition-shadow hover:shadow-[0_10px_24px_-8px_rgba(8,90,192,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0058be]"
            onClick={() => setModal({ kind: "create" })}
            type="button"
          >
            <span className="mb-4 grid size-16 place-items-center rounded-full bg-[#d8e2ff]">
              <Image alt="" height={17.5} src="/subjects/actions/plus.svg" width={17.5} />
            </span>
            <span className="text-base font-semibold leading-7">Buat Kelas Baru</span>
          </button>
        </div>
      </div>

      <SubjectFormModal onClose={closeModal} open={modal?.kind === "create"} />
      <SubjectFormModal
        onClose={closeModal}
        open={modal?.kind === "edit"}
        subject={modal?.kind === "edit" ? modal.subject : undefined}
      />
      <DeleteSubjectModal onClose={closeModal} subject={modal?.kind === "delete" ? modal.subject : undefined} />

      <p
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-[#091426] px-4 py-3 text-sm text-white shadow-lg transition-opacity ${toast ? "opacity-100" : "pointer-events-none opacity-0"}`}
        role="status"
      >
        {toast}
      </p>
    </>
  );
}
