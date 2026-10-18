// Student dashboard figures (PRD 6.1, SRS FR-S-001 – 004) on top of GET /subjects/:id/my-dashboard. Pure functions.
import type { ActivityStatus, MyActivity, StudentChapter } from "./api/student";

const numberFormat = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });

export function formatPoints(value: number): string {
  return numberFormat.format(Math.round(value * 100) / 100);
}

// "+12 poin dari rata-rata kelas"
export function classGap(chapter: StudentChapter): string | null {
  if (chapter.score === null || chapter.classAverage === null) return null;
  const gap = chapter.score - chapter.classAverage;
  if (Math.abs(gap) < 0.005) return "Sama dengan rata-rata kelas";
  return `${gap > 0 ? "+" : "−"}${formatPoints(Math.abs(gap))} poin dari rata-rata kelas`;
}

// The Bab to work on next: the lowest score among those with one.
export function weakestChapter(chapters: StudentChapter[]): StudentChapter | null {
  return chapters
    .filter((chapter) => chapter.score !== null)
    .reduce<StudentChapter | null>((low, chapter) => (!low || chapter.score! < low.score! ? chapter : low), null);
}

export const activityStatusLabels: Record<ActivityStatus, { label: string; className: string }> = {
  menunggu_nilai: { label: "Menunggu nilai", className: "bg-[rgba(153,188,229,0.6)] text-[#004695]" },
  tuntas: { label: "Tuntas", className: "bg-[#dcfce7] text-[#166534]" },
  belum_tuntas: { label: "Perlu remedial", className: "bg-[#ffedd5] text-[#9a3412]" },
};

const dateFormat = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

// "Kemarin, 15.30", "2 hari yang lalu", or "14 Oktober 2026, 18.10" (WIB).
export function activityTime(iso: string, now = Date.now()): string {
  const at = new Date(iso);
  const days = Math.floor((startOfDay(now) - startOfDay(at.getTime())) / 86_400_000);
  const time = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" }).format(at);
  if (days <= 0) return `Hari ini, ${time}`;
  if (days === 1) return `Kemarin, ${time}`;
  if (days < 7) return `${days} hari yang lalu`;
  return dateFormat.format(at).replace(" pukul ", ", ");
}

function startOfDay(ms: number): number {
  // Days are counted in WIB.
  const wib = ms + 7 * 3_600_000;
  return wib - (wib % 86_400_000);
}

export function activityTitle(activity: MyActivity): string {
  if (activity.kind === "material") return `Materi Dibuka: ${activity.material?.title ?? "Materi"}`;
  return activity.assessment?.title ?? "Asesmen";
}

const sizeFormat = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });

export function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${sizeFormat.format(bytes / (1024 * 1024))} MB`;
  return `${sizeFormat.format(Math.max(1, Math.round(bytes / 1024)))} KB`;
}
