import { redirect } from "next/navigation";

// Sign-in still sends students here; the dashboard now lives under a subject, so start at the subject list.
export default function StudentDashboardRedirect() {
  redirect("/student");
}
