import { softButtonClassName } from "@/components/student/dashboard/student-dashboard-page";
import type { MyRemedial } from "@/lib/api/student";
import { formatPoints } from "@/lib/student-dashboard";
import { PracticeQuestions } from "./practice-questions";

const infoCard = "flex flex-col gap-1 rounded-2xl bg-[#e6eff9] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)]";

// Persiapan Remedial, right column: the approved package (FR-S-050) in place of the assessment tips.
export function RemedialPackage({ remedial }: { remedial: MyRemedial }) {
  const pack = remedial.package;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl bg-[#003264] p-5 text-white">
        <p className="text-xl font-semibold">Materi untuk Dipelajari</p>
        {!pack || pack.materials.length === 0 ? (
          <p className="text-sm leading-normal text-white/90">Gurumu belum menambahkan materi pada paket remedial ini.</p>
        ) : (
          <>
            <p className="text-sm leading-normal text-white/90">Pelajari materi ini dulu sebelum mulai mengerjakan.</p>
            <ul className="flex flex-col gap-2">
              {pack.materials.map((material) => (
                <li className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/10 p-3" key={material.id}>
                  <span className="min-w-0 text-sm font-semibold">{material.title}</span>
                  <a
                    className={softButtonClassName}
                    href={`/api/my-materials/${encodeURIComponent(material.id)}/file`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Buka Materi
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      {pack && <PracticeQuestions questions={pack.practice ?? []} />}
      <div className={infoCard}>
        <p className="text-base font-semibold text-[#45474c]">Asesmen Sumber</p>
        <p className="text-sm text-[#1b1b1d]">
          {remedial.sourceAssessment.title}: skormu {formatPoints(remedial.sourceScore)}/100, KKM {remedial.sourceAssessment.kkm}.
        </p>
      </div>
      {pack && pack.weakObjectives.length > 0 && (
        <div className={infoCard}>
          <p className="text-base font-semibold text-[#45474c]">TP yang Perlu Diperkuat</p>
          <ul className="flex flex-col gap-1 text-sm text-[#1b1b1d]">
            {pack.weakObjectives.map((objective) => (
              <li key={objective.learningObjective.id}>
                TP {objective.learningObjective.number}: {objective.learningObjective.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
