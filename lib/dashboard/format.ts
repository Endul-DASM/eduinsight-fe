import { SCHEDULE_TIME_ZONE } from "@/lib/assessment-form";
import type { Activity } from "./compute";

const DAY_MS = 24 * 60 * 60 * 1000;

// The filters of "Semua Aktivitas" (Figma New Design 65:12207).
export type ActivityPeriod = "week" | "month" | "older";

export type ActivityView = Activity & { timeLabel: string; period: ActivityPeriod };

// en-GB writes the time as 15:03 like the design; id-ID would write 15.03.
const timeFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: SCHEDULE_TIME_ZONE });
const dateFormat = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: SCHEDULE_TIME_ZONE });
const dayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: SCHEDULE_TIME_ZONE });

// Formatted on the server, so the page and the modal show the same text: "15:03" today, "9 Okt, 15:03" before.
export function toActivityViews(activities: Activity[], now = new Date()): ActivityView[] {
  const today = dayFormat.format(now);
  return activities.map((activity) => {
    const at = new Date(activity.at);
    const age = now.getTime() - at.getTime();
    const time = timeFormat.format(at);
    return {
      ...activity,
      timeLabel: dayFormat.format(at) === today ? time : `${dateFormat.format(at)}, ${time}`,
      period: age < 7 * DAY_MS ? "week" : age < 30 * DAY_MS ? "month" : "older",
    };
  });
}
