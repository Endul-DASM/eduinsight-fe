import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ClipboardIcon } from "@/components/ui/icons";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import type { Assessment } from "@/lib/api/types";
import { formatSchedule } from "@/lib/assessment-form";
import { AssessmentStatusBadge, AssessmentTypeBadge } from "./assessment-badges";
import { AssessmentFilters } from "./assessment-filters";
import { CreateAssessmentButton } from "./create-assessment-modal";

// Daftar Assessment (PRD G-ASM-00, FR-G-040).
export function AssessmentListPage({
  slug,
  subjectId,
  assessments,
  filtered,
  openCreate,
}: {
  slug: string;
  subjectId: string;
  assessments: Assessment[];
  // A type or status filter is active, so an empty list means "no match", not "none yet".
  filtered: boolean;
  openCreate: boolean;
}) {
  return (
    <div className="space-y-8 px-5 py-6 sm:px-6 lg:px-10 lg:py-10">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-[clamp(2rem,4vw,2.75rem)] font-semibold tracking-[-0.04em] text-[#1b1b1d]">
            Daftar Assessment
          </h1>
          <p className="text-sm text-[#5c6470]">
            Buat asesmen dari Bank Soal, periksa kisi-kisinya, lalu publikasikan sesuai jadwal.
          </p>
        </div>
        {/* Remounts when ?new=1 appears, e.g. from the sidebar while this page is open. */}
        <CreateAssessmentButton
          initiallyOpen={openCreate}
          key={String(openCreate)}
          slug={slug}
          subjectId={subjectId}
        />
      </section>

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
