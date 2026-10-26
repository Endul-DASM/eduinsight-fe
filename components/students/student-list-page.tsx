"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { ConfirmModal } from "@/components/curriculum/confirm-modal";
import { sectionClassName } from "@/components/curriculum/styles";
import { MaskIcon } from "@/components/ui/mask-icon";
import { removeStudentAction } from "@/lib/actions/subjects";
import type { EnrolledStudent } from "@/lib/api/subjects";
import type { Subject } from "@/lib/api/types";
import { initialsOf } from "@/lib/diagnosis";
import type { StudentRecommendation } from "@/lib/remedial";
import { semesterOf } from "@/lib/student-assessment";
import { StudentMaterialsModal } from "./student-materials-modal";

// Daftar Siswa (UAT MAPEL-H04, MAPEL-U04, SIS-H04; Figma New Design 265:8593): the students who joined, a search,
// Lihat Materi and Lihat Diagnosis per student, and taking a student out of the subject.
export function StudentListPage({
  subject,
  students,
  recommendations,
}: {
  subject: Subject;
  students: EnrolledStudent[];
  // Each student's recommended materials, by student id.
  recommendations: Record<string, StudentRecommendation[]>;
}) {
  const [query, setQuery] = useState("");
  const [viewing, setViewing] = useState<EnrolledStudent | null>(null);
  const [removing, setRemoving] = useState<EnrolledStudent | null>(null);
  const [removeError, setRemoveError] = useState<string>();
  const [toast, setToast] = useState<string>();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(undefined), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const needle = query.trim().toLowerCase();
  const shown = students.filter(
    (student) => !needle || `${student.name} ${student.username} ${student.nis ?? ""}`.toLowerCase().includes(needle),
  );
  const classLabel = `${subject.name} ${subject.class.name}`;

  function closeRemove() {
    setRemoving(null);
    setRemoveError(undefined);
  }

  function confirmRemove() {
    if (!removing) return;
    const student = removing;
    startTransition(async () => {
      const result = await removeStudentAction(subject.slug, subject.id, student.id);
      if (result.status === "error") return setRemoveError(result.message);
      closeRemove();
      setToast(`${student.name} sudah dikeluarkan dari kelas.`);
    });
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8">
      <h2 className="text-2xl font-bold leading-normal text-[#1b1b1d] sm:text-[32px]">
        Daftar Siswa {subject.name} kelas {subject.class.name}
      </h2>

      <section className={sectionClassName}>
        <div className="flex items-center gap-3">
          <MaskIcon className="size-6 shrink-0 text-[#0058be]" src="/dashboard/nav-students.svg" />
          <div className="min-w-0 leading-normal">
            <p className="truncate text-xl font-semibold text-[#1b1b1d]">{classLabel}</p>
            <p className="text-xs text-[#45474c]">
              Semester {semesterOf()} {subject.class.academicYear}, {students.length} siswa
            </p>
          </div>
        </div>
        <hr className="border-[#c5c6cd]" />

        <label className="flex h-[50px] w-full items-center gap-3 rounded-xl border border-[#c5c6cd] bg-[#fbf8fa] px-3 focus-within:border-[#0058be]">
          <input
            aria-label="Cari siswa"
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#75777d]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari Siswa..."
            value={query}
          />
          <Image alt="" height={22} src="/assessment/search.svg" width={22} />
        </label>

        {students.length === 0 ? (
          <p className="py-6 text-center text-sm leading-normal text-[#45474c]">
            Belum ada siswa yang bergabung.
            {subject.joinCode ? ` Bagikan kode kelas ${subject.joinCode} dari Dashboard.` : " Bagikan kode kelas dari Dashboard."}
          </p>
        ) : shown.length === 0 ? (
          <p className="py-6 text-center text-sm leading-normal text-[#45474c]">Tidak ada siswa yang cocok dengan pencarian.</p>
        ) : (
          <ul className="flex flex-col">
            {shown.map((student) => (
              <li className="flex flex-wrap items-center gap-3 border-b border-[#c5c6cd] py-3 last:border-b-0 sm:flex-nowrap sm:gap-4" key={student.id}>
                <span className="grid size-[55px] shrink-0 place-items-center rounded-full bg-[#e6eff9] text-base font-bold text-[#004695]">
                  {initialsOf(student.name)}
                </span>
                <div className="min-w-0 flex-1 leading-normal">
                  <p className="truncate text-base font-semibold text-[#1b1b1d]">{student.name}</p>
                  <p className="truncate text-xs text-[#75777d]">
                    @{student.username}
                    {student.nis ? `, NIS ${student.nis}` : ""}
                  </p>
                </div>
                <div className="ml-auto flex shrink-0 items-center gap-1 max-sm:order-last max-sm:w-full max-sm:justify-end">
                  <button
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-[#0058be] hover:bg-[#e6eff9]"
                    onClick={() => setViewing(student)}
                    type="button"
                  >
                    Lihat Materi{recommendations[student.id]?.length ? ` (${recommendations[student.id].length})` : ""}
                  </button>
                  <Link
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-[#0058be] hover:bg-[#e6eff9]"
                    href={`/${subject.slug}/analysis?tab=diagnosis&view=siswa&student=${encodeURIComponent(student.id)}`}
                  >
                    Lihat Diagnosis
                  </Link>
                </div>
                <button
                  aria-label={`Keluarkan ${student.name} dari kelas`}
                  className="grid size-7 shrink-0 place-items-center rounded-md hover:bg-[#fee2e2]"
                  onClick={() => setRemoving(student)}
                  title="Keluarkan dari kelas"
                  type="button"
                >
                  <Image alt="" height={16} src="/materials/trash.svg" width={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <StudentMaterialsModal
        materials={viewing ? (recommendations[viewing.id] ?? []) : []}
        onClose={() => setViewing(null)}
        student={viewing}
      />

      <ConfirmModal
        cancelLabel="Batal"
        confirmLabel="Keluarkan"
        description={
          removing
            ? `${removing.name} tidak bisa lagi membuka ${classLabel} dan asesmennya. Nilai yang sudah ada tetap tersimpan, dan ${removing.name} bisa bergabung lagi dengan kode kelas.`
            : ""
        }
        error={removeError}
        onClose={closeRemove}
        onConfirm={confirmRemove}
        open={Boolean(removing)}
        pending={pending}
        pendingLabel="Mengeluarkan..."
        title={removing ? `Keluarkan ${removing.name} dari kelas?` : ""}
      />

      <p
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-[#091426] px-4 py-3 text-sm text-white shadow-lg transition-opacity ${toast ? "opacity-100" : "pointer-events-none opacity-0"}`}
        role="status"
      >
        {toast}
      </p>
    </div>
  );
}
