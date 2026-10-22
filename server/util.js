// Utilitas umum: respons JSON, error, id, validasi.
export class ApiError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}
export const E = {
  bad: (m = "Input tidak valid", code = "bad_request") => new ApiError(400, code, m),
  unauth: (m = "Belum login") => new ApiError(401, "unauthorized", m),
  forbid: (m = "Tidak berhak mengakses ini") => new ApiError(403, "forbidden", m),
  notFound: (m = "Tidak ditemukan") => new ApiError(404, "not_found", m),
  conflict: (m, code = "conflict") => new ApiError(409, code, m),
  limit: (m = "Terlalu banyak permintaan, coba lagi nanti") => new ApiError(429, "rate_limited", m)
};

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers }
  });
}
export const errorResponse = (e) => json({ error: { code: e.code, message: e.message } }, e.status);

const B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export function ulid(now = Date.now()) {
  let t = "";
  for (let i = 0, n = now; i < 10; i++, n = Math.floor(n / 32)) t = B32[n % 32] + t;
  const r = crypto.getRandomValues(new Uint8Array(16));
  return t + Array.from(r, (b) => B32[b % 32]).join("");
}
export const newId = (prefix, now) => prefix + "_" + ulid(now);

const ALNUM = "abcdefghjkmnpqrstuvwxyz23456789";
export function randomCode(len) {
  const r = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(r, (b) => ALNUM[b % ALNUM.length]).join("");
}
export function randomToken(bytes = 32) {
  const r = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...r)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ---- validasi ----
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const WA_LINK_RE = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9_-]+$/;
export const waValid = (v) => { const n = String(v).replace(/\D/g, "").length; return n >= 9 && n <= 15; };

// teks polos: string, di-trim, tanpa karakter kontrol, panjang 0..max (min bila required)
export function str(v, field, { max, min = 0 } = {}) {
  if (typeof v !== "string") throw E.bad(`${field} harus teks`);
  const s = v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
  if (s.length < min) throw E.bad(`${field} wajib diisi`);
  if (s.length > max) throw E.bad(`${field} maksimal ${max} karakter`);
  return s;
}
export function optUrl(v, field) {
  const s = str(v, field, { max: 200 });
  if (s && !/^https?:\/\/\S+$/i.test(s)) throw E.bad(`${field} harus berupa URL http(s)`);
  return s;
}

export async function readJson(req) {
  if (+(req.headers.get("content-length") || 0) > 65536) throw E.bad("Isi permintaan terlalu besar");
  let b;
  try { b = await req.json(); } catch { throw E.bad("Isi permintaan harus JSON"); }
  if (!b || typeof b !== "object" || Array.isArray(b)) throw E.bad("Isi permintaan harus objek JSON");
  return b;
}

export const parseJson = (s, fallback) => { try { return JSON.parse(s); } catch { return fallback; } };
export const isUniqueError = (e) => /UNIQUE constraint failed|constraint failed/i.test(String(e && e.message));
