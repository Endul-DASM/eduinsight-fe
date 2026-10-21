import { notFound } from "next/navigation";
import { RemedialPage } from "@/components/remedial/remedial-page";
import { getSourceRemedial } from "@/lib/api/remedial";
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
  const [references, remedial] = await Promise.all([
    pair.sourceResults ? getMaterialReferences(subject, pair.sourceResults, pair.targets) : [],
    pair.source ? getSourceRemedial(pair.source.id) : null,
  ]);
  const groupLevels = Object.fromEntries((remedial?.targets ?? []).map((target) => [target.student.id, target.groupLevel]));

  return <RemedialPage cards={cards} groupLevels={groupLevels} pair={pair} references={references} slug={slug} />;
}
