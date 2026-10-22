// Pengumuman, chat tim, dan admin.
import { E, newId, ulid, readJson, str } from "./util.js";
import { requireActiveMember, memberRole } from "./db.js";

const LANGS = ["id", "en", "zh"];
const lang = (c) => { const l = c.url.searchParams.get("lang"); return LANGS.includes(l) ? l : "id"; };
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,48}$/;

// ---------- pengumuman (publik) ----------
const ANN_SELECT = (withBody) =>
  `SELECT a.id, a.pinned, a.published_at,
          COALESCE(l.title, d.title) AS title, COALESCE(l.summary, d.summary) AS summary
          ${withBody ? ", COALESCE(l.body, d.body) AS body" : ""},
          (SELECT COUNT(*) FROM hackathon_announcement_view v WHERE v.announcement_id = a.id) AS views
     FROM hackathon_announcement a
     LEFT JOIN hackathon_announcement_i18n l ON l.announcement_id = a.id AND l.lang = ?
     JOIN hackathon_announcement_i18n d ON d.announcement_id = a.id AND d.lang = 'id'`;

async function readSet(c, ids) {
  if (!c.member || !ids.length) return new Set();
  const r = await c.db.prepare(`SELECT announcement_id FROM hackathon_announcement_view WHERE member_id = ? AND announcement_id IN (${ids.map(() => "?").join(",")})`).bind(c.member.id, ...ids).all();
  return new Set(r.results.map((x) => x.announcement_id));
}
const annOut = (a, read) => ({ id: a.id, title: a.title, summary: a.summary, pinned: !!a.pinned, published_at: a.published_at, views: a.views, ...(read ? { read: read.has(a.id) } : {}) });

export async function listAnnouncements(c) {
  const r = await c.db.prepare(ANN_SELECT(false) + " WHERE a.status = 'published' ORDER BY a.pinned DESC, a.published_at DESC").bind(lang(c)).all();
  const read = c.member ? await readSet(c, r.results.map((a) => a.id)) : null;
  return c.json({ announcements: r.results.map((a) => annOut(a, read)) });
}
export async function getAnnouncement(c) {
  const a = await c.db.prepare(ANN_SELECT(true) + " WHERE a.id = ? AND a.status = 'published'").bind(lang(c), c.params.id).first();
  if (!a) throw E.notFound("Pengumuman tidak ditemukan");
  const read = c.member ? await readSet(c, [a.id]) : null;
  return c.json({ ...annOut(a, read), body: a.body, paragraphs: a.body.split(/\n{2,}/) });
}
// tayangan unik: satu baris per (pengumuman, member); angka = jumlah baris
export async function viewAnnouncement(c) {
  const id = c.params.id, now = c.now;
  const a = await c.db.prepare("SELECT 1 FROM hackathon_announcement WHERE id = ? AND status = 'published'").bind(id).first();
  if (!a) throw E.notFound("Pengumuman tidak ditemukan");
  await c.db.prepare(
    `INSERT INTO hackathon_announcement_view (announcement_id, member_id, first_viewed_at, last_viewed_at, open_count) VALUES (?,?,?,?,1)
     ON CONFLICT(announcement_id, member_id) DO UPDATE SET last_viewed_at = excluded.last_viewed_at, open_count = open_count + 1`
  ).bind(id, c.member.id, now, now).run();
  const v = await c.db.prepare("SELECT COUNT(*) n FROM hackathon_announcement_view WHERE announcement_id = ?").bind(id).first();
  return c.json({ views: v.n, read: true });
}

// ---------- pengumuman (admin) ----------
function parseTexts(texts, { partial = false } = {}) {
  if (!texts || typeof texts !== "object" || Array.isArray(texts)) throw E.bad("texts wajib berupa objek per bahasa");
  const out = {};
  for (const [l, t] of Object.entries(texts)) {
    if (!LANGS.includes(l)) throw E.bad(`bahasa ${l} tidak dikenal`);
    if (!t || typeof t !== "object") throw E.bad(`texts.${l} tidak valid`);
    out[l] = {
      title: str(t.title, `${l}.title`, { max: 150, min: 1 }),
      summary: str(t.summary, `${l}.summary`, { max: 300, min: 1 }),
      body: str(Array.isArray(t.body) ? t.body.join("\n\n") : t.body, `${l}.body`, { max: 8000, min: 1 })
    };
  }
  if (!partial && !out.id) throw E.bad("teks bahasa id wajib");
  return out;
}
const putTexts = (c, id, texts) => Object.entries(texts).map(([l, t]) =>
  c.db.prepare(
    `INSERT INTO hackathon_announcement_i18n (announcement_id, lang, title, summary, body) VALUES (?,?,?,?,?)
     ON CONFLICT(announcement_id, lang) DO UPDATE SET title = excluded.title, summary = excluded.summary, body = excluded.body`
  ).bind(id, l, t.title, t.summary, t.body));

export async function adminListAnnouncements(c) {
  const r = await c.db.prepare(
    `SELECT a.id, a.pinned, a.status, a.published_at, a.created_at, a.updated_at, d.title,
            (SELECT COUNT(*) FROM hackathon_announcement_view v WHERE v.announcement_id = a.id) AS views
       FROM hackathon_announcement a LEFT JOIN hackathon_announcement_i18n d ON d.announcement_id = a.id AND d.lang = 'id'
      ORDER BY a.created_at DESC`
  ).all();
  return c.json({ announcements: r.results.map((a) => ({ ...a, pinned: !!a.pinned })) });
}
export async function adminCreateAnnouncement(c) {
  const b = await readJson(c.req), now = c.now;
  const id = b.id == null ? "p-" + ulid(now).slice(-8).toLowerCase() : b.id;
  if (typeof id !== "string" || !SLUG_RE.test(id)) throw E.bad("id harus slug huruf kecil/angka/strip, 2-49 karakter");
  const texts = parseTexts(b.texts);
  if (await c.db.prepare("SELECT 1 FROM hackathon_announcement WHERE id = ?").bind(id).first()) throw E.conflict("id pengumuman sudah dipakai", "id_taken");
  await c.db.batch([
    c.db.prepare("INSERT INTO hackathon_announcement (id, pinned, status, created_by, created_at, updated_at) VALUES (?,?, 'draft', ?,?,?)").bind(id, b.pinned ? 1 : 0, c.member.id, now, now),
    ...putTexts(c, id, texts)
  ]);
  return c.json({ id, status: "draft" }, 201);
}
async function annExists(c) {
  const a = await c.db.prepare("SELECT * FROM hackathon_announcement WHERE id = ?").bind(c.params.id).first();
  if (!a) throw E.notFound("Pengumuman tidak ditemukan");
  return a;
}
export async function adminPatchAnnouncement(c) {
  const a = await annExists(c), b = await readJson(c.req);
  const texts = "texts" in b ? parseTexts(b.texts, { partial: true }) : {};
  const stmts = putTexts(c, a.id, texts);
  stmts.push(c.db.prepare("UPDATE hackathon_announcement SET pinned = ?, updated_at = ? WHERE id = ?").bind("pinned" in b ? (b.pinned ? 1 : 0) : a.pinned, c.now, a.id));
  await c.db.batch(stmts);
  return c.json({ ok: true });
}
export async function adminGetAnnouncement(c) {
  const a = await annExists(c);
  const [t, v] = await Promise.all([
    c.db.prepare("SELECT lang, title, summary, body FROM hackathon_announcement_i18n WHERE announcement_id = ?").bind(a.id).all(),
    c.db.prepare("SELECT COUNT(*) n FROM hackathon_announcement_view WHERE announcement_id = ?").bind(a.id).first()
  ]);
  return c.json({
    id: a.id, status: a.status, pinned: !!a.pinned, published_at: a.published_at, created_at: a.created_at, updated_at: a.updated_at, views: v.n,
    texts: Object.fromEntries(t.results.map(({ lang, ...x }) => [lang, x]))
  });
}
export async function adminUnpublish(c) {
  const a = await annExists(c);
  await c.db.prepare("UPDATE hackathon_announcement SET status = 'draft', updated_at = ? WHERE id = ?").bind(c.now, a.id).run();
  return c.json({ id: a.id, status: "draft" });
}
// hapus permanen beserta teks dan tayangannya; untuk menyembunyikan saja, pakai arsip
export async function adminDeleteAnnouncement(c) {
  const a = await annExists(c);
  await c.db.batch([
    c.db.prepare("DELETE FROM hackathon_announcement_view WHERE announcement_id = ?").bind(a.id),
    c.db.prepare("DELETE FROM hackathon_announcement_i18n WHERE announcement_id = ?").bind(a.id),
    c.db.prepare("DELETE FROM hackathon_announcement WHERE id = ?").bind(a.id)
  ]);
  return c.json({ id: a.id, deleted: true });
}
export async function adminPublish(c) {
  const a = await annExists(c);
  await c.db.prepare("UPDATE hackathon_announcement SET status = 'published', published_at = COALESCE(published_at, ?), updated_at = ? WHERE id = ?").bind(c.now, c.now, a.id).run();
  return c.json({ id: a.id, status: "published" });
}
export async function adminArchive(c) {
  const a = await annExists(c);
  await c.db.prepare("UPDATE hackathon_announcement SET status = 'archived', updated_at = ? WHERE id = ?").bind(c.now, a.id).run();
  return c.json({ id: a.id, status: "archived" });
}
export async function adminAnnouncementViews(c) {
  const a = await annExists(c);
  const [t, d] = await Promise.all([
    c.db.prepare("SELECT COUNT(*) n FROM hackathon_announcement_view WHERE announcement_id = ?").bind(a.id).first(),
    c.db.prepare(
      `SELECT strftime('%Y-%m-%d', first_viewed_at / 1000, 'unixepoch') AS day, COUNT(*) AS views
         FROM hackathon_announcement_view WHERE announcement_id = ? GROUP BY day ORDER BY day`
    ).bind(a.id).all()
  ]);
  return c.json({ unique_views: t.n, per_day: d.results });
}

// ---------- chat tim ----------
const MSG_MAX = 1000, PER_MIN = 20, PER_DAY = 500;
const msgOut = (m) => m.deleted_at
  ? { id: m.id, member_id: m.member_id, deleted: true, created_at: m.created_at }
  : { id: m.id, member_id: m.member_id, nama: m.nama, body: m.body, created_at: m.created_at };
const MSG_SELECT = "SELECT c.*, m.nama FROM hackathon_chat_message c JOIN hackathon_member m ON m.id = c.member_id WHERE c.team_id = ?";

export async function listMessages(c) {
  await requireActiveMember(c.db, c.params.id, c.member.id);
  const q = c.url.searchParams;
  const limit = Math.min(100, Math.max(1, parseInt(q.get("limit") || "50", 10) || 50));
  const after = q.get("after"), before = q.get("before");
  let rows;
  if (after) rows = (await c.db.prepare(MSG_SELECT + " AND c.id > ? ORDER BY c.id ASC LIMIT ?").bind(c.params.id, after, limit).all()).results;
  else if (before) rows = (await c.db.prepare(MSG_SELECT + " AND c.id < ? ORDER BY c.id DESC LIMIT ?").bind(c.params.id, before, limit).all()).results.reverse();
  else rows = (await c.db.prepare(MSG_SELECT + " ORDER BY c.id DESC LIMIT ?").bind(c.params.id, limit).all()).results.reverse();
  return c.json({ messages: rows.map(msgOut) });
}
export async function sendMessage(c) {
  await requireActiveMember(c.db, c.params.id, c.member.id);
  const b = await readJson(c.req), now = c.now, me = c.member.id;
  if (typeof b.body !== "string") throw E.bad("body harus teks");
  const body = b.body.replace(/\r\n/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
  if (!body || body.length > MSG_MAX) throw E.bad(`Pesan 1 sampai ${MSG_MAX} karakter`);
  const [m, d] = await Promise.all([
    c.db.prepare("SELECT COUNT(*) n FROM hackathon_chat_message WHERE member_id = ? AND created_at > ?").bind(me, now - 60000).first(),
    c.db.prepare("SELECT COUNT(*) n FROM hackathon_chat_message WHERE member_id = ? AND created_at > ?").bind(me, now - 86400000).first()
  ]);
  if (m.n >= PER_MIN || d.n >= PER_DAY) throw E.limit("Batas kirim pesan tercapai");
  const id = ulid(now);
  await c.db.prepare("INSERT INTO hackathon_chat_message (id, team_id, member_id, body, created_at) VALUES (?,?,?,?,?)").bind(id, c.params.id, me, body, now).run();
  return c.json({ id, member_id: me, nama: c.member.nama, body, created_at: now }, 201);
}
export async function deleteMessage(c) {
  const role = await requireActiveMember(c.db, c.params.id, c.member.id);
  const m = await c.db.prepare("SELECT * FROM hackathon_chat_message WHERE id = ? AND team_id = ?").bind(c.params.mid, c.params.id).first();
  if (!m) throw E.notFound("Pesan tidak ditemukan");
  if (m.member_id !== c.member.id && role !== "owner") throw E.forbid("Hanya penulis atau owner yang bisa menghapus pesan");
  await c.db.prepare("UPDATE hackathon_chat_message SET deleted_at = COALESCE(deleted_at, ?), deleted_by = COALESCE(deleted_by, ?) WHERE id = ?").bind(c.now, c.member.id, m.id).run();
  return c.json({ ok: true });
}
export async function markRead(c) {
  await requireActiveMember(c.db, c.params.id, c.member.id);
  const b = await readJson(c.req);
  const id = str(b.last_read_id, "last_read_id", { max: 40, min: 1 });
  if (!(await c.db.prepare("SELECT 1 FROM hackathon_chat_message WHERE id = ? AND team_id = ?").bind(id, c.params.id).first())) throw E.notFound("Pesan tidak ditemukan");
  await c.db.prepare(
    `INSERT INTO hackathon_chat_read (team_id, member_id, last_read_id) VALUES (?,?,?)
     ON CONFLICT(team_id, member_id) DO UPDATE SET last_read_id = MAX(COALESCE(last_read_id, ''), excluded.last_read_id)`
  ).bind(c.params.id, c.member.id, id).run();
  return c.json({ ok: true });
}

// ---------- admin: ringkasan dan ekspor ----------
export async function adminOverview(c) {
  const n = (sql) => c.db.prepare(sql).first().then((r) => r.n);
  const [members, finished, joined, teams, pending, approved] = await Promise.all([
    n("SELECT COUNT(*) n FROM hackathon_member"),
    n("SELECT COUNT(*) n FROM hackathon_participant WHERE jalur IS NOT NULL"),
    n("SELECT COUNT(*) n FROM hackathon_participant WHERE joined_main_at IS NOT NULL"),
    n("SELECT COUNT(*) n FROM hackathon_team WHERE status = 'open'"),
    n("SELECT COUNT(*) n FROM hackathon_application WHERE status = 'pending'"),
    n("SELECT COUNT(*) n FROM hackathon_application WHERE status = 'approved'")
  ]);
  return c.json({ members, quiz_done: finished, joined_main: joined, open_teams: teams, pending_applications: pending, approved_applications: approved });
}
const csvCell = (v) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // cegah formula injection di spreadsheet
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
export async function adminExportParticipants(c) {
  const r = await c.db.prepare(
    `SELECT m.id, m.nama, m.email, m.kota, m.wa, m.linkedin, m.github, p.latar, COALESCE(p.jalur_override, p.jalur) AS jalur,
            p.joined_main_at, p.tencent_clicked_at, p.project_ready_at, p.submit_clicked_at,
            (SELECT t.nama FROM hackathon_team_member tm JOIN hackathon_team t ON t.id = tm.team_id WHERE tm.member_id = m.id AND tm.left_at IS NULL) AS tim,
            m.created_at
       FROM hackathon_member m JOIN hackathon_participant p ON p.member_id = m.id ORDER BY m.created_at`
  ).all();
  const cols = ["id", "nama", "email", "kota", "wa", "linkedin", "github", "latar", "jalur", "tim", "joined_main_at", "tencent_clicked_at", "project_ready_at", "submit_clicked_at", "created_at"];
  const csv = [cols.join(","), ...r.results.map((x) => cols.map((k) => csvCell(x[k])).join(","))].join("\n") + "\n";
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="peserta-hackathon.csv"', "cache-control": "no-store" } });
}
