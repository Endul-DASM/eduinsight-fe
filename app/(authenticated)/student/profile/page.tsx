import { redirect } from "next/navigation";
import { ProfilePage } from "@/components/account/profile-page";
import { AccountShell } from "@/components/subject-select/subject-select-shell";
import { isMockMode } from "@/lib/api/client";
import { mockStudent } from "@/lib/api/mocks";
import { getCurrentUser } from "@/lib/api/users";

// /student/profile — the student's Edit Profile from the account menu on Pilih Mapel, before a subject is chosen.
export default async function StudentAccountProfileRoute() {
  const user = isMockMode ? mockStudent : await getCurrentUser();
  if (user.role !== "siswa") redirect("/profile");

  return (
    <AccountShell user={user}>
      <main className="flex-1">
        <ProfilePage back={{ href: "/student", label: "Pilih Mata Pelajaran" }} user={user} />
      </main>
    </AccountShell>
  );
}
