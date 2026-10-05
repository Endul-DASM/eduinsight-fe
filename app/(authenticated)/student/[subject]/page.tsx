import { redirect } from "next/navigation";

export default async function StudentSubjectRoute({ params }: PageProps<"/student/[subject]">) {
  const { subject } = await params;
  redirect(`/student/${subject}/dashboard`);
}
