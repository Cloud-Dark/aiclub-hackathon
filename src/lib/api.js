// Klien API (same-origin, cookie session). Semua data berasal dari server; tidak ada data lokal sebagai sumber kebenaran.
export class ApiError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}

// penghitung permintaan yang sedang berjalan (kecuali yang { silent: true }, mis. polling latar belakang) untuk indikator "mohon tunggu"
let inflight = 0;
const listeners = new Set();
const bump = (d) => { inflight += d; listeners.forEach((f) => f(inflight)); };
export const onBusy = (f) => { listeners.add(f); return () => listeners.delete(f); };

export async function api(method, path, body, opts = {}) {
  if (!opts.silent) bump(1);
  try { return await request(method, path, body); } finally { if (!opts.silent) bump(-1); }
}

async function request(method, path, body) {
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
api.get = (p, o) => api("GET", p, undefined, o);
api.post = (p, b, o) => api("POST", p, b === undefined ? {} : b, o);
api.patch = (p, b, o) => api("PATCH", p, b, o);
api.del = (p, o) => api("DELETE", p, undefined, o);
