import Image from "next/image";
import Link from "next/link";
import { cn } from "@/components/ui/cn";
import type { Subject } from "@/lib/api/types";
import { getSubjectGradient } from "@/lib/subject-gradients";

const actionButtonClassName =
  "grid place-items-center rounded-md p-1 transition-colors hover:bg-[rgba(0,88,190,0.08)] focus-visible:outline-2 focus-visible:outline-[#0058be]";

// The glass card of the new design (Figma New Design 22:3612).
const glassCardClassName =
  "flex w-full max-w-[313px] flex-col rounded-3xl bg-[rgba(245,243,244,0.6)] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-xs transition-shadow hover:shadow-[0_8px_28px_rgba(0,88,190,0.18)]";

type SubjectCardActions = {
  onDelete: () => void;
  onEdit: () => void;
  onCopyLink: () => void;
};

// Teachers see the actions (Figma New Design 22:3475); students do not. The cover and title open the subject.
export function SubjectCard({
  subject,
  href,
  actions,
}: {
  subject: Subject;
  href: string;
  actions?: SubjectCardActions;
}) {
  return (
    <article className={cn(glassCardClassName, "gap-[21px]")}>
      <Link
        className="group flex flex-col gap-[7px] rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0058be]"
        href={href}
      >
        <div
          className="h-[120px] rounded-xl transition-opacity group-hover:opacity-90"
          style={{ backgroundImage: getSubjectGradient(subject.id) }}
        />
        <div className="leading-normal text-[#1b1b1d]">
          <p className="flex items-center justify-between gap-3 text-base">
            <span className="truncate">{subject.class.name}</span>
            <span className="shrink-0">{subject.class.academicYear}</span>
          </p>
          <p className="truncate text-2xl font-semibold text-black group-hover:text-[#0058be]">{subject.name}</p>
        </div>
      </Link>
      {actions && (
        <div className="flex items-center justify-between py-2">
          <button
            aria-label={`Hapus ${subject.name}`}
            className={actionButtonClassName}
            onClick={actions.onDelete}
            type="button"
          >
            <Image alt="" height={20} src="/subjects/trash.svg" width={20} />
          </button>
          <div className="flex items-center gap-1.5">
            <button
              aria-label={`Edit ${subject.name}`}
              className={actionButtonClassName}
              onClick={actions.onEdit}
              type="button"
            >
              <Image alt="" height={20} src="/subjects/pencil.svg" width={20} />
            </button>
            <button
              aria-label={`Salin link join ${subject.name}`}
              className={actionButtonClassName}
              onClick={actions.onCopyLink}
              type="button"
            >
              <Image alt="" height={20} src="/subjects/link.svg" width={20} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

// The last card of the grid: "Buat Kelas Baru" for teachers, "Tambah Kelas Baru" for students (Figma New Design
// 22:3719).
export function AddSubjectCard({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      className={cn(
        glassCardClassName,
        "min-h-[211px] items-center justify-center gap-[21px] text-[#45474c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0058be]",
      )}
      onClick={onClick}
      type="button"
    >
      <span className="grid place-items-center rounded-[48px] bg-[rgba(153,188,229,0.6)] p-3">
        <Image alt="" height={40} src="/subjects/circle-plus.svg" width={40} />
      </span>
      <span className="text-base font-semibold leading-normal">{label}</span>
    </button>
  );
}

// Shared list of 313px cards, centred, up to four per row; it scrolls once it outgrows two rows (Figma note: "Ini
// bisa scroll").
export const subjectGridOuterClassName = "max-h-[600px] w-full overflow-y-auto overflow-x-clip p-3";
export const subjectGridClassName = "mx-auto flex max-w-[1291px] flex-wrap justify-center gap-[13px]";
