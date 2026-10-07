import { cn } from "@/components/ui/cn";
import type { AssessmentStatus, AssessmentType } from "@/lib/api/types";
import { assessmentStatusLabels, assessmentTypeLabels } from "@/lib/assessment-form";

const pillClassName =
  "inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]";

const statusTones: Record<AssessmentStatus, string> = {
  draft: "bg-[#eef2f7] text-[#45474c]",
  scheduled: "bg-[#eef5ff] text-[#0058be]",
  ongoing: "bg-[#ecfdf3] text-[#16a34a]",
  closed: "bg-[#f5f3f4] text-[#75777d]",
};

export function AssessmentStatusBadge({ status }: { status: AssessmentStatus }) {
  return <span className={cn(pillClassName, statusTones[status])}>{assessmentStatusLabels[status]}</span>;
}

export function AssessmentTypeBadge({ type }: { type: AssessmentType }) {
  return <span className={cn(pillClassName, "bg-[#fff7e8] text-[#8a6b38]")}>{assessmentTypeLabels[type]}</span>;
}
