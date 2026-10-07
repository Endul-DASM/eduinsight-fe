import { redirect } from "next/navigation";

// Kept for old links: the dashboard now lives under a subject (/student/{slug}/dashboard), so start at the
// subject list, where sign-in also lands.
export default function StudentDashboardRedirect() {
  redirect("/student");
}
