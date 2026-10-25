import { getSessionToken } from "@/lib/api/session";

// UAT MAT-U08: a hidden, deleted or unknown material opens in a new tab, so it gets a page that says so, not plain
// text. It follows the 404 design (Figma New Design 265:9433): the public background, "Oops!", a way back to the
// student's subjects and the EduInsight footer. Plain HTML, since a route handler cannot render a React page.
function unavailable(status: number) {
  const missing = status === 403 || status === 404;
  const title = missing ? "404 - Materi tidak tersedia" : "Materi belum bisa dibuka";
  const text = missing
    ? "Materi ini mungkin sedang disembunyikan atau sudah dihapus oleh guru, atau bukan dari mapel yang kamu ikuti."
    : "Terjadi kendala saat membuka materi. Coba lagi beberapa saat lagi.";
  const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title.replace("404 - ", "")} | EduInsight</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: flex; flex-direction: column; position: relative; overflow-x: hidden;
    background: #fff; color: #003264; font-family: Poppins, "Segoe UI", Arial, Helvetica, sans-serif; }
  .bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
  .bg img { position: absolute; max-width: none; }
  .bg .top { left: 50%; top: -713px; width: 1867px; height: 1444px; transform: translateX(-50%); }
  .bg .bottom-wrap { position: absolute; left: calc(50% + 380px); top: 700px; width: 1867px; height: 1444px;
    transform: translateX(-50%); display: flex; align-items: center; justify-content: center; }
  .bg .bottom { position: static; width: 1007px; height: 1644px; transform: rotate(107deg) scaleY(-1); }
  main { position: relative; flex: 1; display: flex; align-items: center; justify-content: center; padding: 64px 16px; }
  .box { width: 100%; max-width: 611px; display: flex; flex-direction: column; gap: 12px; text-align: center; }
  .oops { margin: 0; font-size: 200px; font-weight: 700; line-height: 1.5; }
  h1 { margin: 0; font-size: 32px; font-weight: 600; line-height: 1.5; }
  p { margin: 0; font-size: 16px; line-height: 1.5; }
  .button { display: flex; height: 48px; align-items: center; justify-content: center; border-radius: 12px; padding: 0 16px;
    background: #0058be; color: #f5f3f4; font-weight: 600; text-decoration: none;
    filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.15)); }
  .button:hover { background: #004695; }
  footer { position: relative; display: flex; flex-direction: column; gap: 8px; padding: 24px 64px;
    background: rgba(245, 243, 244, 0.6); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); backdrop-filter: blur(4px); }
  .brand { display: flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 600; color: #1b1b1d; }
  .brand img { width: 40px; height: 40px; }
  footer small { font-size: 12px; line-height: 1.5; color: #45474c; }
  @media (max-width: 1023px) { .oops { font-size: 160px; line-height: 1.2; } }
  @media (max-width: 639px) {
    .oops { font-size: 96px; }
    h1 { font-size: 24px; }
    footer { padding: 24px 16px; }
  }
</style>
</head>
<body>
<div class="bg" aria-hidden="true">
  <img class="top" src="/landing/bg-ellipse.svg" alt="">
  <div class="bottom-wrap"><img class="bottom" src="/landing/bg-curve.svg" alt=""></div>
</div>
<main>
  <div class="box">
    <p class="oops">Oops!</p>
    <h1>${title}</h1>
    <p>${text}</p>
    <a class="button" href="/student">Kembali ke Halaman Utama</a>
  </div>
</main>
<footer>
  <div class="brand"><img src="/auth/logo.svg" alt="">EduInsight</div>
  <small>&copy; 2026 EduInsight AI. Systematic &amp; Encouraging Learning.</small>
</footer>
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
