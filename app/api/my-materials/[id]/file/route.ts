import { getSessionToken } from "@/lib/api/session";

// Opens a material for the student (FR-S-031). The backend needs the session token, which only the server has, so
// the file is passed through here. ?download=true downloads it instead of opening it.
export async function GET(request: Request, { params }: RouteContext<"/api/my-materials/[id]/file">) {
  const { id } = await params;
  const token = await getSessionToken();
  const base = process.env.API_BASE_URL;
  if (!base || !token) return new Response("Materi tidak tersedia.", { status: 404 });

  const download = new URL(request.url).searchParams.get("download") === "true";
  const response = await fetch(`${base}/my-materials/${encodeURIComponent(id)}/file${download ? "?download=true" : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok || !response.body) return new Response("Materi tidak ditemukan.", { status: response.status });

  const headers = new Headers();
  for (const name of ["content-type", "content-length", "content-disposition"]) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(response.body, { headers });
}
