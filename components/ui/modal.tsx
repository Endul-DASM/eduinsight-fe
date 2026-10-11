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
  icon,
  align = "center",
  showClose = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  // A line under the title, e.g. "Masukkan kode kelas dari guru kamu!".
  description?: string;
  // Replaces the default look of the box and its backdrop, e.g. the glass modals of the new design.
  className?: string;
  // Shown before the title, e.g. the clock of "Semua Aktivitas".
  icon?: ReactNode;
  // "start" puts the title on the left, with a divider under it (Figma New Design 65:12207).
  align?: "center" | "start";
  // Adds a × button in the corner.
  showClose?: boolean;
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
        "m-auto w-[calc(100%-2rem)] text-[#111c2d]",
        className ?? "max-w-[542px] rounded-xl border border-[#c5c6cd] bg-white p-6 backdrop:bg-[rgba(9,20,38,0.4)]",
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
          <div
            className={cn(
              "relative flex flex-col gap-2",
              align === "center" ? "items-center text-center" : "border-b border-[#c5c6cd] pb-4",
              showClose && "pr-10",
            )}
          >
            <h2
              className={cn(
                "flex items-center gap-3 text-black",
                align === "center"
                  ? "text-2xl font-bold leading-10 tracking-[-0.32px]"
                  : "text-xl font-semibold leading-normal",
              )}
              id="modal-title"
            >
              {icon}
              {title}
            </h2>
            {description && <p className="text-sm leading-5 text-[#45474c]">{description}</p>}
            {showClose && (
              <button
                aria-label="Tutup"
                className="absolute right-0 top-0 grid size-9 place-items-center rounded-full text-2xl leading-none text-[#1b1b1d] hover:bg-[#e6eff9]"
                onClick={onClose}
                type="button"
              >
                ×
              </button>
            )}
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
