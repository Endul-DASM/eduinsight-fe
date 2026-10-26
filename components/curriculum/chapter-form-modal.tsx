"use client";

import Image from "next/image";
import { type KeyboardEvent, useId, useState, useTransition } from "react";
import { outlineButtonClassName, primaryButtonClassName } from "@/components/auth/styles";
import { TextField } from "@/components/auth/text-field";
import { cn } from "@/components/ui/cn";
import { Modal } from "@/components/ui/modal";
import { focusFirstError } from "@/components/ui/focus-first-error";
import { SelectMenu as SelectInput } from "@/components/ui/select-menu";
import { saveChapterAction } from "@/lib/actions/curriculum";
import type { ChapterInput } from "@/lib/api/curriculum";
import type { CurriculumChapter, CurriculumCp } from "@/lib/api/types";
import { DUPLICATE_OBJECTIVE_MESSAGE, type FieldErrors, validateChapter } from "@/lib/curriculum-form";
import { ChapterHead, ChapterSummary } from "./chapter-section";
import { ConfirmModal } from "./confirm-modal";
import {
  fieldLabelClassName,
  greyButtonClassName,
  iconButtonClassName,
  inputBoxClassName,
  redOutlineButtonClassName,
  wideModalClassName,
} from "./styles";

// "create" and "continue" (a draft) use the two steps of Figma 50:3662 / 50:4735; "edit" (a final Bab) is the single
// page of Figma 50:5947 with Hapus and Simpan.
export type ChapterFormMode = "create" | "continue" | "edit";

type DraftObjective = { key: string; id?: string; description: string; keywords: string[] };
type CpBlock = { key: string; cpId: string; objectives: DraftObjective[]; text: string; copyOpen: boolean };
type DraftSubchapter = { key: string; id?: string; name: string };

const TAKEN_MESSAGE = "TP ini sudah ada di Bab ini.";

let nextKey = 0;
const newKey = () => `k${(nextKey += 1)}`;

function initialBlocks(chapter?: CurriculumChapter): CpBlock[] {
  if (!chapter || chapter.cpIds.length === 0) return [{ key: newKey(), cpId: "", objectives: [], text: "", copyOpen: false }];
  return chapter.cpIds.map((cpId) => ({
    key: newKey(),
    cpId,
    text: "",
    copyOpen: false,
    objectives: chapter.learningObjectives
      .filter((objective) => objective.cpId === cpId)
      .sort((a, b) => a.position - b.position)
      .map((objective) => ({
        key: newKey(),
        id: objective.id,
        description: objective.description,
        keywords: objective.keywords,
      })),
  }));
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
        Detail Bab
      </li>
      <li aria-hidden className={cn("h-0.5 w-20 sm:w-[324px]", step === "review" ? "bg-[#0058be]" : "bg-[#c5c6cd]")} />
      <li className={cn("flex items-center gap-2", step === "review" ? "text-[#0058be]" : "text-[#75777d]")}>
        <span className={circle(step === "review")}>2</span>
        Review
      </li>
    </ol>
  );
}

function ChapterForm({
  slug,
  subjectId,
  subjectName,
  mode,
  chapter,
  chapters,
  cps,
  onClose,
  onDelete,
}: {
  slug: string;
  subjectId: string;
  subjectName: string;
  mode: ChapterFormMode;
  chapter?: CurriculumChapter;
  chapters: CurriculumChapter[];
  cps: CurriculumCp[];
  onClose: () => void;
  onDelete: () => void;
}) {
  const others = chapters.filter((entry) => entry.id !== chapter?.id);
  const takenNumbers = others.map((entry) => entry.number);
  const suggestedNumber = Math.max(0, ...chapters.map((entry) => entry.number)) + 1;
  const cpById = new Map(cps.map((cp) => [cp.id, cp]));
  const formId = useId();

  const [step, setStep] = useState<"detail" | "review">("detail");
  const [number, setNumber] = useState(String(chapter?.number ?? suggestedNumber));
  const [name, setName] = useState(chapter?.name ?? "");
  const [blocks, setBlocks] = useState<CpBlock[]>(() => initialBlocks(chapter));
  const [subchapters, setSubchapters] = useState<DraftSubchapter[]>(
    chapter?.subchapters.map((subchapter) => ({ key: newKey(), id: subchapter.id, name: subchapter.name })) ?? [],
  );
  const [subchapterText, setSubchapterText] = useState("");
  const [notes, setNotes] = useState(chapter?.notes ?? "");
  const [editing, setEditing] = useState<{ objectiveKey: string; text: string } | null>(null);
  const [removing, setRemoving] = useState<{ blockKey: string; objectiveKey: string } | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string>();
  // A message under one CP block's TP input, e.g. a TP that is already in the Bab (UAT KUR-H03).
  const [blockErrors, setBlockErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const updateBlock = (key: string, change: (block: CpBlock) => CpBlock) =>
    setBlocks((current) => current.map((block) => (block.key === key ? change(block) : block)));

  const setBlockError = (key: string, text?: string) =>
    setBlockErrors((current) => {
      const next = { ...current };
      if (text) next[key] = text;
      else delete next[key];
      return next;
    });

  // A TP text may appear once in the whole Bab, under any of its CPs; letter case and spaces around it do not count.
  const isTaken = (text: string, exceptKey?: string) => {
    const wanted = text.trim().toLowerCase();
    return blocks.some((block) =>
      block.objectives.some((objective) => objective.key !== exceptKey && objective.description.trim().toLowerCase() === wanted),
    );
  };

  function addObjective(block: CpBlock, text = block.text) {
    const description = text.trim();
    if (!description) return;
    if (isTaken(description)) {
      setBlockError(block.key, TAKEN_MESSAGE);
      return;
    }
    setBlockError(block.key);
    updateBlock(block.key, (current) => ({
      ...current,
      text: text === current.text ? "" : current.text,
      objectives: [...current.objectives, { key: newKey(), description, keywords: [] }],
    }));
  }

  function input(status: "draft" | "final"): ChapterInput {
    const picked = blocks.filter((block) => block.cpId);
    return {
      number: Number(number),
      name: name.trim(),
      notes: notes.trim() || null,
      status,
      cpIds: [...new Set(picked.map((block) => block.cpId))],
      learningObjectives: picked.flatMap((block) =>
        block.objectives.map((objective) => ({
          ...(objective.id ? { id: objective.id } : {}),
          cpId: block.cpId,
          description: objective.description.trim(),
          // Kept so the material-mapping dictionary of an existing TP survives the edit.
          keywords: objective.keywords,
        })),
      ),
      subchapters: subchapters.map((subchapter) => ({
        ...(subchapter.id ? { id: subchapter.id } : {}),
        name: subchapter.name.trim(),
      })),
    };
  }

  // The blocks holding a TP that already appeared earlier in the Bab, e.g. from an older save.
  function duplicateBlocks(): Record<string, string> {
    const seen = new Set<string>();
    const found: Record<string, string> = {};
    for (const block of blocks.filter((entry) => entry.cpId)) {
      for (const objective of block.objectives) {
        const text = objective.description.trim().toLowerCase();
        if (seen.has(text)) found[block.key] ??= `TP "${objective.description.trim()}" sudah ada di Bab ini.`;
        seen.add(text);
      }
    }
    return found;
  }

  function check(status: "draft" | "final") {
    const found = validateChapter(input(status), takenNumbers);
    // The duplicate message goes under the CP block that holds the repeated TP, not under the last block.
    const duplicates = found.learningObjectives === DUPLICATE_OBJECTIVE_MESSAGE ? duplicateBlocks() : {};
    if (Object.keys(duplicates).length > 0) delete found.learningObjectives;
    setErrors(found);
    setBlockErrors(duplicates);
    setMessage(undefined);
    return Object.keys(found).length === 0 && Object.keys(duplicates).length === 0;
  }

  function save(status: "draft" | "final") {
    if (!check(status)) {
      setStep("detail");
      return focusFirstError();
    }
    startTransition(async () => {
      const result = await saveChapterAction(slug, subjectId, chapter?.id ?? null, input(status), takenNumbers);
      if (result.status === "saved") return onClose();
      const fields = result.fields ?? {};
      // Field names the form shows; anything else (e.g. learningObjectives.2.cpId) becomes the general message.
      const known = ["number", "name", "cpIds", "learningObjectives"];
      setErrors(Object.fromEntries(Object.entries(fields).filter(([field]) => known.includes(field))));
      setMessage(
        result.message ??
          Object.entries(fields)
            .filter(([field]) => !known.includes(field))
            .map(([, text]) => text)[0],
      );
      setStep("detail");
      focusFirstError();
    });
  }

  const flatObjectives = blocks
    .filter((block) => block.cpId)
    .flatMap((block) => block.objectives.map((objective) => ({ ...objective, cpId: block.cpId })))
    .map((objective, index) => ({ ...objective, number: `${number || "?"}.${index + 1}` }));
  const usedCpIds = new Set(blocks.map((block) => block.cpId).filter(Boolean));

  const detail = (
    <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-1">
      <div className="flex flex-col gap-2">
        <label className={fieldLabelClassName} htmlFor={`${formId}-number`}>
          Nomor Bab
        </label>
        <div className="relative">
          <input
            aria-invalid={errors.number ? true : undefined}
            className={cn(
              inputBoxClassName,
              "h-[50px] appearance-none pr-12 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
              errors.number && "border-[#dc2626]",
            )}
            id={`${formId}-number`}
            inputMode="numeric"
            max={99}
            min={1}
            onChange={(event) => setNumber(event.target.value)}
            placeholder="Masukkan nomor urutan bab..."
            type="number"
            value={number}
          />
          <div className="absolute right-[13px] top-1/2 flex h-6 w-6 -translate-y-1/2 flex-col">
            <Image alt="" className="pointer-events-none absolute inset-0" height={24} src="/curriculum/chevrons-up-down.svg" width={24} />
            <button
              aria-label="Naikkan nomor"
              className="h-1/2 w-full"
              onClick={() => setNumber(String(Math.min(99, (Number(number) || 0) + 1)))}
              type="button"
            />
            <button
              aria-label="Turunkan nomor"
              className="h-1/2 w-full"
              onClick={() => setNumber(String(Math.max(1, (Number(number) || 2) - 1)))}
              type="button"
            />
          </div>
        </div>
        {errors.number && <p className="text-xs font-semibold text-[#dc2626]">{errors.number}</p>}
      </div>

      <TextField
        error={errors.name}
        label="Nama Bab"
        maxLength={200}
        name="name"
        onChange={(event) => setName(event.target.value)}
        placeholder="Masukkan nama bab..."
        value={name}
      />

      {blocks.map((block, blockIndex) => {
        const options = cps.filter((cp) => cp.id === block.cpId || !usedCpIds.has(cp.id));
        const copyable = block.cpId
          ? others.flatMap((other) =>
              other.learningObjectives
                .filter(
                  (objective) =>
                    objective.cpId === block.cpId && !isTaken(objective.description),
                )
                .map((objective) => ({ ...objective, chapterLabel: `Bab ${other.number}` })),
            )
          : [];
        const onEnter = (event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          addObjective(block);
        };

        return (
          <div
            className={cn("flex flex-col gap-3", blocks.length > 1 && "rounded-2xl border border-[#c5c6cd] p-3")}
            key={block.key}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className={fieldLabelClassName} htmlFor={`${formId}-cp-${block.key}`}>
                  Capaian Pembelajaran (CP){blocks.length > 1 ? ` ${blockIndex + 1}` : ""}
                </label>
                {blocks.length > 1 && (
                  <button
                    className="text-xs font-semibold text-[#dc2626] hover:underline"
                    onClick={() => setBlocks((current) => current.filter((entry) => entry.key !== block.key))}
                    type="button"
                  >
                    Hapus CP dari Bab
                  </button>
                )}
              </div>
              <SelectInput
                className={block.cpId ? "font-semibold" : undefined}
                id={`${formId}-cp-${block.key}`}
                invalid={Boolean(errors.cpIds && !block.cpId)}
                onChange={(event) => updateBlock(block.key, (current) => ({ ...current, cpId: event.target.value }))}
                value={block.cpId}
              >
                <option value="">{cps.length === 0 ? "Belum ada CP, tambahkan di Daftar CP" : "Pilih CP..."}</option>
                {options.map((cp) => (
                  <option key={cp.id} value={cp.id}>
                    {cp.element} (Fase {cp.fase})
                  </option>
                ))}
              </SelectInput>
              {block.cpId && <p className="text-xs leading-normal text-[#45474c]">{cpById.get(block.cpId)?.description}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className={fieldLabelClassName} htmlFor={`${formId}-tp-${block.key}`}>
                Tujuan Pembelajaran (TP)
              </label>
              <div className="flex items-stretch gap-3">
                <input
                  className={cn(inputBoxClassName, "h-[50px] flex-1")}
                  disabled={!block.cpId}
                  id={`${formId}-tp-${block.key}`}
                  maxLength={2000}
                  onChange={(event) => {
                    setBlockError(block.key);
                    updateBlock(block.key, (current) => ({ ...current, text: event.target.value }));
                  }}
                  onKeyDown={onEnter}
                  placeholder={block.cpId ? "Masukkan TP..." : "Pilih CP terlebih dahulu"}
                  value={block.text}
                />
                <button
                  aria-label="Tambah TP"
                  className="grid w-[54px] shrink-0 place-items-center rounded-xl border-2 border-[#0058be] bg-[#f5f3f4] drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)] hover:bg-[#e6eff9] disabled:opacity-50"
                  disabled={!block.cpId || !block.text.trim()}
                  onClick={() => addObjective(block)}
                  type="button"
                >
                  <Image alt="" height={24} src="/curriculum/add-small.svg" width={24} />
                </button>
              </div>
              {blockErrors[block.key] && (
                <p className="text-xs font-semibold text-[#dc2626]" role="alert">
                  {blockErrors[block.key]}
                </p>
              )}
              <p className="text-base leading-normal text-[#75777d]">*Urutan pemasukan TP akan menjadi nomor urut TP.</p>
            </div>

            {block.objectives.length > 0 && (
              <ul className="flex flex-col gap-3">
                {block.objectives.map((objective) => {
                  const isEditing = editing?.objectiveKey === objective.key;
                  return (
                    <li className="flex items-center gap-3" key={objective.key}>
                      <Image alt="" height={16} src="/curriculum/bullet.svg" width={16} />
                      <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#c5c6cd] bg-[#e6eff9] px-4 py-3">
                        {isEditing ? (
                          <input
                            aria-label="Ubah TP"
                            autoFocus
                            className="min-w-0 flex-1 rounded-md bg-white px-2 py-1 text-base text-[#1b1b1d] outline-none ring-2 ring-[#0058be]/30"
                            onBlur={() => {
                              const text = editing.text.trim();
                              if (text && isTaken(text, objective.key)) {
                                setBlockError(block.key, TAKEN_MESSAGE);
                              } else if (text) {
                                setBlockError(block.key);
                                updateBlock(block.key, (current) => ({
                                  ...current,
                                  objectives: current.objectives.map((entry) =>
                                    entry.key === objective.key ? { ...entry, description: text } : entry,
                                  ),
                                }));
                              }
                              setEditing(null);
                            }}
                            onChange={(event) => setEditing({ objectiveKey: objective.key, text: event.target.value })}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") (event.target as HTMLInputElement).blur();
                              if (event.key === "Escape") setEditing(null);
                            }}
                            value={editing.text}
                          />
                        ) : (
                          <p className="min-w-0 flex-1 text-base leading-normal text-[#1b1b1d]">{objective.description}</p>
                        )}
                        <button
                          aria-label="Ubah TP"
                          className={iconButtonClassName}
                          onClick={() => setEditing({ objectiveKey: objective.key, text: objective.description })}
                          type="button"
                        >
                          <Image alt="" height={12} src="/curriculum/pencil.svg" width={12} />
                        </button>
                        <button
                          aria-label="Hapus TP"
                          className={iconButtonClassName}
                          onClick={() => setRemoving({ blockKey: block.key, objectiveKey: objective.key })}
                          type="button"
                        >
                          <Image alt="" height={12} src="/curriculum/x.svg" width={12} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {copyable.length > 0 && (
              <div className="flex flex-col gap-2">
                <button
                  aria-expanded={block.copyOpen}
                  className="w-fit text-sm font-semibold text-[#0058be] hover:underline"
                  onClick={() => updateBlock(block.key, (current) => ({ ...current, copyOpen: !current.copyOpen }))}
                  type="button"
                >
                  {block.copyOpen ? "Tutup" : `Salin TP dari Bab lain (${copyable.length})`}
                </button>
                {block.copyOpen && (
                  <ul className="flex flex-col gap-2 rounded-xl border border-dashed border-[#99bce5] p-3">
                    {copyable.map((objective) => (
                      <li className="flex items-center gap-3 text-sm leading-normal" key={objective.id}>
                        <span className="shrink-0 font-semibold text-[#45474c]">{objective.chapterLabel}</span>
                        <span className="min-w-0 flex-1 text-[#1b1b1d]">{objective.description}</span>
                        <button
                          className="shrink-0 rounded-lg px-2 py-1 font-semibold text-[#0058be] hover:bg-[#e6eff9]"
                          onClick={() => addObjective(block, objective.description)}
                          type="button"
                        >
                          + Salin
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
      {errors.cpIds && <p className="text-xs font-semibold text-[#dc2626]">{errors.cpIds}</p>}
      {errors.learningObjectives && <p className="text-xs font-semibold text-[#dc2626]">{errors.learningObjectives}</p>}
      {usedCpIds.size < cps.length && blocks.every((block) => block.cpId) && (
        <button
          className="w-fit text-sm font-semibold text-[#0058be] hover:underline"
          onClick={() =>
            setBlocks((current) => [...current, { key: newKey(), cpId: "", objectives: [], text: "", copyOpen: false }])
          }
          type="button"
        >
          + Tambah CP lain untuk Bab ini
        </button>
      )}

      <div className="flex flex-col gap-2">
        <label className={fieldLabelClassName} htmlFor={`${formId}-subchapter`}>
          Subbab (Opsional)
        </label>
        <div className="flex items-stretch gap-3">
          <input
            className={cn(inputBoxClassName, "h-[50px] flex-1")}
            id={`${formId}-subchapter`}
            maxLength={200}
            onChange={(event) => setSubchapterText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              if (subchapterText.trim()) {
                setSubchapters((current) => [...current, { key: newKey(), name: subchapterText.trim() }]);
                setSubchapterText("");
              }
            }}
            placeholder="Masukkan nama subbab..."
            value={subchapterText}
          />
          <button
            aria-label="Tambah Subbab"
            className="grid w-[54px] shrink-0 place-items-center rounded-xl border-2 border-[#0058be] bg-[#f5f3f4] drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)] hover:bg-[#e6eff9] disabled:opacity-50"
            disabled={!subchapterText.trim()}
            onClick={() => {
              setSubchapters((current) => [...current, { key: newKey(), name: subchapterText.trim() }]);
              setSubchapterText("");
            }}
            type="button"
          >
            <Image alt="" height={24} src="/curriculum/add-small.svg" width={24} />
          </button>
        </div>
        {subchapters.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {subchapters.map((subchapter) => (
              <li
                className="flex items-center gap-2 rounded-3xl border border-[#c5c6cd] bg-[#e6eff9] py-1 pl-3 pr-1 text-sm text-[#1b1b1d]"
                key={subchapter.key}
              >
                {subchapter.name}
                <button
                  aria-label={`Hapus Subbab ${subchapter.name}`}
                  className={iconButtonClassName}
                  onClick={() => setSubchapters((current) => current.filter((entry) => entry.key !== subchapter.key))}
                  type="button"
                >
                  <Image alt="" height={12} src="/curriculum/x.svg" width={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className={fieldLabelClassName} htmlFor={`${formId}-notes`}>
          Keterangan (Opsional)
        </label>
        <textarea
          className={cn(inputBoxClassName, "min-h-[50px] py-3")}
          id={`${formId}-notes`}
          maxLength={2000}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Masukkan keterangan... (Opsional)"
          rows={2}
          value={notes}
        />
      </div>
    </div>
  );

  const review = (
    <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-1 text-left">
      <p className="text-xs font-semibold leading-normal text-[#45474c]">Review</p>
      <div className="flex flex-col">
        <ChapterHead name={name.trim() || "-"} number={number || "?"} subtitle={subjectName} />
        <div className="overflow-hidden rounded-b-xl border-x border-b border-[#c5c6cd]">
          <ChapterSummary
            chapterCps={[...usedCpIds]}
            cps={cpById}
            notes={notes.trim() || null}
            objectives={flatObjectives}
            subchapters={subchapters.map((subchapter) => subchapter.name)}
          />
        </div>
      </div>
    </div>
  );

  const removingObjective = removing
    ? blocks.find((block) => block.key === removing.blockKey)?.objectives.find((entry) => entry.key === removing.objectiveKey)
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      {mode !== "edit" && <Stepper step={step} />}
      {step === "detail" ? detail : review}
      {message && (
        <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm leading-5 text-[#93000a]" role="alert">
          {message}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-[10px]">
        {mode === "edit" ? (
          <>
            <button className={redOutlineButtonClassName} disabled={pending} onClick={onDelete} type="button">
              Hapus
            </button>
            <button className={primaryButtonClassName} disabled={pending} onClick={() => save("final")} type="button">
              {pending ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        ) : (
          <>
            <button className={greyButtonClassName} disabled={pending} onClick={() => save("draft")} type="button">
              {pending ? "Menyimpan..." : "Simpan Draft"}
            </button>
            {step === "review" && (
              <button className={outlineButtonClassName} disabled={pending} onClick={() => setStep("detail")} type="button">
                Sebelumnya
              </button>
            )}
            {step === "detail" ? (
              <button
                className={primaryButtonClassName}
                disabled={pending}
                onClick={() => check("final") && setStep("review")}
                type="button"
              >
                Next
              </button>
            ) : (
              <button className={primaryButtonClassName} disabled={pending} onClick={() => save("final")} type="button">
                {pending ? "Menyimpan..." : "Tambah Bab"}
              </button>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        description="Anda masih bisa menambahkan TP setelah ini."
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          if (removing) {
            updateBlock(removing.blockKey, (current) => ({
              ...current,
              objectives: current.objectives.filter((entry) => entry.key !== removing.objectiveKey),
            }));
          }
          setRemoving(null);
        }}
        open={Boolean(removingObjective)}
        title="Apakah Anda yakin ingin menghapus TP ini?"
      />
    </div>
  );
}

// Tambah Bab Baru / Edit Bab (FR-G-021, FR-G-023; Figma New Design 50:3662, 50:4735, 50:5947).
export function ChapterFormModal({
  open,
  mode,
  chapter,
  onClose,
  ...props
}: {
  open: boolean;
  mode: ChapterFormMode;
  chapter?: CurriculumChapter;
  slug: string;
  subjectId: string;
  subjectName: string;
  chapters: CurriculumChapter[];
  cps: CurriculumCp[];
  onClose: () => void;
  onDelete: () => void;
}) {
  const title = mode === "edit" ? "Edit Bab" : mode === "continue" ? `Lanjutkan Bab ${chapter?.number ?? ""}` : "Tambah Bab Baru";

  return (
    <Modal className={wideModalClassName} onClose={onClose} open={open} title={title}>
      <ChapterForm chapter={chapter} key={`${mode}-${chapter?.id ?? "new"}`} mode={mode} onClose={onClose} {...props} />
    </Modal>
  );
}
