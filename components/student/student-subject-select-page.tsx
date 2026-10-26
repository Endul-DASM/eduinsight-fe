import { SubjectSelectShell } from "@/components/subject-select/subject-select-shell";
import type { CurrentUser, Subject } from "@/lib/api/types";
import { StudentSubjectGrid } from "./student-subject-grid";

// Pilihan Mapel (Figma New Design 181:8656): the student's first page after signing in.
export function StudentSubjectSelectPage({
  user,
  subjects,
  initialJoinCode,
}: {
  user: CurrentUser;
  subjects: Subject[];
  initialJoinCode?: string;
}) {
  return (
    <SubjectSelectShell subtitle="Silakan pilih mata pelajaran" user={user}>
      <StudentSubjectGrid initialJoinCode={initialJoinCode} subjects={subjects} />
    </SubjectSelectShell>
  );
}
