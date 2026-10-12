import { getSessionToken } from "@/lib/api/session";

// Unduh Template soal (FR-G-061), ?format=xlsx|csv. The backend needs the session token, which only the server has,
// so the download is passed through here.
export async function GET(request: Request, { params }: RouteContext<"/api/subjects/[id]/question-template">) {
  const { id } = await params;
  const format = new URL(request.url).searchParams.get("format") === "csv" ? "csv" : "xlsx";
  const token = await getSessionToken();
  const base = process.env.API_BASE_URL;
  if (!base || !token) return new Response("Template tidak tersedia.", { status: 404 });

  const response = await fetch(
    `${base}/subjects/${encodeURIComponent(id)}/question-imports/template?format=${format}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!response.ok || !response.body) return new Response("Template tidak ditemukan.", { status: response.status });

  const headers = new Headers();
  for (const name of ["content-type", "content-length", "content-disposition"]) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(response.body, { headers });
}
