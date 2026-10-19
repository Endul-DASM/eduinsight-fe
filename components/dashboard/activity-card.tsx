"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/components/ui/cn";
import { Modal } from "@/components/ui/modal";
import type { ActivityKind } from "@/lib/dashboard/compute";
import type { ActivityPeriod, ActivityView } from "@/lib/dashboard/format";

const kindStyles: Record<ActivityKind, { icon: string; chip: string }> = {
  grading: { icon: "/dashboard/activity-remedial.svg", chip: "bg-[rgba(254,202,202,0.6)]" },
  closed: { icon: "/dashboard/activity-done.svg", chip: "bg-[rgba(153,188,229,0.6)]" },
  published: { icon: "/dashboard/activity-report.svg", chip: "bg-[rgba(187,247,208,0.6)]" },
  remedial: { icon: "/dashboard/activity-remedial.svg", chip: "bg-[rgba(254,215,170,0.6)]" },
  material: { icon: "/dashboard/activity-history.svg", chip: "bg-[rgba(153,188,229,0.6)]" },
  joined: { icon: "/dashboard/activity-report.svg", chip: "bg-[rgba(187,247,208,0.6)]" },
};

const periods: { id: ActivityPeriod | "month-all"; label: string }[] = [
  { id: "week", label: "Minggu Ini" },
  { id: "month-all", label: "Bulan Ini" },
  { id: "older", label: "Sudah berlalu" },
];

function ActivityItem({ activity, last }: { activity: ActivityView; last: boolean }) {
  const style = kindStyles[activity.kind];

  return (
    <li className="flex gap-1 rounded-xl p-3">
      <div className="flex w-[47px] shrink-0 flex-col items-center gap-2">
        <span className={cn("grid place-items-center rounded-3xl px-2 py-1", style.chip)}>
          <Image alt="" height={20} src={style.icon} width={20} />
        </span>
        {!last && <span className="w-px flex-1 bg-[#c5c6cd]" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 text-base leading-normal">
        {activity.href ? (
          <Link className="font-semibold text-[#1b1b1d] hover:text-[#0058be]" href={activity.href}>
            {activity.title}
          </Link>
        ) : (
          <p className="font-semibold text-[#1b1b1d]">{activity.title}</p>
        )}
        <p className="text-[#75777d]">{activity.detail}</p>
        <p className="text-[#0058be]">{activity.timeLabel}</p>
      </div>
    </li>
  );
}

function ActivityList({ activities }: { activities: ActivityView[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {activities.map((activity, index) => (
        <ActivityItem activity={activity} key={activity.id} last={index === activities.length - 1} />
      ))}
    </ul>
  );
}

// "Aktivitas Terbaru" (FR-G-015, Figma New Design 22:4162) and "Semua Aktivitas" (65:12207).
export function ActivityCard({ activities }: { activities: ActivityView[] }) {
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState<(typeof periods)[number]["id"]>("week");
  const filtered = activities.filter((activity) =>
    period === "month-all" ? activity.period !== "older" : activity.period === period,
  );

  return (
    <section className="flex w-full flex-col gap-5 rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
      <h2 className="flex items-center gap-3 py-1 text-xl font-semibold leading-normal text-[#1b1b1d]">
        <Image alt="" height={24} src="/dashboard/activity-history.svg" width={24} />
        Aktivitas Terbaru
      </h2>
      <hr className="border-[#c5c6cd]" />
      {activities.length === 0 ? (
        <p className="py-4 text-sm leading-normal text-[#45474c]">Belum ada aktivitas di mapel ini.</p>
      ) : (
        <ActivityList activities={activities.slice(0, 3)} />
      )}
      <button
        className="rounded-xl bg-[rgba(153,188,229,0.6)] px-4 py-3 text-base font-semibold leading-normal text-[#004695] shadow-[0_4px_8px_rgba(0,0,0,0.15)] transition-colors hover:bg-[rgba(153,188,229,0.85)] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={activities.length === 0}
        onClick={() => setOpen(true)}
        type="button"
      >
        Tampilkan Semua Aktivitas
      </button>

      <Modal
        align="start"
        className="max-w-[1090px] rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop:bg-[rgba(9,20,38,0.2)] backdrop:backdrop-blur-sm"
        icon={<Image alt="" height={24} src="/dashboard/activity-history.svg" width={24} />}
        onClose={() => setOpen(false)}
        open={open}
        showClose
        title="Semua Aktivitas"
      >
        <div className="flex flex-col gap-4 text-left">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Periode">
            {periods.map((option) => (
              <button
                aria-pressed={period === option.id}
                className={cn(
                  "rounded-3xl px-3 py-1 text-xs font-semibold leading-normal text-[#004695]",
                  period === option.id
                    ? "border border-[#004695] bg-[rgba(153,188,229,0.6)]"
                    : "bg-[rgba(153,188,229,0.6)] hover:bg-[rgba(153,188,229,0.85)]",
                )}
                key={option.id}
                onClick={() => setPeriod(option.id)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#45474c]">Tidak ada aktivitas pada periode ini.</p>
            ) : (
              <ActivityList activities={filtered} />
            )}
          </div>
        </div>
      </Modal>
    </section>
  );
}
