"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { assessmentStatuses, assessmentStatusLabels, assessmentTypeLabels, assessmentTypes } from "@/lib/assessment-form";

const selectClassName =
  "h-10 rounded-[12px] border border-[#c5c6cd] bg-white px-3 text-sm text-[#091426] outline-none focus:border-[#0058be]";

// Filters of Daftar Assessment (FR-G-040), kept in the URL so the list is rendered on the server.
export function AssessmentFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(name: "type" | "status", value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(name, value);
    else params.delete(name);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-[#45474c]">
        Jenis
        <select
          className={selectClassName}
          onChange={(event) => update("type", event.target.value)}
          value={searchParams.get("type") ?? ""}
        >
          <option value="">Semua</option>
          {assessmentTypes.map((type) => (
            <option key={type} value={type}>
              {assessmentTypeLabels[type]}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm text-[#45474c]">
        Status
        <select
          className={selectClassName}
          onChange={(event) => update("status", event.target.value)}
          value={searchParams.get("status") ?? ""}
        >
          <option value="">Semua</option>
          {assessmentStatuses.map((status) => (
            <option key={status} value={status}>
              {assessmentStatusLabels[status]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
