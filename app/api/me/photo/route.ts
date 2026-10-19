import { getSessionToken } from "@/lib/api/session";

// The signed-in user's profile photo. The backend needs the session token, which only the server has, so the image
// is passed through here. Callers add ?v={photoUpdatedAt}, so a new photo is a new URL and the old one can be cached.
export async function GET() {
  const token = await getSessionToken();
  const base = process.env.API_BASE_URL;
  if (!base || !token) return new Response("Foto tidak tersedia.", { status: 404 });

  const response = await fetch(`${base}/me/photo`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok || !response.body) return new Response("Foto tidak ditemukan.", { status: response.status });

  const headers = new Headers({ "cache-control": "private, max-age=31536000, immutable" });
  for (const name of ["content-type", "content-length"]) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(response.body, { headers });
}
