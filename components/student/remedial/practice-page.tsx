import Link from "next/link";
import type { MyRemedial } from "@/lib/api/student";
import { PracticeQuestions } from "./practice-questions";

const card = "rounded-3xl bg-[#fafbfd] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)]";

// Soal Latihan (UAT REM-H05; AI-13, FR-G-102): the practice questions of an approved remedial package on their own
// page, opened from Daftar Remedial next to the remedial assessment.
export function PracticePage({ slug, remedial }: { slug: string; remedial: MyRemedial }) {
  const pack = remedial.package!;
  const practice = pack.practice ?? [];

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8">
      <Link className="self-start text-sm font-semibold text-[#0058be] hover:underline" href={`/student/${slug}/remedial`}>
        ‹ Daftar Remedial
      </Link>
      <div className="leading-normal">
        <h2 className="text-2xl font-bold text-[#1b1b1d] sm:text-[32px]">Soal Latihan</h2>
        <p className="text-base text-[#45474c]">{remedial.sourceAssessment.title}</p>
      </div>

      {pack.weakObjectives.length > 0 && (
        <section className={card}>
          <p className="text-base font-semibold text-[#45474c]">TP yang Dilatih</p>
          <ul className="mt-2 flex flex-col gap-1 text-sm leading-normal text-[#1b1b1d]">
            {pack.weakObjectives.map((objective) => (
              <li key={objective.learningObjective.id}>
                TP {objective.learningObjective.number}: {objective.learningObjective.description}
              </li>
            ))}
          </ul>
        </section>
      )}

      {practice.length === 0 ? (
        <p className={`${card} text-sm text-[#45474c]`}>Gurumu belum menambahkan soal latihan pada paket ini.</p>
      ) : (
        <PracticeQuestions questions={practice} />
      )}
    </div>
  );
}
