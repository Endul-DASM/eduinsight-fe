import { redirect } from "next/navigation";
import { ProfilePage } from "@/components/account/profile-page";
import { AccountShell } from "@/components/subject-select/subject-select-shell";
import { getCurrentUser } from "@/lib/api/users";

// /profile — the teacher's Edit Profile from the account menu on Pilih Mapel, before a subject is chosen.
export default async function TeacherAccountProfileRoute() {
  const user = await getCurrentUser();
  if (user.role === "siswa") redirect("/student/profile");

  return (
    <AccountShell user={user}>
      <main className="flex-1">
        <ProfilePage back={{ href: "/choose-subject", label: "Pilih Mata Pelajaran" }} user={user} />
      </main>
    </AccountShell>
  );
}
