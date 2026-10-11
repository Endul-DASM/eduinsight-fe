"use client";

import { useCallback, useEffect, useState } from "react";
import type { Subject } from "@/lib/api/types";
import { DeleteSubjectModal } from "./delete-subject-modal";
import { AddSubjectCard, SubjectCard, subjectGridClassName, subjectGridOuterClassName } from "./subject-card";
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
      <div className={subjectGridOuterClassName}>
        <div className={subjectGridClassName}>
          {subjects.map((subject) => (
            <SubjectCard
              actions={{
                onCopyLink: () => copyJoinLink(subject),
                onDelete: () => setModal({ kind: "delete", subject }),
                onEdit: () => setModal({ kind: "edit", subject }),
              }}
              href={`/${subject.slug}/dashboard`}
              key={subject.id}
              subject={subject}
            />
          ))}
          <AddSubjectCard label="Buat Kelas Baru" onClick={() => setModal({ kind: "create" })} />
        </div>
      </div>

      <SubjectFormModal onClose={closeModal} open={modal?.kind === "create"} subjects={subjects} />
      <SubjectFormModal
        onClose={closeModal}
        open={modal?.kind === "edit"}
        subject={modal?.kind === "edit" ? modal.subject : undefined}
        subjects={subjects}
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
