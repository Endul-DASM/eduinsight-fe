// The Diagnosis URL: /{slug}/analysis?tab=diagnosis&view=…&semester=&assessment=&chapter=&tp=&student=&item=.
// Every link keeps the scope filters and changes only what it is about.

export const diagnosisViews = ["kelas", "tp", "siswa"] as const;
export type DiagnosisView = (typeof diagnosisViews)[number];

export type DiagnosisParams = {
  view: DiagnosisView;
  semester?: "ganjil" | "genap";
  assessment?: string;
  chapter?: string;
  tp?: string;
  student?: string;
  // "{assessmentId}:{questionId}" — Detail Soal on Diagnosis Siswa.
  item?: string;
};

const text = (value: unknown) => (typeof value === "string" && value ? value : undefined);

export function diagnosisParamsOf(query: Record<string, string | string[] | undefined>): DiagnosisParams {
  const semester = query.semester === "ganjil" || query.semester === "genap" ? query.semester : undefined;
  return {
    view: diagnosisViews.find((view) => view === query.view) ?? "kelas",
    semester,
    assessment: text(query.assessment),
    chapter: text(query.chapter),
    tp: text(query.tp),
    student: text(query.student),
    item: text(query.item),
  };
}

export function diagnosisHref(slug: string, params: DiagnosisParams, change: Partial<DiagnosisParams> = {}): string {
  const next = { ...params, ...change };
  const query = new URLSearchParams({ tab: "diagnosis", view: next.view });
  for (const key of ["semester", "assessment", "chapter", "tp", "student", "item"] as const) {
    const value = next[key];
    if (value) query.set(key, value);
  }
  return `/${slug}/analysis?${query}`;
}
