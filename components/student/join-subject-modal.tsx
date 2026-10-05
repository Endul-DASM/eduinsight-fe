"use client";

import { type FormEvent, useActionState, useEffect, useState } from "react";
import { FormField, outlineButtonClassName, primaryButtonClassName } from "@/components/subject-select/form-field";
import { Modal } from "@/components/ui/modal";
import { joinSubjectAction } from "@/lib/actions/student-subjects";
import { validateJoinCode } from "@/lib/join-code";

// Mounted only while the modal is open, so each opening starts from a fresh form state.
function JoinForm({
  initialCode,
  onClose,
  onJoined,
}: {
  initialCode: string;
  onClose: () => void;
  onJoined: (subjectName: string) => void;
}) {
  const [state, formAction, pending] = useActionState(joinSubjectAction, undefined);
  // Checked in the browser before submitting; the Server Function repeats the same rule.
  const [clientError, setClientError] = useState<string>();

  useEffect(() => {
    if (state?.status === "joined") onJoined(state.subjectName);
  }, [state, onJoined]);

  const failed = state?.status === "error" ? state : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const error = validateJoinCode(String(new FormData(event.currentTarget).get("joinCode") ?? "").trim());
    setClientError(error);
    if (error) event.preventDefault();
  }

  return (
    // React resets the form after each submission; the key remounts it with the submitted code as default.
    <form
      action={formAction}
      className="flex flex-col gap-6"
      key={failed?.joinCode ?? "initial"}
      noValidate
      onSubmit={handleSubmit}
    >
      <FormField
        autoCapitalize="characters"
        autoComplete="off"
        defaultValue={failed?.joinCode ?? initialCode}
        error={clientError ?? failed?.codeError}
        label="Kode Kelas"
        maxLength={32}
        name="joinCode"
        placeholder="1234..."
      />
      {failed?.message && (
        <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm leading-5 text-[#93000a]" role="alert">
          {failed.message}
        </p>
      )}
      <div className="flex justify-end gap-[10px]">
        <button className={outlineButtonClassName} disabled={pending} onClick={onClose} type="button">
          Cancel
        </button>
        <button className={primaryButtonClassName} disabled={pending} type="submit">
          {pending ? "Memproses..." : "Join"}
        </button>
      </div>
    </form>
  );
}

// Figma 236:3753.
export function JoinSubjectModal({
  open,
  initialCode,
  onClose,
  onJoined,
}: {
  open: boolean;
  initialCode: string;
  onClose: () => void;
  onJoined: (subjectName: string) => void;
}) {
  return (
    <Modal description="Masukkan kode kelas dari guru kamu!" onClose={onClose} open={open} title="Ikuti Kelas Baru">
      <JoinForm initialCode={initialCode} onClose={onClose} onJoined={onJoined} />
    </Modal>
  );
}
