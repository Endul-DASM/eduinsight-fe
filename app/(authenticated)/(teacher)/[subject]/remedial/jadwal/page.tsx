import { notFound } from "next/navigation";
import { SchedulePage } from "@/components/remedial/schedule-page";
import { getSubject } from "@/lib/api/subjects";
import { getRemedialHistory, getRemedialPair } from "@/lib/remedial";

// /{slug}/remedial/jadwal?source={id}&remedial={id} — Jadwalkan Remedial, reassessment and Riwayat Remedial.
export default async function RemedialScheduleRoute({ params, searchParams }: PageProps<"/[subject]/remedial/jadwal">) {
  const { subject: slug } = await params;
  const query = await searchParams;
  const subject = await getSubject(slug);
  if (!subject) notFound();

  const pair = await getRemedialPair(subject, query.source, query.remedial);
  const history = await getRemedialHistory(pair.sourceResults, pair.remedials);

  return <SchedulePage history={history} pair={pair} slug={slug} />;
}
