import { SubjectSelectShell } from "@/components/subject-select/subject-select-shell";
import type { CurrentUser, Subject } from "@/lib/api/types";
import { StudentSubjectGrid } from "./student-subject-grid";

// Figma 236:3420: the student's first page after signing in.
export function StudentSubjectSelectPage({
  user,
  subjects,
  listUnavailable,
  initialJoinCode,
}: {
  user: CurrentUser;
  subjects: Subject[];
  // The backend does not serve the subject list to students yet.
  listUnavailable: boolean;
  initialJoinCode?: string;
}) {
  return (
    <SubjectSelectShell subtitle="Silakan pilih mata pelajaran yang ingin kamu pelajari." userName={user.name}>
      {listUnavailable && (
        <p className="rounded-lg bg-[#fff4d6] px-4 py-3 text-sm text-[#6b4e00]" role="status">
          Daftar mata pelajaran belum tersedia dari server.
        </p>
      )}
      <StudentSubjectGrid initialJoinCode={initialJoinCode} subjects={subjects} />
    </SubjectSelectShell>
  );
}
