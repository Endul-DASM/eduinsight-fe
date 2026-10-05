"use client";

import { useActionState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { deleteSubjectAction } from "@/lib/actions/subjects";
import type { Subject } from "@/lib/api/types";
import { dangerButtonClassName, outlineButtonClassName } from "./form-field";

function DeleteForm({ subject, onClose }: { subject: Subject; onClose: () => void }) {
  const [state, formAction, pending] = useActionState(deleteSubjectAction, undefined);

  useEffect(() => {
    if (state?.status === "saved") onClose();
  }, [state, onClose]);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input name="subjectId" type="hidden" value={subject.id} />
      <p className="text-center text-base leading-6 text-[#45474c]">
        <span className="font-semibold text-[#111c2d]">
          {subject.name} · {subject.class.name} ({subject.class.academicYear})
        </span>{" "}
        akan dihapus dari daftar Anda.
      </p>
      {state?.status === "error" && (
        <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm leading-5 text-[#93000a]" role="alert">
          {state.message}
        </p>
      )}
      <div className="flex justify-end gap-[10px]">
        <button className={outlineButtonClassName} disabled={pending} onClick={onClose} type="button">
          Batal
        </button>
        <button className={dangerButtonClassName} disabled={pending} type="submit">
          {pending ? "Menghapus..." : "Hapus"}
        </button>
      </div>
    </form>
  );
}

export function DeleteSubjectModal({ subject, onClose }: { subject?: Subject; onClose: () => void }) {
  return (
    <Modal onClose={onClose} open={Boolean(subject)} title="Hapus Mata Pelajaran?">
      {subject && <DeleteForm key={subject.id} onClose={onClose} subject={subject} />}
    </Modal>
  );
}
