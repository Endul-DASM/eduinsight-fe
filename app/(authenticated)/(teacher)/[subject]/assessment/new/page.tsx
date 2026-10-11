import { notFound } from "next/navigation";
import { BuilderShell } from "@/components/assessment/builder-shell";
import { SpecificationStep } from "@/components/assessment/specification-step";
import { getCurriculum } from "@/lib/api/curriculum";
import { getSubject } from "@/lib/api/subjects";
import { builderMethodOf } from "@/lib/assessment-form";

// /{slug}/assessment/new?method=ai|ketik|template|ocr: langkah 1 before the draft exists. Saving it creates the draft
// and moves to /{slug}/assessment/{id}.
export default async function NewAssessmentRoute({ params, searchParams }: PageProps<"/[subject]/assessment/new">) {
  const { subject: slug } = await params;
  const method = builderMethodOf((await searchParams).method);
  const subject = await getSubject(slug);
  if (!subject) notFound();

  const tree = await getCurriculum(subject.id);

  return (
    <BuilderShell method={method} step="spesifikasi">
      <SpecificationStep
        assessment={null}
        chapters={tree?.chapters.filter((chapter) => chapter.status === "final") ?? []}
        kkmDefault={subject.kkmDefault}
        method={method}
        slug={slug}
        subjectId={subject.id}
      />
    </BuilderShell>
  );
}
