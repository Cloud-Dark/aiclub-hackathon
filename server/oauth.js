// OAuth 2.1 authorization server minimal untuk MCP: klien publik, PKCE S256, registrasi dinamis.
// Login memakai akun portal dan hanya admin yang boleh menyelesaikan otorisasi.
import { json, randomToken, newId, EMAIL_RE } from "./util.js";
import { verifyTurnstile } from "./turnstile.js";
import { sha256, hashPassword, safeEqual, throttleLogin, recordFailedLogin } from "./auth.js";

const CODE_MS = 10 * 60000, ACCESS_MS = 3600000, REFRESH_MS = 30 * 86400000;
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, content-type, mcp-protocol-version", "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-expose-headers": "www-authenticate" };
const withCors = (r) => { for (const [k, v] of Object.entries(CORS)) r.headers.set(k, v); return r; };
const j = (data, status = 200, h = {}) => withCors(json(data, status, h));
const oerr = (error, description, status = 400) => j({ error, error_description: description }, status);
const origin = (url) => url.origin;

export const resourceMetadataUrl = (url) => `${origin(url)}/.well-known/oauth-protected-resource`;

export function wellKnown(request) {
  const url = new URL(request.url), o = origin(url);
  if (request.method === "OPTIONS") return withCors(new Response(null, { status: 204 }));
  if (url.pathname.startsWith("/.well-known/oauth-protected-resource"))
    return j({ resource: o + "/mcp", authorization_servers: [o], bearer_methods_supported: ["header"] });
  if (url.pathname.startsWith("/.well-known/oauth-authorization-server"))
    return j({
      issuer: o, authorization_endpoint: o + "/oauth/authorize", token_endpoint: o + "/oauth/token", registration_endpoint: o + "/oauth/register",
      response_types_supported: ["code"], grant_types_supported: ["authorization_code", "refresh_token"],
      code_challenge_methods_supported: ["S256"], token_endpoint_auth_methods_supported: ["none"]
    });
  return j({ error: "not_found" }, 404);
}

const validRedirect = (u) => {
  if (typeof u !== "string" || u.length > 300) return false;
  try {
    const x = new URL(u);
    if (x.hash) return false;
    if (x.protocol === "https:") return true;
    if (x.protocol === "http:") return ["localhost", "127.0.0.1", "[::1]"].includes(x.hostname);
    return /^[a-z][a-z0-9+.-]*:$/.test(x.protocol) && !["javascript:", "data:", "file:", "vbscript:"].includes(x.protocol); // skema aplikasi native
  } catch { return false; }
};

async function register(c) {
  let b; try { b = await c.req.json(); } catch { return oerr("invalid_client_metadata", "JSON tidak valid"); }
  const uris = b && b.redirect_uris;
  if (!Array.isArray(uris) || !uris.length || uris.length > 5 || !uris.every(validRedirect)) return oerr("invalid_redirect_uri", "redirect_uris tidak valid");
  const recent = await c.db.prepare("SELECT COUNT(*) n FROM hackathon_oauth_client WHERE created_at > ?").bind(c.now - 3600000).first();
  if (recent.n >= 200) return oerr("temporarily_unavailable", "Terlalu banyak registrasi, coba lagi nanti", 429);
  const id = newId("cli", c.now), name = String(b.client_name || "MCP client").slice(0, 80);
  await c.db.batch([
    c.db.prepare("INSERT INTO hackathon_oauth_client (id, name, redirect_uris, created_at) VALUES (?,?,?,?)").bind(id, name, JSON.stringify(uris), c.now),
    c.db.prepare("DELETE FROM hackathon_oauth_client WHERE created_at < ? AND NOT EXISTS (SELECT 1 FROM hackathon_oauth_token t WHERE t.client_id = hackathon_oauth_client.id)").bind(c.now - 30 * 86400000)
  ]);
  return j({ client_id: id, client_name: name, redirect_uris: uris, grant_types: ["authorization_code", "refresh_token"], response_types: ["code"], token_endpoint_auth_method: "none" }, 201);
}

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
const page = (body, status = 200) => new Response(
  `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Masuk pengurus</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#05070e;color:#e8ecf8;font:16px/1.5 system-ui,sans-serif}main{width:min(92vw,380px);background:#0d1220;border:1px solid #232b45;border-radius:12px;padding:28px}h1{font-size:20px;margin:0 0 4px}p{color:#9aa4c4;margin:0 0 18px;font-size:14px}label{display:block;font-size:13px;margin:12px 0 4px}input{width:100%;box-sizing:border-box;padding:10px 12px;border-radius:8px;border:1px solid #2c3556;background:#05070e;color:inherit;font:inherit}button{margin-top:18px;width:100%;padding:11px;border:0;border-radius:8px;background:#6ea8ff;color:#05070e;font:inherit;font-weight:700;cursor:pointer}.err{background:#3a1620;border:1px solid #7a2a3c;padding:10px 12px;border-radius:8px;font-size:14px;margin-bottom:8px}</style></head><body><main>${body}</main></body></html>`,
  { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-frame-options": "DENY", "content-security-policy": "frame-ancestors 'none'; default-src 'none'; style-src 'unsafe-inline'; script-src https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; connect-src https://challenges.cloudflare.com", "referrer-policy": "no-referrer" } }
);

// validasi parameter otorisasi; kembalikan {client, p} atau Response halaman galat (tanpa redirect)
async function authParams(c, src) {
  const p = Object.fromEntries(["client_id", "redirect_uri", "response_type", "code_challenge", "code_challenge_method", "state"].map((k) => [k, (src.get(k) || "").slice(0, 600)]));
  const client = p.client_id && await c.db.prepare("SELECT * FROM hackathon_oauth_client WHERE id = ?").bind(p.client_id).first();
  if (!client || !JSON.parse(client.redirect_uris).includes(p.redirect_uri)) return { fail: page("<h1>Permintaan tidak valid</h1><p>Aplikasi atau redirect_uri tidak dikenal.</p>", 400) };
  const back = (error) => { const u = new URL(p.redirect_uri); u.searchParams.set("error", error); if (p.state) u.searchParams.set("state", p.state); return new Response(null, { status: 302, headers: { location: u.toString(), "cache-control": "no-store" } }); };
  if (p.response_type !== "code") return { fail: back("unsupported_response_type") };
  if (p.code_challenge_method !== "S256" || !/^[A-Za-z0-9_-]{43,128}$/.test(p.code_challenge)) return { fail: back("invalid_request") };
  return { client, p };
}
const form = (c, p, client, error, email = "") => page(
  `<h1>Masuk pengurus</h1><p>${esc(client.name)} meminta akses ke pengelolaan portal hackathon. Hanya akun admin yang bisa melanjutkan.</p>
${error ? `<div class="err" role="alert">${esc(error)}</div>` : ""}
<form method="post">${Object.entries(p).map(([k, v]) => `<input type="hidden" name="${k}" value="${esc(v)}">`).join("")}
<label for="e">Email</label><input id="e" name="email" type="email" autocomplete="username" required value="${esc(email)}">
<label for="pw">Sandi</label><input id="pw" name="password" type="password" autocomplete="current-password" required>
${c.env.TURNSTILE_SITEKEY && c.env.TURNSTILE_SECRET ? `<div class="cf-turnstile" data-sitekey="${esc(c.env.TURNSTILE_SITEKEY)}" data-theme="dark" style="margin-top:14px"></div><script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>` : ""}
<button type="submit">Masuk dan izinkan</button></form>`, error ? 401 : 200);

async function authorize(c) {
  const src = c.req.method === "POST" ? new URLSearchParams(await c.req.text()) : c.url.searchParams;
  const { fail, client, p } = await authParams(c, src);
  if (fail) return fail;
  if (c.req.method === "GET") return form(c, p, client);

  const email = (src.get("email") || "").trim().toLowerCase().slice(0, 120), pw = src.get("password") || "";
  const origin = c.req.headers.get("origin");
  if (origin && new URL(origin).host !== c.url.host) return page("<h1>Ditolak</h1>", 403);
  if (!EMAIL_RE.test(email) || !pw || pw.length > 128) return form(c, p, client, "Email dan sandi wajib diisi", email);
  try { await verifyTurnstile(c.env, src.get("cf-turnstile-response") || "", c.req); } catch (e) { return form(c, p, client, e.message, email); }
  try { await throttleLogin(c.db, email, c.now); } catch { return form(c, p, client, "Terlalu banyak percobaan, coba lagi 15 menit lagi", email); }
  const m = await c.db.prepare("SELECT * FROM hackathon_member WHERE email = ?").bind(email).first();
  const got = await hashPassword(pw, m ? m.pass_salt : "00".repeat(16));
  if (!m || !safeEqual(got, m.pass_hash)) { await recordFailedLogin(c.db, email, c.now); return form(c, p, client, "Email atau sandi salah", email); }
  if (m.role !== "admin") return form(c, p, client, "Akun ini bukan admin", email);

  const code = randomToken();
  await c.db.batch([
    c.db.prepare("INSERT INTO hackathon_oauth_code (code_hash, client_id, member_id, redirect_uri, code_challenge, expires_at) VALUES (?,?,?,?,?,?)").bind(await sha256(code), client.id, m.id, p.redirect_uri, p.code_challenge, c.now + CODE_MS),
    c.db.prepare("DELETE FROM hackathon_oauth_code WHERE expires_at < ?").bind(c.now)
  ]);
  const u = new URL(p.redirect_uri);
  u.searchParams.set("code", code);
  if (p.state) u.searchParams.set("state", p.state);
  return new Response(null, { status: 302, headers: { location: u.toString(), "cache-control": "no-store", "referrer-policy": "no-referrer" } });
}

async function issue(c, clientId, memberId) {
  const access = randomToken(), refresh = randomToken();
  await c.db.batch([
    c.db.prepare("INSERT INTO hackathon_oauth_token (token_hash, kind, client_id, member_id, expires_at) VALUES (?,?,?,?,?)").bind(await sha256(access), "access", clientId, memberId, c.now + ACCESS_MS),
    c.db.prepare("INSERT INTO hackathon_oauth_token (token_hash, kind, client_id, member_id, expires_at) VALUES (?,?,?,?,?)").bind(await sha256(refresh), "refresh", clientId, memberId, c.now + REFRESH_MS),
    c.db.prepare("DELETE FROM hackathon_oauth_token WHERE expires_at < ?").bind(c.now)
  ]);
  return j({ access_token: access, token_type: "Bearer", expires_in: ACCESS_MS / 1000, refresh_token: refresh }, 200, { pragma: "no-cache" });
}

async function token(c) {
  const f = new URLSearchParams(await c.req.text());
  const grant = f.get("grant_type"), clientId = f.get("client_id") || "";
  const client = await c.db.prepare("SELECT id FROM hackathon_oauth_client WHERE id = ?").bind(clientId).first();
  if (!client) return oerr("invalid_client", "client_id tidak dikenal", 401);

  if (grant === "authorization_code") {
    const code = f.get("code") || "", verifier = f.get("code_verifier") || "";
    if (!code || !/^[A-Za-z0-9._~-]{43,128}$/.test(verifier)) return oerr("invalid_request", "code atau code_verifier tidak valid");
    const hash = await sha256(code);
    // sekali pakai: hapus dulu, pakai hanya bila benar-benar terhapus oleh permintaan ini
    const row = await c.db.prepare("SELECT * FROM hackathon_oauth_code WHERE code_hash = ?").bind(hash).first();
    const del = await c.db.prepare("DELETE FROM hackathon_oauth_code WHERE code_hash = ?").bind(hash).run();
    if (!row || !del.meta.changes || row.expires_at <= c.now || row.client_id !== client.id || row.redirect_uri !== (f.get("redirect_uri") || ""))
      return oerr("invalid_grant", "code tidak valid atau kedaluwarsa");
    const challenge = btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    if (!safeEqual(challenge, row.code_challenge)) return oerr("invalid_grant", "code_verifier salah");
    const m = await c.db.prepare("SELECT role FROM hackathon_member WHERE id = ?").bind(row.member_id).first();
    if (!m || m.role !== "admin") return oerr("invalid_grant", "akun bukan admin");
    return issue(c, client.id, row.member_id);
  }
  if (grant === "refresh_token") {
    const hash = await sha256(f.get("refresh_token") || "");
    const row = await c.db.prepare("SELECT * FROM hackathon_oauth_token WHERE token_hash = ? AND kind = 'refresh'").bind(hash).first();
    const del = await c.db.prepare("DELETE FROM hackathon_oauth_token WHERE token_hash = ?").bind(hash).run(); // rotasi: refresh token sekali pakai
    if (!row || !del.meta.changes || row.expires_at <= c.now || row.client_id !== client.id) return oerr("invalid_grant", "refresh_token tidak valid");
    const m = await c.db.prepare("SELECT role FROM hackathon_member WHERE id = ?").bind(row.member_id).first();
    if (!m || m.role !== "admin") return oerr("invalid_grant", "akun bukan admin");
    return issue(c, client.id, row.member_id);
  }
  return oerr("unsupported_grant_type", "grant_type tidak didukung");
}

// member admin dari access token, atau null
export async function adminFromToken(db, bearer, now) {
  if (!bearer || bearer.length > 100) return { member: null };
  const m = await db.prepare(
    `SELECT m.* FROM hackathon_oauth_token t JOIN hackathon_member m ON m.id = t.member_id
      WHERE t.token_hash = ? AND t.kind = 'access' AND t.expires_at > ?`
  ).bind(await sha256(bearer), now).first();
  return { member: m || null };
}

export async function handleOAuth(request, env) {
  if (request.method === "OPTIONS") return withCors(new Response(null, { status: 204 }));
  if (!env.DB) return oerr("server_error", "Database belum terpasang", 500);
  const url = new URL(request.url), now = Date.now();
  const c = { env, db: env.DB, req: request, url, now };
  const path = url.pathname.replace(/\/+$/, "");
  try {
    if (path === "/oauth/register" && request.method === "POST") return await register(c);
    if (path === "/oauth/authorize" && (request.method === "GET" || request.method === "POST")) return await authorize(c);
    if (path === "/oauth/token" && request.method === "POST") return await token(c);
  } catch (e) {
    console.error("oauth error", path, e && e.stack || e);
    return oerr("server_error", "Kesalahan di server", 500);
  }
  return oerr("not_found", "Endpoint tidak ada", 404);
}
