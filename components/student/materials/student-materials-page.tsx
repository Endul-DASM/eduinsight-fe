"use client";

import Image from "next/image";
import { useState } from "react";
import { iconButtonClassName, sectionClassName } from "@/components/curriculum/styles";
import { MaterialRow } from "@/components/materials/material-rows";
import { cn } from "@/components/ui/cn";
import type { MyMaterial, MyMaterialsRead } from "@/lib/api/student";

export type MaterialFilter = "semua" | "rekomendasi";

const filters: { value: MaterialFilter; label: string; empty: string }[] = [
  { value: "semua", label: "Lihat Semua", empty: "Belum ada materi dari guru." },
  { value: "rekomendasi", label: "Materi Rekomendasi", empty: "Belum ada materi rekomendasi untukmu." },
];

type Section = { id: string; label: string | null; materials: MyMaterial[] };
type Group = { id: string; label: string; sections: Section[] };

function groupsOf(data: MyMaterialsRead): Group[] {
  const chapters = [...data.chapters]
    .sort((a, b) => a.number - b.number)
    .map((chapter) => ({
      id: chapter.chapterId,
      label: `BAB ${chapter.number}: ${chapter.name}`,
      sections: [
        { id: `${chapter.chapterId}-bab`, label: null, materials: chapter.materials },
        ...chapter.subchapters.map((subchapter) => ({ id: subchapter.id, label: subchapter.name, materials: subchapter.materials })),
      ],
    }));
  if (data.unlinked.length === 0) return chapters;
  return [...chapters, { id: "none", label: "Tanpa Bab", sections: [{ id: "none-bab", label: null, materials: data.unlinked }] }];
}

const objectivesOf = (material: MyMaterial) => {
  const numbers = (material.learningObjectives ?? []).map((objective) => objective.number);
  return numbers.length > 0 ? `TP ${numbers.join(", ")}` : "";
};

const fileHref = (material: MyMaterial, download = false) =>
  `/api/my-materials/${encodeURIComponent(material.id)}/file${download ? "?download=true" : ""}`;

// Menu Materi siswa (PRD S-MAT-01, SRS FR-S-030 – 032; UAT MAT-H08, MAT-H09; Figma New Design 256:8213): the
// materials the teacher shows, per Bab and Subbab, with search and the recommended ones.
export function StudentMaterialsPage({
  materials,
  classLabel,
  initialFilter,
}: {
  materials: MyMaterialsRead | null;
  classLabel: string;
  initialFilter: MaterialFilter;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MaterialFilter>(initialFilter);
  // Babs with materials start open; the student's own clicks win until the search or filter changes.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  const needle = query.trim().toLowerCase();
  const narrowed = Boolean(needle) || filter === "rekomendasi";
  const matches = (material: MyMaterial) => {
    if (filter === "rekomendasi" && !material.recommended) return false;
    if (!needle) return true;
    const objectives = [...(material.learningObjectives ?? []), ...material.recommendedFor];
    const text = [material.title, ...objectives.map((objective) => `TP ${objective.number} ${objective.description}`)];
    return text.join(" ").toLowerCase().includes(needle);
  };

  const groups = (materials ? groupsOf(materials) : [])
    .map((group) => ({
      ...group,
      sections: group.sections.map((section) => ({ ...section, materials: section.materials.filter(matches) })),
    }))
    .map((group) => ({ ...group, count: group.sections.reduce((sum, section) => sum + section.materials.length, 0) }))
    // While searching or filtering, only the Babs with a match.
    .filter((group) => !narrowed || group.count > 0);

  const total = groups.reduce((sum, group) => sum + group.count, 0);
  const emptyText = needle ? "Tidak ada materi yang cocok." : filters.find((option) => option.value === filter)!.empty;

  function changeFilter(next: MaterialFilter) {
    setFilter(next);
    setToggled({});
    // Keeps the chip on reload and on the way back, without asking the server again.
    const url = new URL(window.location.href);
    if (next === "rekomendasi") url.searchParams.set("filter", next);
    else url.searchParams.delete("filter");
    window.history.replaceState(null, "", url);
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8">
      <label className="flex h-[50px] w-full items-center gap-3 rounded-xl border border-[#c5c6cd] bg-[#fbf8fa] px-3 focus-within:border-[#0058be]">
        <input
          aria-label="Cari topik"
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#75777d]"
          onChange={(event) => {
            setQuery(event.target.value);
            setToggled({});
          }}
          placeholder="Cari topik..."
          type="search"
          value={query}
        />
        <Image alt="" height={24} src="/assessment/search.svg" width={24} />
      </label>

      <div aria-label="Saring materi" className="flex flex-wrap gap-4" role="group">
        {filters.map((option) => (
          <button
            aria-pressed={filter === option.value}
            className={cn(
              "rounded-3xl border bg-[rgba(153,188,229,0.6)] px-2 py-1 text-xs font-semibold leading-normal text-[#004695] transition-colors hover:bg-[rgba(153,188,229,0.85)]",
              filter === option.value ? "border-[#003264]" : "border-transparent",
            )}
            key={option.value}
            onClick={() => changeFilter(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>

      <section className={cn(sectionClassName, "gap-0")}>
        {total === 0 && (narrowed || groups.length === 0) ? (
          <p className="py-6 text-center text-sm leading-normal text-[#45474c]">{emptyText}</p>
        ) : (
          groups.map((group) => {
            const open = toggled[group.id] ?? group.count > 0;
            return (
              <div className="flex flex-col" key={group.id}>
                <button
                  aria-expanded={open}
                  className="flex items-center gap-2.5 border-b border-[#c5c6cd] py-2 text-left text-base font-bold leading-6 text-[#1b1b1d]"
                  onClick={() => setToggled((current) => ({ ...current, [group.id]: !open }))}
                  type="button"
                >
                  <Image
                    alt=""
                    className={cn("shrink-0 transition-transform", open && "rotate-90")}
                    height={24}
                    src="/materials/chevron-right.svg"
                    width={24}
                  />
                  <span className="min-w-0 flex-1 truncate">{group.label}</span>
                  <span className="shrink-0 text-xs font-medium text-[#75777d]">{group.count} materi</span>
                </button>
                {open && (
                  <div className="flex flex-col pb-3">
                    {group.count === 0 && <p className="px-4 py-4 text-sm leading-normal text-[#75777d]">Belum ada materi di Bab ini.</p>}
                    {group.sections
                      .filter((section) => section.materials.length > 0)
                      .map((section) => (
                        <div className="flex flex-col" key={section.id}>
                          {section.label && (
                            <p className="px-4 pt-4 text-sm font-semibold leading-normal text-[#45474c]">{section.label}</p>
                          )}
                          {section.materials.map((material) => (
                            <MaterialRow
                              actions={
                                <a
                                  aria-label={`Unduh ${material.title}`}
                                  className={iconButtonClassName}
                                  download
                                  href={fileHref(material, true)}
                                  title="Unduh materi"
                                >
                                  <Image alt="" height={18} src="/materials/download.svg" width={18} />
                                </a>
                              }
                              badge={
                                material.recommended && (
                                  <span
                                    className="shrink-0 rounded-3xl bg-[rgba(153,188,229,0.6)] px-2 py-0.5 text-[10px] font-semibold text-[#004695]"
                                    title={
                                      material.recommendedFor.length > 0
                                        ? `Untuk TP ${material.recommendedFor.map((objective) => objective.number).join(", ")}`
                                        : undefined
                                    }
                                  >
                                    Direkomendasikan
                                  </span>
                                )
                              }
                              classLabel={classLabel}
                              href={fileHref(material)}
                              key={material.id}
                              material={material}
                              objectives={objectivesOf(material)}
                            />
                          ))}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
