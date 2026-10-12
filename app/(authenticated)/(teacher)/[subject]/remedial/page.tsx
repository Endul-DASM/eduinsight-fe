import { notFound } from "next/navigation";
import { RemedialPage } from "@/components/remedial/remedial-page";
import { getSubject } from "@/lib/api/subjects";
import { getAssessmentCards } from "@/lib/assessment-list";
import { getMaterialReferences, getRemedialPair } from "@/lib/remedial";

// /{slug}/remedial?source={id}&remedial={id} — Pantau Remedial.
export default async function RemedialRoute({ params, searchParams }: PageProps<"/[subject]/remedial">) {
  const { subject: slug } = await params;
  const query = await searchParams;
  const subject = await getSubject(slug);
  if (!subject) notFound();

  const [pair, cards] = await Promise.all([
    getRemedialPair(subject, query.source, query.remedial),
    getAssessmentCards(subject, { type: "remedial" }),
  ]);
  const references = pair.sourceResults ? await getMaterialReferences(subject, pair.sourceResults, pair.targets) : [];

  return <RemedialPage cards={cards} pair={pair} references={references} slug={slug} />;
}
