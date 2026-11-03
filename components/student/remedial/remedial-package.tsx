import { softButtonClassName } from "@/components/student/dashboard/student-dashboard-page";
import type { MyRemedial } from "@/lib/api/student";
import { levelLabels } from "@/lib/remedial-figures";
import { formatPoints } from "@/lib/student-dashboard";
import { packageMaterials } from "@/lib/student-remedial";

const infoCard = "flex flex-col gap-1 rounded-2xl bg-[#e6eff9] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)]";

// Persiapan Remedial, right column: the approved packages (FR-S-050) in place of the assessment tips. A student can
// have one per need (Belum Paham, Butuh Latihan, Pengayaan), each on its own TPs.
export function RemedialPackage({ remedial }: { remedial: MyRemedial }) {
  const materials = packageMaterials(remedial);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl bg-[#003264] p-5 text-white">
        <p className="text-xl font-semibold">Materi untuk Dipelajari</p>
        {materials.length === 0 ? (
          <p className="text-sm leading-normal text-white/90">Gurumu belum menambahkan materi pada paket remedial ini.</p>
        ) : (
          <>
            <p className="text-sm leading-normal text-white/90">Pelajari materi ini dulu sebelum mulai mengerjakan.</p>
            <ul className="flex flex-col gap-2">
              {materials.map((material) => (
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
      <div className={infoCard}>
        <p className="text-base font-semibold text-[#45474c]">Asesmen Sumber</p>
        <p className="text-sm text-[#1b1b1d]">
          {remedial.sourceAssessment.title}: skormu {formatPoints(remedial.sourceScore)}/100, KKM {remedial.sourceAssessment.kkm}.
        </p>
      </div>
      {remedial.packages
        .filter((pack) => pack.objectives.length > 0)
        .map((pack) => (
          <div className={infoCard} key={pack.level}>
            <p className="text-base font-semibold text-[#45474c]">{levelLabels[pack.level]}</p>
            <ul className="flex flex-col gap-1 text-sm text-[#1b1b1d]">
              {pack.objectives.map((objective) => (
                <li key={objective.learningObjective.id}>
                  TP {objective.learningObjective.number}: {objective.learningObjective.description}
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}
