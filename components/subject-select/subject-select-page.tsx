import type { CurrentUser, Subject } from "@/lib/api/types";
import { SubjectGrid } from "./subject-grid";
import { SubjectSelectShell } from "./subject-select-shell";

export function SubjectSelectPage({ subjects, user }: { subjects: Subject[]; user: CurrentUser }) {
  return (
    <SubjectSelectShell subtitle="Silakan pilih mata pelajaran yang ingin dipantau." userName={user.name}>
      <SubjectGrid subjects={subjects} />
    </SubjectSelectShell>
  );
}
