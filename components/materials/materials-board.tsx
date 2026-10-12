"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type DragEvent, useEffect, useRef, useState, useTransition } from "react";
import { outlineButtonClassName } from "@/components/auth/styles";
import { ConfirmModal } from "@/components/curriculum/confirm-modal";
import { addButtonClassName, sectionClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import {
  deleteMaterialAction,
  getMaterialAction,
  retryExtractionAction,
  setVisibilityAction,
  uploadMaterialAction,
} from "@/lib/actions/materials";
import type { Material } from "@/lib/api/materials";
import { ACCEPTED_FORMATS, fileProblem, MAX_UPLOAD_MB } from "@/lib/material-file";
import type { CurriculumChapter } from "@/lib/api/types";
import { MaterialFormModal, type MaterialFormMode } from "./material-form-modal";
import { MaterialRow, RowIconButton } from "./material-rows";

const POLL_MS = 2000;

const inProgress = (material: Material) =>
  material.extractionStatus === "pending" || material.extractionStatus === "processing";

// A file being sent (before the backend answers) or one the browser or backend refused.
type LocalUpload = { key: string; name: string; chapterId: string | null; error?: string };

let nextKey = 0;

function CardTitle({ icon, children }: { icon: string; children: string }) {
  return (
    <h3 className="flex items-center gap-3 border-b border-[rgba(153,188,229,0.6)] pb-4 text-xl font-semibold leading-normal text-[#1b1b1d]">
      <Image alt="" height={24} src={icon} width={24} />
      {children}
    </h3>
  );
}

// Upload Materi tab (PRD 5.3.2, SRS FR-G-030 – 035; Figma New Design 54:6193, 54:7512, 54:7392).
export function MaterialsBoard({
  slug,
  subjectId,
  classLabel,
  chapters,
  materials,
  objectiveNumbers,
}: {
  slug: string;
  subjectId: string;
  classLabel: string;
  chapters: CurriculumChapter[];
  materials: Material[];
  // The confirmed TP numbers of each material, e.g. ["1.1", "1.2"].
  objectiveNumbers: Record<string, string[]>;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pickChapterId, setPickChapterId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState<LocalUpload[]>([]);
  // Uploaded or retried here: their form opens by itself once extraction is done.
  const awaiting = useRef(new Set<string>());
  const [target, setTarget] = useState<{ mode: MaterialFormMode; material: Material } | null>(null);
  const [removing, setRemoving] = useState<Material | null>(null);
  const [removeError, setRemoveError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();

  const sortedChapters = [...chapters].sort((a, b) => a.number - b.number);
  const finalChapters = sortedChapters.filter((chapter) => chapter.status === "final");
  const chapterById = new Map(chapters.map((chapter) => [chapter.id, chapter]));
  const processing = materials.filter(inProgress);
  const failed = materials.filter((material) => material.extractionStatus === "failed");
  const done = materials.filter((material) => material.extractionStatus === "done");
  const drafts = done.filter((material) => !material.mappingConfirmedAt);
  const confirmed = done.filter((material) => material.mappingConfirmedAt);
  const unassigned = confirmed.filter((material) => !material.chapterId || !chapterById.has(material.chapterId));

  // Babs with materials start open; the teacher's own clicks win.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  // FR-G-031: extraction runs in the background; check on it until it is done or failed.
  const processingIds = processing.map((material) => material.id).join(",");
  useEffect(() => {
    if (!processingIds) return;
    const timer = setInterval(async () => {
      const results = await Promise.all(processingIds.split(",").map((id) => getMaterialAction(id)));
      let changed = false;
      for (const result of results) {
        if (result.status !== "ok" || inProgress(result.material)) continue;
        changed = true;
        const { material } = result;
        if (awaiting.current.delete(material.id) && material.extractionStatus === "done" && !material.mappingConfirmedAt) {
          setTarget({ mode: "new", material });
        }
      }
      if (changed) router.refresh();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [processingIds, router]);

  // A small file can finish extracting before the first check; open its form when the refreshed list shows it done.
  useEffect(() => {
    const ready = materials.find(
      (material) => awaiting.current.has(material.id) && material.extractionStatus === "done" && !material.mappingConfirmedAt,
    );
    if (!ready) return;
    awaiting.current.delete(ready.id);
    setTarget({ mode: "new", material: ready });
  }, [materials]);

  function pick(chapterId: string | null) {
    setPickChapterId(chapterId);
    inputRef.current?.click();
  }

  async function upload(file: File, chapterId: string | null) {
    const key = `u${(nextKey += 1)}`;
    const problem = fileProblem(file);
    if (problem) return setUploads((current) => [...current, { key, name: file.name, chapterId, error: problem }]);

    setUploads((current) => [...current, { key, name: file.name, chapterId }]);
    const form = new FormData();
    form.set("file", file);
    if (chapterId) form.set("chapterId", chapterId);
    const result = await uploadMaterialAction(slug, subjectId, form);
    if (result.status === "ok") {
      awaiting.current.add(result.material.id);
      setUploads((current) => current.filter((entry) => entry.key !== key));
    } else {
      setUploads((current) => current.map((entry) => (entry.key === key ? { ...entry, error: result.message } : entry)));
    }
  }

  function uploadAll(files: FileList | null, chapterId: string | null) {
    setMessage(undefined);
    for (const file of Array.from(files ?? [])) void upload(file, chapterId);
  }

  function onDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragging(false);
    uploadAll(event.dataTransfer.files, null);
  }

  function run(action: () => Promise<{ status: "saved" } | { status: "error"; message: string }>) {
    setMessage(undefined);
    startTransition(async () => {
      const result = await action();
      if (result.status === "error") setMessage(result.message);
    });
  }

  function retry(material: Material) {
    awaiting.current.add(material.id);
    run(() => retryExtractionAction(slug, material.id));
  }

  function confirmRemove() {
    if (!removing) return;
    setRemoveError(undefined);
    startTransition(async () => {
      const result = await deleteMaterialAction(slug, removing.id);
      if (result.status === "saved") setRemoving(null);
      else setRemoveError(result.message);
    });
  }

  const chapterLabel = (material: Material) => {
    const chapter = material.chapterId ? chapterById.get(material.chapterId) : undefined;
    return chapter ? `Bab ${chapter.number}` : "";
  };
  const objectivesOf = (material: Material) => {
    const numbers = objectiveNumbers[material.id] ?? [];
    return numbers.length > 0 ? `TP ${numbers.join(", ")}` : "";
  };

  const rowActions = (material: Material) => (
    <>
      <RowIconButton icon="/materials/trash.svg" label="Hapus materi" onClick={() => setRemoving(material)} />
      <RowIconButton icon="/curriculum/pencil.svg" label="Edit materi" onClick={() => setTarget({ mode: "edit", material })} />
      <RowIconButton
        disabled={pending}
        icon={material.visibleToStudents ? "/materials/eye.svg" : "/materials/eye-off.svg"}
        label={material.visibleToStudents ? "Terlihat oleh siswa (klik untuk menyembunyikan)" : "Tersembunyi dari siswa (klik untuk menampilkan)"}
        onClick={() => run(() => setVisibilityAction(slug, material.id, !material.visibleToStudents))}
        size={18}
      />
    </>
  );

  const toggleOpen = (id: string, open: boolean) => setToggled((current) => ({ ...current, [id]: !open }));

  const groups = [
    ...sortedChapters.map((chapter) => ({
      id: chapter.id,
      label: `BAB ${chapter.number}: ${chapter.name}`,
      chapterId: chapter.id as string | null,
      items: confirmed.filter((material) => material.chapterId === chapter.id),
    })),
    ...(unassigned.length > 0 ? [{ id: "none", label: "Tanpa Bab", chapterId: null, items: unassigned }] : []),
  ];

  const sending = uploads.filter((entry) => !entry.error);
  const refused = uploads.filter((entry) => entry.error);

  return (
    <div className="flex flex-col gap-6">
      <section className={sectionClassName}>
        <CardTitle icon="/materials/title-upload.svg">Unggah Materi</CardTitle>
        <input
          accept={ACCEPTED_FORMATS.map((format) => `.${format}`).join(",")}
          className="hidden"
          multiple
          onChange={(event) => {
            uploadAll(event.target.files, pickChapterId);
            event.target.value = "";
          }}
          ref={inputRef}
          type="file"
        />
        <button
          className={cn(
            "flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors focus-visible:outline-2 focus-visible:outline-[#0058be]",
            dragging ? "border-[#0058be] bg-[#e6eff9]" : "border-transparent hover:bg-[rgba(230,239,249,0.5)]",
          )}
          onClick={() => pick(null)}
          onDragLeave={() => setDragging(false)}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDrop={onDrop}
          type="button"
        >
          <span className="grid size-30 place-items-center rounded-full bg-[#e6eff9]">
            <Image alt="" height={80} src="/materials/upload-large.svg" width={80} />
          </span>
          <span className="text-base font-semibold leading-normal text-[#0058be]">
            Seret file ke sini atau klik untuk mengunggah
          </span>
          <span className="text-sm leading-normal text-[#45474c]">
            Mendukung file pdf, docx, dan pptx (maksimal {MAX_UPLOAD_MB} MB).
          </span>
        </button>

        {(sending.length > 0 || processing.length > 0) && (
          <div className="flex flex-col gap-1 border-t border-[rgba(153,188,229,0.6)] pt-4">
            <p className="text-xs font-semibold leading-normal text-[#1b1b1d]">Sedang meng-upload materi...</p>
            <div className="h-1 overflow-hidden rounded-full bg-[#e6eff9]">
              <div className="h-full w-full animate-pulse rounded-full bg-[#0058be]" />
            </div>
            {sending.map((entry) => (
              <div className="flex items-center gap-3 px-4 py-4 text-sm leading-normal text-[#1b1b1d]" key={entry.key}>
                <Image alt="" className="animate-spin" height={18} src="/materials/spinner.svg" width={18} />
                <Image alt="" className="h-9 w-8 opacity-60" height={36} src="/materials/file-faded.svg" width={32} />
                <span className="truncate opacity-60">{entry.name}</span>
                <span className="ml-auto text-xs text-[#75777d]">Mengirim berkas...</span>
              </div>
            ))}
            {processing.map((material) => (
              <MaterialRow
                actions={<RowIconButton icon="/materials/trash.svg" label="Hapus materi" onClick={() => setRemoving(material)} />}
                classLabel={classLabel}
                key={material.id}
                leading={<Image alt="Diproses" className="shrink-0 animate-spin" height={18} src="/materials/spinner.svg" width={18} />}
                material={material}
                objectives={chapterLabel(material) || "Mengekstrak isi..."}
                tone="processing"
              />
            ))}
          </div>
        )}

        {(failed.length > 0 || refused.length > 0) && (
          <div className="flex flex-col gap-2 border-t border-[rgba(153,188,229,0.6)] pt-4">
            <p className="text-xs font-semibold leading-normal text-[#1b1b1d]">Gagal upload materi!</p>
            {refused.map((entry) => (
              <div
                className="flex flex-wrap items-center gap-3 rounded-xl bg-[#ffeded] px-4 py-4 text-sm leading-normal"
                key={entry.key}
              >
                <Image alt="Gagal" height={24} src="/materials/failed.svg" width={24} />
                <Image alt="" className="h-9 w-8" height={36} src="/materials/file-failed.svg" width={32} />
                <span className="min-w-0 truncate font-medium text-[#bf2626] line-through">{entry.name}</span>
                <span className="min-w-0 flex-1 text-[#93000a]">{entry.error}</span>
                <RowIconButton
                  icon="/materials/trash.svg"
                  label="Tutup"
                  onClick={() => setUploads((current) => current.filter((item) => item.key !== entry.key))}
                />
              </div>
            ))}
            {failed.map((material) => (
              <div className="flex flex-col gap-1" key={material.id}>
                <MaterialRow
                  actions={
                    <>
                      <RowIconButton icon="/materials/trash.svg" label="Hapus materi" onClick={() => setRemoving(material)} />
                      <RowIconButton
                        disabled={pending}
                        icon="/materials/retry.svg"
                        label="Coba lagi"
                        onClick={() => retry(material)}
                        size={18}
                      />
                    </>
                  }
                  classLabel={classLabel}
                  leading={<Image alt="Gagal" className="shrink-0" height={24} src="/materials/failed.svg" width={24} />}
                  material={material}
                  objectives={chapterLabel(material)}
                  tone="failed"
                />
                {material.extractionError && <p className="px-4 text-xs leading-normal text-[#93000a]">{material.extractionError}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={sectionClassName}>
        <CardTitle icon="/materials/book.svg">Daftar Materi Diunggah</CardTitle>
        <div className="flex flex-wrap gap-2 text-[10px] font-semibold leading-normal">
          <span className="rounded-3xl border border-[#004695] bg-[rgba(153,188,229,0.6)] px-2 py-1 text-[#004695]">
            Materi Ter-Upload
          </span>
          <span className="rounded-3xl border border-[#7c2d12] bg-[rgba(254,215,170,0.6)] px-2 py-1 text-[#c2410c]">Draft</span>
        </div>

        {message && (
          <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm leading-5 text-[#93000a]" role="alert">
            {message}
          </p>
        )}

        {drafts.length > 0 && (
          <div className="flex flex-col rounded-xl border border-[rgba(254,215,170,0.9)] bg-[rgba(255,247,237,0.6)]">
            {drafts.map((material) => (
              <MaterialRow
                actions={
                  <>
                    <RowIconButton icon="/materials/trash.svg" label="Hapus materi" onClick={() => setRemoving(material)} />
                    <button
                      className={cn(outlineButtonClassName, "px-4 py-1.5 text-sm")}
                      onClick={() => setTarget({ mode: "new", material })}
                      type="button"
                    >
                      Lanjut
                    </button>
                  </>
                }
                classLabel={classLabel}
                key={material.id}
                material={material}
                objectives={chapterLabel(material) || "Belum dipetakan"}
              />
            ))}
          </div>
        )}

        {groups.length === 0 && drafts.length === 0 && (
          <p className="py-6 text-center text-sm leading-normal text-[#45474c]">
            Belum ada materi. Unggah materi di atas, lalu petakan ke Bab dan TP.
          </p>
        )}

        <div className="flex flex-col">
          {groups.map((group) => {
            const open = toggled[group.id] ?? group.items.length > 0;
            return (
              <div className="border-b border-[#c5c6cd]" key={group.id}>
                <div className="flex items-center gap-3 py-3">
                  <button
                    aria-expanded={open}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left text-base font-semibold leading-normal text-[#1b1b1d]"
                    onClick={() => toggleOpen(group.id, open)}
                    type="button"
                  >
                    <Image
                      alt=""
                      className={cn("transition-transform", open && "rotate-90")}
                      height={20}
                      src="/materials/chevron-right.svg"
                      width={20}
                    />
                    <span className="truncate">{group.label}</span>
                    <span className="shrink-0 text-xs font-medium text-[#75777d]">{group.items.length} materi</span>
                  </button>
                  {group.chapterId && (
                    <button
                      aria-label={`Unggah materi ke ${group.label}`}
                      className={cn(addButtonClassName, "px-3 py-2")}
                      onClick={() => pick(group.chapterId)}
                      title="Unggah materi ke Bab ini"
                      type="button"
                    >
                      <Image alt="" height={20} src="/materials/add.svg" width={20} />
                    </button>
                  )}
                </div>
                {open && (
                  <div className="flex flex-col border-t border-[#c5c6cd] pl-4">
                    {group.items.length === 0 ? (
                      <p className="py-4 text-sm leading-normal text-[#75777d]">Belum ada materi di Bab ini.</p>
                    ) : (
                      group.items.map((material) => (
                        <MaterialRow
                          actions={rowActions(material)}
                          classLabel={classLabel}
                          key={material.id}
                          material={material}
                          objectives={objectivesOf(material)}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <MaterialFormModal chapters={finalChapters} onClose={() => setTarget(null)} slug={slug} target={target} />
      <ConfirmModal
        description={removing ? `Materi "${removing.title}" beserta pemetaan TP-nya akan dihapus permanen.` : ""}
        error={removeError}
        onClose={() => {
          setRemoving(null);
          setRemoveError(undefined);
        }}
        onConfirm={confirmRemove}
        open={Boolean(removing)}
        pending={pending}
        title="Apakah Anda yakin ingin menghapus materi ini?"
      />
    </div>
  );
}
