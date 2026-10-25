// The Diagnosis URL: /{slug}/analysis?tab=diagnosis&view=…&assessment=&chapter=&tp=&student=&item=. An old
// ?semester= is ignored: the semester filter was taken out at UAT.
// Every link keeps the scope filters and changes only what it is about.

export const diagnosisViews = ["kelas", "tp", "siswa"] as const;
export type DiagnosisView = (typeof diagnosisViews)[number];

export type DiagnosisParams = {
  view: DiagnosisView;
  assessment?: string;
  chapter?: string;
  tp?: string;
  student?: string;
  // "{assessmentId}:{questionId}" — Detail Soal on Diagnosis Siswa.
  item?: string;
};

const text = (value: unknown) => (typeof value === "string" && value ? value : undefined);

export function diagnosisParamsOf(query: Record<string, string | string[] | undefined>): DiagnosisParams {
  return {
    view: diagnosisViews.find((view) => view === query.view) ?? "kelas",
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
  for (const key of ["assessment", "chapter", "tp", "student", "item"] as const) {
    const value = next[key];
    if (value) query.set(key, value);
  }
  return `/${slug}/analysis?${query}`;
}
