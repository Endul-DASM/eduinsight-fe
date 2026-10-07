"use client";

import { usePathname, useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { FormField, outlineButtonClassName, primaryButtonClassName } from "@/components/subject-select/form-field";
import { Modal } from "@/components/ui/modal";
import { PlusIcon } from "@/components/ui/icons";
import { createAssessmentAction } from "@/lib/actions/assessments";
import { assessmentTypeLabels, assessmentTypes } from "@/lib/assessment-form";
import { FormAlert, SelectField } from "./form-controls";

// Mounted only while the modal is open, so each opening starts from a fresh form state.
function CreateAssessmentForm({ slug, subjectId, onClose }: { slug: string; subjectId: string; onClose: () => void }) {
  // On success the Server Function redirects to the wizard.
  const [state, formAction, pending] = useActionState(createAssessmentAction.bind(null, slug, subjectId), undefined);
  const failed = state?.status === "error" ? state : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-6" key={JSON.stringify(failed?.values ?? null)} noValidate>
      <div className="flex flex-col gap-3">
        <FormField
          defaultValue={failed?.values?.title ?? ""}
          error={failed?.fields?.title}
          label="Judul Asesmen"
          maxLength={200}
          name="title"
          placeholder="mis. Post-test Eksponen"
          required
        />
        <SelectField defaultValue={failed?.values?.type ?? ""} error={failed?.fields?.type} label="Jenis" name="type" required>
          <option disabled value="">
            Pilih jenis asesmen
          </option>
          {assessmentTypes.map((type) => (
            <option key={type} value={type}>
              {assessmentTypeLabels[type]}
            </option>
          ))}
        </SelectField>
      </div>
      {failed?.message && <FormAlert>{failed.message}</FormAlert>}
      <div className="flex justify-end gap-[10px]">
        <button className={outlineButtonClassName} disabled={pending} onClick={onClose} type="button">
          Batal
        </button>
        <button className={primaryButtonClassName} disabled={pending} type="submit">
          {pending ? "Membuat..." : "Buat & Lanjutkan"}
        </button>
      </div>
    </form>
  );
}

// Starts the Buat Assessment wizard (PRD 5.4.2) with a draft. `?new=1` opens it, e.g. from the sidebar button.
export function CreateAssessmentButton({
  slug,
  subjectId,
  initiallyOpen,
}: {
  slug: string;
  subjectId: string;
  initiallyOpen: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(initiallyOpen);

  function close() {
    setOpen(false);
    // Drop ?new=1 so a reload does not open the modal again.
    if (initiallyOpen) router.replace(pathname);
  }

  return (
    <>
      <button className={primaryButtonClassName} onClick={() => setOpen(true)} type="button">
        <PlusIcon className="size-4" />
        Buat Assessment
      </button>
      <Modal
        description="Lengkapi detail lainnya di langkah berikutnya."
        onClose={close}
        open={open}
        title="Buat Assessment"
      >
        <CreateAssessmentForm onClose={close} slug={slug} subjectId={subjectId} />
      </Modal>
    </>
  );
}
