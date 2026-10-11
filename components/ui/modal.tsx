"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { cn } from "./cn";

// A native <dialog>: showModal() gives the backdrop, focus trapping and Esc-to-close for free.
export function Modal({
  open,
  onClose,
  title,
  description,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  // A line under the title, e.g. "Masukkan kode kelas dari guru kamu!".
  description?: string;
  // Replaces the default look of the box and its backdrop, e.g. the glass modals of the new design.
  className?: string;
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
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-[542px] text-[#111c2d]",
        className ?? "rounded-xl border border-[#c5c6cd] bg-white p-6 backdrop:bg-[rgba(9,20,38,0.4)]",
      )}
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
