"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteChapterAction, deleteCpAction } from "@/lib/actions/curriculum";
import type { CurriculumChapter, CurriculumCp, CurriculumTree, Fase } from "@/lib/api/types";
import { ChapterDetail, ChapterSection } from "./chapter-section";
import { ChapterFormModal, type ChapterFormMode } from "./chapter-form-modal";
import { ConfirmModal } from "./confirm-modal";
import { CpFormModal } from "./cp-form-modal";
import { CpImportModal } from "./cp-import-modal";
import { CpSection, faseChoices } from "./cp-section";

type ChapterForm = { mode: ChapterFormMode; chapter?: CurriculumChapter } | null;
type Deleting = { kind: "cp"; cp: CurriculumCp } | { kind: "chapter"; chapter: CurriculumChapter } | null;

// The Kurikulum tab: Daftar CP on top, Daftar Bab (or one Bab's detail) below, and their modals.
export function CurriculumBoard({
  slug,
  subjectId,
  subjectName,
  subtitle,
  tree,
  selectedChapterId,
}: {
  slug: string;
  subjectId: string;
  subjectName: string;
  // "Matematika | X-1 MIPA" on a Bab's detail.
  subtitle: string;
  tree: CurriculumTree;
  selectedChapterId: string | null;
}) {
  const router = useRouter();
  const baseHref = `/${slug}/curriculum`;
  const cpById = new Map(tree.cps.map((cp) => [cp.id, cp]));
  const chapters = [...tree.chapters].sort((a, b) => a.number - b.number);
  const selected = chapters.find((chapter) => chapter.id === selectedChapterId) ?? null;
  const defaultFase: Fase = tree.suggestedFase ?? faseChoices(null)[1];

  const [importFase, setImportFase] = useState<Fase | null>(null);
  const [cpForm, setCpForm] = useState<{ cp?: CurriculumCp } | null>(null);
  const [chapterForm, setChapterForm] = useState<ChapterForm>(null);
  const [deleting, setDeleting] = useState<Deleting>(null);
  const [deleteError, setDeleteError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function closeDelete() {
    setDeleting(null);
    setDeleteError(undefined);
  }

  function confirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const result =
        deleting.kind === "cp"
          ? await deleteCpAction(slug, deleting.cp.id)
          : await deleteChapterAction(slug, deleting.chapter.id);
      if (result.status === "error") {
        setDeleteError(result.message ?? Object.values(result.fields ?? {})[0]);
        return;
      }
      if (deleting.kind === "chapter") {
        setChapterForm(null);
        if (selected?.id === deleting.chapter.id) router.replace(baseHref, { scroll: false });
      }
      closeDelete();
    });
  }

  return (
    <>
      <CpSection
        cps={tree.cps}
        onCreate={() => setCpForm({})}
        onDelete={(cp) => setDeleting({ kind: "cp", cp })}
        onEdit={(cp) => setCpForm({ cp })}
        onImport={setImportFase}
        subjectName={subjectName}
        suggestedFase={tree.suggestedFase}
      />
      {selected ? (
        <ChapterDetail
          backHref={baseHref}
          chapter={selected}
          cps={cpById}
          onCreate={() => setChapterForm({ mode: "create" })}
          onDelete={() => setDeleting({ kind: "chapter", chapter: selected })}
          onEdit={() => setChapterForm({ mode: "edit", chapter: selected })}
          subtitle={subtitle}
        />
      ) : (
        <ChapterSection
          baseHref={baseHref}
          chapters={chapters}
          cps={cpById}
          onContinue={(chapter) => setChapterForm({ mode: "continue", chapter })}
          onCreate={() => setChapterForm({ mode: "create" })}
        />
      )}

      <CpImportModal fase={importFase} onClose={() => setImportFase(null)} slug={slug} subjectId={subjectId} />
      <CpFormModal
        cp={cpForm?.cp}
        defaultFase={defaultFase}
        onClose={() => setCpForm(null)}
        open={Boolean(cpForm)}
        slug={slug}
        subjectId={subjectId}
      />
      <ChapterFormModal
        chapter={chapterForm?.chapter}
        chapters={chapters}
        cps={tree.cps}
        mode={chapterForm?.mode ?? "create"}
        onClose={() => setChapterForm(null)}
        onDelete={() => chapterForm?.chapter && setDeleting({ kind: "chapter", chapter: chapterForm.chapter })}
        open={Boolean(chapterForm)}
        slug={slug}
        subjectId={subjectId}
        subjectName={subjectName}
      />
      <ConfirmModal
        description={
          deleting?.kind === "cp"
            ? "CP yang masih dipilih oleh Bab tidak dapat dihapus."
            : "Semua informasi mengenai bab akan ikut terhapus."
        }
        error={deleteError}
        onClose={closeDelete}
        onConfirm={confirmDelete}
        open={Boolean(deleting)}
        pending={pending}
        title={`Apakah Anda yakin ingin menghapus ${deleting?.kind === "cp" ? "CP" : "Bab"} ini?`}
      />
    </>
  );
}
