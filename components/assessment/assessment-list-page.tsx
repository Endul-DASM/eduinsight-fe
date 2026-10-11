import Link from "next/link";
import { sectionClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import type { AssessmentCard as Card } from "@/lib/assessment-list";
import { AssessmentCard } from "./assessment-card";
import { AssessmentFilterChips } from "./assessment-filter-chips";

// Daftar Asesmen tab (PRD G-ASM-00, FR-G-040; Figma New Design 54:7817): every assessment of the subject as a card,
// filtered by type or draft status.
export function AssessmentListPage({
  slug,
  cards,
  filtered,
}: {
  slug: string;
  cards: Card[];
  // A filter is active, so an empty list means "no match", not "none yet".
  filtered: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <AssessmentFilterChips />

      {cards.length === 0 ? (
        <section className={cn(sectionClassName, "items-center py-12 text-center")}>
          <p className="text-base font-semibold text-[#1b1b1d]">
            {filtered ? "Tidak ada asesmen yang cocok dengan filter." : "Belum ada asesmen di mata pelajaran ini."}
          </p>
          {!filtered && (
            <Link className="text-sm font-semibold text-[#0058be] hover:underline" href={`/${slug}/assessment`}>
              Buat asesmen pertama
            </Link>
          )}
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <AssessmentCard card={card} key={card.assessment.id} slug={slug} />
          ))}
        </div>
      )}
    </div>
  );
}
