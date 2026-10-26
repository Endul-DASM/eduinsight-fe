"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { outlineButtonClassName } from "@/components/auth/styles";
import { cn } from "@/components/ui/cn";
import type { CurriculumCp, Fase } from "@/lib/api/types";
import { faseInfo, fases } from "@/lib/curriculum-form";
import { addButtonClassName, ghostButtonClassName, iconButtonClassName, sectionClassName } from "./styles";

// Fase offered for the import: only the class's Fase (UAT KUR-H01), or every Fase when the class name has no grade.
export function faseChoices(classFase: Fase | null): Fase[] {
  return classFase ? [classFase] : fases.map((fase) => fase.value);
}

// An option of the + menu: icon chip, label and a short explanation.
function MenuItem({
  icon,
  label,
  description,
  onSelect,
}: {
  icon: string;
  label: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <button
      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-[#e6eff9] focus-visible:bg-[#e6eff9] focus-visible:outline-none"
      onClick={onSelect}
      role="menuitem"
      type="button"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[rgba(153,188,229,0.6)]">
        <Image alt="" height={22} src={icon} width={22} />
      </span>
      <span className="flex min-w-0 flex-col leading-normal">
        <span className="text-base font-semibold text-[#1b1b1d]">{label}</span>
        <span className="text-xs text-[#45474c]">{description}</span>
      </span>
    </button>
  );
}

function CpCard({ cp, onEdit, onDelete }: { cp: CurriculumCp; onEdit: () => void; onDelete: () => void }) {
  return (
    <article className="flex flex-col gap-1 rounded-xl border border-[#c5c6cd] px-3 py-2 text-base leading-normal text-black">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold">
          {cp.code && <span className="mr-2 text-[#45474c]">{cp.code}</span>}
          {cp.element}
        </h3>
        <div className="flex shrink-0 items-center">
          <button aria-label={`Edit CP ${cp.element}`} className={iconButtonClassName} onClick={onEdit} type="button">
            <Image alt="" height={12} src="/curriculum/pencil.svg" width={12} />
          </button>
          <button aria-label={`Hapus CP ${cp.element}`} className={iconButtonClassName} onClick={onDelete} type="button">
            <Image alt="" height={12} src="/curriculum/x.svg" width={12} />
          </button>
        </div>
      </div>
      <p>{cp.description}</p>
    </article>
  );
}

// Daftar CP (FR-G-020, FR-G-025; Figma New Design 37:5961, 47:1578).
export function CpSection({
  subjectName,
  cps,
  suggestedFase,
  officialCatalog,
  onImport,
  onCreate,
  onEdit,
  onDelete,
}: {
  subjectName: string;
  cps: CurriculumCp[];
  // The Fase of the subject's class; null when the class name has no grade.
  suggestedFase: Fase | null;
  // False when the catalog has no CPs for this subject: only "Tambah CP Sendiri" is offered.
  officialCatalog: boolean;
  onImport: (fase: Fase) => void;
  onCreate: () => void;
  onEdit: (cp: CurriculumCp) => void;
  onDelete: (cp: CurriculumCp) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // The + menu closes on Escape or a click elsewhere.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    const onClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [menuOpen]);
  let emptyText = `Katalog CP resmi belum tersedia untuk ${subjectName}. Tambahkan CP sesuai kurikulum yang sedang berjalan.`;
  if (officialCatalog && suggestedFase) {
    const fase = faseInfo(suggestedFase);
    emptyText = `Impor CP resmi ${subjectName} untuk ${fase.label} (${fase.grades}) sesuai kelas mata pelajaran ini, atau tambahkan CP sendiri.`;
  } else if (officialCatalog) {
    emptyText = "Sebelum mengimpor CP berdasarkan kurikulum yang sedang berjalan, fase apa yang sedang Bapak/Ibu ampu?";
  }
  const byFase = fases
    .map((fase) => ({ ...fase, cps: cps.filter((cp) => cp.fase === fase.value) }))
    .filter((group) => group.cps.length > 0);

  return (
    <section className={sectionClassName}>
      <h2 className="flex items-center gap-3 py-1 text-xl font-semibold leading-normal text-[#1b1b1d]">
        <Image alt="" height={24} src="/curriculum/cp-chart.svg" width={24} />
        List Capaian Pembelajaran (CP) di Mata Pelajaran {subjectName}
      </h2>
      <hr className="border-[#c5c6cd]" />

      {cps.length === 0 ? (
        <div className="flex flex-col items-center gap-6 py-10 text-center">
          <p className="max-w-[903px] text-base leading-normal text-[#1b1b1d]">
            {emptyText}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {officialCatalog && faseChoices(suggestedFase).map((value) => {
              const fase = fases.find((option) => option.value === value);
              return (
                <button className={outlineButtonClassName} key={value} onClick={() => onImport(value)} type="button">
                  {suggestedFase ? `Impor CP Resmi ${fase?.label}` : `${fase?.label} (${fase?.grades})`}
                </button>
              );
            })}
            <button className={ghostButtonClassName} onClick={onCreate} type="button">
              <Image alt="" height={24} src="/curriculum/add-small.svg" width={24} />
              Tambah CP Sendiri
            </button>
          </div>
        </div>
      ) : (
        <div className="flex max-h-[360px] flex-col gap-5 overflow-y-auto pr-1">
          {byFase.map((group) => (
            <div className="flex flex-col gap-5" key={group.value}>
              <span className="w-fit rounded-3xl bg-[rgba(153,188,229,0.6)] px-2 py-1 text-xs font-semibold leading-normal text-[#004695]">
                {group.label}
              </span>
              {group.cps.map((cp) => (
                <CpCard cp={cp} key={cp.id} onDelete={() => onDelete(cp)} onEdit={() => onEdit(cp)} />
              ))}
            </div>
          ))}
        </div>
      )}

      {cps.length > 0 && (
        <div className="relative flex justify-end" ref={menuRef}>
          {menuOpen && (
            <div
              className="absolute bottom-full right-0 z-10 mb-3 flex w-[min(340px,calc(100vw-4rem))] flex-col gap-1 rounded-3xl border border-[#c5c6cd] bg-[#fafbfd] p-3 text-left shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
              role="menu"
            >
              <p className="px-3 pb-1 pt-1 text-xs font-semibold leading-normal text-[#45474c]">Tambah CP</p>
              {officialCatalog && faseChoices(suggestedFase).map((value) => {
                const fase = fases.find((option) => option.value === value);
                return (
                  <MenuItem
                    description={`CP ${subjectName} ${fase?.grades} dari katalog resmi`}
                    icon="/curriculum/cp-chart.svg"
                    key={value}
                    label={`Impor CP resmi ${fase?.label}`}
                    onSelect={() => {
                      setMenuOpen(false);
                      onImport(value);
                    }}
                  />
                );
              })}
              {officialCatalog && <hr className="mx-3 my-1 border-[#e6eff9]" />}
              <MenuItem
                description="Tulis Elemen dan deskripsi CP sendiri"
                icon="/curriculum/add-small.svg"
                label="Tambah CP sendiri"
                onSelect={() => {
                  setMenuOpen(false);
                  onCreate();
                }}
              />
            </div>
          )}
          <button
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="Tambah CP"
            className={cn(addButtonClassName)}
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <Image alt="" height={36} src="/curriculum/add-large.svg" width={36} />
          </button>
        </div>
      )}
    </section>
  );
}
