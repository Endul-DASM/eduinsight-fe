import Image from "next/image";
import Link from "next/link";
import type { Subject } from "@/lib/api/types";
import { getSubjectPattern } from "@/lib/subject-patterns";

const actionButtonClassName =
  "grid place-items-center rounded-md p-1.5 transition-colors hover:bg-[#eef2f7] focus-visible:outline-2 focus-visible:outline-[#0058be]";

export const subjectCardClassName =
  "flex w-full flex-col overflow-hidden rounded-xl border border-[#c5c6cd] bg-white shadow-[0_4px_4px_rgba(0,0,0,0.1)]";

// Figma 167:722. The pattern and title open the subject; the actions are separate buttons below them.
export function SubjectCard({
  subject,
  onDelete,
  onEdit,
  onCopyLink,
}: {
  subject: Subject;
  onDelete: () => void;
  onEdit: () => void;
  onCopyLink: () => void;
}) {
  return (
    <article className={subjectCardClassName}>
      <Link
        className="group flex flex-col gap-2 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0058be]"
        href={`/${subject.slug}/dashboard`}
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
        <div className="border-b border-[#c5c6cd] px-3 py-1 text-[#091426]">
          <p className="truncate text-xs leading-7">
            {subject.class.name}
            <span className="px-3">-</span>
            {subject.class.academicYear}
          </p>
          <p className="truncate text-base font-semibold leading-7 group-hover:text-[#0058be]">{subject.name}</p>
        </div>
      </Link>
      <div className="flex items-center justify-between px-3 py-2">
        <button
          aria-label={`Hapus ${subject.name}`}
          className={actionButtonClassName}
          onClick={onDelete}
          type="button"
        >
          <Image alt="" height={16} src="/subjects/actions/trash.svg" width={16} />
        </button>
        <div className="flex items-center">
          <button aria-label={`Edit ${subject.name}`} className={actionButtonClassName} onClick={onEdit} type="button">
            <Image alt="" height={15} src="/subjects/actions/edit.svg" width={15} />
          </button>
          <button
            aria-label={`Salin link join ${subject.name}`}
            className={actionButtonClassName}
            onClick={onCopyLink}
            type="button"
          >
            <Image alt="" height={15} src="/subjects/actions/link.svg" width={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
