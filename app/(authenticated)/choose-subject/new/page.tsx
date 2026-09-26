import { redirect } from "next/navigation";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicTopNav } from "@/components/layout/public-top-nav";
import { SubjectForm } from "@/components/subject-select/subject-form";
import { getClasses } from "@/lib/api/classes";
import { getCurrentUser, getTeachers } from "@/lib/api/users";

// The Indonesian academic year starts in July.
function currentAcademicYear(now = new Date()) {
  const startYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  return `${startYear}/${startYear + 1}`;
}

export default async function NewSubjectRoute() {
  const user = await getCurrentUser();
  if (user.role === "siswa") redirect("/student/dashboard");

  const isAdmin = user.role === "admin";
  const [classes, teachers] = await Promise.all([getClasses(), isAdmin ? getTeachers() : null]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PublicTopNav />
      <main className="flex flex-1 justify-center bg-[rgba(251,248,250,0.5)] px-4 py-12 sm:px-6 md:py-20">
        <div className="w-full max-w-[40rem] rounded-xl border border-[#c5c6cd] bg-white p-6 shadow-[0_10px_40px_-10px_rgba(8,90,192,0.15)] sm:p-8">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-black">Tambah Mata Pelajaran</h1>
          <p className="mb-6 mt-1 text-sm text-[#45474c]">
            {isAdmin
              ? "Buat mata pelajaran untuk satu kelas, lalu tugaskan guru pengampunya."
              : "Buat mata pelajaran untuk satu kelas. Anda otomatis menjadi guru pengampunya."}
          </p>
          <SubjectForm classes={classes} defaultAcademicYear={currentAcademicYear()} teachers={teachers} />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
