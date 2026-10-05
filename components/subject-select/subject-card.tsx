import Image from "next/image";
import Link from "next/link";
import { cn } from "@/components/ui/cn";
import type { Subject } from "@/lib/api/types";
import { getSubjectPattern } from "@/lib/subject-patterns";

const actionButtonClassName =
  "grid place-items-center rounded-md p-1.5 transition-colors hover:bg-[#eef2f7] focus-visible:outline-2 focus-visible:outline-[#0058be]";

export const subjectCardClassName =
  "flex w-full flex-col overflow-hidden rounded-xl border border-[#c5c6cd] bg-white shadow-[0_4px_4px_rgba(0,0,0,0.1)]";

type SubjectCardActions = {
  onDelete: () => void;
  onEdit: () => void;
  onCopyLink: () => void;
};

// Figma 167:722 (teacher, with actions) and 236:3420 (student, without). The pattern and title open the subject;
// the actions are separate buttons below them.
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
    <article className={subjectCardClassName}>
      <Link
        className={cn(
          "group flex flex-col gap-2 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0058be]",
          !actions && "pb-2",
        )}
        href={href}
      >
        <div className="h-[98px] bg-[#ebe5db]">
          <Image
            alt=""
            className="size-full object-cover transition-opacity group-hover:opacity-90"
            height={98}
            src={getSubjectPattern(subject.slug)}
            width={214}
          />
        </div>
        <div className={cn("px-3 py-1 text-[#091426]", actions && "border-b border-[#c5c6cd]")}>
          <p className="truncate text-xs leading-7">
            {subject.class.name}
            <span className="px-3">-</span>
            {subject.class.academicYear}
          </p>
          <p className="truncate text-base font-semibold leading-7 group-hover:text-[#0058be]">{subject.name}</p>
        </div>
      </Link>
      {actions && (
        <div className="flex items-center justify-between px-3 py-2">
          <button
            aria-label={`Hapus ${subject.name}`}
            className={actionButtonClassName}
            onClick={actions.onDelete}
            type="button"
          >
            <Image alt="" height={16} src="/subjects/actions/trash.svg" width={16} />
          </button>
          <div className="flex items-center">
            <button
              aria-label={`Edit ${subject.name}`}
              className={actionButtonClassName}
              onClick={actions.onEdit}
              type="button"
            >
              <Image alt="" height={15} src="/subjects/actions/edit.svg" width={15} />
            </button>
            <button
              aria-label={`Salin link join ${subject.name}`}
              className={actionButtonClassName}
              onClick={actions.onCopyLink}
              type="button"
            >
              <Image alt="" height={15} src="/subjects/actions/link.svg" width={15} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

// The last card of the grid: "Buat Kelas Baru" for teachers, "Tambah Kelas Baru" for students.
export function AddSubjectCard({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      className="flex min-h-[150px] w-full flex-col items-center justify-center gap-1 rounded-xl border border-[#c5c6cd] bg-white p-3 text-[#45474c] transition-shadow hover:shadow-[0_10px_24px_-8px_rgba(8,90,192,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0058be]"
      onClick={onClick}
      type="button"
    >
      <span className="mb-4 grid size-16 place-items-center rounded-full bg-[#d8e2ff]">
        <Image alt="" height={17.5} src="/subjects/actions/plus.svg" width={17.5} />
      </span>
      <span className="text-base font-semibold leading-7">{label}</span>
    </button>
  );
}

// Shared grid: 214px cards that scroll once the list outgrows the space (Figma note: "Ini bisa scroll").
export const subjectGridOuterClassName = "max-h-[374px] w-full overflow-y-auto overflow-x-clip p-1";
export const subjectGridClassName =
  "mx-auto grid w-fit grid-cols-2 gap-4 sm:grid-cols-[repeat(3,214px)] sm:gap-8 lg:grid-cols-[repeat(5,214px)]";
