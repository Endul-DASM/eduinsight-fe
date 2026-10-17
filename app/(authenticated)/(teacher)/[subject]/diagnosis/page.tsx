import { redirect } from "next/navigation";

// Diagnosis moved into Analisis (Figma New Design 65:15809).
export default async function DiagnosisRoute({ params }: PageProps<"/[subject]/diagnosis">) {
  const { subject } = await params;
  redirect(`/${subject}/analysis?tab=diagnosis`);
}
