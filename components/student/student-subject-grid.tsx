"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { ConfirmModal } from "@/components/curriculum/confirm-modal";
import {
  AddSubjectCard,
  SubjectCard,
  subjectGridClassName,
  subjectGridOuterClassName,
} from "@/components/subject-select/subject-card";
import { leaveSubjectAction } from "@/lib/actions/student-subjects";
import type { Subject } from "@/lib/api/types";
import { JoinSubjectModal } from "./join-subject-modal";

// initialJoinCode comes from a teacher's join link (/join/{code} → /student?join={code}).
export function StudentSubjectGrid({ subjects, initialJoinCode }: { subjects: Subject[]; initialJoinCode?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [joinOpen, setJoinOpen] = useState(Boolean(initialJoinCode));
  // Kept in state because the prop disappears once ?join= is removed from the URL below.
  const [prefilledCode, setPrefilledCode] = useState(initialJoinCode ?? "");
  const [toast, setToast] = useState<string>();
  // Keluar dari kelas (UAT MAPEL-H05, MAPEL-U02).
  const [leaving, setLeaving] = useState<Subject | null>(null);
  const [leaveError, setLeaveError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function closeLeave() {
    setLeaving(null);
    setLeaveError(undefined);
  }

  function confirmLeave() {
    if (!leaving) return;
    const subject = leaving;
    startTransition(async () => {
      const result = await leaveSubjectAction(subject.id);
      if (result.status === "error") return setLeaveError(result.message);
      closeLeave();
      setToast(`Kamu sudah keluar dari ${subject.name}.`);
      router.refresh();
    });
  }

  // Drop ?join= from the URL so a refresh does not reopen the modal.
  useEffect(() => {
    if (initialJoinCode) router.replace(pathname, { scroll: false });
  }, [initialJoinCode, pathname, router]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(undefined), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  // The link's code is only offered once; opening the modal again starts empty.
  const closeJoin = useCallback(() => {
    setJoinOpen(false);
    setPrefilledCode("");
  }, []);
  const handleJoined = useCallback(
    (subjectName: string, alreadyJoined: boolean) => {
      closeJoin();
      setToast(alreadyJoined ? `Kamu sudah tergabung di ${subjectName}.` : `Berhasil bergabung ke ${subjectName}.`);
    },
    [closeJoin],
  );

  return (
    <>
      {subjects.length === 0 && (
        <p className="text-sm text-[#45474c]">Kamu belum mengikuti kelas apa pun. Masukkan kode dari guru kamu.</p>
      )}
      <div className={subjectGridOuterClassName}>
        <div className={subjectGridClassName}>
          {subjects.map((subject) => (
            <SubjectCard
              href={`/student/${subject.slug}/dashboard`}
              key={subject.id}
              onLeave={() => setLeaving(subject)}
              subject={subject}
            />
          ))}
          <AddSubjectCard label="Ikut Kelas Baru" onClick={() => setJoinOpen(true)} />
        </div>
      </div>

      <ConfirmModal
        cancelLabel="Batal"
        confirmLabel="Keluar dari Kelas"
        description={
          leaving
            ? `Kamu akan keluar dari ${leaving.name} ${leaving.class.name}. Nilai dan hasil asesmenmu tetap tersimpan, dan kamu bisa bergabung lagi dengan kode kelas dari gurumu.`
            : ""
        }
        error={leaveError}
        onClose={closeLeave}
        onConfirm={confirmLeave}
        open={Boolean(leaving)}
        pending={pending}
        pendingLabel="Memproses..."
        title="Keluar dari kelas ini?"
      />

      <JoinSubjectModal
        initialCode={prefilledCode}
        onClose={closeJoin}
        onJoined={handleJoined}
        open={joinOpen}
      />

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
