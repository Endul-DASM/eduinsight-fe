"use client";

import { useState, useTransition } from "react";
import { outlineButtonClassName, primaryButtonClassName } from "@/components/auth/styles";
import { TextField } from "@/components/auth/text-field";
import { cn } from "@/components/ui/cn";
import { Modal } from "@/components/ui/modal";
import { SelectMenu } from "@/components/ui/select-menu";
import { subjectModalClassName } from "@/components/subject-select/styles";
import { saveCpAction } from "@/lib/actions/curriculum";
import type { CurriculumCp, Fase } from "@/lib/api/types";
import { fases, type FieldErrors, validateCp } from "@/lib/curriculum-form";
import { fieldLabelClassName, inputBoxClassName } from "./styles";

function CpForm({
  slug,
  subjectId,
  cp,
  defaultFase,
  onClose,
}: {
  slug: string;
  subjectId: string;
  cp?: CurriculumCp;
  defaultFase: Fase;
  onClose: () => void;
}) {
  const [element, setElement] = useState(cp?.element ?? "");
  const [fase, setFase] = useState<Fase>(cp?.fase ?? defaultFase);
  const [code, setCode] = useState(cp?.code ?? "");
  const [description, setDescription] = useState(cp?.description ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();

  function submit() {
    const input = { element: element.trim(), fase, code: code.trim() || null, description: description.trim() };
    const found = validateCp(input);
    setErrors(found);
    setMessage(undefined);
    if (Object.keys(found).length > 0) return;
    startTransition(async () => {
      const result = await saveCpAction(slug, subjectId, cp?.id ?? null, input);
      if (result.status === "saved") return onClose();
      setErrors(result.fields ?? {});
      setMessage(result.message);
    });
  }

  return (
    <form
      className="flex flex-col gap-6"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="flex flex-col gap-3">
        <TextField
          error={errors.element}
          label="Elemen"
          maxLength={60}
          name="element"
          onChange={(event) => setElement(event.target.value)}
          placeholder="mis. Bilangan; Membaca dan Memirsa"
          value={element}
        />
        <div className="flex flex-col gap-2">
          <label className={fieldLabelClassName} htmlFor="cp-fase">
            Fase
          </label>
          <SelectMenu id="cp-fase" onChange={(event) => setFase(event.target.value as Fase)} value={fase}>
            {fases.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.grades})
              </option>
            ))}
          </SelectMenu>
        </div>
        <TextField
          error={errors.code}
          label="Kode (Opsional)"
          maxLength={30}
          name="code"
          onChange={(event) => setCode(event.target.value)}
          placeholder="mis. CP-E.1"
          value={code}
        />
        <div className="flex flex-col gap-2">
          <label className={fieldLabelClassName} htmlFor="cp-description">
            Deskripsi CP
          </label>
          <textarea
            aria-invalid={errors.description ? true : undefined}
            className={cn(inputBoxClassName, "min-h-28 py-3", errors.description && "border-[#dc2626]")}
            id="cp-description"
            maxLength={2000}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Tulis capaian pembelajaran untuk Elemen ini..."
            value={description}
          />
          {errors.description && <p className="text-xs font-semibold text-[#dc2626]">{errors.description}</p>}
        </div>
      </div>
      {message && (
        <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm leading-5 text-[#93000a]" role="alert">
          {message}
        </p>
      )}
      <div className="flex justify-end gap-[10px]">
        <button className={outlineButtonClassName} disabled={pending} onClick={onClose} type="button">
          Cancel
        </button>
        <button className={primaryButtonClassName} disabled={pending} type="submit">
          {pending ? "Menyimpan..." : cp ? "Save" : "Tambah CP"}
        </button>
      </div>
    </form>
  );
}

// Tambah CP Sendiri / edit CP (FR-G-020). Not in Figma; follows the class modal's look.
export function CpFormModal({
  open,
  slug,
  subjectId,
  cp,
  defaultFase,
  onClose,
}: {
  open: boolean;
  slug: string;
  subjectId: string;
  cp?: CurriculumCp;
  defaultFase: Fase;
  onClose: () => void;
}) {
  return (
    <Modal className={subjectModalClassName} onClose={onClose} open={open} title={cp ? "Edit CP" : "Tambah CP Sendiri"}>
      <CpForm cp={cp} defaultFase={defaultFase} key={cp?.id ?? "new"} onClose={onClose} slug={slug} subjectId={subjectId} />
    </Modal>
  );
}
