import { redirect } from "next/navigation";

export default async function SubjectRoute({ params }: PageProps<"/[subject]">) {
  const { subject } = await params;
  redirect(`/${subject}/dashboard`);
}
