"use client";

import { useEffect, useState, useTransition } from "react";
import { outlineButtonClassName, primaryButtonClassName } from "@/components/auth/styles";
import { cn } from "@/components/ui/cn";
import { Modal } from "@/components/ui/modal";
import { importCpsAction, listOfficialCpsAction } from "@/lib/actions/curriculum";
import type { OfficialCp } from "@/lib/api/curriculum";
import type { Fase } from "@/lib/api/types";
import { fases } from "@/lib/curriculum-form";
import { wideModalClassName } from "./styles";

// Mounted only while open, so each opening loads the catalog again.
function ImportList({
  slug,
  subjectId,
  fase,
  onClose,
}: {
  slug: string;
  subjectId: string;
  fase: Fase;
  onClose: () => void;
}) {
  const [cps, setCps] = useState<OfficialCp[] | null>(null);
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    listOfficialCpsAction(subjectId, fase).then((result) => {
      if (!active) return;
      if (result.status === "error") return setMessage(result.message);
      setCps(result.cps);
      // Everything not imported yet starts checked.
      setChosen(new Set(result.cps.filter((cp) => !cp.imported).map((cp) => cp.id)));
    });
    return () => {
      active = false;
    };
  }, [subjectId, fase]);

  function toggle(id: string) {
    setChosen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function submit() {
    setMessage(undefined);
    startTransition(async () => {
      const result = await importCpsAction(slug, subjectId, [...chosen]);
      if (result.status === "saved") return onClose();
      setMessage(result.message ?? Object.values(result.fields ?? {})[0]);
    });
  }

  const source = cps?.[0]?.sourceDocument;
  const allImported = Boolean(cps?.length) && cps!.every((cp) => cp.imported);

  return (
    <div className="flex flex-col gap-5 text-left">
      {source && (
        <p className="rounded-xl bg-[#e6eff9] px-3 py-2 text-xs leading-normal text-[#004695]">
          <span className="font-semibold">Sumber:</span> {source}
        </p>
      )}
      {allImported && (
        <p className="rounded-xl border border-[#99bce5] px-3 py-2 text-sm leading-normal text-[#004695]">
          Semua CP Fase ini sudah diimpor. Anda tetap bisa mengubahnya di Daftar CP.
        </p>
      )}
      {!cps && !message && <p className="py-6 text-center text-sm text-[#45474c]">Memuat CP resmi...</p>}
      {cps?.length === 0 && (
        <p className="py-6 text-center text-sm text-[#45474c]">Belum ada CP resmi untuk Fase ini di katalog.</p>
      )}
      {cps && cps.length > 0 && (
        <ul className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto pr-1">
          {cps.map((cp) => (
            <li key={cp.id}>
              <label
                className={cn(
                  "flex cursor-pointer gap-3 rounded-xl border px-3 py-2 transition-colors",
                  cp.imported
                    ? "cursor-default border-[#c5c6cd] bg-[#f5f3f4] opacity-70"
                    : chosen.has(cp.id)
                      ? "border-[#0058be] bg-[#e6eff9]"
                      : "border-[#c5c6cd] hover:bg-[#f5f3f4]",
                )}
              >
                <input
                  checked={cp.imported ? true : chosen.has(cp.id)}
                  className="mt-1 size-4 shrink-0 accent-[#0058be]"
                  disabled={Boolean(cp.imported)}
                  onChange={() => toggle(cp.id)}
                  type="checkbox"
                />
                <span className="flex flex-col gap-1 text-base leading-normal text-black">
                  <span className="flex items-center gap-2 font-semibold">
                    {cp.element}
                    {cp.imported && (
                      <span className="rounded-3xl bg-[rgba(153,188,229,0.6)] px-2 py-0.5 text-[10px] text-[#004695]">
                        Sudah diimpor
                      </span>
                    )}
                  </span>
                  <span>{cp.description}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
      {message && (
        <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm leading-5 text-[#93000a]" role="alert">
          {message}
        </p>
      )}
      <div className="flex justify-end gap-[10px]">
        <button className={outlineButtonClassName} disabled={pending} onClick={onClose} type="button">
          {allImported ? "Tutup" : "Batal"}
        </button>
        {!allImported && (
          <button className={primaryButtonClassName} disabled={pending || chosen.size === 0} onClick={submit} type="button">
            {pending ? "Mengimpor..." : chosen.size > 0 ? `Impor ${chosen.size} CP` : "Pilih CP"}
          </button>
        )}
      </div>
    </div>
  );
}

// FR-G-025: official CPs of one Fase, from the system catalog.
export function CpImportModal({
  slug,
  subjectId,
  fase,
  onClose,
}: {
  slug: string;
  subjectId: string;
  fase: Fase | null;
  onClose: () => void;
}) {
  const label = fases.find((option) => option.value === fase);

  return (
    <Modal
      className={wideModalClassName}
      description={`${label ? `${label.label} (${label.grades}). ` : ""}Pilih CP yang ingin dipakai; CP hasil impor bisa diubah tanpa mengubah katalog.`}
      onClose={onClose}
      open={Boolean(fase)}
      title="Impor CP Resmi"
    >
      {fase && <ImportList fase={fase} key={fase} onClose={onClose} slug={slug} subjectId={subjectId} />}
    </Modal>
  );
}
