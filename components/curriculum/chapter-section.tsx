"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { outlineButtonClassName } from "@/components/auth/styles";
import { cn } from "@/components/ui/cn";
import type { CurriculumChapter, CurriculumCp } from "@/lib/api/types";
import { StatusFilter, type StatusFilterOption } from "./status-filter";
import { addButtonClassName, iconButtonClassName, sectionClassName } from "./styles";

function BookIcon({ className }: { className?: string }) {
  return (
    <Image alt="" className={cn("h-[70px] w-auto shrink-0", className)} height={78} src="/curriculum/book.svg" width={67} />
  );
}

function Header() {
  return (
    <>
      <h2 className="flex items-center gap-3 py-1 text-xl font-semibold leading-normal text-[#1b1b1d]">
        <Image alt="" height={24} src="/curriculum/chapter-list.svg" width={24} />
        List Bab
      </h2>
      <hr className="border-[#c5c6cd]" />
    </>
  );
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-end">
      <button aria-label="Tambah Bab Baru" className={addButtonClassName} onClick={onClick} type="button">
        <Image alt="" height={36} src="/curriculum/add-large.svg" width={36} />
      </button>
    </div>
  );
}

const cpNames = (chapter: CurriculumChapter, cps: Map<string, CurriculumCp>) =>
  chapter.cpIds.map((id) => cps.get(id)?.element ?? "CP").join(", ") || "Belum dipilih";

// A Bab in the list (Figma New Design 50:3478, 54:6916). Final Babs open their detail; drafts carry "Lanjut edit".
function ChapterCard({
  chapter,
  cps,
  href,
  onContinue,
}: {
  chapter: CurriculumChapter;
  cps: Map<string, CurriculumCp>;
  href: string;
  onContinue: () => void;
}) {
  const draft = chapter.status === "draft";
  const body = (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <BookIcon />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-normal">
        <p className="flex flex-wrap items-center gap-2 text-xl font-semibold text-[#1b1b1d]">
          <span className="whitespace-pre-wrap">
            Bab {chapter.number}:{"   "}
            {chapter.name}
          </span>
          {draft && (
            <span className="rounded-3xl border border-[#7c2d12] bg-[rgba(254,215,170,0.6)] px-2 py-0.5 text-xs font-semibold text-[#c2410c]">
              Draft
            </span>
          )}
        </p>
        <p className="truncate text-base text-[#75777d]">CP: {cpNames(chapter, cps)}</p>
        <p className="truncate text-base text-[#75777d]">
          TP: {chapter.learningObjectives.map((objective) => objective.description).join(", ") || "Belum ada"}
        </p>
      </div>
    </div>
  );

  return (
    <article className="flex flex-col items-end gap-3 rounded-xl border border-[#c5c6cd] bg-[#fafbfd] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      {draft ? (
        <>
          <div className="flex w-full">{body}</div>
          <button className={outlineButtonClassName} onClick={onContinue} type="button">
            Lanjut edit
          </button>
        </>
      ) : (
        <Link className="flex w-full rounded-lg hover:bg-[#f5f3f4] focus-visible:outline-2 focus-visible:outline-[#0058be]" href={href} scroll={false}>
          {body}
        </Link>
      )}
    </article>
  );
}

type ChapterFilter = "all" | "final" | "draft";

// List Bab filters (UAT KUR-H04): every Bab, the saved (final) ones, or the drafts.
const chapterFilters: StatusFilterOption<ChapterFilter>[] = [
  { value: "all", label: "Lihat Semua", tone: "neutral" },
  { value: "final", label: "Sudah Di-upload", tone: "blue" },
  { value: "draft", label: "Draft", tone: "orange" },
];

const emptyChapterText: Record<ChapterFilter, string> = {
  all: "",
  final: "Belum ada Bab yang sudah di-upload.",
  draft: "Belum ada Bab berstatus Draft.",
};

// Daftar Bab (FR-G-023; Figma New Design 37:5961, 50:3478, 54:6916).
export function ChapterSection({
  chapters,
  cps,
  baseHref,
  onCreate,
  onContinue,
}: {
  chapters: CurriculumChapter[];
  cps: Map<string, CurriculumCp>;
  baseHref: string;
  onCreate: () => void;
  onContinue: (chapter: CurriculumChapter) => void;
}) {
  const [filter, setFilter] = useState<ChapterFilter>("all");
  const shown = filter === "all" ? chapters : chapters.filter((chapter) => chapter.status === filter);

  return (
    <section className={sectionClassName}>
      <Header />
      {chapters.length === 0 ? (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          <p className="text-base leading-normal text-[#45474c]">Anda belum menambah Bab di mata pelajaran ini.</p>
          <button className="group flex flex-col items-center gap-3" onClick={onCreate} type="button">
            <span className="grid size-32 place-items-center rounded-full bg-[#e6eff9] transition-colors group-hover:bg-[#d3e3f6]">
              <Image alt="" height={72} src="/curriculum/add-large.svg" width={72} />
            </span>
            <span className="text-base font-semibold leading-normal text-[#0058be]">Tambah Bab Baru</span>
          </button>
        </div>
      ) : (
        <>
          <StatusFilter label="Saring Bab" onChange={setFilter} options={chapterFilters} value={filter} />
          {shown.length === 0 && <p className="px-1 text-sm leading-normal text-[#45474c]">{emptyChapterText[filter]}</p>}
          <div className="flex max-h-[490px] flex-col gap-3 overflow-y-auto p-1">
            {shown.map((chapter) => (
              <ChapterCard
                chapter={chapter}
                cps={cps}
                href={`${baseHref}?bab=${chapter.id}`}
                key={chapter.id}
                onContinue={() => onContinue(chapter)}
              />
            ))}
          </div>
          <AddButton onClick={onCreate} />
        </>
      )}
      <hr className="border-[#c5c6cd]" />
    </section>
  );
}

function DetailBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold leading-normal text-[#1b1b1d]">{label}</p>
      {children}
    </div>
  );
}

const boxClassName = "rounded-xl border border-[#c5c6cd] bg-[#fafbfd] px-3 py-2 text-base leading-normal text-black";

// The body of a Bab: its CPs, numbered TPs, Subbabs and notes. Shared by the detail view and the form's Review step.
export function ChapterSummary({
  cps,
  chapterCps,
  objectives,
  subchapters,
  notes,
}: {
  cps: Map<string, CurriculumCp>;
  chapterCps: string[];
  objectives: { number: string; description: string; cpId: string }[];
  subchapters: string[];
  notes: string | null;
}) {
  return (
    <div className="flex flex-col gap-3 bg-[#e6eff9] px-3 pb-6 pt-3">
      <DetailBlock label="Capaian Pembelajaran">
        {chapterCps.length === 0 ? (
          <p className={boxClassName}>-</p>
        ) : (
          chapterCps.map((cpId) => {
            const cp = cps.get(cpId);
            return (
              <div className={cn(boxClassName, "flex flex-col gap-1")} key={cpId}>
                <p className="font-semibold">{cp?.element ?? "CP"}</p>
                <p>{cp?.description}</p>
              </div>
            );
          })
        )}
      </DetailBlock>
      <DetailBlock label="Tujuan Pembelajaran">
        <div className={cn(boxClassName, "px-4 py-3")}>
          {objectives.length === 0 ? (
            <p>-</p>
          ) : (
            <ul className="list-disc pl-6 text-[#1b1b1d]">
              {objectives.map((objective) => (
                <li key={`${objective.number}-${objective.description}`}>
                  TP {objective.number}: {objective.description}
                  {chapterCps.length > 1 && (
                    <span className="text-[#75777d]"> ({cps.get(objective.cpId)?.element ?? "CP"})</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </DetailBlock>
      {subchapters.length > 0 && (
        <DetailBlock label="Subbab">
          <ul className={cn(boxClassName, "list-disc py-3 pl-10")}>
            {subchapters.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </DetailBlock>
      )}
      <DetailBlock label="Keterangan Tambahan">
        <p className={cn(boxClassName, "whitespace-pre-wrap")}>{notes || "-"}</p>
      </DetailBlock>
    </div>
  );
}

// The card head of a Bab: icon, "Bab N: Nama", and a subtitle (Figma New Design 50:4009, 50:4735).
export function ChapterHead({
  number,
  name,
  subtitle,
  actions,
}: {
  number: number | string;
  name: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-t-xl border border-[#c5c6cd] bg-[#fafbfd] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <BookIcon className="h-[60px]" />
      <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch leading-normal">
        <p className="whitespace-pre-wrap text-xl font-semibold text-[#1b1b1d]">
          Bab {number}:{"   "}
          {name}
        </p>
        <p className="text-base text-[#75777d]">{subtitle}</p>
      </div>
      {actions}
    </div>
  );
}

// Detail Bab (?bab=, Figma New Design 50:4009).
export function ChapterDetail({
  chapter,
  cps,
  subtitle,
  backHref,
  onEdit,
  onDelete,
  onCreate,
}: {
  chapter: CurriculumChapter;
  cps: Map<string, CurriculumCp>;
  subtitle: string;
  backHref: string;
  onEdit: () => void;
  onDelete: () => void;
  onCreate: () => void;
}) {
  return (
    <section className={sectionClassName}>
      <Header />
      <Link
        className="flex w-fit items-center gap-1 rounded-3xl border border-[#0058be] px-3 py-1 text-xs font-semibold text-[#0058be] hover:bg-[#e6eff9]"
        href={backHref}
        scroll={false}
      >
        ← Kembali
      </Link>
      <div className="flex flex-col">
        <ChapterHead
          actions={
            <div className="flex shrink-0 items-center gap-1">
              <button aria-label="Edit Bab" className={iconButtonClassName} onClick={onEdit} type="button">
                <Image alt="" height={18} src="/subjects/pencil.svg" width={18} />
              </button>
              <button aria-label="Hapus Bab" className={iconButtonClassName} onClick={onDelete} type="button">
                <Image alt="" height={18} src="/subjects/trash.svg" width={18} />
              </button>
            </div>
          }
          name={chapter.name}
          number={chapter.number}
          subtitle={subtitle}
        />
        <div className="overflow-hidden rounded-b-xl border-x border-b border-[#c5c6cd]">
          <ChapterSummary
            chapterCps={chapter.cpIds}
            cps={cps}
            notes={chapter.notes}
            objectives={chapter.learningObjectives}
            subchapters={chapter.subchapters.map((subchapter) => subchapter.name)}
          />
        </div>
      </div>
      <AddButton onClick={onCreate} />
      <hr className="border-[#c5c6cd]" />
    </section>
  );
}
