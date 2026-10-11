import { notFound } from "next/navigation";
import { type CurriculumTab, CurriculumPage } from "@/components/curriculum/curriculum-page";
import { ApiError } from "@/lib/api/client";
import { getCurriculum } from "@/lib/api/curriculum";
import { getSubject } from "@/lib/api/subjects";
import type { CurriculumTree } from "@/lib/api/types";
import { getCurrentUser } from "@/lib/api/users";
import { firstName } from "@/lib/display-name";

// /{slug}/curriculum, ?bab={id} for one Bab, ?tab=materi for Upload Materi.
export default async function CurriculumRoute({ params, searchParams }: PageProps<"/[subject]/curriculum">) {
  const { subject: slug } = await params;
  const { tab, bab } = await searchParams;
  const [user, subject] = await Promise.all([getCurrentUser(), getSubject(slug)]);
  if (!subject) notFound();

  const activeTab: CurriculumTab = tab === "materi" ? "materi" : "kurikulum";
  let tree: CurriculumTree | null = null;
  let error: string | undefined;
  try {
    // Mock mode has no curriculum; show it empty so the page can still be explored.
    tree = (await getCurriculum(subject.id)) ?? { subjectId: subject.id, suggestedFase: null, cps: [], chapters: [] };
  } catch (caught) {
    error =
      caught instanceof ApiError && caught.code
        ? caught.message
        : "Kurikulum belum dapat dimuat dari server. Coba muat ulang halaman.";
  }

  return (
    <CurriculumPage
      error={error}
      selectedChapterId={typeof bab === "string" ? bab : null}
      subject={subject}
      tab={activeTab}
      teacherName={firstName(user.name)}
      tree={tree}
    />
  );
}
