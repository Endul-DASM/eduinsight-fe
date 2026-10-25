import { getSessionToken } from "@/lib/api/session";

// UAT MAT-U08: a hidden, deleted or unknown material opens in a new tab, so it gets a page that says so, not plain
// text.
function unavailable(status: number) {
  const missing = status === 403 || status === 404;
  const title = missing ? "Materi tidak tersedia" : "Materi belum bisa dibuka";
  const text = missing
    ? "Materi ini mungkin sedang disembunyikan atau sudah dihapus oleh guru, atau bukan dari mapel yang kamu ikuti."
    : "Terjadi kendala saat membuka materi. Coba lagi beberapa saat lagi.";
  const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} | EduInsight</title>
<style>
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 16px; box-sizing: border-box;
    background: #e6eff9; color: #1b1b1d; font-family: Poppins, "Segoe UI", Arial, Helvetica, sans-serif; }
  main { max-width: 440px; display: flex; flex-direction: column; gap: 12px; padding: 32px 24px; border-radius: 24px;
    background: #fafbfd; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); text-align: center; }
  h1 { margin: 0; font-size: 20px; line-height: 1.5; }
  p { margin: 0; font-size: 14px; line-height: 1.5; color: #45474c; }
  button { align-self: center; margin-top: 8px; border: 0; border-radius: 12px; padding: 10px 16px; background: #0058be;
    color: #f5f3f4; font: inherit; font-weight: 600; cursor: pointer; }
  button:hover { background: #004695; }
</style>
</head>
<body>
<main>
  <h1>${title}</h1>
  <p>${text}</p>
  <button onclick="history.length > 1 ? history.back() : window.close()" type="button">Kembali</button>
</main>
</body>
</html>`;
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8" } });
}

// Opens a material for the student (FR-S-031). The backend needs the session token, which only the server has, so
// the file is passed through here. ?download=true downloads it instead of opening it.
export async function GET(request: Request, { params }: RouteContext<"/api/my-materials/[id]/file">) {
  const { id } = await params;
  const token = await getSessionToken();
  const base = process.env.API_BASE_URL;
  if (!base || !token) return unavailable(404);

  const download = new URL(request.url).searchParams.get("download") === "true";
  const response = await fetch(`${base}/my-materials/${encodeURIComponent(id)}/file${download ? "?download=true" : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok || !response.body) return unavailable(response.ok ? 404 : response.status);

  const headers = new Headers();
  for (const name of ["content-type", "content-length", "content-disposition"]) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(response.body, { headers });
}
