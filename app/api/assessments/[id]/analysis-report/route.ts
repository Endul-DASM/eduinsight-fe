import { getAssessmentAnalysis } from "@/lib/api/analysis";
import { analysisCsv } from "@/lib/question-analysis";

// Unduh laporan Analisis Soal (FR-G-090 – 093). The backend has no export, so the CSV is built from the analysis.
export async function GET(_request: Request, { params }: RouteContext<"/api/assessments/[id]/analysis-report">) {
  const { id } = await params;
  const analysis = await getAssessmentAnalysis(id).catch(() => null);
  if (!analysis) return new Response("Laporan tidak tersedia.", { status: 404 });

  // Header values must stay ASCII.
  const name = analysis.assessment.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "asesmen";
  return new Response(analysisCsv(analysis), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="analisis-soal-${name}.csv"`,
    },
  });
}
