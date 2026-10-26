"use client";

import { Modal } from "@/components/ui/modal";
import { cn } from "@/components/ui/cn";
import { ghostButtonClassName, redButtonClassName } from "./styles";

// "Apakah Anda yakin ingin menghapus …?" (Figma New Design 50:5911, 50:5929).
export function ConfirmModal({
  open,
  title,
  description,
  error,
  pending,
  confirmLabel = "Ya",
  pendingLabel = "Menghapus...",
  cancelLabel = "Tidak",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  error?: string;
  pending?: boolean;
  // Button texts; the defaults are the Hapus confirmation of the curriculum.
  confirmLabel?: string;
  pendingLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      className="max-w-[482px] rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop:bg-[rgba(9,20,38,0.2)] backdrop:backdrop-blur-sm"
      description={description}
      onClose={onClose}
      open={open}
      title={title}
    >
      <div className="flex flex-col gap-4">
        {error && (
          <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm leading-5 text-[#93000a]" role="alert">
            {error}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <button className={cn(ghostButtonClassName, "w-full")} disabled={pending} onClick={onClose} type="button">
            {cancelLabel}
          </button>
          <button className={cn(redButtonClassName, "w-full")} disabled={pending} onClick={onConfirm} type="button">
            {pending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
