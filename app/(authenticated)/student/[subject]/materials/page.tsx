import { notFound } from "next/navigation";
import { StudentMaterialsPage } from "@/components/student/materials/student-materials-page";
import { getMyMaterials } from "@/lib/api/student";
import { getSubject } from "@/lib/api/subjects";

// /student/{slug}/materials?filter=rekomendasi — Menu Materi siswa (FR-S-030). The filter opens Materi Rekomendasi,
// e.g. from a post-test's recommendation (FR-S-014).
export default async function StudentMaterialsRoute({ params, searchParams }: PageProps<"/student/[subject]/materials">) {
  const { subject: slug } = await params;
  const query = await searchParams;
  const subject = await getSubject(slug);
  if (!subject) notFound();

  const materials = await getMyMaterials(subject.id);

  return (
    <StudentMaterialsPage
      classLabel={subject.class.name}
      initialFilter={query.filter === "rekomendasi" ? "rekomendasi" : "semua"}
      materials={materials}
    />
  );
}
