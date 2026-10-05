import { redirect } from "next/navigation";

// /join/{code} — the link teachers copy from a subject card. Students land on their subject list with the join
// modal open and the code filled in.
export default async function JoinRoute({ params }: PageProps<"/join/[code]">) {
  const { code } = await params;
  redirect(`/student?join=${encodeURIComponent(code)}`);
}
