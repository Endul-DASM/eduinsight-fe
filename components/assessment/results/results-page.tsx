import Link from "next/link";
import { sectionClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import type { AssessmentResults } from "@/lib/api/results";
import type { Assessment } from "@/lib/api/types";
import { AssessmentSelect } from "./assessment-select";
import { ClassPerformanceView } from "./class-performance";
import { ObjectivePerformanceView } from "./objective-performance";
import { QuestionPerformanceView } from "./question-performance";
import { StudentPerformanceView } from "./student-performance";

const views = [
  { id: "kelas", label: "Performa Kelas" },
  { id: "siswa", label: "Performa Siswa" },
  { id: "tp", label: "Performa Per TP" },
  { id: "soal", label: "Performa Soal" },
] as const;

export type ResultsView = (typeof views)[number]["id"];

export function resultsViewOf(value: unknown): ResultsView {
  return views.find((view) => view.id === value)?.id ?? "kelas";
}

function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section className={cn(sectionClassName, "items-center py-12 text-center")}>
      <p className="text-base font-semibold text-[#1b1b1d]">{title}</p>
      {children && <div className="max-w-[560px] text-sm leading-normal text-[#45474c]">{children}</div>}
    </section>
  );
}

// Hasil Asesmen tab (PRD 5.4.4, FR-G-070 – 073; Figma New Design 65:13118, 65:13515, 65:14903). Performa Per TP
// (FR-G-072) has no design; Performa Soal is the design's third tab.
export function ResultsPage({
  slug,
  assessments,
  selectedId,
  view,
  results,
}: {
  slug: string;
  // Published assessments, newest first.
  assessments: Assessment[];
  selectedId: string | null;
  view: ResultsView;
  // Null when the backend has no results for it (mock mode or an older backend).
  results: AssessmentResults | null;
}) {
  if (assessments.length === 0) {
    return (
      <Empty title="Belum ada asesmen yang dipublikasikan.">
        Hasil muncul setelah asesmen dipublikasikan dan dikerjakan siswa.{" "}
        <Link className="font-semibold text-[#0058be] hover:underline" href={`/${slug}/assessment`}>
          Buat asesmen
        </Link>
      </Empty>
    );
  }

  const href = (id: ResultsView) => `/${slug}/assessment?tab=hasil&assessment=${selectedId}&view=${id}`;
  const selected = assessments.find((assessment) => assessment.id === selectedId);

  // The picker in its own card, apart from the result tabs (UAT ASM-U06).
  const picker = (
    <section className={sectionClassName}>
      <div className="flex flex-col gap-1 leading-normal">
        <h3 className="text-xl font-semibold text-[#1b1b1d]">Pilih Asesmen</h3>
        <p className="text-sm text-[#45474c]">Hanya asesmen yang sudah dipublikasikan yang memiliki hasil.</p>
      </div>
      <AssessmentSelect assessments={assessments} selectedId={selectedId} slug={slug} view={view} />
    </section>
  );

  if (!selected) {
    return (
      <div className="flex flex-col gap-6">
        {picker}
        <Empty title="Pilih asesmen untuk melihat hasilnya.">
          Performa kelas, siswa, TP, dan soal tampil setelah asesmen dipilih.
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {picker}

      <h3 className="text-xl font-semibold leading-normal text-[#1b1b1d]">Hasil {selected.title}</h3>
      <nav aria-label="Bagian Hasil Asesmen" className="-mt-3 flex flex-wrap gap-3">
        {views.map((item) => {
          const active = item.id === view;
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-xl px-2 py-2 text-base font-semibold leading-normal transition-colors",
                active ? "bg-[rgba(153,188,229,0.6)] text-[#004695]" : "text-[#1b1b1d] hover:bg-[#e6eff9]",
              )}
              href={href(item.id)}
              key={item.id}
              replace
              scroll={false}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {!results ? (
        <Empty title="Hasil asesmen belum tersedia.">
          Server belum menyediakan hasil untuk asesmen ini. Pastikan backend sudah versi terbaru.
        </Empty>
      ) : results.classPerformance.submitted === 0 ? (
        <Empty title="Belum ada siswa yang mengerjakan asesmen ini.">
          {results.classPerformance.enrolled} siswa terdaftar. Hasil muncul setelah ada pengerjaan yang diserahkan.
        </Empty>
      ) : (
        <>
          {view === "kelas" && <ClassPerformanceView results={results} slug={slug} />}
          {view === "siswa" && <StudentPerformanceView results={results} />}
          {view === "tp" && <ObjectivePerformanceView results={results} />}
          {view === "soal" && <QuestionPerformanceView results={results} slug={slug} />}
        </>
      )}
    </div>
  );
}
