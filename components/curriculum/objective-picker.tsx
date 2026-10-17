"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";
import type { CurriculumChapter } from "@/lib/api/types";
import { inputBoxClassName } from "./styles";

// A TP of a final Bab, with the Bab it belongs to.
export type Objective = CurriculumChapter["learningObjectives"][number] & { chapter: CurriculumChapter };

// The TPs of the given Babs in curriculum order.
export function objectivesOf(chapters: CurriculumChapter[]): Objective[] {
  return [...chapters]
    .sort((a, b) => a.number - b.number)
    .flatMap((chapter) =>
      [...chapter.learningObjectives].sort((a, b) => a.position - b.position).map((objective) => ({ ...objective, chapter })),
    );
}

// "Pilih TP..." with a checkbox per TP: the chosen Bab first, then the TPs of the other Babs.
export function ObjectivePicker({
  objectives,
  chapterId,
  chosen,
  suggested = new Set(),
  invalid,
  onToggle,
  placeholder = "Pilih TP...",
  disabled = false,
  id,
}: {
  objectives: Objective[];
  // The Bab whose TPs come first; "" lists every TP in one group.
  chapterId: string;
  chosen: string[];
  // TPs marked "Disarankan", e.g. the system's suggestions for a material.
  suggested?: Set<string>;
  invalid: boolean;
  onToggle: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // Close the list only, not the whole modal.
        event.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  const groups = [
    { label: "TP Bab ini", items: objectives.filter((objective) => objective.chapter.id === chapterId) },
    { label: chapterId ? "TP lain" : "Semua TP", items: objectives.filter((objective) => objective.chapter.id !== chapterId) },
  ].filter((group) => group.items.length > 0);

  return (
    <div className="relative" ref={ref}>
      <button
        aria-controls={listId}
        aria-expanded={open}
        disabled={disabled}
        id={id}
        className={cn(
          inputBoxClassName,
          "flex h-[50px] items-center justify-between text-left",
          chosen.length === 0 && "text-[#75777d]",
          invalid && "border-[#dc2626]",
        )}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {chosen.length === 0 ? placeholder : `${chosen.length} TP dipilih`}
        <Image alt="" className={cn("transition-transform", open && "rotate-180")} height={24} src="/materials/chevron-down.svg" width={24} />
      </button>
      {open && (
        <div
          className="absolute inset-x-0 top-[calc(100%+6px)] z-10 max-h-72 overflow-y-auto rounded-xl border border-[#c5c6cd] bg-white p-2 shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
          id={listId}
        >
          {objectives.length === 0 && (
            <p className="px-3 py-4 text-sm leading-normal text-[#45474c]">
              Belum ada TP dari Bab final. Selesaikan Bab di tab Kurikulum terlebih dahulu.
            </p>
          )}
          {groups.map((group) => (
            <div className="flex flex-col" key={group.label}>
              <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-[#75777d]">{group.label}</p>
              {group.items.map((objective) => (
                <label
                  className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 text-sm leading-normal text-[#1b1b1d] hover:bg-[#e6eff9]"
                  key={objective.id}
                >
                  <input
                    checked={chosen.includes(objective.id)}
                    className="mt-1 size-4 shrink-0 accent-[#0058be]"
                    onChange={() => onToggle(objective.id)}
                    type="checkbox"
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="flex flex-wrap items-center gap-2 font-semibold">
                      TP {objective.number}
                      <span className="font-normal text-[#75777d]">(Bab {objective.chapter.number})</span>
                      {suggested.has(objective.id) && (
                        <span className="rounded-3xl bg-[rgba(153,188,229,0.6)] px-2 py-0.5 text-[10px] text-[#004695]">
                          Disarankan
                        </span>
                      )}
                    </span>
                    <span>{objective.description}</span>
                  </span>
                </label>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
