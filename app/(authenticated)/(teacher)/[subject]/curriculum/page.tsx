import { notFound, unstable_rethrow } from "next/navigation";
import { type CurriculumTab, CurriculumPage } from "@/components/curriculum/curriculum-page";
import { ApiError } from "@/lib/api/client";
import { getCurriculum } from "@/lib/api/curriculum";
import { getMaterial, getMaterials, type Material } from "@/lib/api/materials";
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
    // An expired session makes apiFetch redirect to sign in, which works by throwing; let it through.
    unstable_rethrow(caught);
    error =
      caught instanceof ApiError && caught.code
        ? caught.message
        : "Kurikulum belum dapat dimuat dari server. Coba muat ulang halaman.";
  }

  let materials: { items: Material[]; objectiveNumbers: Record<string, string[]> } | undefined;
  if (activeTab === "materi" && tree) {
    try {
      const items = await getMaterials(subject.id);
      // The list has no TPs; read them from each confirmed material (FR-G-034 shows them per row).
      const confirmed = items.filter((material) => material.mappingConfirmedAt);
      const details = await Promise.all(confirmed.map((material) => getMaterial(material.id)));
      const objectiveNumbers = Object.fromEntries(
        details.map((detail) => [
          detail.id,
          [...new Set(detail.mappings.map((mapping) => mapping.learningObjective.number))].sort((a, b) =>
            a.localeCompare(b, undefined, { numeric: true }),
          ),
        ]),
      );
      materials = { items, objectiveNumbers };
    } catch (caught) {
      unstable_rethrow(caught);
      tree = null;
      error =
        caught instanceof ApiError && caught.code
          ? caught.message
          : "Materi belum dapat dimuat dari server. Coba muat ulang halaman.";
    }
  }

  return (
    <CurriculumPage
      materials={materials}
      error={error}
      selectedChapterId={typeof bab === "string" ? bab : null}
      subject={subject}
      tab={activeTab}
      teacherName={firstName(user.name)}
      tree={tree}
    />
  );
}
