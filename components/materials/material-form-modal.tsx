"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { outlineButtonClassName, primaryButtonClassName } from "@/components/auth/styles";
import { TextField } from "@/components/auth/text-field";
import {
  fieldLabelClassName,
  greyButtonClassName,
  iconButtonClassName,
  inputBoxClassName,
  wideModalClassName,
} from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import { Modal } from "@/components/ui/modal";
import { getMaterialAction, saveMaterialAction } from "@/lib/actions/materials";
import type { Material, MaterialDetail } from "@/lib/api/materials";
import type { CurriculumChapter } from "@/lib/api/types";
import { formatLabels, formatSize } from "./material-rows";

// "new" is the two steps of Figma New Design 54:6788 → 54:7197 (also used by "Lanjut" on a draft); "edit" is the
// single page of Figma 54:7451.
export type MaterialFormMode = "new" | "edit";

type Objective = CurriculumChapter["learningObjectives"][number] & { chapter: CurriculumChapter };

// The TPs the system suggested, best score first (FR-G-032).
function suggestedObjectiveIds(detail: MaterialDetail) {
  const best = new Map<string, number>();
  for (const mapping of detail.mappings) {
    const id = mapping.learningObjective.id;
    best.set(id, Math.max(best.get(id) ?? 0, mapping.score ?? 0));
  }
  return [...best.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

function Stepper({ step }: { step: "detail" | "review" }) {
  const circle = (active: boolean) =>
    cn(
      "grid size-12 place-items-center rounded-full text-base font-semibold",
      active ? "bg-[#0058be] text-[#f5f3f4]" : "bg-[#c5c6cd] text-[#45474c]",
    );
  return (
    <ol className="flex items-center justify-center gap-6 text-xs font-semibold leading-normal">
      <li className="flex items-center gap-2 text-[#0058be]">
        <span className={circle(true)}>1</span>
        Detail Materi
      </li>
      <li aria-hidden className={cn("h-0.5 w-20 sm:w-[324px]", step === "review" ? "bg-[#0058be]" : "bg-[#c5c6cd]")} />
      <li className={cn("flex items-center gap-2", step === "review" ? "text-[#0058be]" : "text-[#75777d]")}>
        <span className={circle(step === "review")}>2</span>
        Review
      </li>
    </ol>
  );
}

// "Pilih TP..." with a checkbox per TP: the chosen Bab first, then the TPs of the other Babs.
function ObjectivePicker({
  objectives,
  chapterId,
  chosen,
  suggested,
  invalid,
  onToggle,
}: {
  objectives: Objective[];
  chapterId: string;
  chosen: string[];
  suggested: Set<string>;
  invalid: boolean;
  onToggle: (id: string) => void;
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
        className={cn(
          inputBoxClassName,
          "flex h-[50px] items-center justify-between text-left",
          chosen.length === 0 && "text-[#75777d]",
          invalid && "border-[#dc2626]",
        )}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {chosen.length === 0 ? "Pilih TP..." : `${chosen.length} TP dipilih`}
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
                      <span className="font-normal text-[#75777d]">· Bab {objective.chapter.number}</span>
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

function MaterialForm({
  slug,
  mode,
  detail,
  chapters,
  onClose,
}: {
  slug: string;
  mode: MaterialFormMode;
  detail: MaterialDetail;
  chapters: CurriculumChapter[];
  onClose: () => void;
}) {
  const formId = useId();
  const objectives: Objective[] = chapters.flatMap((chapter) =>
    [...chapter.learningObjectives].sort((a, b) => a.position - b.position).map((objective) => ({ ...objective, chapter })),
  );
  const objectiveById = new Map(objectives.map((objective) => [objective.id, objective]));
  const suggestedIds = suggestedObjectiveIds(detail).filter((id) => objectiveById.has(id));
  const suggested = new Set(suggestedIds);
  const draft = !detail.mappingConfirmedAt;

  const [step, setStep] = useState<"detail" | "review">("detail");
  const [title, setTitle] = useState(detail.title);
  // A draft without a Bab takes the Bab of the best suggestion.
  const [chapterId, setChapterId] = useState(
    detail.chapterId ?? (suggestedIds[0] ? objectiveById.get(suggestedIds[0])!.chapter.id : ""),
  );
  // Confirmed materials show their mapping; drafts start from the suggestions, which the teacher can change.
  const [chosen, setChosen] = useState<string[]>(() =>
    draft
      ? suggestedIds
      : [...new Set(detail.mappings.filter((mapping) => mapping.confirmed).map((mapping) => mapping.learningObjective.id))],
  );
  const [errors, setErrors] = useState<{ title?: string; objectives?: string }>({});
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();

  const chapter = chapters.find((entry) => entry.id === chapterId);
  const chosenObjectives = chosen.map((id) => objectiveById.get(id)).filter((objective) => objective !== undefined);

  function toggle(id: string) {
    setChosen((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]));
    setErrors((current) => ({ ...current, objectives: undefined }));
  }

  function validate() {
    const next = {
      title: title.trim() ? (title.trim().length > 200 ? "Judul maksimal 200 karakter." : undefined) : "Judul materi wajib diisi.",
      objectives: chosen.length === 0 ? "Pilih minimal satu TP." : undefined,
    };
    setErrors(next);
    return !next.title && !next.objectives;
  }

  function save(confirm: boolean) {
    // A draft only needs its title; confirming also needs at least one TP.
    if (confirm && !validate()) return;
    if (!confirm && !title.trim()) return setErrors({ title: "Judul materi wajib diisi." });
    setMessage(undefined);
    startTransition(async () => {
      const result = await saveMaterialAction(slug, detail.id, {
        title,
        chapterId: chapterId || null,
        objectiveIds: chosen,
        confirm,
      });
      if (result.status === "saved") return onClose();
      setMessage(result.message);
    });
  }

  // The sections each chosen TP will be linked to, the same rule saveMaterialAction uses.
  const sectionObjectives = new Map<string, Objective[]>();
  for (const objective of chosenObjectives) {
    const suggestedSections = detail.mappings
      .filter((mapping) => mapping.learningObjective.id === objective.id)
      .map((mapping) => mapping.sectionId);
    const sections = suggestedSections.length > 0 ? suggestedSections : detail.sections.map((section) => section.id);
    for (const sectionId of new Set(sections)) sectionObjectives.set(sectionId, [...(sectionObjectives.get(sectionId) ?? []), objective]);
  }

  const detailFields = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className={fieldLabelClassName}>Upload Dokumen</span>
        <div className={cn(inputBoxClassName, "flex h-[50px] items-center gap-3 bg-[#f0edef] text-[#45474c]")}>
          <Image alt="" height={24} src="/materials/title-upload.svg" width={24} />
          <span className="truncate">{detail.originalFilename}</span>
        </div>
      </div>
      <TextField
        error={errors.title}
        id={`${formId}-title`}
        label="Judul Materi"
        maxLength={200}
        name="title"
        onChange={(event) => {
          setTitle(event.target.value);
          setErrors((current) => ({ ...current, title: undefined }));
        }}
        placeholder="Masukkan nama materi..."
        value={title}
      />
      <div className="flex flex-col gap-2">
        <label className={fieldLabelClassName} htmlFor={`${formId}-chapter`}>
          Bab
        </label>
        <div className="relative">
          <select
            className={cn(inputBoxClassName, "h-[50px] appearance-none pr-12", !chapterId && "text-[#75777d]")}
            id={`${formId}-chapter`}
            onChange={(event) => setChapterId(event.target.value)}
            value={chapterId}
          >
            <option value="">{chapters.length === 0 ? "Belum ada Bab final" : "Pilih bab..."}</option>
            {chapters.map((entry) => (
              <option key={entry.id} value={entry.id}>
                Bab {entry.number}: {entry.name}
              </option>
            ))}
          </select>
          <Image
            alt=""
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
            height={24}
            src="/materials/chevron-down.svg"
            width={24}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className={fieldLabelClassName}>Tujuan Pembelajaran (TP)</span>
        <ObjectivePicker
          chapterId={chapterId}
          chosen={chosen}
          invalid={Boolean(errors.objectives)}
          objectives={objectives}
          onToggle={toggle}
          suggested={suggested}
        />
        <p className={cn("text-xs leading-normal", errors.objectives ? "font-semibold text-[#dc2626]" : "text-[#75777d]")}>
          {errors.objectives ??
            (suggestedIds.length > 0
              ? "Bisa pilih lebih dari 1. TP bertanda Disarankan dipilih otomatis dari isi materi; sesuaikan bila kurang tepat."
              : "Bisa pilih lebih dari 1.")}
        </p>
        {chosenObjectives.length > 0 && (
          <ul className="flex flex-col gap-3">
            {chosenObjectives.map((objective) => (
              <li className="flex items-center gap-4" key={objective.id}>
                <span aria-hidden className="size-4 shrink-0 rounded-full bg-[#00376f]" />
                <span className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#c5c6cd] bg-[#e6eff9] px-4 py-3 text-base leading-normal text-[#1b1b1d]">
                  <span className="min-w-0 flex-1">
                    <span className="font-semibold">TP {objective.number}</span> {objective.description}
                  </span>
                  {suggested.has(objective.id) && (
                    <span className="shrink-0 rounded-3xl bg-[rgba(153,188,229,0.6)] px-2 py-0.5 text-[10px] text-[#004695]">
                      Disarankan
                    </span>
                  )}
                  <button
                    aria-label={`Hapus TP ${objective.number}`}
                    className={cn(iconButtonClassName, "shrink-0 text-lg leading-none")}
                    onClick={() => toggle(objective.id)}
                    type="button"
                  >
                    ×
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  const review = (
    <div className="flex flex-col gap-2">
      <span className={fieldLabelClassName}>Review</span>
      <div className="overflow-hidden rounded-xl border border-[#c5c6cd]">
        <div className="flex items-center gap-4 bg-[#fafbfd] px-3 py-3">
          <span className="grid size-16 shrink-0 place-items-center rounded-full bg-[rgba(153,188,229,0.6)]">
            <Image alt="" height={36} src="/materials/file.svg" width={32} />
          </span>
          <div className="min-w-0 leading-normal">
            <p className="truncate text-xl font-semibold text-[#1b1b1d]">{detail.originalFilename}</p>
            <p className="text-base text-[#75777d]">
              {formatSize(detail.sizeBytes)} &nbsp;|&nbsp; {formatLabels[detail.format]}
            </p>
          </div>
        </div>
        <dl className="flex flex-col gap-3 border-t border-[#c5c6cd] bg-[#e6eff9] p-3">
          <div className="flex flex-col gap-2">
            <dt className={fieldLabelClassName}>Judul Materi</dt>
            <dd className="rounded-xl border border-[#c5c6cd] bg-[#fbf8fa] px-3 py-2.5 text-base">{title.trim()}</dd>
          </div>
          <div className="flex flex-col gap-2">
            <dt className={fieldLabelClassName}>Nama Bab</dt>
            <dd className="rounded-xl border border-[#c5c6cd] bg-[#fbf8fa] px-4 py-3 text-base">
              {chapter ? `Bab ${chapter.number}: ${chapter.name}` : "Tanpa Bab"}
            </dd>
          </div>
          <div className="flex flex-col gap-2">
            <dt className={fieldLabelClassName}>Tujuan Pembelajaran (TP)</dt>
            {chosenObjectives.map((objective) => (
              <dd className="rounded-xl border border-[#c5c6cd] bg-[#fbf8fa] px-4 py-3 text-base" key={objective.id}>
                <span className="font-semibold">TP {objective.number}</span> {objective.description}
              </dd>
            ))}
          </div>
          {detail.sections.length > 0 && (
            <details className="group rounded-xl border border-[#c5c6cd] bg-[#fbf8fa] px-4 py-3 text-sm leading-normal">
              <summary className="cursor-pointer font-semibold text-[#0058be]">
                Lihat pemetaan per bagian ({detail.sections.length} bagian)
              </summary>
              <ol className="mt-3 flex max-h-64 flex-col gap-3 overflow-y-auto pr-1">
                {detail.sections.map((section) => {
                  const linked = sectionObjectives.get(section.id) ?? [];
                  return (
                    <li className="flex flex-col gap-1 border-b border-[#c5c6cd] pb-3 last:border-b-0" key={section.id}>
                      <p className="font-semibold text-[#1b1b1d]">
                        {section.heading || `Bagian ${section.position}`}
                        {section.sourcePage && <span className="font-normal text-[#75777d]"> · hlm. {section.sourcePage}</span>}
                      </p>
                      <p className="line-clamp-2 text-[#45474c]">{section.body}</p>
                      <p className="text-xs text-[#004695]">
                        {linked.length > 0 ? linked.map((objective) => `TP ${objective.number}`).join(", ") : "Tidak dipetakan"}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </details>
          )}
        </dl>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 text-left">
      {mode === "new" && <Stepper step={step} />}
      {mode === "new" && step === "review" ? review : detailFields}
      {message && (
        <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm leading-5 text-[#93000a]" role="alert">
          {message}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-[10px]">
        {draft ? (
          <button className={greyButtonClassName} disabled={pending} onClick={() => save(false)} type="button">
            Simpan Draft
          </button>
        ) : (
          <button className={outlineButtonClassName} disabled={pending} onClick={onClose} type="button">
            Batal
          </button>
        )}
        {mode === "new" && step === "detail" && (
          <button className={primaryButtonClassName} onClick={() => validate() && setStep("review")} type="button">
            Next
          </button>
        )}
        {mode === "new" && step === "review" && (
          <>
            <button className={outlineButtonClassName} disabled={pending} onClick={() => setStep("detail")} type="button">
              Kembali
            </button>
            <button className={primaryButtonClassName} disabled={pending} onClick={() => save(true)} type="button">
              {pending ? "Menyimpan..." : "Upload Materi"}
            </button>
          </>
        )}
        {mode === "edit" && (
          <button className={primaryButtonClassName} disabled={pending} onClick={() => save(true)} type="button">
            {pending ? "Menyimpan..." : "Simpan"}
          </button>
        )}
      </div>
    </div>
  );
}

// Loads the extracted sections and suggested TPs, then shows the form. Mounted only while open.
function MaterialLoader({
  slug,
  mode,
  material,
  chapters,
  onClose,
}: {
  slug: string;
  mode: MaterialFormMode;
  material: Material;
  chapters: CurriculumChapter[];
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<MaterialDetail>();
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    let active = true;
    getMaterialAction(material.id).then((result) => {
      if (!active) return;
      if (result.status === "error") setMessage(result.message);
      else setDetail(result.material);
    });
    return () => {
      active = false;
    };
  }, [material.id]);

  if (message) {
    return (
      <div className="flex flex-col gap-4">
        <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm leading-5 text-[#93000a]" role="alert">
          {message}
        </p>
        <button className={cn(outlineButtonClassName, "self-end")} onClick={onClose} type="button">
          Tutup
        </button>
      </div>
    );
  }
  if (!detail) return <p className="py-10 text-center text-sm text-[#45474c]">Memuat materi...</p>;
  return <MaterialForm chapters={chapters} detail={detail} mode={mode} onClose={onClose} slug={slug} />;
}

export function MaterialFormModal({
  slug,
  target,
  chapters,
  onClose,
}: {
  slug: string;
  target: { mode: MaterialFormMode; material: Material } | null;
  // Final Babs only: TPs of a draft Bab cannot be mapped yet.
  chapters: CurriculumChapter[];
  onClose: () => void;
}) {
  return (
    <Modal
      className={wideModalClassName}
      onClose={onClose}
      open={Boolean(target)}
      title={target?.mode === "edit" ? "Edit Materi" : "Upload Materi Baru"}
    >
      {target && (
        <MaterialLoader
          chapters={chapters}
          key={target.material.id}
          material={target.material}
          mode={target.mode}
          onClose={onClose}
          slug={slug}
        />
      )}
    </Modal>
  );
}
