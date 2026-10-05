"use client";

import { type ReactNode, useEffect, useRef } from "react";

// A native <dialog>: showModal() gives the backdrop, focus trapping and Esc-to-close for free.
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  // A line under the title, e.g. "Masukkan kode kelas dari guru kamu!".
  description?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      aria-labelledby="modal-title"
      className="m-auto w-[calc(100%-2rem)] max-w-[542px] rounded-xl border border-[#c5c6cd] bg-white p-6 text-[#111c2d] backdrop:bg-[rgba(9,20,38,0.4)]"
      // Esc fires "cancel" and closes the dialog itself; keep the parent's state in step.
      onClose={onClose}
      // Clicking the backdrop lands on the <dialog> element itself.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      ref={ref}
    >
      {open && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-2xl font-bold leading-10 tracking-[-0.32px] text-black" id="modal-title">
              {title}
            </h2>
            {description && <p className="text-sm leading-5 text-[#45474c]">{description}</p>}
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
