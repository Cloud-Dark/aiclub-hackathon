// Klien API (same-origin, cookie session). Semua data berasal dari server; tidak ada data lokal sebagai sumber kebenaran.
export class ApiError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}

export async function api(method, path, body) {
  let r;
  try {
    r = await fetch("/api" + path, {
      method, credentials: "same-origin",
      headers: body !== undefined ? { "content-type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch (e) { throw new ApiError(0, "network", "Tidak bisa terhubung ke server"); }
  let data = null;
  try { data = await r.json(); } catch (e) {}
  if (!r.ok) {
    const er = (data && data.error) || {};
    throw new ApiError(r.status, er.code || "error", er.message || "Terjadi kesalahan (" + r.status + ")");
  }
  return data;
}
api.get = (p) => api("GET", p);
api.post = (p, b) => api("POST", p, b === undefined ? {} : b);
api.patch = (p, b) => api("PATCH", p, b);
api.del = (p) => api("DELETE", p);
