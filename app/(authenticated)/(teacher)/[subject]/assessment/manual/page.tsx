import { ManualPicker } from "@/components/assessment/manual-picker";

// /{slug}/assessment/manual: Template or Ketik di EduInsight (Figma New Design 61:7728).
export default async function ManualAssessmentRoute({ params }: PageProps<"/[subject]/assessment/manual">) {
  const { subject: slug } = await params;
  return <ManualPicker slug={slug} />;
}
