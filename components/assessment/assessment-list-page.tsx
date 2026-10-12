import Link from "next/link";
import { sectionClassName } from "@/components/curriculum/styles";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { ClipboardIcon } from "@/components/ui/icons";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import type { Assessment } from "@/lib/api/types";
import { formatSchedule } from "@/lib/assessment-form";
import { AssessmentStatusBadge, AssessmentTypeBadge } from "./assessment-badges";
import { AssessmentFilters } from "./assessment-filters";

// Daftar Asesmen tab (PRD G-ASM-00, FR-G-040). The table is the previous design; its redesign (Figma New Design
// 54:7817) comes next.
export function AssessmentListPage({
  slug,
  assessments,
  filtered,
}: {
  slug: string;
  assessments: Assessment[];
  // A type or status filter is active, so an empty list means "no match", not "none yet".
  filtered: boolean;
}) {
  return (
    <div className={cn(sectionClassName, "gap-6")}>
      <AssessmentFilters />

      {assessments.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center shadow-none">
          <ClipboardIcon className="size-8 text-[#9aa1ae]" />
          <p className="text-sm text-[#45474c]">
            {filtered ? "Tidak ada asesmen yang cocok dengan filter." : "Belum ada asesmen di mata pelajaran ini."}
          </p>
        </Card>
      ) : (
        <Card className="p-2 shadow-none">
          <Table className="border-spacing-0">
            <TableHead>
              <TableRow>
                <TableHeaderCell className="text-left">Judul</TableHeaderCell>
                <TableHeaderCell className="text-left">Jenis</TableHeaderCell>
                <TableHeaderCell className="text-left">Status</TableHeaderCell>
                <TableHeaderCell className="text-left">Jadwal Buka</TableHeaderCell>
                <TableHeaderCell className="text-right">Soal</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assessments.map((assessment) => (
                <TableRow className="hover:bg-[#f5f3f4]" key={assessment.id}>
                  <TableCell className="border-t border-[#eae7e9] px-2 py-3">
                    <Link
                      className="text-sm font-medium text-[#0058be] hover:underline"
                      href={`/${slug}/assessment/${assessment.id}`}
                    >
                      {assessment.title}
                    </Link>
                  </TableCell>
                  <TableCell className="border-t border-[#eae7e9] px-2 py-3">
                    <AssessmentTypeBadge type={assessment.type} />
                  </TableCell>
                  <TableCell className="border-t border-[#eae7e9] px-2 py-3">
                    <AssessmentStatusBadge status={assessment.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap border-t border-[#eae7e9] px-2 py-3 text-sm text-[#45474c]">
                    {formatSchedule(assessment.opensAt)}
                  </TableCell>
                  <TableCell className="border-t border-[#eae7e9] px-2 py-3 text-right text-sm text-[#45474c]">
                    {assessment.questionCount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
