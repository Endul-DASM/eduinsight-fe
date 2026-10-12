import { getSessionToken } from "@/lib/api/session";

// Opens a material's file (FR-G-033). The backend needs the session token, which only the server has, so the
// download is passed through here.
export async function GET(_request: Request, { params }: RouteContext<"/api/materials/[id]/file">) {
  const { id } = await params;
  const token = await getSessionToken();
  const base = process.env.API_BASE_URL;
  if (!base || !token) return new Response("Materi tidak tersedia.", { status: 404 });

  const response = await fetch(`${base}/materials/${encodeURIComponent(id)}/file`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok || !response.body) return new Response("Materi tidak ditemukan.", { status: response.status });

  const headers = new Headers();
  for (const name of ["content-type", "content-length", "content-disposition"]) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }
  // Open PDFs in the browser instead of always downloading them.
  const disposition = headers.get("content-disposition");
  if (disposition && headers.get("content-type") === "application/pdf") {
    headers.set("content-disposition", disposition.replace(/^attachment/, "inline"));
  }
  return new Response(response.body, { headers });
}
