// MCP (Streamable HTTP, JSON-RPC tanpa sesi) untuk pengurus di /mcp.
// Auth: OAuth (login akun admin), lihat oauth.js. Peran admin dicek ulang di setiap permintaan.
import { json, ApiError, E, newId, randomCode, EMAIL_RE } from "./util.js";
import { hashPassword, newSalt } from "./auth.js";
import { adminFromToken, resourceMetadataUrl } from "./oauth.js";
import { expireDue, jalurAktif } from "./db.js";
import * as ct from "./routes_content.js";

const PROTOCOL = "2025-03-26";

const obj = (properties = {}, required = []) => ({ type: "object", properties, required, additionalProperties: false });
const idProp = { id: { type: "string", description: "id pengumuman (slug)" } };
const textsProp = {
  texts: {
    type: "object",
    description: "Teks per bahasa: {id:{title,summary,body}, en:{...}, zh:{...}}. body boleh string (paragraf dipisah baris kosong) atau array paragraf. Bahasa id wajib saat membuat.",
    additionalProperties: obj({ title: { type: "string" }, summary: { type: "string" }, body: { type: ["string", "array"] } }, ["title", "summary", "body"])
  }
};

// semua handler mengembalikan data JSON; mutasi memakai handler REST yang sama (validasi sama)
const via = (handler, withBody) => async (c, args) => {
  const { id } = args;
  const ctx = { ...c, params: { id }, req: new Request("https://mcp.local/", { method: "POST", headers: { "content-type": "application/json" }, body: withBody ? JSON.stringify(args) : undefined }) };
  const r = await handler(ctx);
  const text = await r.text();
  if (!r.ok) { const e = JSON.parse(text).error; throw new ApiError(r.status, e.code, e.message); }
  return r.headers.get("content-type").includes("json") ? JSON.parse(text) : text;
};

const TOOLS = [
  { name: "overview", description: "Ringkasan jumlah akun, kuis selesai, gabung grup, tim terbuka, lamaran.", schema: obj(), run: via(ct.adminOverview) },
  {
    name: "list_participants", description: "Daftar peserta (termasuk kontak; data pribadi). Filter opsional.",
    schema: obj({ q: { type: "string", description: "cari nama/email/kota" }, has_team: { type: "boolean" }, limit: { type: "integer", maximum: 500 }, offset: { type: "integer" } }),
    async run(c, a) {
      const q = "%" + String(a.q || "").replace(/[%_]/g, "") + "%";
      const r = await c.db.prepare(
        `SELECT m.id AS member_id, m.nama, m.email, m.kota, m.wa, m.linkedin, m.github, p.latar, p.jalur, p.jalur_override,
                p.joined_main_at, p.tencent_clicked_at, p.project_ready_at, p.submit_clicked_at, m.created_at,
                (SELECT t.nama FROM hackathon_team_member tm JOIN hackathon_team t ON t.id = tm.team_id WHERE tm.member_id = m.id AND tm.left_at IS NULL) AS tim
           FROM hackathon_member m JOIN hackathon_participant p ON p.member_id = m.id
          WHERE (m.nama LIKE ?1 OR m.email LIKE ?1 OR m.kota LIKE ?1)
          ORDER BY m.created_at DESC LIMIT ?2 OFFSET ?3`
      ).bind(q, Math.min(500, a.limit || 100), a.offset || 0).all();
      let rows = r.results.map(({ jalur, jalur_override, ...x }) => ({ ...x, jalur_aktif: jalurAktif({ jalur, jalur_override }) }));
      if (typeof a.has_team === "boolean") rows = rows.filter((x) => !!x.tim === a.has_team);
      return { participants: rows };
    }
  },
  { name: "export_participants_csv", description: "Seluruh peserta sebagai CSV (teks).", schema: obj(), run: via(ct.adminExportParticipants) },
  {
    name: "list_teams", description: "Semua tim (open/closed) dengan owner dan jumlah anggota aktif.",
    schema: obj({ status: { type: "string", enum: ["open", "closed"] } }),
    async run(c, a) {
      const r = await c.db.prepare(
        `SELECT t.id, t.nama, t.kota, t.status, t.butuh, t.created_at, t.closed_at, o.nama AS owner, o.email AS owner_email,
                (SELECT COUNT(*) FROM hackathon_team_member x WHERE x.team_id = t.id AND x.left_at IS NULL) AS member_count
           FROM hackathon_team t JOIN hackathon_member o ON o.id = t.owner_id
          WHERE (?1 IS NULL OR t.status = ?1) ORDER BY t.created_at DESC LIMIT 500`
      ).bind(a.status || null).all();
      return { teams: r.results.map((t) => ({ ...t, butuh: JSON.parse(t.butuh) })) };
    }
  },
  {
    name: "get_team", description: "Detail tim: anggota aktif beserta kontak, lamaran, dan link grup WA.",
    schema: obj({ id: { type: "string" } }, ["id"]),
    async run(c, a) {
      const t = await c.db.prepare("SELECT id, nama, deskripsi, kota, butuh, wa_link, status, created_at, closed_at, owner_id FROM hackathon_team WHERE id = ?").bind(a.id).first();
      if (!t) throw E.notFound("Tim tidak ditemukan");
      const [m, ap] = await Promise.all([
        c.db.prepare(`SELECT tm.member_id, tm.role, tm.joined_at, x.nama, x.email, x.wa, x.linkedin, x.github FROM hackathon_team_member tm JOIN hackathon_member x ON x.id = tm.member_id WHERE tm.team_id = ? AND tm.left_at IS NULL`).bind(a.id).all(),
        c.db.prepare(`SELECT a.id, a.member_id, x.nama, a.status, a.via, a.created_at, a.expires_at, a.decided_at FROM hackathon_application a JOIN hackathon_member x ON x.id = a.member_id WHERE a.team_id = ? ORDER BY a.created_at DESC`).bind(a.id).all()
      ]);
      return { team: { ...t, butuh: JSON.parse(t.butuh) }, members: m.results, applications: ap.results };
    }
  },
  { name: "list_announcements", description: "Semua pengumuman (draft/published/archived) dengan jumlah tayangan unik.", schema: obj(), run: via(ct.adminListAnnouncements) },
  { name: "create_announcement", description: "Buat pengumuman berstatus draft. Terbitkan dengan publish_announcement.", schema: obj({ id: { type: "string", description: "slug opsional" }, pinned: { type: "boolean" }, ...textsProp }, ["texts"]), run: via(ct.adminCreateAnnouncement, true) },
  { name: "update_announcement", description: "Ubah teks (per bahasa) atau sematkan/lepas.", schema: obj({ ...idProp, pinned: { type: "boolean" }, ...textsProp }, ["id"]), run: via(ct.adminPatchAnnouncement, true) },
  { name: "publish_announcement", description: "Terbitkan pengumuman (tampil publik).", schema: obj(idProp, ["id"]), run: via(ct.adminPublish) },
  { name: "archive_announcement", description: "Arsipkan pengumuman (disembunyikan dari publik).", schema: obj(idProp, ["id"]), run: via(ct.adminArchive) },
  { name: "list_admins", description: "Daftar akun admin (yang bisa login ke MCP).", schema: obj(), async run(c) {
      const r = await c.db.prepare("SELECT id AS member_id, email, nama, created_at FROM hackathon_member WHERE role = 'admin' ORDER BY created_at").all();
      return { admins: r.results };
    } },
  {
    name: "add_admin", description: "Jadikan sebuah email admin. Bila akun belum ada, dibuat dengan sandi acak yang ditampilkan SEKALI di hasil ini (teruskan ke orangnya, minta ganti lewat change_password). Bila akun sudah ada, hanya dinaikkan menjadi admin.",
    schema: obj({ email: { type: "string" }, nama: { type: "string" } }, ["email"]),
    async run(c, a) {
      const email = String(a.email || "").trim().toLowerCase();
      if (!EMAIL_RE.test(email) || email.length > 120) throw E.bad("Email tidak valid");
      const ex = await c.db.prepare("SELECT id, role FROM hackathon_member WHERE email = ?").bind(email).first();
      if (ex) {
        await c.db.prepare("UPDATE hackathon_member SET role = 'admin' WHERE id = ?").bind(ex.id).run();
        return { email, promoted: true, created: false };
      }
      const pw = randomCode(16), salt = newSalt(), id = newId("mem", c.now);
      const nama = String(a.nama || email.split("@")[0]).trim().slice(0, 80) || "Admin";
      await c.db.batch([
        c.db.prepare("INSERT INTO hackathon_member (id, email, nama, pass_hash, pass_salt, role, created_at) VALUES (?,?,?,?,?, 'admin', ?)").bind(id, email, nama, await hashPassword(pw, salt), salt, c.now),
        c.db.prepare("INSERT INTO hackathon_participant (member_id, created_at, updated_at) VALUES (?,?,?)").bind(id, c.now, c.now)
      ]);
      return { email, created: true, password_sekali_tampil: pw };
    }
  },
  {
    name: "remove_admin", description: "Cabut peran admin dari sebuah email (akses MCP langsung berhenti). Tidak bisa mencabut diri sendiri atau admin terakhir.",
    schema: obj({ email: { type: "string" } }, ["email"]),
    async run(c, a) {
      const email = String(a.email || "").trim().toLowerCase();
      const m = await c.db.prepare("SELECT id FROM hackathon_member WHERE email = ? AND role = 'admin'").bind(email).first();
      if (!m) throw E.notFound("Admin tidak ditemukan");
      if (m.id === c.member.id) throw E.conflict("Tidak bisa mencabut diri sendiri", "self");
      await c.db.batch([
        c.db.prepare("UPDATE hackathon_member SET role = 'member' WHERE id = ?").bind(m.id),
        c.db.prepare("DELETE FROM hackathon_oauth_token WHERE member_id = ?").bind(m.id)
      ]);
      return { email, removed: true };
    }
  },
  {
    name: "change_password", description: "Ganti sandi akun admin yang sedang login (min. 8 karakter). Sesi web akun ini ikut dikeluarkan.",
    schema: obj({ new_password: { type: "string" } }, ["new_password"]),
    async run(c, a) {
      if (typeof a.new_password !== "string" || a.new_password.length < 8 || a.new_password.length > 128) throw E.bad("Sandi 8 sampai 128 karakter");
      const salt = newSalt();
      await c.db.batch([
        c.db.prepare("UPDATE hackathon_member SET pass_hash = ?, pass_salt = ? WHERE id = ?").bind(await hashPassword(a.new_password, salt), salt, c.member.id),
        c.db.prepare("DELETE FROM hackathon_session WHERE member_id = ?").bind(c.member.id)
      ]);
      return { ok: true };
    }
  },
  { name: "announcement_views", description: "Tayangan unik dan per hari untuk satu pengumuman.", schema: obj(idProp, ["id"]), run: via(ct.adminAnnouncementViews) }
];

const rpcErr = (id, code, message) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });

async function dispatch(msg, c) {
  const { id, method, params = {} } = msg;
  const isNote = id === undefined;
  switch (method) {
    case "initialize":
      return { jsonrpc: "2.0", id, result: { protocolVersion: PROTOCOL, capabilities: { tools: {} }, serverInfo: { name: "aiclub-hackathon", version: "1.0.0" }, instructions: "Pengelolaan portal AI Agent Hackathon. Tool bersifat admin; data peserta mengandung data pribadi. Mutasi: pengumuman dan daftar admin." } };
    case "ping": return { jsonrpc: "2.0", id, result: {} };
    case "tools/list":
      return { jsonrpc: "2.0", id, result: { tools: TOOLS.map((t) => ({ name: t.name, description: t.description, inputSchema: t.schema })) } };
    case "tools/call": {
      const tool = TOOLS.find((t) => t.name === params.name);
      if (!tool) return rpcErr(id, -32602, "Tool tidak dikenal: " + params.name);
      try {
        await expireDue(c.db, c.now);
        const out = await tool.run(c, params.arguments || {});
        return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text: typeof out === "string" ? out : JSON.stringify(out) }] } };
      } catch (e) {
        if (!(e instanceof ApiError)) console.error("mcp tool error", params.name, e && e.stack || e);
        const message = e instanceof ApiError ? `${e.code}: ${e.message}` : "Kesalahan di server";
        return { jsonrpc: "2.0", id, result: { isError: true, content: [{ type: "text", text: message }] } };
      }
    }
    default:
      return isNote ? null : rpcErr(id, -32601, "Metode tidak dikenal: " + method);
  }
}

const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, content-type, mcp-protocol-version, mcp-session-id", "access-control-allow-methods": "POST, OPTIONS", "access-control-expose-headers": "www-authenticate" };
const reply = (r) => { for (const [k, v] of Object.entries(CORS)) r.headers.set(k, v); return r; };

export async function handleMcp(request, env) {
  const now = Date.now(), url = new URL(request.url);
  if (request.method === "OPTIONS") return reply(new Response(null, { status: 204 }));
  if (!env.DB) return reply(json(rpcErr(null, -32000, "Database belum terpasang"), 500));
  const bearer = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const { member } = await adminFromToken(env.DB, bearer, now);
  if (!member) return reply(json(rpcErr(null, -32001, "Perlu login admin"), 401, { "www-authenticate": `Bearer resource_metadata="${resourceMetadataUrl(url)}"` }));
  if (member.role !== "admin") return reply(json(rpcErr(null, -32002, "Akun bukan admin"), 403));
  if (request.method !== "POST") return reply(new Response(null, { status: 405, headers: { allow: "POST" } }));

  let body;
  try { body = await request.json(); } catch { return reply(json(rpcErr(null, -32700, "JSON tidak valid"), 400)); }
  const c = { env, db: env.DB, url, now, member, json };
  const batch = Array.isArray(body);
  const out = (await Promise.all((batch ? body : [body]).map((m) =>
    m && typeof m === "object" && m.jsonrpc === "2.0" && typeof m.method === "string" ? dispatch(m, c) : rpcErr(m && m.id, -32600, "Permintaan tidak valid")
  ))).filter(Boolean);
  if (!out.length) return reply(new Response(null, { status: 202 }));
  return reply(json(batch ? out : out[0]));
}
